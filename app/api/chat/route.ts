import { NextRequest, NextResponse } from "next/server";
import { MCPClient } from "@/lib/mcp-client";
import path from "path";

// Initialize MCP client as a singleton
let mcpClient: MCPClient | null = null;

async function getMCPClient(): Promise<MCPClient> {
    console.log("hf api key ", process.env.HF_API_KEY)
    if (!mcpClient) {

        const apiKey = process.env.HF_API_KEY || "";

        mcpClient = new MCPClient(apiKey);

        const serverPath = path.join(
            process.cwd(),
            "server_mcp",
            "index.ts"
        );

        await mcpClient.connect(serverPath);
    }

    return mcpClient;
}

export async function POST(request: NextRequest) {
    try {
        console.log("Inside POST handler");
        const body = await request.json();
        const { query } = body;
        console.log("Received query:", query);

        if (!query || typeof query !== "string") {
            return NextResponse.json(
                { error: "Query is required and must be a string" },
                { status: 400 }
            );
        }

        // Force new client creation for debugging
        console.log("Creating new MCP client...");
        // const apiKey = process.env.HF_API_KEY || ""
        // const client = new MCPClient(apiKey);
        const client = await getMCPClient();

        const serverPath = path.join(
            process.cwd(),
            "server_mcp",
            "index.ts"
        );
        console.log("Connecting to server at:", serverPath);
        await client.connect(serverPath);

        console.log("Client connected, processing query...");
        const response = await client.processQuery(query);
        console.log("Query processed, response:", response);

        // Disconnect to clean up
        await client.disconnect();

        return NextResponse.json({
            success: true,
            response,
        });
    } catch (error) {
        console.error("Error processing query:", error);

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error occurred",
            },
            { status: 500 }
        );
    }
}
