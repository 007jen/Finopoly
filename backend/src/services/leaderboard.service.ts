// import { prisma } from "../utils/prisma";

// export async function getAllTimeLeaderboard(limit: number = 50) {
//     // limit is set to 50 because we want to show only top 50 users in the leaderboard
//     const getAllTimeLeaderboard = async () => {
//         return prisma.user.findMany({
//             orderBy: { xp: "desc" },
//             take: limit,
//             select: { id: true, email: true, xp: true }
//         });
//     };

//     const users = await getAllTimeLeaderboard();
//     return users.map((user, index) => ({
//         rank: index + 1,
//         userId: user.id,
//         email: user.email,
//         xp: user.xp,
//     }));
// }


import { prisma } from "../utils/prisma";

export async function getAllTimeLeaderboard(limit = 50) {
    const users = await prisma.user.findMany({
        orderBy: { xp: "desc" },
        take: limit,
        select: {
            id: true,
            email: true,
            xp: true,
        },
    });

    return users.map((user, index) => ({
        rank: index + 1,
        userId: user.id,
        email: user.email,
        xp: user.xp,
    }));
}
