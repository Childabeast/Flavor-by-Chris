"use client";

import { Button } from "@/components/ui/Button";
import { Recipe } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import { X, Star, Clock, ChefHat } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface RecipeModalProps {
    recipe: Recipe | null;
    isOpen: boolean;
    onClose: () => void;
    userId?: string | null;
    isAdmin?: boolean;
}

import { useRouter } from "next/navigation";

export function RecipeModal({ recipe, isOpen, onClose, userId, isAdmin }: RecipeModalProps) {
    const router = useRouter();

    const canEdit = recipe && (isAdmin || (userId && recipe.userId === userId));

    const handleEdit = () => {
        if (recipe) {
            router.push(`/edit/${recipe.id}`);
        }
    };
    // Prevent body scroll when open
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

    // Handle ESC key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    if (!isOpen || !recipe) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
                    />

                    {/* Modal Container */}
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", duration: 0.3 }}
                            className="pointer-events-auto relative flex h-full max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
                        >
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md transition-colors hover:bg-black/30"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            {/* Image Section */}
                            <div className="relative h-64 shrink-0 sm:h-80 w-full bg-black/5">
                                {recipe.image ? (
                                    <Image
                                        src={recipe.image}
                                        alt={recipe.name}
                                        fill
                                        className="object-cover opacity-95"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                                        No Image
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                                <div className="absolute bottom-6 left-6 right-6">
                                    <h2 className="font-display text-3xl font-bold text-white md:text-4xl text-shadow-sm">
                                        {recipe.name}
                                    </h2>
                                    {/* Rating */}
                                    <div className="mt-2 flex items-center gap-2">
                                        <div className="flex text-yellow-400">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    fill={star <= Math.round(recipe.rating) ? "currentColor" : "none"}
                                                    className={cn("h-5 w-5", star > Math.round(recipe.rating) && "text-gray-400")}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-lg font-medium text-white">{recipe.rating}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Content Scrollable Area */}
                            <div className="flex-1 overflow-y-auto p-6 md:p-8">

                                <div className="grid gap-10 md:grid-cols-[1fr_1.5fr]">

                                    {/* Ingredients Column */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-2 text-deep-blue">
                                            <ChefHat className="h-6 w-6" />
                                            <h3 className="font-display text-2xl font-bold">Ingredients</h3>
                                        </div>

                                        <div className="space-y-6">
                                            {recipe.ingredientSections?.length > 0 ? (
                                                recipe.ingredientSections.map((section, idx) => (
                                                    <div key={idx} className="rounded-xl bg-cream/50 p-4 border border-deep-blue/5">
                                                        <h4 className="mb-3 font-bold text-deep-blue text-lg border-b border-deep-blue/10 pb-1">{section.title}</h4>
                                                        <ul className="space-y-2">
                                                            {section.items.map((item, i) => (
                                                                <li key={i} className="flex justify-between text-base">
                                                                    <span className="text-gray-700">{item.name}</span>
                                                                    <span className="font-medium text-deep-blue">{item.amount}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-gray-500 italic">No ingredients listed.</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Instructions Column */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-2 text-deep-blue">
                                            <Clock className="h-6 w-6" />
                                            <h3 className="font-display text-2xl font-bold">Instructions</h3>
                                        </div>

                                        <div className="prose prose-lg text-gray-700 whitespace-pre-line leading-relaxed">
                                            {recipe.instructions || "No instructions provided."}
                                        </div>

                                        {recipe.notes && (
                                            <div className="mt-8 rounded-xl bg-yellow-50 p-6 text-yellow-900 border border-yellow-100">
                                                <h4 className="mb-2 font-bold">Chef's Notes</h4>
                                                <p>{recipe.notes}</p>
                                            </div>
                                        )}
                                    </div>

                                </div>

                                {/* Edit Button */}
                                {canEdit && (
                                    <div className="mt-8 flex justify-end">
                                        <Button onClick={handleEdit} className="bg-deep-blue text-white hover:bg-deep-blue/90">
                                            Edit Recipe
                                        </Button>
                                    </div>
                                )}

                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
