import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import authRoutes from "./routes/auth.routes";
import activityRoutes from "./routes/activity.routes";
import leaderboardRoutes from "./routes/leaderboard.routes";
import adminRoutes from "./routes/admin.routes";
import { clerkWebhook } from "./webhooks/clerkWebhook";
import caseRoutes from "./routes/case.route";

const app = express();
app.post(
    "/api/webhooks/clerk",
    bodyParser.raw({ type: "application/json" }),
    clerkWebhook
);

app.use(express.json());
app.use(cors());

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/cases", caseRoutes);
console.log("Case routes mounted");


export default app;
