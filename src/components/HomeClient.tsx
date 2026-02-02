"use client";

import { Hero } from "@/components/Hero";
import { RecipeCard } from "@/components/RecipeCard";
import { RecipeModal } from "@/components/RecipeModal";
import { Recipe } from "@/types";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState } from "react";
import { Input } from "@/components/ui/Input"; // Assuming we might want client-side filter logic here or in navbar

interface HomeClientProps {
    initialRecipes: Recipe[];
    recommendedRecipes: Recipe[];
}

export default function HomeClient({ initialRecipes, recommendedRecipes }: HomeClientProps) {
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [recipes] = useState<Recipe[]>(initialRecipes);

    // Parallax logic for "fast scroll" effect
    const { scrollY } = useScroll();
    // Move up an extra 250px over the first 500px of scroll
    const sectionY = useTransform(scrollY, [0, 500], [0, -250]);

    const handleOpenRecipe = (recipe: Recipe) => {
        setSelectedRecipe(recipe);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <main className="min-h-screen w-full bg-cream pb-20">
            <Hero />

            {/* Recommended Section - Distinct Card Look */}
            {/* Added style={{ y: sectionY }} for parallax */}
            <motion.section
                style={{ y: sectionY }}
                className="relative z-10 -mt-[15vh] bg-white px-6 py-24 rounded-t-[3rem] shadow-[0_-20px_60px_rgba(0,0,0,0.08)]"
            >
                <div className="mx-auto max-w-7xl">
                    <div className="mb-16 text-center">
                        <span className="mb-4 block font-sans text-sm font-bold uppercase tracking-widest text-deep-blue/60">
                            Chef's Selection
                        </span>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="font-display text-4xl font-bold text-deep-blue md:text-5xl"
                        >
                            Recommended Recipes
                        </motion.h2>
                    </div>

                    {recommendedRecipes.length > 0 ? (
                        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
                            {recommendedRecipes.map((recipe) => (
                                <RecipeCard
                                    key={recipe.id}
                                    recipe={recipe}
                                    onClick={() => handleOpenRecipe(recipe)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500">No recommended recipes yet. Add some!</div>
                    )}
                </div>
            </motion.section>

            {/* Browse Full Menu - Distinct Background */}
            <section className="bg-cream px-6 py-24">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-16 flex items-end justify-between border-b border-deep-blue/10 pb-6">
                        <div className="max-w-2xl">
                            <motion.h2
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="font-display text-4xl font-bold text-deep-blue md:text-5xl"
                            >
                                The Full Menu
                            </motion.h2>
                            <p className="mt-4 text-lg text-deep-blue/70">
                                Explore our complete collection of culinary creations.
                            </p>
                        </div>
                    </div>

                    {recipes.length > 0 ? (
                        <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-4">
                            {recipes.map((recipe) => (
                                <RecipeCard
                                    key={recipe.id}
                                    recipe={recipe}
                                    onClick={() => handleOpenRecipe(recipe)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center text-xl text-gray-500">
                            No recipes found. Click "Add Recipe" to get started!
                        </div>
                    )}
                </div>
            </section>

            <RecipeModal
                recipe={selectedRecipe}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />
        </main>
    );
}
