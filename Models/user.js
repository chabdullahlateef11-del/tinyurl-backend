import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    stripeCustomerId: { type: String, default: null },
    stripeSubscriptionId: { type: String, default: null },
    plan: { type: String, enum: ["free", "pro"], default: "free" },
    subscriptionStatus: {
      type: String,
      enum: [
        "none",
        "active",
        "trialing",
        "past_due",
        "canceled",
        "unpaid",
        "incomplete",
        "incomplete_expired",
      ],
      default: "none",
    },
    currentPeriodEnd: { type: Date, default: null },
    cancelAtPeriodEnd: { type: Boolean, default: false },
    priceId: { type: String, default: null },
  },
  { timestamps: true }
);

export const Users = mongoose.model("User", userSchema);