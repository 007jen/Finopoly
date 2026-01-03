import { z } from "zod";
import { Server, Socket } from "socket.io";
import { prisma } from "./utils/prisma";
import { ProgressService } from "./services/progress.service";
// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient(); // Architect note: Use a singleton in production

// 1. Define the Message Schema (The Architect's Shield)
const MessageSchema = z.object({
    room: z.string().min(1), // Can be ID or name for now, but not junk
    content: z.string().min(1).max(2000),
    author: z.string().min(1),
    time: z.string().optional(),
});
const challengeSchema = z.object({
    room: z.string().min(1),
    content: z.string().min(1),
    answer: z.string().min(1),
    xpReward: z.number().min(50),

});

// 2. The Socket Manager
export const setupSocketHandlers = (io: Server) => {
    // Simple authentication middleware for Phase 1
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error("Unauthorized: No token provided"));
        // Token verification logic would go here
        next();
    });

    io.on("connection", (socket: Socket) => {
        console.log(`[SOCKET] Handshake Successful: ${socket.id}`);

        socket.on("join_room", async (room: string) => {
            // Logic: You should verify room existence in DB here
            socket.join(room);
            console.log(`[SOCKET] User ${socket.id} joined room: ${room}`);
            const channel = await prisma.channel.findUnique(
                {
                    where: {
                        name: room
                    },
                    include: {
                        messages: {
                            take: 50,
                            orderBy: { createdAt: 'asc' }
                        }
                    }
                });

            if (channel) {
                const history = channel.messages.map(m => ({
                    id: m.id,
                    room: room,
                    author: m.authorName,
                    content: m.content,
                    time: m.createdAt.toISOString(),
                    challengeData: m.challengeData
                }));
                socket.emit("load_history", history);
            }
        });

        socket.on("send_message", async (payload: unknown) => {
            try {
                // Strict Validation
                const validatedData = MessageSchema.parse(payload);
                const channel = await prisma.channel.findUnique(
                    {
                        where:
                            { name: validatedData.room }
                    }
                );
                if (channel) {
                    await prisma.message.create({
                        data: {
                            content: validatedData.content,
                            authorName: validatedData.author,
                            channelId: channel.id,
                        }
                    });
                }

                socket.to(validatedData.room).emit("receive_message", validatedData);
            } catch (error) {
                if (error instanceof z.ZodError) {
                    console.error(`[SOCKET-ERROR] Malformed payload from ${socket.id}`);
                    socket.emit("error", { message: "Invalid payload format" });
                }
            }
        });

        socket.on("broadcast_challenge", async (payload: unknown) => {
            try {
                const challenge = challengeSchema.parse(payload);
                let channel = await prisma.channel.findUnique({ where: { name: challenge.room } });
                if (!channel) {
                    // If not found, just grab ANY existing channel so the message doesn't fail
                    channel = await prisma.channel.findFirst();
                }
                if (!channel) return;
                const message = await prisma.message.create({
                    data: {
                        content: challenge.content,
                        authorName: "SYSTEM",
                        channelId: channel.id,
                        challengeData: {
                            type: "QUIZ",
                            answer: challenge.answer,
                            xpReward: challenge.xpReward,
                            isChallenge: true

                        }
                    }
                });
                io.to(challenge.room).emit("receive_message", {
                    id: message.id,
                    room: challenge.room,
                    content: challenge.content,
                    author: "SYSTEM",
                    time: message.createdAt.toISOString(),
                    challengeData: {
                        isChallenge: true,
                        xpReward: challenge.xpReward,
                    }
                });
            } catch (error) {
                console.error("[CHALLENGE-ERROR]", error);
            }
        });
        socket.on("submit_challenge_answer", async (data: { messageId: string; answer: string, userId?: string, username: string }) => {
            try {
                const message = await prisma.message.findUnique({ where: { id: data.messageId } });
                if (!message || !message.challengeData) return;

                const challengeData = message.challengeData as any;

                // 🛑 Level 3: Check if already solved
                if (challengeData.isSolved) {
                    socket.emit("challenge_result", {
                        success: false,
                        message: `Already solved by ${challengeData.winner || 'someone else'}!`
                    });
                    return;
                }

                const isCorrect = data.answer.trim().toLowerCase() === challengeData.answer.trim().toLowerCase();
                if (isCorrect) {
                    // Mark as Solved in DB
                    const updatedData = {
                        ...challengeData,
                        isSolved: true,
                        winner: data.username || "Someone"
                    };

                    await prisma.message.update({
                        where: { id: data.messageId },
                        data: { challengeData: updatedData }
                    });

                    if (data.userId) {
                        await ProgressService.addXp(
                            data.userId,
                            challengeData.xpReward,
                            `Solved Challenge: ${message.content}`
                        );
                    }

                    socket.emit("challenge_result", {
                        success: true,
                        message: "Challenge Solved Successfully",
                        xpReward: challengeData.xpReward,
                    });

                    // 🌍 GLOBAL BROADCAST: Tell everyone it's over
                    io.emit("challenge_solved_globally", {
                        messageId: message.id,
                        winner: data.username || "Someone"
                    });
                } else {
                    socket.emit("challenge_result", { success: false, message: "Negative. Try again." });
                }
            } catch (error) {
                console.error("[SOLVE-ERROR]", error);
            }
        });
        socket.on("disconnect", () => {
            console.log(`[SOCKET] Session Ended: ${socket.id}`);
        });
    });
};