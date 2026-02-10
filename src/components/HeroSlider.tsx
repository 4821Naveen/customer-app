'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

interface HeroSliderProps {
    slides: any[];
}

export default function HeroSlider({ slides }: HeroSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Filter valid slides or use defaults if empty
    const activeSlides = slides && slides.length > 0 ? slides : [
        {
            _id: 'default-1',
            name: "Summer Collection",
            description: "Up to 50% Off",
            images: [], // Fallback styling
            category: "summer"
        }
    ];

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    };

    useEffect(() => {
        // Auto-scroll every 5 seconds (5000ms)
        intervalRef.current = setInterval(nextSlide, 5000);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [activeSlides.length]);

    const currentSlide = activeSlides[currentIndex];
    // Use uploaded image or fallback gradient
    const bgImage = currentSlide.images && currentSlide.images.length > 0 ? currentSlide.images[0] : null;

    return (
        <div className="relative w-full h-[40vh] min-h-[300px] md:h-[600px] overflow-hidden bg-peca-bg-alt">

            {/* Background Image Area */}
            <Link
                href={`/product/${currentSlide._id}`}
                className="block relative w-full h-full cursor-pointer group"
            >
                {bgImage ? (
                    <div className="w-full h-full relative">
                        <img
                            src={bgImage}
                            alt={currentSlide.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                    </div>
                ) : (
                    <div className="w-full h-full bg-peca-purple flex items-center justify-center p-6 md:p-10 border-b border-peca-purple-dark/20" />
                )}
            </Link>

            {/* Slider Navigation Buttons - Hidden on very small screens */}
            <button
                onClick={() => setCurrentIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length)}
                className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-20 group hidden xs:block"
            >
                <div className="bg-white/90 backdrop-blur-md p-2.5 md:p-4 rounded-full shadow-2xl hover:bg-white hover:scale-110 transition-all transform active:scale-90 text-peca-text border border-gray-100 flex items-center justify-center">
                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                </div>
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-20 group hidden xs:block"
            >
                <div className="bg-white/90 backdrop-blur-md p-2.5 md:p-4 rounded-full shadow-2xl hover:bg-white hover:scale-110 transition-all transform active:scale-90 text-peca-text border border-gray-100 flex items-center justify-center">
                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                </div>
            </button>

            {/* Indicators */}
            <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-3 z-20">
                {activeSlides.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`transition-all h-1.5 rounded-full ${idx === currentIndex ? 'w-10 bg-slate-900 shadow-lg shadow-black/10' : 'w-4 bg-slate-400/30 hover:bg-slate-400'
                            }`}
                        aria-label={`Go to slide ${idx + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}

