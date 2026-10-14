import "dotenv/config";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const databaseUrl = process.env["DATABASE_URL"];
const caCertificatePath = process.env["PGSSLROOTCERT_PATH"];

if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
}

if (!caCertificatePath) {
    throw new Error("PGSSLROOTCERT_PATH is not set. Configure the Aiven CA certificate path.");
}

const connectionUrl = new URL(databaseUrl);
for (const parameter of ["sslmode", "sslcert", "sslkey", "sslrootcert"]) {
    connectionUrl.searchParams.delete(parameter);
}

const adapter = new PrismaPg({
    connectionString: connectionUrl.toString(),
    ssl: {
        ca: readFileSync(resolve(process.cwd(), caCertificatePath), "utf8"),
        rejectUnauthorized: true,
    },
});
const prisma = new PrismaClient({ adapter });

export { prisma };