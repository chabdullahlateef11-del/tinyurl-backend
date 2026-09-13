import { nanoid } from "nanoid";
import { URLs } from "../Models/url.js";

export const BulkSaveURL = async (req, res) => {
  try {
    const { urls } = req.body; // array of longUrls
    const userId = req.userId || null;

    if (!Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ ok: false, message: "urls array zaroori hai" });
    }

    if (urls.length > 20) {
      return res.status(400).json({ ok: false, message: "Ek baar mein max 20 URLs allowed hain" });
    }

    const results = [];

    for (const longUrl of urls) {
      if (!longUrl || typeof longUrl !== "string") {
        results.push({ longUrl, ok: false, message: "Invalid URL" });
        continue;
      }

      const shortId = nanoid(6);
      const newUrl = await URLs.create({ shortId, longUrl, userId });

      results.push({
        ok: true,
        longUrl,
        shortURL: `${process.env.BASE_URL}/${newUrl.shortId}`,
      });
    }

    res.status(200).json({ ok: true, results });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};