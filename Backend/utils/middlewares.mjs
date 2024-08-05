import { validationResult } from "express-validator";
// import { User } from "../Schema/User.mjs";

export const isLoggedIn = (req, res, next) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ msg: "Unauthorized" });
  }
  next();
};

export const checkValidationErrors = (req, res, next) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    return res.status(400).json(result.array());
  }
  next();
};

// export const validUser = async (req, res, next) => {
//   const userId = req.session.userId;

//   const user = await User.findById(userId);

//   if (user.role !== "admin" && account.userId.toString() !== userId)
//     return res.status(404).json({ msg: `Unauthorized` });
//   next();
// };
