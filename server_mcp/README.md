# MCP Server for AI Routing System

This is a Model Context Protocol (MCP) server that provides tools for an AI routing system. The server exposes three main tools:

## Tools

### 1. `get_weather`
Fetches weather information for a specific location.

**Parameters:**
- `location` (string): The city name or location

**Example:**
```json
{
  "location": "San Francisco"
}
```

**Response:**
Returns a natural language description of the weather conditions.

### 2. `get_database_schema`
Retrieves the database schema including all tables, columns, types, and relationships.

**Parameters:** None

**Response:**
Returns a JSON object containing:
- Database type (PostgreSQL)
- Table structures (Employee, Order)
- Column definitions with types and constraints
- Example SQL queries
- Important notes about PostgreSQL syntax

### 3. `execute_database_query`
Executes a SQL SELECT query on the PostgreSQL database.

**Parameters:**
- `query` (string): A valid PostgreSQL SELECT statement

**Security:** Only SELECT queries are allowed for safety.

**Example:**
```json
{
  "query": "SELECT COUNT(*) FROM \"Employee\" WHERE \"joinedAt\" >= NOW() - INTERVAL '1 month'"
}
```

**Response:**
Returns the query results as JSON.

## Database Schema

The database contains two main tables:

### Employee
- `id`: INTEGER (Primary Key)
- `name`: TEXT
- `email`: TEXT (Unique)
- `position`: TEXT
- `salary`: INTEGER
- `joinedAt`: TIMESTAMP
- `createdAt`: TIMESTAMP

### Order
- `id`: INTEGER (Primary Key)
- `orderNo`: TEXT (Unique)
- `customer`: TEXT
- `amount`: DOUBLE PRECISION
- `status`: TEXT
- `createdAt`: TIMESTAMP

## Important Notes

1. **Table Names**: PostgreSQL table names are case-sensitive and must be quoted: `"Employee"`, `"Order"`
2. **Column Names**: CamelCase column names must also be quoted: `"joinedAt"`, `"createdAt"`, `"orderNo"`
3. **Security**: Only SELECT queries are permitted for database safety

## Usage Flow

For database queries, the LLM should:
1. First call `get_database_schema` to understand the database structure
2. Generate an appropriate SQL query based on the user's natural language request
3. Call `execute_database_query` with the generated SQL
4. Format the results into a natural English response

## Building and Running

```bash
# Build the TypeScript code
npm run build

# Run the server
npm start

# Or run in development mode with tsx
npm run dev
```

The server runs on stdio transport and communicates via the Model Context Protocol.
