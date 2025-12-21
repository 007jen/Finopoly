import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import authRoutes from "./routes/auth.routes";
import activityRoutes from "./routes/activity.routes";
import leaderboardRoutes from "./routes/leaderboard.routes";
import adminRoutes from "./routes/admin.routes";
import { clerkWebhook } from "./webhooks/clerkWebhook";
import caseRoutes from "./routes/case.route";
import caseReviewRoutes from "./routes/caseReview.routes";
import progressRoutes from "./routes/progress.routes";
import profileRoutes from "./routes/profile.routes";
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
app.use("/api/admin", caseReviewRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/profile", profileRoutes);

// console.log("Case routes mounted");
console.log("Progress routes mounted");
console.log("Profile routes mounted");

export default app;
