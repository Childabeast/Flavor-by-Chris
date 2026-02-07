"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { IngredientItem, IngredientSection } from "@/types";
import { cn } from "@/lib/utils";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowLeft, ChefHat, Clock, Plus, Trash2, Upload, X, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useRef, useState, useEffect } from "react";
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import getCroppedImg from "@/lib/cropImage";

const FRACTIONS = ["-", "1/8", "1/4", "1/3", "1/2", "2/3", "3/4"];
const UNITS = ["-", "tsp", "tbsp", "cup", "oz", "lb", "g", "kg", "ml", "can", "jar", "pinch"];

export default function EditRecipePage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [recipeId, setRecipeId] = useState<string>("");

    const [name, setName] = useState("");
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Cropper State
    const [tempImage, setTempImage] = useState<string | null>(null);
    const [isCropping, setIsCropping] = useState(false);
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const imgRef = useRef<HTMLImageElement>(null);

    // Initialize with granular fields
    const [ingredientSections, setIngredientSections] = useState<IngredientSection[]>([
        {
            title: "Main Ingredients",
            items: [{ name: "", amount: "", quantity: "", fraction: "-", unit: "-" }]
        },
    ]);

    const [instructions, setInstructions] = useState("");
    const [notes, setNotes] = useState("");
    const [rating, setRating] = useState("");

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isAdmin, setIsAdmin] = useState(false);
    const [isPublic, setIsPublic] = useState(false);

    // Fetch Recipe Data
    useEffect(() => {
        const fetchRecipe = async () => {
            try {
                const resolvedParams = await params;
                const id = resolvedParams.id;
                setRecipeId(id);

                // Check Admin
                const adminRes = await fetch("/api/admin/check");
                const adminData = await adminRes.json();
                setIsAdmin(adminData.isAdmin);

                // Fetch Recipe
                const res = await fetch(`/api/recipes/${id}`);
                if (!res.ok) {
                    if (res.status === 404) alert("Recipe not found");
                    else alert("Failed to fetch recipe");
                    router.push("/");
                    return;
                }
                const data = await res.json();

                setName(data.name);
                setImagePreview(data.image);
                setRating(data.rating.toString());
                setIngredientSections(data.ingredientSections);
                setInstructions(data.instructions);
                setNotes(data.notes || "");
                setIsPublic(data.isPublic === 1);
            } catch (error) {
                console.error("Error fetching recipe:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecipe();
    }, [params, router]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setTempImage(reader.result as string);
                setIsCropping(true);
            };
            reader.readAsDataURL(file);
        }
        // Reset input value so same file can be selected again
        e.target.value = "";
    };

    const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const { width, height } = e.currentTarget;
        // Center crop by default
        const crop = centerCrop(
            makeAspectCrop(
                {
                    unit: '%',
                    width: 90,
                },
                1,
                width,
                height
            ),
            width,
            height
        );
        setCrop(crop);
    };

    const handleCropSave = async () => {
        if (imgRef.current && completedCrop && completedCrop.width > 0 && completedCrop.height > 0) {
            // Calculate scale
            const image = imgRef.current;
            const scaleX = image.naturalWidth / image.width;
            const scaleY = image.naturalHeight / image.height;

            const pixelCrop = {
                x: completedCrop.x * scaleX,
                y: completedCrop.y * scaleY,
                width: completedCrop.width * scaleX,
                height: completedCrop.height * scaleY,
            };

            try {
                const croppedImage = await getCroppedImg(tempImage!, pixelCrop);
                if (croppedImage) {
                    setImagePreview(croppedImage);
                    setIsCropping(false);
                    setTempImage(null);
                }
            } catch (e) {
                console.error(e);
            }
        }
    };

    const handleCropCancel = () => {
        setIsCropping(false);
        setTempImage(null);
    };

    const addSection = () => {
        setIngredientSections([...ingredientSections, {
            title: "New Section",
            items: [{ name: "", amount: "", quantity: "", fraction: "-", unit: "-" }]
        }]);
    };

    const removeSection = (index: number) => {
        const newSections = [...ingredientSections];
        newSections.splice(index, 1);
        setIngredientSections(newSections);
    };

    const updateSectionTitle = (index: number, title: string) => {
        const newSections = [...ingredientSections];
        newSections[index].title = title;
        setIngredientSections(newSections);
    };

    const addIngredient = (sectionIndex: number) => {
        const newSections = [...ingredientSections];
        newSections[sectionIndex].items.push({ name: "", amount: "", quantity: "", fraction: "-", unit: "-" });
        setIngredientSections(newSections);
    };

    const removeIngredient = (sectionIndex: number, itemIndex: number) => {
        const newSections = [...ingredientSections];
        newSections[sectionIndex].items.splice(itemIndex, 1);
        setIngredientSections(newSections);
    };

    const updateIngredient = (sectionIndex: number, itemIndex: number, field: keyof IngredientItem, value: string) => {
        const newSections = [...ingredientSections];
        const item = newSections[sectionIndex].items[itemIndex];

        // Update the specific field
        // @ts-ignore
        item[field] = value;

        // Re-calculate the full 'amount' string for display/storage
        const q = item.quantity || "";
        const f = item.fraction === "-" ? "" : item.fraction;
        const u = item.unit === "-" ? "" : item.unit;

        const parts = [q, f, u].filter(p => p !== "");
        item.amount = parts.join(" ");

        setIngredientSections(newSections);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const payload = {
                name,
                image: imagePreview,
                rating: parseFloat(rating),
                ingredientSections,
                instructions,
                notes,
                isPublic
            };

            const res = await fetch(`/api/recipes/${recipeId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                router.push("/");
                router.refresh();
            } else {
                alert("Failed to update recipe. Please try again.");
            }
        } catch (err) {
            console.error(err);
            alert("An error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this recipe?")) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/recipes/${recipeId}`, {
                method: "DELETE"
            });
            if (res.ok) {
                router.push("/");
                router.refresh();
            } else {
                alert("Failed to delete recipe.");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    }

    const headerText = name.trim().length > 0 ? name : "Edit Recipe";
    const ratingValue = parseFloat(rating) || 0;

    const { scrollY } = useScroll();
    const backgroundY = useTransform(scrollY, [0, 500], [0, -100]); // Parallax effect

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-cream">Loading...</div>;
    }

    return (
        <main className="relative min-h-screen w-full overflow-hidden">
            {/* Dynamic Background */}
            <motion.div
                style={{ y: backgroundY }}
                className="fixed inset-0 z-0"
            >
                <div className="absolute inset-0 bg-cream" />
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03]" />
                <div className="absolute -top-[20%] -right-[10%] h-[800px] w-[800px] rounded-full bg-deep-blue/5 blur-3xl" />
                <div className="absolute -bottom-[20%] -left-[10%] h-[600px] w-[600px] rounded-full bg-yellow-400/5 blur-3xl" />
            </motion.div>

            <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12 md:px-8">
                <div className="w-full max-w-4xl">
                    {/* Header */}
                    <div className="mb-8 flex items-center justify-between">
                        <Link
                            href="/"
                            className="group flex items-center gap-2 rounded-full bg-white px-5 py-2.5 font-medium text-deep-blue shadow-sm transition-all hover:bg-deep-blue hover:text-white hover:shadow-md"
                        >
                            <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                            Back to Recipes
                        </Link>
                        <h1 className="font-display text-3xl font-bold text-deep-blue opacity-50 hidden md:block">
                            {headerText}
                        </h1>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="overflow-hidden rounded-3xl bg-white shadow-xl"
                    >
                        <form onSubmit={handleSubmit} className="flex flex-col gap-8 p-6 md:p-10">

                            {/* 1. Basic Info Section */}
                            <div className="grid gap-8 md:grid-cols-[1fr_1.5fr]">
                                {/* Image Upload */}
                                <div className="space-y-4">
                                    <label className="block text-lg font-bold text-deep-blue">
                                        Recipe Photo
                                    </label>
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="relative aspect-square cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 transition-colors hover:border-deep-blue/30 hover:bg-gray-100"
                                    >
                                        {imagePreview ? (
                                            <>
                                                <Image
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    fill
                                                    className="object-cover"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
                                                    <Upload className="h-8 w-8 text-white" />
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-400">
                                                <Upload className="h-10 w-10" />
                                                <span className="text-sm font-medium">Click to upload</span>
                                            </div>
                                        )}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                    </div>
                                    <p className="text-xs text-center text-gray-500">
                                        Square format recommended. JPG/PNG supported.
                                    </p>
                                </div>

                                {/* Name & Rating */}
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label htmlFor="name" className="block text-lg font-bold text-deep-blue">
                                            Recipe Name
                                        </label>
                                        <Input
                                            id="name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="e.g. Grandma's Apple Pie"
                                            required
                                            className="h-14 text-lg"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-lg font-bold text-deep-blue">
                                            Rating (0-5)
                                        </label>
                                        <div className="flex items-center gap-4 rounded-xl bg-gray-50 p-4 border border-gray-100">
                                            <div className="flex text-yellow-400">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        fill={star <= Math.round(ratingValue) ? "currentColor" : "none"}
                                                        className={`h-6 w-6 cursor-pointer transition-transform hover:scale-110 ${star <= Math.round(ratingValue) ? "text-yellow-400" : "text-gray-300"}`}
                                                        onClick={() => setRating(star.toString())}
                                                    />
                                                ))}
                                            </div>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="5"
                                                step="0.1"
                                                value={rating}
                                                onChange={(e) => setRating(e.target.value)}
                                                className="w-20 text-center font-bold"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 2. Structured Ingredients Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                                    <ChefHat className="h-6 w-6 text-deep-blue" />
                                    <h2 className="font-display text-2xl font-bold text-deep-blue">Ingredients</h2>
                                </div>

                                <div className="space-y-8">
                                    {ingredientSections.map((section, sIdx) => (
                                        <div key={sIdx} className="rounded-2xl bg-gray-50 p-6 border border-gray-100 relative group">
                                            {/* Section Header */}
                                            <div className="mb-4 flex items-center gap-3">
                                                <Input
                                                    value={section.title}
                                                    onChange={(e) => updateSectionTitle(sIdx, e.target.value)}
                                                    className="font-bold text-deep-blue bg-transparent border-none shadow-none text-xl px-0 focus-visible:ring-0 placeholder:text-gray-400"
                                                    placeholder="Section Title (e.g. Sauce)"
                                                />
                                                {ingredientSections.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeSection(sIdx)}
                                                        className="text-red-400 hover:text-red-600 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>

                                            {/* Ingredients List */}
                                            <div className="space-y-3">
                                                {section.items.map((item, iIdx) => (
                                                    <div key={iIdx} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                                                        <div className="flex gap-2 w-full sm:w-auto">
                                                            <Input
                                                                placeholder="Qty"
                                                                value={item.quantity || ""}
                                                                onChange={(e) => updateIngredient(sIdx, iIdx, "quantity", e.target.value)}
                                                                className="w-16 text-center"
                                                            />
                                                            <select
                                                                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                                                value={item.fraction || "-"}
                                                                onChange={(e) => updateIngredient(sIdx, iIdx, "fraction", e.target.value)}
                                                            >
                                                                {FRACTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                                                            </select>
                                                            <select
                                                                className="h-10 w-20 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                                                value={item.unit || "-"}
                                                                onChange={(e) => updateIngredient(sIdx, iIdx, "unit", e.target.value)}
                                                            >
                                                                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                                            </select>
                                                        </div>
                                                        <div className="flex gap-2 w-full">
                                                            <Input
                                                                placeholder="Ingredient Name (e.g. Flour)"
                                                                value={item.name}
                                                                onChange={(e) => updateIngredient(sIdx, iIdx, "name", e.target.value)}
                                                                className="flex-1"
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => removeIngredient(sIdx, iIdx)}
                                                                className="text-gray-400 hover:text-red-500 p-2 h-10 w-10 flex items-center justify-center"
                                                                tabIndex={-1}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => addIngredient(sIdx)}
                                                    className="mt-2 w-full sm:w-auto text-deep-blue"
                                                >
                                                    <Plus className="mr-2 h-4 w-4" /> Add Ingredient
                                                </Button>
                                            </div>
                                        </div>
                                    ))}

                                    <Button
                                        type="button"
                                        onClick={addSection}
                                        className="w-full border-dashed border-2 bg-transparent text-deep-blue hover:bg-gray-50 border-gray-200"
                                        variant="outline"
                                    >
                                        <Plus className="mr-2 h-4 w-4" /> Add New Section
                                    </Button>
                                </div>
                            </div>

                            {/* 3. Instructions & Notes */}
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                                        <Clock className="h-6 w-6 text-deep-blue" />
                                        <h2 className="font-display text-2xl font-bold text-deep-blue">Instructions</h2>
                                    </div>
                                    <textarea
                                        value={instructions}
                                        onChange={(e) => setInstructions(e.target.value)}
                                        placeholder="Step 1: Preheat oven...&#10;Step 2: Mix ingredients..."
                                        className="min-h-[200px] w-full rounded-xl border border-gray-300 bg-white p-4 text-base leading-relaxed focus:border-deep-blue focus:ring-1 focus:ring-deep-blue"
                                        required
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-lg font-bold text-deep-blue">
                                        Chef's Notes (Optional)
                                    </label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Any tips, tricks, or memories associated with this recipe..."
                                        className="min-h-[100px] w-full rounded-xl border border-yellow-200 bg-yellow-50/50 p-4 text-base focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
                                    />
                                </div>
                            </div>

                            {isAdmin && (
                                <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={isPublic}
                                            onChange={(e) => setIsPublic(e.target.checked)}
                                            className="h-5 w-5 rounded border-gray-300 text-deep-blue focus:ring-deep-blue"
                                        />
                                        <div>
                                            <span className="block font-bold text-deep-blue">Make Master Recipe</span>
                                            <span className="text-sm text-gray-600">Visible to all users on the main page</span>
                                        </div>
                                    </label>
                                </div>
                            )}

                            <div className="pt-6 flex gap-4">
                                <Button type="submit" size="lg" className="flex-1 h-14 text-lg font-bold shadow-lg transition-transform hover:-translate-y-0.5" isLoading={isSubmitting} disabled={isSubmitting}>
                                    {isSubmitting ? "Saving..." : "Update Recipe"}
                                </Button>
                                <Button type="button" variant="outline" size="lg" onClick={handleDelete} className="h-14 border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-300" disabled={isSubmitting}>
                                    Delete
                                </Button>
                            </div>

                        </form>
                    </motion.div>
                </div>
            </div>

            {/* Crop Overlay */}
            {
                isCropping && tempImage && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-full max-w-lg overflow-hidden rounded-3xl bg-cream shadow-2xl"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4">
                                <h2 className="text-xl font-bold text-deep-blue">Adjust Photo</h2>
                                <Button variant="ghost" size="sm" onClick={handleCropCancel} className="text-gray-400 hover:text-red-500">
                                    <X className="h-6 w-6" />
                                </Button>
                            </div>

                            {/* Cropper Area */}
                            <div className="relative flex max-h-[70vh] w-full items-center justify-center overflow-auto bg-black p-4">
                                <ReactCrop
                                    crop={crop}
                                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                                    onComplete={(c) => setCompletedCrop(c)}
                                    aspect={1}
                                    className="max-h-full"
                                >
                                    <img
                                        ref={imgRef}
                                        src={tempImage}
                                        alt="Crop me"
                                        onLoad={onImageLoad}
                                        className="max-h-[60vh] w-auto object-contain"
                                    />
                                </ReactCrop>
                            </div>

                            {/* Controls Footer */}
                            <div className="flex flex-col gap-6 px-8 py-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <Button variant="outline" onClick={handleCropCancel} className="w-full border-deep-blue text-deep-blue hover:bg-deep-blue/5">
                                        Cancel
                                    </Button>
                                    <Button onClick={handleCropSave} className="w-full bg-deep-blue text-white shadow-lg hover:bg-deep-blue/90">
                                        Crop & Save
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )
            }
        </main >
    );
}
