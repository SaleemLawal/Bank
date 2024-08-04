import { Router } from "express";
import { matchedData } from "express-validator";
import {
  userValidationSchema,
  loginUserValidationSchema,
} from "../utils/validators.mjs";
import { User } from "../Schema/User.mjs";
import { Account } from "../Schema/Account.mjs";
import { isLoggedIn, checkValidationErrors } from "../utils/middlewares.mjs";

const routes = Router();

routes.post(
  "/auth/register",
  userValidationSchema,
  checkValidationErrors,
  async (req, res) => {
    const data = matchedData(req);

    try {
      const savedUser = await User.create(data);
      if (data.role !== "admin") {
        const account = new Account({
          userId: savedUser._id,
          accountType: "checking",
        });
        const userAccount = await account.save();

        return res.status(201).json({
          User: savedUser,
          Account: userAccount,
        });
      }

      return res.status(201).json({
        User: savedUser,
      });
    } catch (error) {
      return res.status(500).json({ msg: error.errorResponse.errmsg });
    }
  }
);

routes.post(
  "/auth/login",
  loginUserValidationSchema,
  checkValidationErrors,
  async (req, res) => {
    const data = matchedData(req);

    try {
      const findUser = await User.findOne({
        $or: [{ username: data.username }, { email: data.email }],
      });
      if (!findUser)
        return res
          .status(400)
          .json({ msg: `User with provided username or email doesn't exist` });

      if (findUser.password !== data.password)
        return res.status(400).json({ msg: `Invalid credentials` });

      req.session.userId = findUser._id;

      return res.status(200).json({
        msg: `Successfully logged ${data.username || data.email} in `,
      });
    } catch (error) {
      console.error(error);
      return res
        .sendStatus(500)
        .json({ msg: "Error occured when logging in user" });
    }
  }
);

routes.post("/auth/logout", isLoggedIn, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).json({ msg: "Error occurred during logout" });
    }
    return res.status(200).json({ msg: "Successfully signed user out" });
  });
});

routes.get("/users/profile", isLoggedIn, async (req, res) => {
  try {
    const userId = req.session.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ msg: "User not found" });
    return res.status(200).json(user);
  } catch (error) {
    res.status(400).json(error);
  }
});

routes.put(
  "/users/profile",
  isLoggedIn,
  userValidationSchema,
  checkValidationErrors,
  async (req, res) => {
    const data = matchedData(req);
    try {
      const userId = req.session.userId;

      const updatedUser = await User.findByIdAndUpdate(userId, data, {
        returnDocument: "after",
      });
      return res.status(200).json(updatedUser);
    } catch (error) {
      console.log(error);
      res.status(400).json(error);
    }
  }
);

routes.delete("/users/profile", isLoggedIn, async (req, res) => {
  try {
    const userId = req.session.userId;

    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) return res.status(404).json({ msg: "User not found" });

    await Account.deleteMany({ userId });

    return res
      .status(200)
      .json({ msg: "Deleted user and associated accounts" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default routes;
