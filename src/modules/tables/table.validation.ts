import { z } from "zod";

export const createTableSchema = z.object({
    name: z.string().trim().min(1).max(150),
    capacity: z.coerce.number().int().positive("La capacidad debe ser un número entero positivo"),
    status: z.enum(["AVAILABLE", "OCCUPIED", "RESERVED"]).default("AVAILABLE"),
});

export type CreateTableInput = z.infer<typeof createTableSchema>;