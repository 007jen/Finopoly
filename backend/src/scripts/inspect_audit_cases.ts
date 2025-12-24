
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- DB INSPECTION START ---');
    const allCases = await prisma.auditCase.findMany();

    console.log(`Total Cases: ${allCases.length}`);

    allCases.forEach(c => {
        console.log(`[${c.id}] "${c.title}" (Active: ${c.isActive})`);
        console.log(`   Invoice: ${JSON.stringify(c.invoiceDetails)}`);
        console.log(`   Ledger: ${JSON.stringify(c.ledgerDetails)}`);
        console.log('---');
    });
    console.log('--- DB INSPECTION END ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
