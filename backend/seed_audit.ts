
import { PrismaClient, Difficulty } from '@prisma/client';

const prisma = new PrismaClient();

const dummyCases = [
    {
        title: "Swastik Enterprises - Purchase Audit",
        companyName: "Swastik Enterprises",
        difficulty: Difficulty.Beginner,
        description: "Audit the purchase register for Swastik Enterprises for the month of April. Focus on GST calculation accuracy.",
        xpReward: 150,
        timeLimit: 600,
        invoiceDetails: {
            invoiceNo: "INV/2024/001",
            date: "2024-04-05",
            vendor: "Swastik Enterprises",
            amount: 10000,
            tax: 1800,
            total: 11800,
            description: "Office Supplies",
            paymentMode: "BANK",
            gstin: "27AAACS1234A1Z1",
            items: [{ desc: "Office Supplies", qty: 10, rate: 1000, total: 10000 }]
        },
        ledgerDetails: {
            vchNo: "P-001",
            date: "2024-04-05",
            amount: 11800,
            particulars: "Purchase A/c",
            debit: 11800,
            credit: 0
        },
        clientBrief: {
            industry: "Retail",
            auditPeriod: "FY 2024-25",
            materiality: 500
        },
        expectedAction: "QUALIFIED",
        violationReason: "Incorrect GST calculation observed (Expected 1800, Ledger shows 1200 in tax breakdown).",
        faultyField: "Amount",
        tags: ["GST", "Purchase", "Beginner"]
    },
    {
        title: "Hindustan Logistics - Fuel Expense",
        companyName: "Hindustan Logistics",
        difficulty: Difficulty.Intermediate,
        description: "Review high-value fuel expenses. Check if the bill date matches the accounting entry.",
        xpReward: 200,
        timeLimit: 450,
        invoiceDetails: {
            invoiceNo: "PETRO/99",
            date: "2024-05-12",
            vendor: "HP Fuel Station",
            amount: 4500,
            tax: 0,
            total: 4500,
            description: "Fuel for Logistics",
            paymentMode: "CASH",
            gstin: "URD-NON-GST",
            items: [{ desc: "Diesel Bulk", qty: 50, rate: 90, total: 4500 }]
        },
        ledgerDetails: {
            vchNo: "F-202",
            date: "24-May-12", // Standard Tally Format
            particulars: "Bank A/c",
            debit: 4500,
            credit: 0
        },
        clientBrief: {
            industry: "Logistics",
            auditPeriod: "Q1 2024",
            materiality: 1000
        },
        expectedAction: "QUALIFIED",
        violationReason: "Cut-off error: Transaction date in books (24-May-12) matches but the voucher date in Tally was audit-flagged.",
        faultyField: "Date",
        tags: ["Expense", "Logistics", "Cut-off"]
    }
];

async function main() {
    console.log('Updating dummy audit cases...');
    for (const c of dummyCases) {
        // Find existing by title
        const existing = await prisma.auditCase.findFirst({
            where: { title: c.title }
        });

        await prisma.auditCase.upsert({
            where: { id: existing?.id || '00000000-0000-0000-0000-000000000000' },
            update: c,
            create: c
        });
        console.log(`Synced: ${c.title}`);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
