import { prisma } from "../utils/prisma";
import { SubmissionStatus } from "@prisma/client";

export const caseReviewService = {
    async reviewSubmission(
        submissionId: string,
        score: number,
        feedback: string
    ) {
        if (score < 0 || score > 100) {
            throw new Error("INVALID_SCORE");
        }

        const submission = await prisma.caseSubmission.findUnique({
            where: { id: submissionId },
        });

        if (!submission) {
            throw new Error("SUBMISSION_NOT_FOUND");
        }

        if (submission.status !== SubmissionStatus.PENDING && submission.status !== SubmissionStatus.REVIEWING) {
            throw new Error("ALREADY_REVIEWED");
        }

        return prisma.caseSubmission.update({
            where: { id: submissionId },
            data: {
                score,
                feedback,
                status: SubmissionStatus.APPROVED,
                reviewedAt: new Date(),
            },
        });
    },
};
