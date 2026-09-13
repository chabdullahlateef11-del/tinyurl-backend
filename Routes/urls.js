import express from "express";
import { BulkSaveURL } from "../Controllers/BulkSaveURL.js";
import { SaveURL } from "../Controllers/SaveURL.js";
import { RedirectURL } from "../Controllers/RedirectURL.js";
import { optionalAuth } from "../Utils/optionalAuth.js";
import { authMiddleware } from "../Utils/authMiddleware.js";
import { getAnalytics } from "../Controllers/Analytics.js";
import { getMyURLs } from "../Controllers/MyURLs.js";

const router = express.Router();

router.post("/save", optionalAuth, SaveURL);
router.post("/save-bulk", optionalAuth, BulkSaveURL);
router.get("/api/my-urls", authMiddleware, getMyURLs);
router.get("/api/analytics/:shortId", authMiddleware, getAnalytics);
router.get("/:shortId", RedirectURL);

export default router;