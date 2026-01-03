import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import http from "http";
import { Server } from "socket.io";
import { setupSocketHandlers } from "./socket";

// Route Imports
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
const PORT = process.env.PORT || 5000;

// Webhook handling (Pre-middleware)
app.post(
    "/api/webhooks/clerk",
    bodyParser.raw({ type: "application/json" }),
    clerkWebhook
);

app.use(express.json());

// Unified CORS Policy
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:4173",
    process.env.FRONTEND_URL
].filter(Boolean) as string[];

const corsOptions = {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"]
};

app.use(cors(corsOptions));

// 1. Create Native HTTP Server
const server = http.createServer(app);

// 2. Initialize Socket.io on that Server
const io = new Server(server, {
    cors: corsOptions // Reuse the same strict policy
});

// 3. Attach Handlers
setupSocketHandlers(io);

// Health Check
app.get('/health', (req, res) => res.status(200).send('OK'));

// REST API Routes
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

export { app, server, io, PORT };
