import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { HfInference } from "@huggingface/inference";

interface ToolCall {
    name: string;
    args: Record<string, any>;
}

interface ToolResult {
    name: string;
    result: string;
}

export class MCPClient {
    private client: Client | null = null;
    private transport: StdioClientTransport | null = null;
    private hf: HfInference;
    private availableTools: any[] = [];

    constructor(apiKey: string) {
        console.log(`setting up hf client, key length is ${apiKey.length} and starts with ${apiKey.substring(0, 5)}`);
        this.hf = new HfInference(apiKey);
    }

    async connect(serverPath: string): Promise<void> {
        // Create stdio transport to connect to MCP server
        const isTs = serverPath.endsWith(".ts");
        this.transport = new StdioClientTransport({
            command: isTs ? "npx" : "node",
            args: isTs ? ["-y", "tsx", serverPath] : [serverPath],
            env: process.env as Record<string, string>,
        });

        // Create client instance
        this.client = new Client(
            {
                name: "mcp-hf-client",
                version: "1.0.0",
            },
            {
                capabilities: {},
            }
        );

        // Connect to the server
        await this.client.connect(this.transport);

        // List available tools from the server
        const response = await this.client.listTools();
        this.availableTools = response.tools;

        console.log(
            "Connected to MCP server with tools:",
            this.availableTools.map((t) => t.name)
        );
    }

    async disconnect(): Promise<void> {
        if (this.client) {
            await this.client.close();
        }
    }

    private convertToolsToOpenAIFormat(): any[] {
        return this.availableTools.map((tool) => ({
            type: "function",
            function: {
                name: tool.name,
                description: tool.description,
                parameters: tool.inputSchema,
            },
        }));
    }



    async processQuery(query: string): Promise<string> {
        if (!this.client) {
            console.error("client isnt connected yet");
            throw new Error("Client not connected. Call connect() first.");
        }

        console.log('processing query via hugging face...');
        const tools = this.convertToolsToOpenAIFormat();

        const SYSTEM_PROMPT = `
You are a helpful assistant with access to a database and weather tools.
The database has the following schema:
- Employee(id, name, email, position, salary, joinedAt, createdAt)
- Order(id, orderNo, customer, amount, status, createdAt)

IMPORTANT:
- Always use the exact table names: "Employee" and "Order" (case-sensitive if required by DB, but usually PascalCase in Prisma).
- When asked to list or find data, use the \`execute_database_query\` tool with a valid SQL query.
- For "list all employees", use "SELECT * FROM \\"Employee\\"".
- For "list all orders", use "SELECT * FROM \\"Order\\"".
- Always return a final natural language summary of the result.
        `;

        const messages: any[] = [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: query }
        ];

        const MAX_ITERATIONS = 10;
        let iterations = 0;

        while (iterations < MAX_ITERATIONS) {
            iterations++;
            console.log(`\niteration ${iterations} of ${MAX_ITERATIONS}`);
            console.log(`current msg count: ${messages.length}`);

            // Call LLM
            console.log("calling llm now...");
            try {
                const response = await this.hf.chatCompletion({
                    model: "Qwen/Qwen2.5-72B-Instruct",
                    messages: messages,
                    tools: tools,
                    max_tokens: 500,
                });

                const message = response.choices[0].message;
                const toolCalls = message.tool_calls;

                // Add assistant's message to history
                messages.push(message);

                // If no tool calls, we are done. Return the text response.
                if (!toolCalls || toolCalls.length === 0) {
                    console.log("no tool calls found, returning response");
                    return message.content || "No response generated.";
                }

                console.log(`llm requested ${toolCalls.length} tool calls`);

                // Execute tool calls
                for (const call of toolCalls) {
                    console.log(`\nexecuting tool: ${call.function.name}`);
                    console.log(`args: ${JSON.stringify(call.function.arguments)}`);

                    try {
                        // Parse arguments
                        let args = call.function.arguments;
                        if (typeof args === 'string') {
                            args = JSON.parse(args);
                        }

                        const mcpResult: any = await this.client.callTool({
                            name: call.function.name,
                            arguments: args as any,
                        });

                        const resultText = mcpResult.content[0]?.text || "Done";
                        console.log(`tool result: ${resultText.substring(0, 100)}...`);

                        // Add tool result to history
                        messages.push({
                            role: "tool",
                            tool_call_id: call.id,
                            name: call.function.name,
                            content: resultText
                        });
                    } catch (error) {
                        console.error(`error running tool ${call.function.name}:`, error);
                        messages.push({
                            role: "tool",
                            tool_call_id: call.id,
                            name: call.function.name,
                            content: `Error: ${String(error)}`
                        });
                    }
                }
                // Loop continues to next iteration to send tool results back to LLM
            } catch (err) {
                console.error("error in llm loop:", err);
                throw err;
            }
        }

        return "Error: Maximum iterations reached without a final answer.";
    }
}
