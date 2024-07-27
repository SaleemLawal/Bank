import e from "express";
import mongoose, { Schema } from "mongoose";

const transactionSchema = new Schema({
  accountId: {
    type: Schema.Types.ObjectId,
    reuqired: true,
    ref: "user",
    unique: true,
  },
  type: {
    type: Schema.Types.String,
    enum: ["deposit", "withdraw", "transfer"],
    required: true,
  },
  amount: {
    type: Schema.Types.Number,
    require: true,
  },
  toAccountId: {
    type: Schema.Types.ObjectId,
  },
  date: {
    type: Schema.Types.Date,
    default: Date.now(),
  },
  description: {
    type: Schema.Types.String,
  },
});

export const Transaction = mongoose.model("Transaction", transactionSchema);
