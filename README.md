# MCP (Model Context Protocol) Routing Agent

(Personal Note)

Hey, 
I created the required project api(`http://localhost:3000/api/chat`) , and also integrated a webpage, I used **NextJS + TypeScript + Prisma 7 (newer version) + Huggingface + MCP (Anthropic)**. I created MCP client in /lib folder while all mcp server files with tools is belongs in server_mcp folder.

I used here **recursive approach** with **max_iteration 5**, So our llm can call the tools again and again untill it hit the max_iteration value or get the most suitable answer, That is very crucial, Because if any work is multistep like first reviewing the tables in database and then accessing any table, then that also can be executed with this approach. (I try to successful deployment on vercel, but got some issue, as debugging can takes time(less time available), and also not mentioned in assignment, i submitted before successfull deployment.)


#### My  Past Related work
I have already worked on MCP, you can see my project (https://github.com/shivamsahu-tech/circuit-designer-mcp) that i build after the 1 month when anthropic release the MCP, in which i provided some tools like get_datasheet_pdf(), get_reserach_papers() etc.
I also worked many agentic project using langchain and langgraph, and also some custom ingestion system, like codeRAG Agent (https://github.com/shivamsahu-tech/coderag-ai)  (graph based) . 

I'm passionate about building AI-powered systems and have extensive experience with:

- **Multimodel Real time MeetRAG AI** : Here i used realtime transcription using **websocket + deepgram API (dual channel ensure cost effective)**, Docs ingestions with **manual + OCR, Cloudinary data storage, redis** for caching. (https://github.com/shivamsahu-tech/meeting-rag)
- **RAG Systems**: Created [CodeRAG Agent](https://github.com/shivamsahu-tech/coderag-ai), Work indepth about the best context retrievel method for AI, **(inspire with cursor, windsurf technologies and cAST reserach paper)**, I created dependecy graph for the whole github codebase resolving the function, class calls, and imports using **tree-sitter and DFS traversal**, use here neo4J Graph DB
- **MCP (Model Context Protocol)**: Built [Circuit Designer MCP](https://github.com/shivamsahu-tech/circuit-designer-mcp) with tools like `get_datasheet_pdf()`, `get_research_papers()`, `run_netlist_code()`, etc. And provide the LLM, **ngspice software interface, that how it generate we tested circuit designs**. 
- **Other**: I also worked on person idea, in which a bot will join the **slack workspace** and using **webhook** it will read the project progress chat, and maintain a memory, so when project manager want to know the suggestion or check the progress development, he can easily justs talk with my agent.


## Architecture

![Architecture Flow](https://drive.google.com/uc?export=view&id=1FHitLgYm0NcFeMT8hO5totsI4vk8qntA)


## Demo

**Screen Recording**: (https://drive.google.com/file/d/15Aa4tUSQqz1Rym17VzD3dN4F4jztImkj/view?usp=drive_link)

### Key Features

- ✅ **MCP Integration**: Custom MCP client (`/lib`) and server (`/server_mcp`) implementation
- ✅ **Recursive Tool Calling**: LLM can call tools iteratively (max 10 iterations) for multi-step tasks
- ✅ **Database Tool**: Execute SQL queries on PostgreSQL using Prisma 7
- ✅ **Weather Tool**: Fetch real-time weather data using Open-Meteo API
- ✅ **Modern Stack**: Next.js 16 + TypeScript + Prisma 7 + Hugging Face (Qwen2.5-72B-Instruct)
- ✅ **Web Interface**: Clean, interactive chat UI for testing the agent




### Project Structure

```
inxtinct_ai/
├── app/
│   ├── api/chat/route.ts          # Main API endpoint
│   ├── page.tsx                   # Chat UI
│   └── generated/prisma/          # Generated Prisma client (for app)
├── lib/
│   ├── mcp-client.ts              # MCP client with recursive tool calling
│   └── db.ts                      # Prisma database connection
├── server_mcp/
│   ├── index.ts                   # MCP server implementation
│   ├── tools/
│   │   ├── database.ts            # Database query tool
│   │   └── weather.ts             # Weather API tool
│   └── generated/client/          # Generated Prisma client (for MCP server)
├── prisma/
│   ├── schema.prisma              # Database schema (Employee, Order models)
│   └── seed.ts                    # Database seeding script
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (local or cloud)
- Hugging Face API key ([Get one here](https://huggingface.co/settings/tokens))

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/shivamsahu-tech/inxtinct-mcp-routing-agent.git
cd inxtinct-mcp-routing-agent
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Update the `.env` file with your credentials:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
HF_API_KEY=your-huggingface-api-key
```

4. **Set up the database**

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed the database with sample data
npm run seed
```

5. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠️ Technical Details

### Recursive Tool Calling

The system implements a recursive loop (max 10 iterations) that allows the LLM to:

1. Analyze the user query
2. Decide which tool(s) to call
3. Execute the tool(s)
4. Process the results
5. Decide if more tool calls are needed
6. Repeat until a final answer is generated

This is **crucial** for multi-step tasks. For example:

**Query**: "Show me all employees with salary > 50000"

**Iteration 1**: LLM calls `execute_database_query` with `SELECT * FROM "Employee"`  
**Iteration 2**: LLM processes results and formulates natural language response

### Database Schema

```prisma
model Employee {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  position  String
  salary    Int
  joinedAt  DateTime @default(now())
  createdAt DateTime @default(now())
}

model Order {
  id        Int      @id @default(autoincrement())
  orderNo   String   @unique
  customer  String
  amount    Float
  status    String
  createdAt DateTime @default(now())
}
```

### MCP Tools

**1. Database Tool** (`execute_database_query`)
- Executes SQL queries on PostgreSQL
- Supports SELECT, INSERT, UPDATE, DELETE
- Returns results as JSON

**2. Weather Tool** (`get_weather`)
- Fetches real-time weather data
- Uses Open-Meteo API (no API key required)
- Returns temperature, conditions, and wind speed




## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: PostgreSQL, Prisma 7 (with pg adapter)
- **AI/LLM**: Hugging Face Inference API (Qwen2.5-72B-Instruct)
- **MCP**: @modelcontextprotocol/sdk


---

**Built with ❤️ by [Shivam Sahu](https://github.com/shivamsahu-tech)**
