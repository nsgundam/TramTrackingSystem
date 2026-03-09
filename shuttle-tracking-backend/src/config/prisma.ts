import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const connectionString = `${process.env.DATABASE_URL}`

// 1. Create the adapter using your connection pooler URL
const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

// 2. Pass the adapter into the Prisma Client constructor
export const prisma = new PrismaClient({ adapter });
