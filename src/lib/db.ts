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
    // 1. Recipes Table
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
                createdAt INTEGER,
                userId TEXT,
                isPublic INTEGER DEFAULT 0
            )
        `);

    // 2. Users Table (New)
    await db.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY, -- Clerk User ID
                username TEXT UNIQUE,
                createdAt INTEGER
            )
        `);

    // 3. Reviews Table (New)
    await db.execute(`
            CREATE TABLE IF NOT EXISTS reviews (
                id TEXT PRIMARY KEY,
                recipeId TEXT NOT NULL,
                userId TEXT NOT NULL,
                text TEXT NOT NULL,
                createdAt INTEGER,
                FOREIGN KEY(recipeId) REFERENCES recipes(id),
                FOREIGN KEY(userId) REFERENCES users(id)
            )
        `);


    // Migrations (idempotent)
    try {
      await db.execute("ALTER TABLE recipes ADD COLUMN userId TEXT");
    } catch (e) { /* Column likely already exists */ }

    try {
      await db.execute("ALTER TABLE recipes ADD COLUMN isPublic INTEGER DEFAULT 0");
    } catch (e) { /* Column likely already exists */ }

  } catch (e) {
    console.error("Failed to init db schema", e);
  }
})();

export default db;
