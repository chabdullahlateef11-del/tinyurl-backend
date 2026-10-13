import express from "express";
import { authMiddleware } from "../Utils/authMiddleware.js";
import {
  createCheckoutSession,
  getSubscriptionStatus,
  createPortalSession,
} from "../Controllers/StripeController.js";

const router = express.Router();

router.post("/create-checkout-session", authMiddleware, createCheckoutSession);
router.get("/subscription-status", authMiddleware, getSubscriptionStatus);
router.post("/create-portal-session", authMiddleware, createPortalSession);

export default router;