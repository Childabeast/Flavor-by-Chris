"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Search } from "lucide-react";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export function Navbar() {
    const { scrollY } = useScroll();
    const [hidden, setHidden] = useState(false);
    const pathname = usePathname();
    const isAddPage = pathname === "/add";

    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious() || 0;
        const delta = latest - previous;

        // Add hysteresis: ignore small scroll movements to prevent jitter
        if (Math.abs(delta) < 5) return;

        if (isAddPage) {
            // Strict behavior for Add Page: Only show at the very top (buffer of 10px)
            if (latest > 10 && delta > 0) {
                setHidden(true);
            } else if (latest < 10) {
                setHidden(false);
            }
        } else {
            // Standard behavior: Show on scroll up, hide on scroll down
            if (latest > 150 && delta > 0) {
                setHidden(true);
            } else if (delta < 0) {
                setHidden(false);
            }
        }
    });
    return (
        <motion.nav
            variants={{
                visible: { y: 0 },
                hidden: { y: "-100%" },
            }}
            animate={hidden ? "hidden" : "visible"}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed top-0 left-0 right-0 z-50 flex h-20 items-center justify-between border-b border-deep-blue/10 bg-cream/80 px-6 backdrop-blur-md"
        >
            {/* Left Actions */}
            <div className="flex items-center gap-4 w-1/3">
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                    Menu
                </Button>

                <SignedIn>
                    <Link href="/add">
                        <Button variant="primary" size="sm">
                            Add Recipe
                        </Button>
                    </Link>
                </SignedIn>
            </div>

            {/* Center Title */}
            <div className="flex w-1/3 justify-center">
                <Link href="/">
                    <h1 className="font-display text-2xl font-bold tracking-tight text-deep-blue sm:text-3xl">
                        Chris Foods
                    </h1>
                </Link>
            </div>

            {/* Right Search & Auth */}
            <div className="flex w-1/3 justify-end items-center gap-4">
                <div className="relative w-full max-w-[200px] hidden md:block">
                    <Input
                        pill
                        placeholder="Search recipes..."
                        className="pl-10 shadow-sm border-transparent bg-white/90 focus:bg-white transition-all hover:bg-white"
                    />
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>

                <SignedOut>
                    <SignInButton mode="modal">
                        <Button
                            variant="primary"
                            size="sm"
                            className="bg-deep-blue text-white hover:bg-deep-blue/90"
                        >
                            Log In
                        </Button>
                    </SignInButton>
                </SignedOut>

                <SignedIn>
                    <UserButton afterSignOutUrl="/" />
                </SignedIn>
            </div>
        </motion.nav>
    );
}
