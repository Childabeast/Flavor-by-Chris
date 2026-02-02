import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { v2 as cloudinary } from "cloudinary";
import { Recipe } from "@/types";

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper to upload base64 image to Cloudinary
async function saveImage(image: string): Promise<string> {
    // If it's a data URL, upload it
    if (image.startsWith("data:image")) {
        try {
            const result = await cloudinary.uploader.upload(image, {
                folder: "recipes",
            });
            return result.secure_url;
        } catch (error) {
            console.error("Cloudinary upload failed:", error);
            return "";
        }
    }
    return image; // Already a URL or empty
}

export async function GET() {
    try {
        const result = await db.execute("SELECT * FROM recipes ORDER BY createdAt DESC");
        const rows = result.rows;

        // Parse JSON fields
        const recipes = rows.map((row: any) => ({
            ...row,
            ingredientSections: JSON.parse(row.ingredientSections as string),
        }));

        return NextResponse.json(recipes);
    } catch (error) {
        console.error("Failed to fetch recipes:", error);
        return NextResponse.json({ error: "Failed to fetch recipes" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, image, rating, ingredientSections, instructions, notes } = body;

        const savedImageUrl = image ? await saveImage(image) : "";
        const id = uuidv4();
        const createdAt = Date.now();

        await db.execute({
            sql: `
      INSERT INTO recipes (id, name, image, rating, ingredientSections, instructions, notes, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
            args: [
                id,
                name,
                savedImageUrl,
                rating || 0,
                JSON.stringify(ingredientSections),
                instructions,
                notes,
                createdAt,
            ],
        });

        return NextResponse.json({ success: true, id });
    } catch (error) {
        console.error("Failed to create recipe:", error);
        return NextResponse.json({ error: "Failed to save recipe" }, { status: 500 });
    }
}
