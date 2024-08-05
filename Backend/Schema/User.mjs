import mongoose, { Schema } from "mongoose";

const validateRole = (value) => {
  const validRoles = ["user", "admin"];
  if (Array.isArray(value)) {
    return value.every((role) => validRoles.includes(role));
  }
  return validRoles.includes(value);
};

const userSchema = new Schema({
  username: {
    type: Schema.Types.String,
    required: true,
    unique: true,
    trim: true,
  },

  email: {
    type: Schema.Types.String,
    required: true,
    unique: true,
    trim: true,
  },

  password: {
    type: Schema.Types.String,
    require: true,
  },
  role: {
    type: Schema.Types.Mixed,
    default: "User",
    validate: [validateRole, "Invalid role"],
  },
});

export const User = mongoose.model("User", userSchema);
