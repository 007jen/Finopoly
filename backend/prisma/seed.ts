import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    await prisma.user.upsert({
        where: { email: "admin@finopoly.com" },
        update: {
            role: "admin",
        },
        create: {
            clerkId: "local-admin-seed",
            email: "admin@finopoly.com",
            role: "admin",
            xp: 0,
            streak: 0,
        },
    });

    // Seed Cases
    const case1 = await prisma.caseLaw.upsert({
        where: { id: "case-1-contract" }, // Fixed ID for testing
        update: {},
        create: {
            id: "case-1-contract",
            title: "The Case of the Missing Contract",
            category: "Contract Law",
            difficulty: "Beginner",
            xpReward: 100,
            facts: "A handy man agreed to paint a fence for $500 but quit halfway.",
            question: "Is the homeowner obligated to pay the full amount?",
            options: ["Yes", "No", "Only for work done", "Double"],
            correctAnswer: "Only for work done",
            explanation: "Quantum meruit applies.",
        },
    });

    const case2 = await prisma.caseLaw.upsert({
        where: { id: "case-2-tax" },
        update: {},
        create: {
            id: "case-2-tax",
            title: "Corporate Tax Evasion Scandal",
            category: "Corporate Law",
            difficulty: "Pro",
            xpReward: 300,
            facts: "CEO hid assets in offshore accounts.",
            question: "What is the primary charge?",
            options: ["Fraud", "Tax Evasion", "Embezzlement", "Theft"],
            correctAnswer: "Tax Evasion",
            explanation: "Intentional concealment of assets from tax authorities.",
        },
    });

    // Seed Badges
    const badges = [
        { name: "Novice Auditor", xp: 500, description: "Earned 500 XP", icon: "🥉" },
        { name: "Apprentice", xp: 1000, description: "Earned 1000 XP", icon: "🥈" },
        { name: "Audit Pro", xp: 2500, description: "Earned 2500 XP", icon: "🥇" },
        { name: "Master of Coin", xp: 5000, description: "Earned 5000 XP", icon: "💎" },
        { name: "Grandmaster", xp: 10000, description: "Earned 10000 XP", icon: "👑" }
    ];

    for (const b of badges) {
        await prisma.badge.upsert({
            where: { name: b.name },
            update: {},
            create: {
                name: b.name,
                description: b.description,
                xpRequirement: b.xp,
                icon: b.icon
            }
        });
    }

    console.log("Admin user seeded");
    console.log("Cases seeded: ", case1.title, case2.title);
    console.log("Badges seeded: ", badges.map(b => b.name).join(", "));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
