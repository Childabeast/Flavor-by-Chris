import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BackgroundPattern } from "@/components/BackgroundPattern";

export default function SignInPage() {
    return (
        <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-cream">
            <BackgroundPattern />

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
                {/* Redesigned Logo */}
                <div className="mb-8 flex flex-col items-center">
                    <span className="font-display text-5xl sm:text-6xl text-deep-blue tracking-tight leading-none">
                        Chris
                    </span>
                    <span className="font-sans text-xl sm:text-2xl text-deep-blue/80 tracking-widest uppercase border-t-2 border-deep-blue/20 pt-2 mt-1">
                        Foods
                    </span>
                </div>

                <SignIn
                    signUpUrl="/sign-up"
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
