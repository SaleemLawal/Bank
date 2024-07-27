import { Router } from "express";
import { checkValidationErrors, isLoggedIn } from "../utils/middlewares.mjs";
import {
  accountsValidationSchema,
  checkAccountIdSchema,
} from "../utils/validators.mjs";
import { matchedData, param } from "express-validator";
import { Account } from "../Schema/Account.mjs";
import { User } from "../Schema/User.mjs";

const routes = Router();
routes.post(
  "/accounts",
  isLoggedIn,
  accountsValidationSchema,
  checkValidationErrors,
  async (req, res) => {
    const data = matchedData(req);
    try {
      const userId = req.session.userId;
      console.log(userId);
      const newAccount = await Account.create({
        ...data,
        userId,
      });
      return res.status(201).json(newAccount);
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ msg: "Error occured when creating account" });
    }
  }
);

routes.get("/accounts", isLoggedIn, async (req, res) => {
  try {
    const userId = req.session.userId;

    const user = await User.findById(userId);
    if (user.role !== "admin")
      return res.status(404).json({ msg: "Unauthorized" });

    const allAccounts = await Account.find({});
    return res.status(200).json(allAccounts);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ msg: "Error occured when fetching all account" });
  }
});

routes.get("/accounts/user", isLoggedIn, async (req, res) => {
  try {
    const userId = req.session.userId;

    const userAccounts = await Account.find({ userId });
    return res.status(200).json(userAccounts);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ msg: "Error occured when fetching all account" });
  }
});

routes.get(
  "/accounts/:accountId",
  isLoggedIn,
  checkAccountIdSchema,
  checkValidationErrors,
  async (req, res) => {
    const userId = req.session.userId;
    const { accountId } = req.params;

    try {
      const account = await Account.findById(accountId);
      if (!account) {
        return res
          .status(404)
          .json({ msg: `Account with id ${accountId} not found` });
      }

      const user = await User.findById(userId);
      if (user.role !== "admin" && account.userId.toString() !== userId)
        return res.status(404).json({ msg: `Unauthorized` });

      return res.status(200).json(account);
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        msg: `Error occurred when fetching account with id ${accountId}`,
      });
    }
  }
);

routes.put(
  "/accounts/:accountId",
  isLoggedIn,
  checkAccountIdSchema,
  accountsValidationSchema,
  checkValidationErrors,
  async (req, res) => {
    const userId = req.session.userId;
    try {
      const { accountId } = req.params;
      const data = matchedData(req);

      const user = await User.findById(userId);
      const account = await Account.findById(accountId);

      if (!account)
        return res
          .status(404)
          .json({ msg: `Can't find account with id ${accountId} to update` });

      if (user.role !== "admin" && account.userId.toString() !== userId)
        return res.status(404).json({ msg: `Unauthorized` });

      const updatedAccount = await Account.findByIdAndUpdate(accountId, data, {
        returnDocument: "after",
      });

      return res.status(200).json(updatedAccount);
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ error: "Update failed: Internal server error" });
    }
  }
);

routes.delete(
  "/accounts/:accountId",
  isLoggedIn,
  checkAccountIdSchema,
  checkValidationErrors,
  async (req, res) => {
    const userId = req.session.userId;
    try {
      const { accountId } = req.params;
      const account = await Account.findById(accountId);
      const user = await User.findById(userId);

      if (!account)
        return res
          .status(404)
          .json({ msg: `Account with id ${accountId} not found` });

      if (user.role !== "admin" && account.userId.toString() !== userId)
        return res.status(404).json({ msg: `Unauthorized` });

      if (account.balance > 0)
        return res
          .status(400)
          .json({ msg: "Can't delete account with balance" });

      const deletedAccount = await Account.findByIdAndDelete(accountId);

      return res.status(200).json(deletedAccount);
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ error: "Deletion failed: Internal server error" });
    }
  }
);

export default routes;
