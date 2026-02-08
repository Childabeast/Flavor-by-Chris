import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import {
    ArrowLeft,
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
} from "lucide-react";


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

export default function SignUpPage() {
    return (
        <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-cream">
            {/* Background Pattern */}
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none select-none overflow-hidden">
                <div className="absolute -top-[50%] -left-[50%] h-[200%] w-[200%] rotate-45">
                    <div className="flex flex-wrap justify-center content-center gap-24 h-full w-full">
                        {Array.from({ length: 400 }).map((_, i) => {
                            // Deterministic random selection
                            const isIcon = (i * 13) % 3 !== 0; // 2/3 chance of being an icon
                            const IconComponent = ICONS[(i * 37) % ICONS.length];

                            return (
                                <div
                                    key={i}
                                    className="text-deep-blue"
                                    style={{
                                        transform: `rotate(${(i * 113) % 360}deg)`,
                                    }}
                                >
                                    {!isIcon ? (
                                        <span className="font-display text-7xl">&</span>
                                    ) : (
                                        <IconComponent className="h-20 w-20" strokeWidth={1.5} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Back Button */}
            <Link
                href="/"
                className="absolute top-8 left-8 z-20 flex items-center gap-2 text-deep-blue transition-opacity hover:opacity-70"
            >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium">Back to Home</span>
            </Link>

            {/* Main Content */}
            <div className="z-10 flex flex-col items-center justify-center p-4">
                <h1 className="mb-8 font-display text-4xl sm:text-5xl text-deep-blue">Chris Foods</h1>
                <SignUp
                    signInUrl="/sign-in"
                    forceRedirectUrl="/"
                    appearance={{
                        elements: {
                            rootBox: "flex justify-center transform scale-110",
                            card: "bg-transparent shadow-none border-none",
                            headerTitle: "hidden",
                            headerSubtitle: "hidden",
                            socialButtonsBlockButton: "rounded-lg border border-gray-200 hover:bg-gray-50 bg-white",
                            formButtonPrimary: "rounded-lg bg-deep-blue hover:bg-deep-blue/90",
                            formFieldInput: "rounded-lg border-gray-300 bg-white/80 backdrop-blur-sm",
                            footer: "hidden"
                        }
                    }}
                />
            </div>
        </div>
    );
}
