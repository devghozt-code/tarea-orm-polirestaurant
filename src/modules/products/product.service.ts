import { prisma } from "../../../lib/prisma";
import type { Prisma } from "../../../generated/prisma/client";
import type { CreateProductInput } from "./product.validation.ts";

export async function createProduct(input: CreateProductInput) {
    const data = {
        name: input.name,
        description: input.description,
        price: input.price,
        ...(input.categoryId !== undefined && {
            category: { connect: { id: input.categoryId } },
        }),
    } satisfies Prisma.ProductsCreateInput;

    return prisma.products.create({ data });
}

export async function getProductById(id: number) {
    return prisma.products.findUnique({
        where: { id },
        include: { category: true },
    });
}

export async function getAllProducts() {
    return prisma.products.findMany({
        include: { category: true },
        orderBy: { id: "asc" },
    });
}

export async function updateProduct(id: number, input: Partial<CreateProductInput>) {
    const data = {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.price !== undefined && { price: input.price }),
        ...(input.categoryId !== undefined && {
            category: { connect: { id: input.categoryId } },
        }),
    } satisfies Prisma.ProductsUpdateInput;

    return prisma.products.update({
        where: { id },
        data,
        include: { category: true },
    });
}

export async function deleteProduct(id: number) {
    return prisma.products.delete({
        where: { id },
    });
}
