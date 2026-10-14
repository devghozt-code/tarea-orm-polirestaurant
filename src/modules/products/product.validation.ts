import { z } from "zod";

export const createProductSchema = z.object({
    name: z.string().trim().min(1).max(150),
    description: z.string().trim().min(1).max(500),
    price: z
        .union([z.string(), z.number()])
        .transform(String)
        .pipe(z.string().regex(/^\d+(\.\d{1,2})?$/, "Price must be a valid number with up to 2 decimal places"))
        .refine((value) => Number(value) > 0, "Price must be greater than 0"),
    categoryId: z.preprocess(
        (value) => typeof value === "string" && value.trim() === "" ? undefined : value,
        z.coerce.number().int().positive("Category ID must be a positive integer").optional(),
    ),
})

export type CreateProductInput = z.infer<typeof createProductSchema>;