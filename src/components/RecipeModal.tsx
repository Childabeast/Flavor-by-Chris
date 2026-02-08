"use client";

import { Recipe } from "@/types";
import React, { useEffect } from "react";
import { X, Clock, Users, ChefHat } from "lucide-react";
import { BackgroundPattern } from "@/components/BackgroundPattern";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface RecipeModalProps {
    recipe: Recipe | null;
    isOpen: boolean;
    onClose: () => void;
    userId?: string | null;
    isAdmin?: boolean;
}

export function RecipeModal({ recipe, isOpen, onClose, userId, isAdmin }: RecipeModalProps) {
    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen || !recipe) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-deep-blue/20 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0"
                    />

                    <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-5xl h-[90vh] pointer-events-none">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="relative w-full flex-1 overflow-hidden rounded-[2.5rem] bg-cream shadow-2xl flex flex-col md:flex-row pointer-events-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Background Pattern */}
                            <BackgroundPattern />

                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute right-6 top-6 z-50 rounded-full bg-white/80 p-2 text-deep-blue backdrop-blur-sm transition-transform hover:scale-110 hover:bg-white"
                            >
                                <X className="h-6 w-6" />
                            </button>

                            {/* Content Container - Scrollable */}
                            <div className="relative z-10 flex flex-col md:flex-row h-full w-full overflow-y-auto md:overflow-hidden">

                                {/* Left Side: Image (Desktop) / Top (Mobile) */}
                                <div className="relative h-64 w-full md:h-full md:w-1/2 shrink-0">
                                    {recipe.image ? (
                                        <Image
                                            src={recipe.image}
                                            alt={recipe.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : ( // Fallback
                                        <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-400">
                                            <ChefHat className="h-20 w-20 opacity-20" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:bg-gradient-to-r" />

                                    <div className="absolute bottom-6 left-6 right-6 text-white md:hidden">
                                        <h2 className="font-display text-3xl font-bold leading-tight shadow-black drop-shadow-md">
                                            {recipe.name}
                                        </h2>
                                    </div>
                                </div>

                                {/* Right Side: Details (Desktop) / Bottom (Mobile) */}
                                <div className="flex flex-col p-8 md:w-1/2 md:overflow-y-auto md:p-12 md:my-14 md:max-h-[calc(100%-7rem)]">
                                    <div className="mb-0 hidden md:block">
                                        <h2 className="font-display text-4xl font-bold text-deep-blue mb-4">
                                            {recipe.name}
                                        </h2>
                                    </div>

                                    {/* Metadata */}
                                    <div className="flex gap-6 mb-8 text-deep-blue/70 font-sans text-sm font-medium tracking-wide border-b border-deep-blue/10 pb-6">
                                        {/*  Placeholder metadata if not in recipe type yet, or derived */}
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            <span>30 mins</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4" />
                                            <span>4 servings</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <ChefHat className="h-4 w-4" />
                                            <span>Easy</span>
                                        </div>
                                    </div>

                                    {/* Ingredients */}
                                    <div className="mb-8">
                                        <h3 className="font-display text-2xl font-bold text-deep-blue mb-4">Ingredients</h3>
                                        <div className="space-y-6">
                                            {recipe.ingredientSections?.map((section, idx) => (
                                                <div key={idx}>
                                                    {section.title && (
                                                        <h4 className="font-sans font-bold text-deep-blue/80 mb-2 text-sm uppercase tracking-wider">
                                                            {section.title}
                                                        </h4>
                                                    )}
                                                    <ul className="space-y-2">
                                                        {section.items.map((item, itemIdx) => (
                                                            <li key={itemIdx} className="flex items-start gap-2 text-deep-blue/80">
                                                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-deep-blue/40" />
                                                                <span className="flex-1">
                                                                    <span className="font-semibold">{item.amount}</span> {item.name}
                                                                </span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )) || <p className="text-gray-500 italic">No ingredients listed.</p>}
                                        </div>
                                    </div>

                                    {/* Instructions */}
                                    <div>
                                        <h3 className="font-display text-2xl font-bold text-deep-blue mb-4">Instructions</h3>
                                        <div className="prose prose-stone text-deep-blue/80 font-sans leading-relaxed whitespace-pre-line">
                                            {recipe.instructions || <p className="italic text-gray-500">No instructions provided.</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.a
                            href={`/recipe/${recipe.name.toLowerCase().replace(/ /g, "-")}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="pointer-events-auto flex items-center gap-2 rounded-full bg-[#2C4B70] px-8 py-3 font-sans text-base font-bold text-white shadow-lg shadow-[#2C4B70]/30 hover:bg-[#2C4B70]/90 hover:shadow-xl hover:shadow-[#2C4B70]/40 transition-all"
                        >
                            Go to recipe
                        </motion.a>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
}
