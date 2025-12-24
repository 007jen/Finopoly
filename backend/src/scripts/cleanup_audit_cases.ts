
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Running Audit Case Cleanup...');

    // Find cases where invoiceDetails or ledgerDetails is null (or empty object if stored as such)
    // Prisma JSON filter support depends on DB, but finding all and filtering in JS is safer for small datasets.
    const allCases = await prisma.auditCase.findMany();

    let deletedCount = 0;

    for (const ac of allCases) {
        const invoice = ac.invoiceDetails as any;
        const ledger = ac.ledgerDetails as any;

        // Check if invalid: null, or missing basic fields like 'amount' or 'vendor'
        const isInvalid = !invoice || !invoice.amount || !invoice.vendor || !ledger;

        if (isInvalid) {
            console.log(`Deleting invalid case: ${ac.title} (ID: ${ac.id})`);
            await prisma.auditCase.delete({ where: { id: ac.id } });
            deletedCount++;
        }
    }

    console.log(`Cleanup Complete. Deleted ${deletedCount} invalid cases.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
