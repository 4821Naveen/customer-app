
'use client';

import Link from 'next/link';
import { ShoppingCart, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 hidden md:flex ${scrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4 text-white'
            }`}>
            <div className="container mx-auto px-4 flex items-center justify-between">
                <Link href="/" className="text-2xl font-bold tracking-tighter">
                    MyShop
                </Link>

                <div className="flex items-center gap-4">
                    <Link href="/cart" className="relative p-2 hover:bg-black/5 rounded-full transition-colors">
                        <ShoppingCart size={24} />
                        {/* <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">0</span> */}
                    </Link>
                    <button className="md:hidden p-2">
                        <Menu size={24} />
                    </button>
                </div>
            </div>
        </nav>
    );
}
