import { nanoid } from "nanoid";
import { URLs } from "../Models/url.js";

export const SaveURL = async (req, res) => {
  try {
    const { longUrl, customAlias } = req.body;
    const userId = req.userId || null; // agar login hai to middleware se milega

    if (!longUrl) {
      return res.status(400).json({ ok: false, message: "longUrl is required" });
    }

    let shortId;

    if (customAlias && customAlias.trim() !== "") {
      const cleanAlias = customAlias.trim().replace(/\s+/g, "-");
      const existing = await URLs.findOne({ shortId: cleanAlias });
      if (existing) {
        return res.status(400).json({ ok: false, message: "Ye custom name pehle se use ho raha hai" });
      }
      shortId = cleanAlias;
    } else {
      shortId = nanoid(6);
    }

    const newUrl = await URLs.create({ shortId, longUrl, userId });

    res.status(200).json({
      ok: true,
      shortURL: `${process.env.BASE_URL}/${newUrl.shortId}`,
    });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};