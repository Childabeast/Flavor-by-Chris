"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { IngredientItem, IngredientSection } from "@/types";
import { cn } from "@/lib/utils";
import { motion, useScroll, useTransform } from "framer-motion";
import { Plus, Trash2, Upload, X, Star } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useRef, useState, useCallback } from "react";
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import getCroppedImg from "@/lib/cropImage";

// Dropdown options (Optimized)
const FRACTIONS = ["-", "1/8", "1/4", "1/3", "1/2", "2/3", "3/4"];
const UNITS = ["-", "tsp", "tbsp", "cup", "oz", "lb", "g", "kg", "ml", "can", "jar", "pinch"];

export default function AddRecipePage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

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
                notes
            };

            const res = await fetch("/api/recipes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                router.push("/");
                router.refresh();
            } else {
                alert("Failed to save recipe. Please try again.");
            }
        } catch (err) {
            console.error(err);
            alert("An error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const headerText = name.trim().length > 0 ? name : "Add New Recipe";
    const ratingValue = parseFloat(rating) || 0;

    const { scrollY } = useScroll();
    const backgroundY = useTransform(scrollY, [0, 500], [0, -100]); // Parallax effect

    return (
        <main className="relative min-h-screen w-full overflow-hidden">
            {/* Dynamic Background */}
            {imagePreview ? (
                <motion.div
                    style={{ y: backgroundY }}
                    className="fixed inset-0 -z-10 h-[120vh] w-full"
                >
                    <Image
                        src={imagePreview}
                        alt="Background"
                        fill
                        className="object-cover blur-2xl brightness-50 contrast-75 scale-110"
                        priority
                    />
                    <div className="absolute inset-0 bg-black/20" />
                </motion.div>
            ) : (
                <div className="fixed inset-0 -z-10 bg-gray-200" />
            )}

            {/* Scrollable Content */}
            <div className="relative z-10 py-24 px-6 md:px-12">
                <div className="mx-auto max-w-5xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-3xl bg-cream p-8 shadow-xl"
                    >
                        <h1 className="mb-8 font-display text-4xl font-bold text-deep-blue break-words">
                            {headerText}
                        </h1>

                        <form onSubmit={handleSubmit} className="space-y-10">
                            {/* Basic Info */}
                            <div className="space-y-6">
                                <div>
                                    <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-gray-500">Recipe Name</label>
                                    <Input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. Grandma's Apple Pie"
                                        required
                                        className="h-12 border-gray-200 bg-white text-lg font-medium shadow-sm focus:border-deep-blue focus:ring-1 focus:ring-deep-blue"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-gray-500">Photo</label>
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="group flex h-96 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white transition-all hover:border-deep-blue hover:bg-white/50"
                                    >
                                        {imagePreview ? (
                                            <div className="relative h-full w-full overflow-hidden rounded-2xl shadow-sm">
                                                <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                                    <span className="font-medium text-white">Change Photo</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center text-gray-400 group-hover:text-deep-blue">
                                                <div className="rounded-full bg-gray-100 p-4 transition-colors group-hover:bg-deep-blue/10">
                                                    <Upload className="h-8 w-8" />
                                                </div>
                                                <span className="mt-2 font-medium">Click to upload photo</span>
                                            </div>
                                        )}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageUpload}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Ingredients */}
                            <div className="space-y-6">
                                <div className="flex items-end justify-between border-b border-gray-200 pb-2">
                                    <h2 className="text-xl font-bold text-deep-blue">Ingredients</h2>
                                    <Button type="button" variant="ghost" size="sm" onClick={addSection} className="text-deep-blue hover:bg-deep-blue/5">
                                        <Plus className="mr-1 h-4 w-4" /> Add Section
                                    </Button>
                                </div>

                                {ingredientSections.map((section, sIdx) => (
                                    <div key={sIdx} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
                                        {/* Section Header */}
                                        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-3">
                                            <Input
                                                value={section.title}
                                                onChange={(e) => updateSectionTitle(sIdx, e.target.value)}
                                                className="h-auto max-w-[250px] border-none bg-transparent p-0 font-sans text-lg font-bold text-deep-blue focus:ring-0 placeholder:text-gray-400"
                                                placeholder="Section Title"
                                            />
                                            {ingredientSections.length > 1 && (
                                                <button type="button" onClick={() => removeSection(sIdx)} className="text-gray-400 transition-colors hover:text-red-500">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>

                                        {/* Column Labels */}
                                        <div className="hidden grid-cols-[1fr_auto_auto] gap-4 bg-white px-6 pt-4 text-xs font-bold uppercase tracking-wider text-gray-400 sm:grid">
                                            <div>Ingredient</div>
                                            <div className="w-[200px] text-left">Quantity & Unit</div>
                                        </div>

                                        <div className="space-y-3 p-6 pt-2">
                                            {section.items.map((item, iIdx) => (
                                                <div key={iIdx} className="group flex flex-col gap-3 sm:flex-row sm:items-center">

                                                    {/* Left: Ingredient Name */}
                                                    <div className="flex-grow">
                                                        <Input
                                                            value={item.name}
                                                            onChange={(e) => updateIngredient(sIdx, iIdx, "name", e.target.value)}
                                                            placeholder="Ingredient Name"
                                                            className="h-10 border-gray-200 bg-gray-50/50 transition-all focus:bg-white focus:ring-deep-blue"
                                                        />
                                                    </div>

                                                    {/* Right: Amount Controls */}
                                                    <div className="flex shrink-0 items-center gap-2">
                                                        {/* Quantity Number */}
                                                        <div className="relative">
                                                            <Input
                                                                value={item.quantity || ""}
                                                                onChange={(e) => updateIngredient(sIdx, iIdx, "quantity", e.target.value)}
                                                                placeholder="-"
                                                                className="h-10 w-20 text-center border-gray-200 bg-gray-50/50 focus:bg-white"
                                                            />
                                                        </div>

                                                        {/* Fraction Dropdown */}
                                                        <select
                                                            value={item.fraction || "-"}
                                                            onChange={(e) => updateIngredient(sIdx, iIdx, "fraction", e.target.value)}
                                                            className="h-10 rounded-md border border-gray-200 bg-gray-50/50 px-2 text-sm text-gray-700 transition-all hover:bg-gray-100 focus:border-deep-blue focus:bg-white focus:outline-none"
                                                        >
                                                            {FRACTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                                                        </select>

                                                        {/* Unit Dropdown */}
                                                        <select
                                                            value={item.unit || "-"}
                                                            onChange={(e) => updateIngredient(sIdx, iIdx, "unit", e.target.value)}
                                                            className="h-10 w-24 rounded-md border border-gray-200 bg-gray-50/50 px-3 text-sm text-gray-700 transition-all hover:bg-gray-100 focus:border-deep-blue focus:bg-white focus:outline-none"
                                                        >
                                                            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                                        </select>

                                                        <button
                                                            type="button"
                                                            onClick={() => removeIngredient(sIdx, iIdx)}
                                                            className="ml-2 rounded-full p-1 text-gray-300 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}

                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => addIngredient(sIdx)}
                                                className="mt-2 text-deep-blue/60 hover:text-deep-blue"
                                            >
                                                <Plus className="mr-1 h-3 w-3" /> Add Ingredient
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Instructions */}
                            <div className="space-y-2">
                                <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-gray-500">Instructions</label>
                                <textarea
                                    value={instructions}
                                    onChange={(e) => setInstructions(e.target.value)}
                                    className="min-h-[200px] w-full resize-none rounded-xl border border-gray-200 bg-white p-4 text-base shadow-sm focus:border-deep-blue focus:outline-none focus:ring-1 focus:ring-deep-blue"
                                    placeholder="Describe the steps..."
                                    required
                                />
                            </div>

                            {/* Notes & Rating */}
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="flex flex-col space-y-2 h-full">
                                    <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-gray-500">Notes (Optional)</label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        className="h-full min-h-[140px] w-full resize-none rounded-xl border border-gray-200 bg-white p-4 text-sm shadow-sm focus:border-deep-blue focus:outline-none focus:ring-1 focus:ring-deep-blue flex-grow"
                                        placeholder="Any chefs tips?"
                                    />
                                </div>

                                {/* Improved Rating UI */}
                                <div className="flex flex-col space-y-2">
                                    <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-gray-500">Rating (0-5)</label>
                                    <div className="flex h-full flex-col items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                                        <Input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            max="5"
                                            value={rating}
                                            onChange={(e) => setRating(e.target.value)}
                                            className="h-10 w-16 text-center text-lg font-bold border-gray-200 bg-gray-50 focus:bg-white focus:ring-deep-blue [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                        <div className="flex text-yellow-400">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    onClick={() => setRating(star.toFixed(1))}
                                                    fill={star <= Math.round(ratingValue) ? "currentColor" : "none"}
                                                    className={cn(
                                                        "h-8 w-8 cursor-pointer transition-all hover:scale-110 hover:text-yellow-500",
                                                        star > Math.round(ratingValue) ? "text-gray-300" : "scale-105"
                                                    )}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6">
                                <Button type="submit" size="lg" className="h-14 w-full text-lg font-bold shadow-lg transition-transform hover:-translate-y-0.5" isLoading={isSubmitting} disabled={isSubmitting}>
                                    {isSubmitting ? "Saving Recipe..." : "Save Recipe"}
                                </Button>
                            </div>

                        </form>
                    </motion.div>
                </div>
            </div>

            {/* Crop Overlay */}
            {isCropping && tempImage && (
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
            )}
        </main>
    );
}
