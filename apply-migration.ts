import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;

const client = new Client({
    connectionString,
    ssl: {
        rejectUnauthorized: false,
    },
});

async function main() {
    try {
        await client.connect();
        console.log("Connected successfully!");

        const sql = fs.readFileSync(path.join(process.cwd(), 'migration.sql'), 'utf-8');
        console.log("Applying migration...");
        await client.query(sql);
        console.log("Migration applied successfully!");

        await client.end();
    } catch (err) {
        console.error("Migration error:", err);
        process.exit(1);
    }
}

main();
