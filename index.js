import "dotenv/config";
import express from "express";
import cors from "cors";
import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

import { connectDB } from "./Utils/mongodb.js";
import { handleWebhook } from "./Controllers/StripeController.js";

import authRoutes from "./Routes/auth.js";
import urlRoutes from "./Routes/urls.js";
import stripeRoutes from "./Routes/stripe.js";

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());

// ⚠️ WEBHOOK ROUTE — express.json() se PEHLAY, raw body ke sath
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  handleWebhook
);

app.use(express.json());
app.use(express.static("public"));

app.use("/api/auth", authRoutes);
app.use("/api/stripe", stripeRoutes);
app.use("/", urlRoutes);

connectDB();

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});