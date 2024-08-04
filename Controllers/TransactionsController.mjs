import { Router } from "express";
import { checkValidationErrors, isLoggedIn } from "../utils/middlewares.mjs";
import { Account } from "../Schema/Account.mjs";
import { transactionValidatorSchema } from "../utils/validators.mjs";
import { matchedData } from "express-validator";
import { User } from "../Schema/User.mjs";
import { startSession } from "mongoose";
import { Transaction } from "../Schema/Transaction.mjs";

const routes = Router();

// POST /transactions/deposit: Deposit funds into an account.
routes.post(
  "/transactions/deposit",
  isLoggedIn,
  transactionValidatorSchema,
  checkValidationErrors,
  async (req, res, next) => {
    const userId = req.session.userId;
    const data = matchedData(req);
    try {
      const account = await Account.findById(data.toAccountId);
      const user = await User.findById(userId);

      if (!account)
        return res.status(404).json({ msg: "Account doesn't exist" });

      if (user.role !== "admin" && account.userId.toString() !== userId)
        return res.status(404).json({ msg: `Unauthorized` });

      account.balance += data.amount;
      await account.save();
      await Transaction.create({
        type: "deposit",
        amount: data.amount,
        toAccountId: data.toAccountId,
        description: data.description ? data.description : "",
      });
      return res.status(200).json({ msg: `New balance ${account.balance}` });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ msg: "Internal Server Error" });
    }
  }
);

// POST /transactions/withdraw: Withdraw funds from an account.
routes.post(
  "/transactions/withdraw",
  isLoggedIn,
  transactionValidatorSchema,
  checkValidationErrors,
  async (req, res) => {
    const userId = req.session.userId;
    const data = matchedData(req);
    try {
      const account = await Account.findById(data.toAccountId);
      const user = await User.findById(userId);

      if (!account)
        return res.status(404).json({ msg: "Account doesn't exist" });

      if (user.role !== "admin" && account.userId.toString() !== userId)
        return res.status(404).json({ msg: `Unauthorized` });
      if (account.balance - data.amount < 0)
        return res.status(400).json({ msg: "Can't withdraw over balance" });

      account.balance -= data.amount;
      await account.save();
      await Transaction.create({
        type: "withdraw",
        amount: data.amount,
        toAccountId: data.toAccountId,
        description: data.description ? data.description : "",
      });
      res.status(200).json({ msg: `New balance ${account.balance}` });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ msg: "Internal Server Error" });
    }
  }
);

// POST /transactions/transfer: Transfer funds between accounts.
routes.post(
  "/transactions/transfer/:accountId",
  isLoggedIn,
  transactionValidatorSchema,
  checkValidationErrors,
  async (req, res) => {
    const { accountId: fromAccount } = req.params;
    const data = matchedData(req);
    const session = await startSession();

    try {
      session.startTransaction();

      const from = await Account.findById(fromAccount).session(session);
      const to = await Account.findById(data.toAccountId).session(session);

      if (!from) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ msg: "From account isn't valid" });
      }
      if (!to) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ msg: "To account isn't valid" });
      }

      if (data.amount > from.balance) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ msg: "Can't send over balance" });
      }

      from.balance -= data.amount;
      to.balance += data.amount;

      await from.save({ session });
      await to.save({ session });

      await session.commitTransaction();
      session.endSession();

      await Transaction.create({
        type: "transfer",
        fromAccountId: fromAccount,
        amount: data.amount,
        toAccountId: data.toAccountId,
        description: data.description ? data.description : "",
      });
      return res.status(200).json({ msg: "Transfer completed successfully" });
    } catch (error) {
      console.log(error);
      await session.abortTransaction();
      session.endSession();
      return res.status(500).json({ msg: "Transfer incomplete, server error" });
    }
  }
);

// Get Transaction History:
// GET /transactions/history/:accountId: Get the transaction history for a specific account.'
routes.get("/transactions/history/:accountId", async (req, res) => {
  try {
    const { accountId } = req.params;
    const transactions = await Transaction.find({ accountId }).sort({
      date: -1,
    });
    res.status(200).json(transactions);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

export default routes;
