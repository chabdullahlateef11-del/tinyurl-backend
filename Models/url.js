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
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: false, // false rakho taake purane bina-login URLs bhi chal sakein
  },
}, { timestamps: true });

export const URLs = mongoose.model("urls", URLSchema);