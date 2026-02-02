"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import React from "react";
import { Recipe } from "@/types";

interface RecipeCardProps {
    recipe: Recipe;
    onClick?: () => void;
}

export function RecipeCard({ recipe, onClick }: RecipeCardProps) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="group cursor-pointer flex flex-col gap-3"
            onClick={onClick}
        >
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow group-hover:shadow-md">
                {/* Image */}
                <div className="absolute inset-0 bg-gray-100">
                    {recipe.image ? (
                        <Image
                            src={recipe.image}
                            alt={recipe.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-gray-300">
                            No Image
                        </div>
                    )}
                </div>
            </div>

            <div className="px-1">
                <h3 className="font-display text-lg font-medium text-deep-blue group-hover:text-deep-blue/80 transition-colors">
                    {recipe.name}
                </h3>
            </div>
        </motion.div>
    );
}
