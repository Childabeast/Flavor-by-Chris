
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getAuth } from "@clerk/nextjs/server";
import { v4 as uuidv4 } from "uuid";

// GET /api/reviews?recipeId=...
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const recipeId = searchParams.get("recipeId");

    if (!recipeId) {
        return NextResponse.json({ error: "Missing recipeId" }, { status: 400 });
    }

    try {
        const result = await db.execute({
            sql: `
                SELECT 
                    reviews.id, 
                    reviews.text, 
                    reviews.createdAt, 
                    reviews.userId,
                    users.username 
                FROM reviews 
                LEFT JOIN users ON reviews.userId = users.id 
                WHERE reviews.recipeId = ? 
                ORDER BY reviews.createdAt DESC
            `,
            args: [recipeId]
        });

        const reviews = result.rows.map(row => ({
            id: row.id,
            text: row.text,
            createdAt: row.createdAt,
            userId: row.userId,
            username: row.username || "Anonymous"
        }));

        return NextResponse.json(reviews);
    } catch (error) {
        console.error("Failed to fetch reviews:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// POST /api/reviews
export async function POST(req: NextRequest) {
    const { userId } = getAuth(req);
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { recipeId, text } = body;

        if (!recipeId || !text) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        // Ensure user exists in our local DB (sync on write if not exists)
        // This is a simple strategy: try to insert user if ignore, or just assume they might be there.
        // Better: Check if user exists, if not, insert with null username or fetch from clerk?
        // For this app, we rely on the user setting their username in the account page.
        // BUT, for the foreign key constraint, the user MUST exist.
        // So we should upsert the user ID at least.

        await db.execute({
            sql: `INSERT OR IGNORE INTO users (id, createdAt) VALUES (?, ?)`,
            args: [userId, Date.now()]
        });

        const reviewId = uuidv4();
        const now = Date.now();

        await db.execute({
            sql: `INSERT INTO reviews (id, recipeId, userId, text, createdAt) VALUES (?, ?, ?, ?, ?)`,
            args: [reviewId, recipeId, userId, text, now]
        });

        // Return the created review with the username (if any)
        const userResult = await db.execute({
            sql: `SELECT username FROM users WHERE id = ?`,
            args: [userId]
        });

        const username = userResult.rows[0]?.username || "Anonymous";

        return NextResponse.json({
            id: reviewId,
            recipeId,
            userId,
            text,
            createdAt: now,
            username
        });

    } catch (error) {
        console.error("Failed to create review:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
