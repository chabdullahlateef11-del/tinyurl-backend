import dns from "dns";
dns.setDefaultResultOrder("ipv4first");
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./Utils/mongodb.js";
import urlRoutes from "./Routes/urls.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // frontend serve karega

import authRoutes from "./Routes/auth.js";
app.use("/api/auth", authRoutes);
app.use("/", urlRoutes);

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});