import { cn } from "@/lib/utils";
import React from "react";

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    pill?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, pill, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "flex h-10 w-full bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-blue focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    pill ? "rounded-full px-4" : "rounded-md",
                    "border border-gray-200", // Subtle border
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
Input.displayName = "Input";

export { Input };
