"use client";

import { Button } from "@/components/ui/Button";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect } from "react";

export function Hero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"],
    });

    // Animation values
    const scale = useTransform(scrollYProgress, [0, 0.2], [0.85, 1]);
    const borderRadius = useTransform(scrollYProgress, [0, 0.2], [24, 0]);
    const titleOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
    const titleY = useTransform(scrollYProgress, [0, 0.1], [0, -50]);
    const videoMarginTop = useTransform(scrollYProgress, [0, 0.2], ["0rem", "-20rem"]);

    // Simple, reliable autoplay
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const playVideo = () => {
            video.muted = true;
            video.play().catch((error) => {
                console.log("Autoplay prevented, will retry on interaction:", error);
            });
        };

        // Try multiple approaches to ensure playback
        playVideo();

        // Also try when metadata loads
        video.addEventListener('loadedmetadata', playVideo);
        video.addEventListener('canplay', playVideo);

        // Retry on user interaction
        const handleInteraction = () => {
            playVideo();
            document.removeEventListener('click', handleInteraction);
            document.removeEventListener('scroll', handleInteraction);
            document.removeEventListener('touchstart', handleInteraction);
        };

        document.addEventListener('click', handleInteraction);
        document.addEventListener('scroll', handleInteraction);
        document.addEventListener('touchstart', handleInteraction);

        return () => {
            video.removeEventListener('loadedmetadata', playVideo);
            video.removeEventListener('canplay', playVideo);
            document.removeEventListener('click', handleInteraction);
            document.removeEventListener('scroll', handleInteraction);
            document.removeEventListener('touchstart', handleInteraction);
        };
    }, []);

    return (
        <div ref={containerRef} className="relative h-[130vh] w-full bg-cream">
            <div className="sticky top-0 flex h-screen w-full flex-col items-center justify-start overflow-hidden pt-24">
                {/* Title */}
                <motion.div
                    style={{ opacity: titleOpacity, y: titleY }}
                    className="z-10 mb-8 text-center"
                >
                    <h1 className="mb-6 font-display text-5xl font-bold leading-tight text-deep-blue md:text-7xl">
                        Find <span className="italic font-serif">your</span> Recipe
                    </h1>
                    <Button size="lg" className="shadow-xl">
                        Find Recipes
                    </Button>
                </motion.div>

                {/* Video Container */}
                <motion.div
                    style={{
                        marginTop: videoMarginTop,
                        scale,
                        borderRadius,
                        width: "100%",
                        transformOrigin: "bottom center",
                    }}
                    className="relative z-0 w-full flex-1 overflow-hidden bg-black shadow-2xl"
                >
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="auto"
                        disablePictureInPicture
                        disableRemotePlayback
                        className="pointer-events-none h-full w-full object-cover opacity-80"
                        src="/hero-video.mp4"
                    />
                </motion.div>
            </div>
        </div>
    );
}
