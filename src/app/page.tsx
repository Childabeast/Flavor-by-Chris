import HomeClient from "@/components/HomeClient";
import db from "@/lib/db";
import { Recipe } from "@/types";

export const dynamic = "force-dynamic"; // Ensure fresh data on every request

// Data fetching helper
// Data fetching helper
import { auth } from "@clerk/nextjs/server";

async function getRecipes(): Promise<Recipe[]> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return [];
    }

    const result = await db.execute({
      sql: "SELECT * FROM recipes WHERE userId = ? OR isPublic = 1 ORDER BY createdAt DESC",
      args: [userId]
    });
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

  const { userId } = await auth();
  const isAdmin = userId === process.env.ADMIN_USER_ID;

  return <HomeClient initialRecipes={recipes} recommendedRecipes={recommended} userId={userId} isAdmin={isAdmin} />;
}
