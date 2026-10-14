import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { prisma } from "../lib/prisma";
import {
    createProduct,
    getProductById,
    getAllProducts,
    updateProduct,
    deleteProduct,
} from "./modules/products/product.service";
import { createProductSchema } from "./modules/products/product.validation";

async function showProductsMenu(terminal: ReturnType<typeof createInterface>) {
    while (true) {
        console.log("\n=== CRUD PRODUCTOS ===");
        console.log("1. Crear producto");
        console.log("2. Listar productos");
        console.log("3. Obtener producto por ID");
        console.log("4. Actualizar producto");
        console.log("5. Eliminar producto");
        console.log("6. Volver al menú principal");

        const option = await terminal.question("\nSeleccione una opción: ");

        switch (option) {
            case "1": {
                const answers = {
                    name: await terminal.question("Nombre del producto: "),
                    description: await terminal.question("Descripción: "),
                    price: await terminal.question("Precio: "),
                    categoryId: await terminal.question("ID de categoría existente (opcional, Enter para omitir): "),
                };

                const validation = createProductSchema.safeParse(answers);
                if (!validation.success) {
                    console.error("No se pudo crear el producto:");
                    for (const issue of validation.error.issues) {
                        console.error(`- ${issue.path.join(".")}: ${issue.message}`);
                    }
                    break;
                }

                const product = await createProduct(validation.data);
                console.log("Producto creado:", product);
                break;
            }
            case "2": {
                const products = await getAllProducts();
                console.log("\nLista de productos:");
                console.table(products.map(p => ({
                    ID: p.id,
                    Nombre: p.name,
                    Precio: p.price,
                    Categoría: p.category?.name || "Sin categoría"
                })));
                break;
            }
            case "3": {
                const id = Number(await terminal.question("ID del producto: "));
                const product = await getProductById(id);
                if (product) {
                    console.log("Producto encontrado:", product);
                } else {
                    console.log("Producto no encontrado");
                }
                break;
            }
            case "4": {
                const id = Number(await terminal.question("ID del producto a actualizar: "));
                const updates = {
                    name: await terminal.question("Nuevo nombre (Enter para mantener): "),
                    description: await terminal.question("Nueva descripción (Enter para mantener): "),
                    price: await terminal.question("Nuevo precio (Enter para mantener): "),
                    categoryId: await terminal.question("Nuevo ID categoría (Enter para mantener): "),
                };
                const filteredUpdates = Object.fromEntries(
                    Object.entries(updates).filter(([, v]) => v !== "")
                );
                const product = await updateProduct(id, filteredUpdates);
                console.log("Producto actualizado:", product);
                break;
            }
            case "5": {
                const id = Number(await terminal.question("ID del producto a eliminar: "));
                await deleteProduct(id);
                console.log("Producto eliminado correctamente");
                break;
            }
            case "6":
                return;
            default:
                console.log("Opción inválida");
        }
    }
}

async function showCategoriesMenu(terminal: ReturnType<typeof createInterface>) {
    console.log("\n=== CRUD CATEGORÍAS ===");
    console.log("(Próximamente - estructura lista en src/modules/categories/)");
    await terminal.question("\nPresione Enter para volver...");
}

async function showTablesMenu(terminal: ReturnType<typeof createInterface>) {
    console.log("\n=== CRUD MESAS ===");
    console.log("(Próximamente - estructura lista en src/modules/tables/)");
    await terminal.question("\nPresione Enter para volver...");
}

async function main() {
    const terminal = createInterface({ input: stdin, output: stdout });

    try {
        while (true) {
            console.log("\n========== POLIRESTAURANT ORM ==========");
            console.log("1. Productos");
            console.log("2. Categorías");
            console.log("3. Mesas");
            console.log("4. Salir");

            const option = await terminal.question("\nSeleccione un módulo: ");

            switch (option) {
                case "1":
                    await showProductsMenu(terminal);
                    break;
                case "2":
                    await showCategoriesMenu(terminal);
                    break;
                case "3":
                    await showTablesMenu(terminal);
                    break;
                case "4":
                    console.log("Saliendo...");
                    return;
                default:
                    console.log("Opción inválida");
            }
        }
    } finally {
        terminal.close();
    }
}

main()
    .catch((error: unknown) => {
        console.error("Error running application:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });