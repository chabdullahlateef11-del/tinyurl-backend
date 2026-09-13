import { URLs } from "../Models/url.js";
import { Clicks } from "../Models/Click.js";

export const RedirectURL = async (req, res) => {
  try {
    const { shortId } = req.params;
    const url = await URLs.findOne({ shortId });

    if (!url) {
      return res.status(404).json({ ok: false, message: "URL not found" });
    }

    // Clicks ko record karna
    Clicks.create({ 
       urlId: url._id, 
       ipAddress: req.ip, 
       userAgent: req.headers["user-agent"]
    }).catch(err => console.error("Click record error:", err));
    
    res.redirect(url.longUrl);
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};