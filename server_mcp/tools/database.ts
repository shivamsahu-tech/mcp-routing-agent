import { z } from "zod";
import { PrismaClient } from "../generated/client/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

// Initialize Prisma client
const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
    adapter,
});



// Database query execution tool
const ExecuteQueryArgsSchema = z.object({
    query: z.string().describe("SQL query to execute on the PostgreSQL database"),
});

export const databaseTool = {
    name: "execute_database_query",
    description:
        "Execute a SQL query on the PostgreSQL database. The query should be a valid PostgreSQL SELECT statement. Returns the query results as JSON.",
    inputSchema: {
        type: "object",
        properties: {
            query: {
                type: "string",
                description: "SQL query to execute (INSERT, UPDATE, DELETE, SELECT, etc.)",
            },
        },
        required: ["query"],
    },
};



// Execute SQL query
export async function executeDatabaseTool(args: any) {
    const parsed = ExecuteQueryArgsSchema.parse(args);
    const query = parsed.query.trim();

    console.log("user args : ", args)

    // Security check removed to allow full SQL capabilities
    // if (!query.toUpperCase().startsWith("SELECT")) { ... }

    try {

        console.log("db query :  ", query)
        // Execute raw SQL query using Prisma
        const result = await prisma.$queryRawUnsafe(query);

        // Format the result as a readable string
        if (Array.isArray(result)) {
            if (result.length === 0) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "Query executed successfully. No results found.",
                        },
                    ],
                };
            }

            // Return the results as JSON string
            const resultText = JSON.stringify(result, null, 2);
            return {
                content: [
                    {
                        type: "text",
                        text: `Query executed successfully. Results:\n${resultText}`,
                    },
                ],
            };
        }

        return {
            content: [
                {
                    type: "text",
                    text: `Query executed successfully. Result: ${JSON.stringify(result)}`,
                },
            ],
        };
    } catch (error) {
        console.error("Database query error:", error);
        return {
            content: [
                {
                    type: "text",
                    text: `Error executing query: ${error instanceof Error ? error.message : String(error)}`,
                },
            ],
        };
    }
}
