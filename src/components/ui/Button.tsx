"use client";

import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";
import React from "react";

interface ButtonProps extends HTMLMotionProps<"button"> {
    variant?: "primary" | "secondary" | "ghost" | "outline";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
    children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", children, isLoading, ...props }, ref) => {

        const variants = {
            primary: "bg-deep-blue text-white shadow-md hover:bg-opacity-90",
            secondary: "bg-white text-deep-blue shadow-sm border border-gray-100 hover:bg-gray-50",
            ghost: "bg-transparent text-deep-blue hover:bg-black/5 shadow-none",
            outline: "bg-transparent border border-deep-blue text-deep-blue hover:bg-deep-blue/5",
        };

        const sizes = {
            sm: "px-3 py-1.5 text-sm rounded-md",
            md: "px-5 py-2.5 text-base rounded-full", // Rounded-full as per "modern" pill feel often seen, or rounded-lg. Spec says "Buttons...". Let's go with rounded-lg or full. Sticky menu has "pill shape" search. Let's use rounded-lg for buttons generally, maybe full for primary.
            // Spec: "Rounded, opaque search bar (pill shape)". 
            // Let's stick to rounded-lg for buttons for a clean look, or rounded-full. Let's use rounded-full for a very modern friendly feel.
            lg: "px-8 py-3 text-lg rounded-full",
        };

        // Override size md for now to be fully rounded as it looks more premium with serif fonts
        const finalSize = size === "md" ? "px-6 py-2 rounded-full" : sizes[size];

        return (
            <motion.button
                ref={ref}
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className={cn(
                    "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-deep-blue/50 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
                    variants[variant],
                    finalSize,
                    className
                )}
                {...props}
            >
                {isLoading ? (
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : null}
                {children}
            </motion.button>
        );
    }
);

Button.displayName = "Button";
