# MCP (Model Context Protocol) Routing Agent


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
