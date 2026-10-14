import { z } from "zod";

export const createCategorySchema = z.object({
    name: z.string().trim().min(1).max(100),
    description: z.string().trim().min(1).max(500),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;