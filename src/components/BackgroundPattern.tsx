"use client";

import {
    Soup,
    Milk,
    ChefHat,
    Utensils,
    Coffee,
    Pizza,
    Croissant,
    Egg,
    Sandwich,
    Wheat,
    IceCream,
    Cookie,
    Cake,
    Fish,
    Carrot,
    Apple,
    Banana,
    Cherry,
    Grape,
    Citrus,
    Salad,
    LucideIcon
} from "lucide-react";
import { useState, useEffect } from "react";

const ICONS = [
    Soup,
    Milk,
    ChefHat,
    Utensils,
    Coffee,
    Pizza,
    Croissant,
    Egg,
    Sandwich,
    Wheat,
    IceCream,
    Cookie,
    Cake,
    Fish,
    Carrot,
    Apple,
    Banana,
    Cherry,
    Grape,
    Citrus,
    Salad
];

interface FloatingIconProps {
    icon?: LucideIcon;
    initialRotation: number;
    isIcon: boolean;
    className?: string;
}

function FloatingIcon({ icon: Icon, initialRotation, isIcon, className }: FloatingIconProps) {
    const [rotation, setRotation] = useState(initialRotation);
    const [isSpinning, setIsSpinning] = useState(false);

    const handleInteraction = () => {
        if (isSpinning) return;

        setIsSpinning(true);

        // Spin fast (3-5 full rotations) then stop at a random angle
        const spins = 360 * (3 + Math.floor(Math.random() * 3));
        const randomStop = Math.floor(Math.random() * 360);
        const targetRotation = rotation + spins + randomStop;

        setRotation(targetRotation);

        setTimeout(() => {
            setIsSpinning(false);
        }, 2000);
    };

    return (
        <div
            className={`transition-transform duration-[2000ms] ease-out select-none cursor-pointer ${className}`}
            style={{
                transform: `rotate(${rotation}deg)`,
            }}
            onMouseEnter={handleInteraction}
            onClick={handleInteraction}
        >
            {!isIcon || !Icon ? (
                <span className="font-display text-7xl select-none">&</span>
            ) : (
                <Icon className="h-20 w-20 select-none" strokeWidth={1.5} />
            )}
        </div>
    );
}

export function BackgroundPattern() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null; // Avoid hydration mismatch for random values

    return (
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none select-none overflow-hidden">
            <div className="absolute -top-[50%] -left-[50%] h-[200%] w-[200%] rotate-45">
                <div className="flex flex-wrap justify-center content-center gap-24 h-full w-full pointer-events-auto">
                    {Array.from({ length: 400 }).map((_, i) => {
                        // Deterministic random selection
                        const isIcon = (i * 13) % 3 !== 0; // 2/3 chance of being an icon
                        const IconComponent = ICONS[(i * 37) % ICONS.length];
                        const initialRotation = (i * 113) % 360;

                        return (
                            <FloatingIcon
                                key={i}
                                icon={IconComponent}
                                isIcon={isIcon}
                                initialRotation={initialRotation}
                                className="text-deep-blue pointer-events-auto"
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
