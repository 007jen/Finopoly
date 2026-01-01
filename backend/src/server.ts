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
import auditRoutes from "./routes/audit.routes";
import challengeRoutes from "./routes/challenge.routes";
import adminChallengeRoutes from "./routes/adminChallenge.routes";
import badgeRoutes from "./routes/badge.routes";
const app = express();
app.post(
    "/api/webhooks/clerk",
    bodyParser.raw({ type: "application/json" }),
    clerkWebhook
);

app.use(express.json());
// CORS Configuration
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:4173",
    process.env.FRONTEND_URL // Production Vercel URL
].filter(Boolean) as string[];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin) || allowedOrigins.some(o => origin.startsWith(o))) {
            callback(null, true);
        } else {
            // Temporarily allow all for debugging if needed, but best to warn
            console.warn(`Blocked CORS request from: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// Simple Health Check Endpoint
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/cases", caseRoutes);
app.use("/api/admin", caseReviewRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/audit", auditRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/admin/challenges', adminChallengeRoutes);
app.use('/api/badges', badgeRoutes);
// console.log("Case routes mounted");
console.log("Progress routes mounted");
console.log("Profile routes mounted");

export default app;
