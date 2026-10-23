import "dotenv/config";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { prisma } from "../lib/prisma";
import {
    createTable,
    deleteTableById,
    getAllTables,
    getTableById,
    updateTableById,
} from "./modules/tables/table.service";
import { createTableSchema } from "./modules/tables/table.validation";

const updateTableSchema = createTableSchema.partial().refine(
    (input) => Object.keys(input).length > 0,
    "Debe enviar al menos un campo para actualizar.",
);

class RequestBodyTooLargeError extends Error {}

function sendJson(response: ServerResponse, statusCode: number, data: unknown) {
    response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
    response.end(JSON.stringify(data));
}

async function readJsonBody(request: IncomingMessage): Promise<unknown> {
    const chunks: Buffer[] = [];
    let size = 0;

    for await (const chunk of request) {
        const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        size += buffer.length;
        if (size > 1_048_576) {
            throw new RequestBodyTooLargeError();
        }
        chunks.push(buffer);
    }

    return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
}

function isRecordNotFound(error: unknown): boolean {
    return typeof error === "object"
        && error !== null
        && "code" in error
        && error.code === "P2025";
}

async function handleRequest(request: IncomingMessage, response: ServerResponse) {
    const url = new URL(request.url ?? "/", "http://localhost");
    const path = url.pathname.replace(/\/+$/, "") || "/";
    const method = request.method ?? "GET";

    if (path === "/api/tables" && method === "GET") {
        sendJson(response, 200, await getAllTables());
        return;
    }

    if (path === "/api/tables" && method === "POST") {
        let body: unknown;
        try {
            body = await readJsonBody(request);
        } catch (error) {
            if (error instanceof SyntaxError) {
                sendJson(response, 400, { error: "El cuerpo debe contener JSON válido." });
            } else if (error instanceof RequestBodyTooLargeError) {
                sendJson(response, 413, { error: "El cuerpo de la solicitud supera el límite de 1 MB." });
            } else {
                throw error;
            }
            return;
        }

        const validation = createTableSchema.safeParse(body);
        if (!validation.success) {
            sendJson(response, 400, { error: "Datos inválidos.", details: validation.error.issues });
            return;
        }

        sendJson(response, 201, await createTable(validation.data));
        return;
    }

    const tableMatch = path.match(/^\/api\/tables\/([^/]+)$/);
    if (tableMatch) {
        const id = Number(tableMatch[1]);
        if (!Number.isInteger(id) || id <= 0) {
            sendJson(response, 400, { error: "El ID debe ser un número entero positivo." });
            return;
        }

        if (method === "GET") {
            const table = await getTableById(id);
            if (!table) {
                sendJson(response, 404, { error: "Mesa no encontrada." });
                return;
            }
            sendJson(response, 200, table);
            return;
        }

        if (method === "PUT" || method === "PATCH") {
            let body: unknown;
            try {
                body = await readJsonBody(request);
            } catch (error) {
                if (error instanceof SyntaxError) {
                    sendJson(response, 400, { error: "El cuerpo debe contener JSON válido." });
                } else if (error instanceof RequestBodyTooLargeError) {
                    sendJson(response, 413, { error: "El cuerpo de la solicitud supera el límite de 1 MB." });
                } else {
                    throw error;
                }
                return;
            }

            const validation = updateTableSchema.safeParse(body);
            if (!validation.success) {
                sendJson(response, 400, { error: "Datos inválidos.", details: validation.error.issues });
                return;
            }

            try {
                const updates = {
                    ...(validation.data.name !== undefined && { name: validation.data.name }),
                    ...(validation.data.capacity !== undefined && { capacity: validation.data.capacity }),
                    ...(validation.data.status !== undefined && { status: validation.data.status }),
                };
                sendJson(response, 200, await updateTableById(id, updates));
            } catch (error) {
                if (isRecordNotFound(error)) {
                    sendJson(response, 404, { error: "Mesa no encontrada." });
                    return;
                }
                throw error;
            }
            return;
        }

        if (method === "DELETE") {
            try {
                await deleteTableById(id);
                response.writeHead(204);
                response.end();
            } catch (error) {
                if (isRecordNotFound(error)) {
                    sendJson(response, 404, { error: "Mesa no encontrada." });
                    return;
                }
                throw error;
            }
            return;
        }
    }

    sendJson(response, 404, { error: "Ruta no encontrada." });
}

const port = Number(process.env["PORT"] ?? 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT debe ser un número entero entre 1 y 65535.");
}

const server = createServer((request, response) => {
    void handleRequest(request, response).catch((error: unknown) => {
        console.error("Error al procesar la solicitud:", error);
        if (!response.headersSent) {
            sendJson(response, 500, { error: "Error interno del servidor." });
        } else {
            response.destroy();
        }
    });
});

server.listen(port, "127.0.0.1", () => {
    console.log(`API de mesas disponible en http://127.0.0.1:${port}/api/tables`);
});

server.on("close", () => {
    void prisma.$disconnect();
});
