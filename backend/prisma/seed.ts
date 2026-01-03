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

    // 0. Cleanup Old Badges (Anti-clutter)
    const oldBadgeNames = ["Novice Auditor", "Apprentice", "Audit Pro", "Master of Coin", "Grandmaster"];

    // First find the badges to get their IDs
    const badgesToDelete = await prisma.badge.findMany({
        where: { name: { in: oldBadgeNames } }
    });

    if (badgesToDelete.length > 0) {
        const ids = badgesToDelete.map(b => b.id);
        // Delete UserBadge links first to avoid foreign key errors
        await prisma.userBadge.deleteMany({
            where: { badgeId: { in: ids } }
        });
        // Now delete the badges
        await prisma.badge.deleteMany({
            where: { id: { in: ids } }
        });
        console.log(`Cleaned up ${badgesToDelete.length} old badges.`);
    }

    // Seed Badges
    const badges = [
        {
            name: "Motivated Aspirant",
            description: "Reached 2,000 XP! You've started a strong journey.",
            icon: "target",
            xpRequirement: 2000
        },
        {
            name: "Consistent Player",
            description: "Reached 5,000 XP! Your dedication is showing.",
            icon: "zap",
            xpRequirement: 5000
        },
        {
            name: "You Can Do It",
            description: "Reached 7,000 XP! Keep pushing forward.",
            icon: "thumbs-up",
            xpRequirement: 7000
        },
        {
            name: "Maintain Your Legacy",
            description: "Reached 15,000 XP! You are building a legacy.",
            icon: "shield",
            xpRequirement: 15000
        },
        {
            name: "Learning to Teach Others",
            description: "Reached 20,000 XP! You are now a master.",
            icon: "book-open",
            xpRequirement: 20000
        }
    ];

    for (const b of badges) {
        await prisma.badge.upsert({
            where: { name: b.name },
            update: {
                description: b.description,
                xpRequirement: b.xpRequirement,
                icon: b.icon
            },
            create: {
                name: b.name,
                description: b.description,
                xpRequirement: b.xpRequirement,
                icon: b.icon
            }
        });
    }

    // Seed Analyst Challenges
    const challenge1 = await prisma.analystChallenge.upsert({
        where: { slug: "turning-bullish-07" },
        update: {},
        create: {
            id: "turning-bullish-07",
            title: "Turning Bullish",
            slug: "turning-bullish-07",
            description: "Your dataset contains daily closing prices for the SPDR S&P 500 ETF Trust (SPY) over the last 5 years. Your task is to calculate moving averages and identify 'Golden Cross' moments.",
            difficulty: "JUNIOR",
            isActive: true,
            xpReward: 150,
            chartUrl: "https://images.unsplash.com/photo-1611974717482-aa866a7b3dbd?q=80&w=2070&auto=format&fit=crop",
            datasetUrl: "https://raw.githubusercontent.com/dataprofessor/data/master/iris.csv",
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            question: "What was the close price on the date of the most recent 'golden cross'? (numbers only, no currency symbols)",
            instructions: "1. 50-day moving average: The average closing price for the last 50 trading days, calculated for each date.\n2. 200-day moving average: The average closing price for the last 200 trading days, calculated for each date.\n3. Golden Cross: A binary field (1/0) that equals 1 only on the exact date when the 50-day average crosses from below the 200-day average; otherwise 0.",
            answerType: "NUMBER",
            correctVal: "145.50",
            tolerance: 0.5
        }
    });

    const challenge2 = await prisma.analystChallenge.upsert({
        where: { slug: "profitability-pulse-08" },
        update: {},
        create: {
            id: "profitability-pulse-08",
            title: "Profitability Pulse",
            slug: "profitability-pulse-08",
            description: "Analyze gross margin trends and identify operating leverage shifts. Understand how variable costs impact bottom-line scalability.",
            difficulty: "SENIOR",
            isActive: true,
            xpReward: 250,
            chartUrl: "https://images.unsplash.com/photo-1543286386-713bcd549661?q=80&w=2070&auto=format&fit=crop",
            datasetUrl: "https://raw.githubusercontent.com/dataprofessor/data/master/iris.csv",
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            question: "What is the Year-over-Year (YoY) percentage growth in Gross Profit for the Q3 2023 period?",
            instructions: "1. Calculate Revenue and COGS for Q3 2022 and Q3 2023.\n2. Determine Gross Profit for both periods.\n3. Apply the growth formula: (New - Old) / Old * 100.",
            answerType: "NUMBER",
            correctVal: "12.4",
            tolerance: 0.1
        }
    });

    // Seed Community Channels
    const channel1 = await prisma.channel.upsert({
        where: { name: 'General Lounge' },
        update: {},
        create: {
            id: '1',
            name: 'General Lounge',
            description: 'The main community hub for all students.'
        }
    });

    console.log("Admin user seeded");
    console.log("Cases seeded: ", case1.title, case2.title);
    console.log("Analyst Challenges seeded: ", challenge1.title);
    console.log("Badges seeded: ", badges.map(b => b.name).join(", "));
    console.log("Community Channels seeded: ", channel1.name);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
