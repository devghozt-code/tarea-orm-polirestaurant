import "dotenv/config";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const databaseUrl = process.env["DATABASE_URL"];
const caCertificatePath = process.env["PGSSLROOTCERT_PATH"];

if (!databaseUrl || !caCertificatePath) {
    throw new Error("DATABASE_URL and PGSSLROOTCERT_PATH must be set");
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

async function main() {
    console.log("Seeding database...");

    // Clear existing data
    await prisma.table.deleteMany();
    await prisma.products.deleteMany();
    await prisma.categories.deleteMany();

    // Create categories
    const categories = await Promise.all([
        prisma.categories.create({
            data: { name: "Entradas", description: "Platos para comenzar la comida" },
        }),
        prisma.categories.create({
            data: { name: "Platos Fuertes", description: "Platos principales" },
        }),
        prisma.categories.create({
            data: { name: "Postres", description: "Dulces para terminar" },
        }),
        prisma.categories.create({
            data: { name: "Bebidas", description: "Bebidas frías y calientes" },
        }),
    ]);

    console.log(`Created ${categories.length} categories`);

    // Create products
    const products = await Promise.all([
        prisma.products.create({
            data: {
                name: "Ceviche de Pescado",
                description: "Pescado fresco marinado en limón con cebolla y cilantro",
                price: 25.50,
                category_id: categories[0].id,
            },
        }),
        prisma.products.create({
            data: {
                name: "Papas a la Huancaína",
                description: "Papas sancochadas con salsa de queso y ají amarillo",
                price: 15.00,
                category_id: categories[0].id,
            },
        }),
        prisma.products.create({
            data: {
                name: "Lomo Saltado",
                description: "Carne salteada con cebolla, tomate, papas fritas y arroz",
                price: 35.00,
                category_id: categories[1].id,
            },
        }),
        prisma.products.create({
            data: {
                name: "Ají de Gallina",
                description: "Pollo deshilachado en salsa de ají amarillo con nueces y queso",
                price: 30.00,
                category_id: categories[1].id,
            },
        }),
        prisma.products.create({
            data: {
                name: "Suspiro a la Limeña",
                description: "Postre tradicional de manjar blanco y merengue",
                price: 12.00,
                category_id: categories[2].id,
            },
        }),
        prisma.products.create({
            data: {
                name: "Mazamorra Morada",
                description: "Postre de maíz morado con frutas y canela",
                price: 10.00,
                category_id: categories[2].id,
            },
        }),
        prisma.products.create({
            data: {
                name: "Chicha Morada",
                description: "Bebida tradicional de maíz morado con piña y canela",
                price: 8.00,
                category_id: categories[3].id,
            },
        }),
        prisma.products.create({
            data: {
                name: "Inca Kola",
                description: "Gaseosa dorada sabor a hierbaluisa",
                price: 6.00,
                category_id: categories[3].id,
            },
        }),
    ]);

    console.log(`Created ${products.length} products`);

    // Create tables
    const tables = await Promise.all([
        prisma.table.create({ data: { name: "Mesa 1", capacity: 2, status: "AVAILABLE" } }),
        prisma.table.create({ data: { name: "Mesa 2", capacity: 4, status: "AVAILABLE" } }),
        prisma.table.create({ data: { name: "Mesa 3", capacity: 4, status: "AVAILABLE" } }),
        prisma.table.create({ data: { name: "Mesa 4", capacity: 6, status: "AVAILABLE" } }),
        prisma.table.create({ data: { name: "Mesa 5", capacity: 6, status: "AVAILABLE" } }),
        prisma.table.create({ data: { name: "Mesa 6", capacity: 8, status: "AVAILABLE" } }),
        prisma.table.create({ data: { name: "Mesa VIP 1", capacity: 10, status: "AVAILABLE" } }),
        prisma.table.create({ data: { name: "Mesa VIP 2", capacity: 12, status: "AVAILABLE" } }),
    ]);

    console.log(`Created ${tables.length} tables`);

    console.log("Seeding completed!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });