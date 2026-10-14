import { prisma } from "../../../lib/prisma";
import type { Prisma } from "../../../generated/prisma/client";
import type { CreateCategoryInput } from "./category.validation";

export async function createCategory(input: CreateCategoryInput) {
    return prisma.categories.create({
        data: input satisfies Prisma.CategoriesCreateInput,
    });
}

export async function getCategoryById(id: number) {
    return prisma.categories.findUnique({
        where: { id },
        include: { products: true },
    });
}

export async function getAllCategories() {
    return prisma.categories.findMany({
        include: { products: true },
        orderBy: { id: "asc" },
    });
}

export async function updateCategory(id: number, input: Partial<CreateCategoryInput>) {
    return prisma.categories.update({
        where: { id },
        data: input satisfies Prisma.CategoriesUpdateInput,
        include: { products: true },
    });
}

export async function deleteCategory(id: number) {
    return prisma.categories.delete({
        where: { id },
    });
}