import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { parseRuntimeConfig } from './runtime.js';

const { databaseUrl } = parseRuntimeConfig(process.env);

const adapter = new PrismaPg({ connectionString: databaseUrl })
const prisma = new PrismaClient({ adapter })

export { prisma }
