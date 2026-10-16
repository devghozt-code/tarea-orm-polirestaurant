import { prisma } from "../../../lib/prisma";
import type { Prisma } from "../../../generated/prisma/client";
import type { CreateTableInput } from "./table.validation";

export async function createTable(input: CreateTableInput) {
    return prisma.table.create({
        data: input satisfies Prisma.TableCreateInput,
    });
}

export async function getTableById(id: number) {
    return prisma.table.findUnique({
        where: { id },
    });
}

export async function getAllTables() {
    return prisma.table.findMany({
        orderBy: { id: "asc" },
    });
}

export async function updateTableById(id: number, input: Partial<CreateTableInput>) {
    return prisma.table.update({
        where: { id },
        data: input satisfies Prisma.TableUpdateInput,
    });
}

export async function deleteTableById(id: number) {
    return prisma.table.delete({
        where: { id },
    });
}