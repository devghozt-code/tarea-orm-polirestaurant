import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const databaseUrl = process.env["DATABASE_URL"];

if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
}

const connectionString = `${databaseUrl}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };