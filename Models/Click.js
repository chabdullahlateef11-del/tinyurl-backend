import mongoose from "mongoose";

const ClickSchema = new mongoose.Schema({
  urlId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "urls",
    required: true,
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
  clickedAt: {
    type: Date,
    default: Date.now,
  },
});

export const Clicks = mongoose.model("clicks", ClickSchema);