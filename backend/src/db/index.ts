import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// BUG: Hardcoded credentials in fallback - security risk
const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/kanban";

// BUG: No connection error handling - app crashes on DB connection failure
const client = postgres(connectionString);
export const db = drizzle(client, { schema });

export * from "./schema";
