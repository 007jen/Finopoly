
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const INITIAL_CASES = [
    {
        title: "GST Mismatch: Sharma Traders",
        companyName: "Swastik Enterprises",
        difficulty: "Beginner",
        description: "Verify if the invoice matches the ledger and GST compliance.",
        xpReward: 150,
        timeLimit: 300,
        isActive: true,
        invoiceDetails: {
            vendor: "Sharma Traders",
            invoiceNo: "INV/23-24/890",
            date: "15-09-2024",
            amount: 100000,
            tax: 18000,
            total: 118000,
            description: "Consultancy Services",
            paymentMode: "BANK",
            gstin: "27ABCDE1234F1Z5"
        },
        ledgerDetails: {
            date: "15-09-24",
            particulars: "Consultancy Exp.",
            vchType: "Journal",
            vchNo: "890",
            debit: 100000,
            credit: null
        },
        expectedAction: "ACCEPT",
        tags: ["GST", "Bank Payment", "Service"]
    },
    {
        title: "Cash Payment Violation: Hardware Store",
        companyName: "Swastik Enterprises",
        difficulty: "Intermediate",
        description: "Check for Section 40A(3) violations regarding cash payments.",
        xpReward: 200,
        timeLimit: 300,
        isActive: true,
        invoiceDetails: {
            vendor: "Local Hardware Store",
            invoiceNo: "INV/24/890",
            date: "15-09-2024",
            amount: 20000,
            tax: 2000,
            total: 22000,
            description: "Office Repairs",
            paymentMode: "CASH",
            gstin: "27ABCDE1234F1Z5"
        },
        ledgerDetails: {
            date: "15-09-24",
            particulars: "Repairs & Maintenance",
            vchType: "Payment",
            vchNo: "452",
            debit: 22000,
            credit: null
        },
        expectedAction: "REJECT",
        violationReason: "DISALLOWED: Section 40A(3) Violation (Cash > 10k)",
        tags: ["Income Tax", "Cash Limit", "Disallowed"]
    },
    {
        title: "Date Mismatch: Tech Solutions",
        companyName: "Swastik Enterprises",
        difficulty: "Beginner",
        description: "Ensure the invoice date corresponds to the financial year.",
        xpReward: 150,
        timeLimit: 300,
        isActive: true,
        invoiceDetails: {
            vendor: "Tech Solutions Pvt Ltd",
            invoiceNo: "TS/24/101",
            date: "01-04-2023",
            amount: 50000,
            tax: 9000,
            total: 59000,
            description: "AMC Charges",
            paymentMode: "BANK",
            gstin: "29XYZAB5678C1Z2"
        },
        ledgerDetails: {
            date: "31-03-2025",
            particulars: "AMC Expenses",
            vchType: "Journal",
            vchNo: "101",
            debit: 59000,
            credit: null
        },
        expectedAction: "REJECT",
        violationReason: "Date Mismatch: Invoice differs from Ledger Year",
        tags: ["Accounting Standards", "Date Check"]
    }
];

async function main() {
    console.log("🌱 Seeding Audit Cases...");

    // Clear existing to avoid duplicates in this dev phase
    // await prisma.auditCase.deleteMany({}); 

    for (const data of INITIAL_CASES) {
        // Use upsert to avoid creating duplicates if run multiple times
        // Identifying by title isn't perfect but works for seeding
        const existing = await prisma.auditCase.findFirst({
            where: { title: data.title }
        });

        if (!existing) {
            await prisma.auditCase.create({
                data: {
                    ...data,
                    difficulty: data.difficulty as any // Cast string to enum
                }
            });
            console.log(`✅ Created: ${data.title}`);
        } else {
            console.log(`⏩ Skipped (Exists): ${data.title}`);
        }
    }

    console.log("✨ Seeding Complete!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
