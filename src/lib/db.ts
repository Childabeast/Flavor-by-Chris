import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  throw new Error("Missing TURSO_DATABASE_URL in .env.local");
}

const db = createClient({
  url,
  authToken,
});

// Initialize Schema
// Note: We use an async IIFE or rely on the fact that this will be called when the module is loaded
// ideally this should be a migration script, but for this simple app we'll do it here.
(async () => {
  try {
    await db.execute(`
            CREATE TABLE IF NOT EXISTS recipes (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                image TEXT,
                rating REAL,
                description TEXT,
                ingredientSections TEXT, -- JSON string
                instructions TEXT,
                notes TEXT,
                createdAt INTEGER
            )
        `);
  } catch (e) {
    console.error("Failed to init db schema", e);
  }
})();

export default db;
