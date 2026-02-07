import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chris Foods - Premium Recipes",
  description: "A modern, curated collection of delicious recipes.",
};

import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#0A2540", // Deep Blue
          colorText: "#0A2540",
          colorBackground: "#FDFBF7", // Cream
          colorInputBackground: "#FFFFFF",
          colorInputText: "#0A2540",
          fontFamily: "var(--font-inter)",
          borderRadius: "0.5rem",
        },
        elements: {
          formButtonPrimary:
            "bg-deep-blue hover:bg-deep-blue/90 text-white shadow-none",
          card: "bg-cream shadow-xl border border-deep-blue/10",
          headerTitle: "font-display text-deep-blue",
          headerSubtitle: "text-deep-blue/70",
          socialButtonsBlockButton:
            "bg-white border-deep-blue/10 text-deep-blue hover:bg-gray-50",
          formFieldInput: "border-deep-blue/20 focus:border-deep-blue",
          footerActionLink: "text-deep-blue hover:text-deep-blue/80",
        },
      }}
    >
      <html lang="en">
        <body
          className={`${inter.variable} ${playfair.variable} bg-cream text-foreground`}
        >
          <Navbar />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
