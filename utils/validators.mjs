import { checkSchema } from "express-validator";

const validateUsernameOrEmail = (value, { req }) => {
  if (!req.body.username && !req.body.email) {
    throw new Error("Either username or email must be provided");
  }
  return true;
};

export const userValidationSchema = checkSchema({
  username: {
    in: ["body"],
    isLength: {
      options: { min: 5 },
      errorMessage: "Username must be at least 5 characters",
    },
    notEmpty: {
      errorMessage: "Username can't be empty",
    },
    isString: {
      errorMessage: "Username should be a string",
    },
    trim: true,
  },
  email: {
    in: ["body"],
    isLength: {
      options: { min: 5 },
      errorMessage: "Email must be at least 5 characters",
    },
    notEmpty: {
      errorMessage: "Email can't be empty",
    },
    isString: {
      errorMessage: "Email should be a string",
    },
    trim: true,
    isEmail: {
      errorMessage: "Must be a valid email address",
    },
  },
  password: {
    in: ["body"],
    isLength: {
      options: { min: 5, max: 15 },
      errorMessage: "Password must be between 8 and 15 characters",
    },
    notEmpty: {
      errorMessage: "Password can't be empty",
    },
  },
  role: {
    in: ["body"],
    optional: true,
    isIn: {
      options: [["user", "admin"]],
      errorMessage: 'Role must be either "user" or "admin"',
    },
  },
});

export const loginUserValidationSchema = checkSchema({
  username: {
    in: ["body"],
    isString: {
      errorMessage: "Username should be a string",
    },
    trim: true,
    optional: { options: { nullable: true, checkFalsy: true } },
    custom: {
      options: validateUsernameOrEmail,
    },
    isLength: {
      options: { min: 5 },
      errorMessage: "Username must be at least 5 characters",
    },
  },
  email: {
    in: ["body"],
    isEmail: {
      errorMessage: "Must be a valid email address",
    },
    trim: true,
    optional: { options: { nullable: true, checkFalsy: true } },
    custom: {
      options: validateUsernameOrEmail,
    },
    isLength: {
      options: { min: 5 },
      errorMessage: "Email must be at least 5 characters",
    },
  },
  password: {
    in: ["body"],
    isLength: {
      options: { min: 5, max: 15 },
      errorMessage: "Password must be between 8 and 15 characters",
    },
    notEmpty: {
      errorMessage: "Password can't be empty",
    },
  },
});

export const accountsValidationSchema = checkSchema({
  accountType: {
    in: ["body"],
    notEmpty: {
      errorMessage: "Account type can't be empty",
    },
    isIn: {
      options: [["checking", "savings"]],
      errorMessage: 'Account type must be either "checking" or "savings"',
    },
  },
  balance: {
    in: ["body"],
    optional: true,
    isFloat: {
      options: { min: 0 },
      errorMessage: 'Balance must be a non-negative number',
    },
  },
  createdAt: {
    in: ["body"],
    optional: true,
    isISO8601: {
      errorMessage: 'Invalid date format',
    },
  },
});

export const checkAccountIdSchema = checkSchema({
  accountId: {
    in: ["params"],
    notEmpty: {
      errorMessage: "Account Id param can't be empty",
    },
    isMongoId: {
      errorMessage: "Account Id needs to be a valid MongoDB ObjectId"
    }
  }
})