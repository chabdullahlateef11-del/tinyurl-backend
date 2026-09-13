import { URLs } from "../Models/url.js";
import { Clicks } from "../Models/Click.js";

export const getAnalytics = async (req, res) => {
  try {
    const { shortId } = req.params;

    const url = await URLs.findOne({ shortId });
    if (!url) {
      return res.status(404).json({ ok: false, message: "URL not found" });
    }

    // Sirf us user ko analytics dikhao jisne URL banaya
    if (url.userId && url.userId.toString() !== req.userId) {
      return res.status(403).json({ ok: false, message: "Ye aapka URL nahi hai" });
    }

    const totalClicks = await Clicks.countDocuments({ urlId: url._id });

    const recentClicks = await Clicks.find({ urlId: url._id })
      .sort({ clickedAt: -1 })
      .limit(20);

    res.status(200).json({
      ok: true,
      shortId: url.shortId,
      longUrl: url.longUrl,
      totalClicks,
      recentClicks,
    });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};