import mongoose, { Schema } from "mongoose";

const transactionSchema = new Schema(
  {

    fromAccountId: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: function () {
        return this.type === "transfer";
      },
    },
    type: {
      type: Schema.Types.String,
      enum: ["deposit", "withdraw", "transfer"],
      required: true,
    },
    amount: {
      type: Schema.Types.Number,
      required: true,
    },
    toAccountId: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    date: {
      type: Schema.Types.Date,
      default: Date.now,
    },
    description: {
      type: Schema.Types.String,
    },
  },
);

export const Transaction = mongoose.model("Transaction", transactionSchema);
