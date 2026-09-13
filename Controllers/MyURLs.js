import { URLs } from "../Models/url.js";

export const getMyURLs = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ ok: false, message: "Login zaroori hai" });
    }

    const urls = await URLs.find({ userId: req.userId }).sort({ createdAt: -1 });

    res.status(200).json({ ok: true, urls });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};