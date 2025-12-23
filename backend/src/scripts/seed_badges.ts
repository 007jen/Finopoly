import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const BADGES = [
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

async function main() {
    console.log('Seeding Badges...');

    for (const b of BADGES) {
        const badge = await prisma.badge.upsert({
            where: { name: b.name },
            update: {
                description: b.description,
                icon: b.icon,
                xpRequirement: b.xpRequirement
            },
            create: {
                name: b.name,
                description: b.description,
                icon: b.icon,
                xpRequirement: b.xpRequirement
            }
        });
        console.log(`- Upserted: ${badge.name} (${badge.xpRequirement} XP)`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
