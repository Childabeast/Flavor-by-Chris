"use client";

import Link from "next/link";
import { FaApple, FaGooglePlay } from "react-icons/fa";

export function Footer() {
    return (
        <footer className="bg-gray-50 text-deep-blue py-16 mt-20 border-t border-deep-blue/10">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                    {/* Column 1: Get the App */}
                    <div className="flex flex-col items-center">
                        <div className="space-y-4 flex flex-col items-start">
                            <h3 className="font-display text-lg font-bold text-left">Get the App</h3>
                            <button className="text-deep-blue/70 hover:text-deep-blue hover:underline transition-colors text-sm cursor-default text-left">
                                Learn more
                            </button>
                            <div className="flex flex-col space-y-3 items-start">
                                <button className="hover:opacity-80 transition-opacity cursor-default">
                                    <img src="/app-store-badge.svg" alt="Download on the App Store" className="h-[40px] w-auto" />
                                </button>
                                <button className="hover:opacity-80 transition-opacity cursor-default">
                                    <img src="/google-play-badge.svg" alt="Get it on Google Play" className="h-[40px] w-auto" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Donate */}
                    <div className="space-y-4 flex flex-col items-center">
                        <h3 className="font-display text-lg font-bold">Donate</h3>
                        <div className="flex flex-col space-y-2 items-center">
                            <button className="text-deep-blue/70 hover:text-deep-blue hover:underline transition-colors text-sm py-1 cursor-default">
                                Support Chris
                            </button>
                        </div>
                    </div>

                    {/* Column 3: Support */}
                    <div className="space-y-4 flex flex-col items-center">
                        <h3 className="font-display text-lg font-bold">Support</h3>
                        <div className="flex flex-col space-y-2 items-center">
                            <button className="text-deep-blue/70 hover:text-deep-blue hover:underline transition-colors text-sm py-1 cursor-default">
                                Help Center
                            </button>
                            <button className="text-deep-blue/70 hover:text-deep-blue hover:underline transition-colors text-sm py-1 cursor-default">
                                Newsletter Preferences
                            </button>
                        </div>
                    </div>

                    {/* Column 4: About */}
                    <div className="space-y-4 flex flex-col items-center">
                        <h3 className="font-display text-lg font-bold">About</h3>
                        <div className="flex flex-col space-y-2 items-center">
                            <Link href="#" className="text-deep-blue/70 hover:text-deep-blue hover:underline transition-colors text-sm py-1">
                                About Us
                            </Link>
                            <Link href="#" className="text-deep-blue/70 hover:text-deep-blue hover:underline transition-colors text-sm py-1">
                                Terms of Use
                            </Link>
                            <Link href="#" className="text-deep-blue/70 hover:text-deep-blue hover:underline transition-colors text-sm py-1">
                                Privacy Policy
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-deep-blue/10 text-center text-deep-blue/40 text-xs">
                    &copy; {new Date().getFullYear()} Chris Foods. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
