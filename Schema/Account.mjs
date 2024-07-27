import mongoose, { Schema } from "mongoose";

const accountSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  accountType: {
    type: Schema.Types.String,
    enum: ["checking", "savings"],
    required: true,
  },
  balance: {
    type: Schema.Types.Number,
    default: 0,
    min: [0, 'Balance cannot be negative'],
  },
  createdAt: {
    type: Schema.Types.Date,
    default: Date.now(),
  },
});

export const Account = mongoose.model("Account", accountSchema);
