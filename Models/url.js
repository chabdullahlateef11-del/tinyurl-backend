import mongoose from "mongoose";

const URLSchema = new mongoose.Schema({
  shortId: {
    type: String,
    required: true,
    unique: true,
  },
  longUrl: {
    type: String,
    required: true,
  },
}, { timestamps: true });

export const URLs = mongoose.model("urls", URLSchema);