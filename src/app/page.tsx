import HomeClient from "@/components/HomeClient";
import db from "@/lib/db";
import { Recipe } from "@/types";

export const dynamic = "force-dynamic"; // Ensure fresh data on every request

// Data fetching helper
// Data fetching helper
async function getRecipes(): Promise<Recipe[]> {
  try {
    const result = await db.execute("SELECT * FROM recipes ORDER BY createdAt DESC");
    const rows = result.rows;
    return rows.map((row: any) => ({
      ...row,
      ingredientSections: JSON.parse(row.ingredientSections as string),
    }));
  } catch (error) {
    console.error("Failed to fetch recipes:", error);
    return [];
  }
}

export default async function Home() {
  const recipes = await getRecipes();

  // Randomly select 3 recommended recipes. 
  // Note: standard JS random is sufficient here.
  const shuffled = [...recipes].sort(() => 0.5 - Math.random());
  const recommended = shuffled.slice(0, 3);

  return <HomeClient initialRecipes={recipes} recommendedRecipes={recommended} />;
}
