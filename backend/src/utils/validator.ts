import { z } from 'zod';

// Define the Enums exactly as they appear in Prisma
const DifficultyEnum = z.enum(["JUNIOR", "SENIOR", "PARTNER"]);
const AnswerTypeEnum = z.enum(["NUMBER", "TEXT"]);

export const baseChallengeSchema = z.object({
    // 1. Identity & Meta
    title: z.string().min(5, "Title must be at least 5 characters"),
    slug: z.string().min(3).regex(/^[a-z0-9-]+$/, "Slug must be lowercase, numbers, and dashes only"),
    description: z.string().min(10, "Description is too short"),
    richTextContext: z.string().nullable().optional(), // The "Content Below Objectives"
    isActive: z.boolean().optional(),

    // 2. Settings
    difficulty: DifficultyEnum,
    xpReward: z.number().int().min(0).max(1000), // Safety Cap: No one gets 1,000,000 XP

    // 3. Media (Allow empty strings or valid URLs)
    chartUrl: z.string().url().or(z.literal("")).nullable().optional(),
    datasetUrl: z.string().url().or(z.literal("")).nullable().optional(),
    videoUrl: z.string().url("A valid Solution Video URL is required"),

    // 4. The Brain (Logic)
    question: z.string().min(5, "Question is required"),
    instructions: z.string().min(10, "Provide detailed instructions for the analyst"),
    answerType: AnswerTypeEnum,
    correctVal: z.string().min(1, "Correct Answer cannot be empty"),
    tolerance: z.number().min(0).nullable().optional(),
});

export const challengeSchema = baseChallengeSchema.refine((data) => {
    // 🧠 SMART CHECK: If it's a math problem, we MUST have a tolerance
    if (data.answerType === "NUMBER" && (data.tolerance === undefined || data.tolerance === null)) {
        return false;
    }
    return true;
}, {
    message: "Tolerance is required for numeric answers",
    path: ["tolerance"],
});

// Type inference for use in Controller
export type CreateChallengeInput = z.infer<typeof challengeSchema>;