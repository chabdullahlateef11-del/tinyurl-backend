import { URLs } from "../Models/url.js";
import { Clicks } from "../Models/Click.js"; // yeh import add karna hai

export const getMyURLs = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ ok: false, message: "Login zaroori hai" });
    }

    const urls = await URLs.find({ userId: req.userId }).sort({ createdAt: -1 });

    // har link ke liye uske total clicks count karke attach karo
    const urlsWithClicks = await Promise.all(
      urls.map(async (u) => {
        const totalClicks = await Clicks.countDocuments({ urlId: u._id });
        return { ...u.toObject(), totalClicks };
      })
    );

    res.status(200).json({ ok: true, urls: urlsWithClicks });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};