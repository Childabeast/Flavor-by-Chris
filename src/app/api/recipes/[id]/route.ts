import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const result = await db.execute({
        sql: "SELECT * FROM recipes WHERE id = ?",
        args: [id],
    });
    const recipe = result.rows[0];

    if (!recipe) {
        return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    // Parse JSON
    // @ts-ignore
    recipe.ingredientSections = JSON.parse(recipe.ingredientSections as string);

    return NextResponse.json(recipe);
}
