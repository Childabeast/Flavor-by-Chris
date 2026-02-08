
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getAuth } from "@clerk/nextjs/server";

// GET /api/user
export async function GET(req: NextRequest) {
    const { userId } = getAuth(req);
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const result = await db.execute({
            sql: "SELECT username FROM users WHERE id = ?",
            args: [userId]
        });

        if (result.rows.length === 0) {
            return NextResponse.json({ username: "" });
        }

        return NextResponse.json({ username: result.rows[0].username });
    } catch (error) {
        console.error("Failed to fetch user:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// PUT /api/user
export async function PUT(req: NextRequest) {
    const { userId } = getAuth(req);
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { username } = body;

        if (!username || username.trim().length === 0) {
            return NextResponse.json({ error: "Invalid username" }, { status: 400 });
        }

        // Check if username is taken (by another user)
        const existing = await db.execute({
            sql: "SELECT id FROM users WHERE username = ? AND id != ?",
            args: [username, userId]
        });

        if (existing.rows.length > 0) {
            return NextResponse.json({ error: "Username already taken" }, { status: 409 });
        }

        // Upsert user
        await db.execute({
            sql: `
                INSERT INTO users (id, username, createdAt) 
                VALUES (?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET username = excluded.username
            `,
            args: [userId, username, Date.now()]
        });

        return NextResponse.json({ success: true, username });

    } catch (error) {
        console.error("Failed to update user:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
