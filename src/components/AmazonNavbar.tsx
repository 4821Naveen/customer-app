
'use client';

import Link from 'next/link';
import { ShoppingCart, Search, Menu, ChevronDown, User, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useRouter } from 'next/navigation';

export default function AmazonNavbar() {
    const { cart } = useCart();
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <header className="sticky top-0 z-50 flex flex-col w-full bg-amazon-navy text-white">
            {/* Top Bar (Desktop) */}
            <div className="flex items-center gap-4 px-2 py-2 md:px-4">

                {/* Logo */}
                <Link href="/" className="flex items-center pt-2 px-2 border border-transparent hover:border-white transition-all rounded-[2px]">
                    <span className="text-2xl font-bold tracking-tight">shop<span className="text-amazon-yellow">.in</span></span>
                </Link>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="flex flex-1 h-10 group bg-white rounded-md overflow-hidden min-w-[150px]">
                    <div className="hidden md:flex items-center px-3 bg-gray-100 border-r border-gray-300 text-gray-700 text-xs cursor-pointer hover:bg-gray-200">
                        All <ChevronDown size={14} className="ml-1" />
                    </div>
                    <input
                        type="search"
                        placeholder="Search Shop.in"
                        className="flex-1 px-3 text-black text-sm outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type="submit" className="bg-amazon-yellow hover:bg-amazon-yellow-dark transition-colors px-4 flex items-center justify-center text-amazon-navy">
                        <Search size={22} className="stroke-[2.5px]" />
                    </button>
                </form>

                {/* Right Items */}
                <div className="flex items-center h-full">

                    {/* Language/Flag (Desktop) */}
                    <div className="hidden lg:flex items-center px-2 border border-transparent hover:border-white transition-all h-full rounded-[2px] cursor-pointer">
                        <span className="text-sm font-bold">EN</span>
                        <ChevronDown size={12} className="ml-1 mt-1 text-gray-400" />
                    </div>

                    {/* Account */}
                    <Link href="/profile" className="flex flex-col items-start px-2 py-1 border border-transparent hover:border-white transition-all rounded-[2px]">
                        <span className="text-xs leading-none">Hello, Sign in</span>
                        <div className="flex items-center">
                            <span className="text-sm font-bold">Account & Lists</span>
                            <ChevronDown size={12} className="ml-1 mt-1 text-gray-400" />
                        </div>
                    </Link>

                    {/* Orders */}
                    <Link href="/profile" className="hidden md:flex flex-col items-start px-2 py-1 border border-transparent hover:border-white transition-all rounded-[2px]">
                        <span className="text-xs leading-none">Returns</span>
                        <span className="text-sm font-bold">& Orders</span>
                    </Link>

                    {/* Wishlist */}
                    <Link href="/wishlist" className="flex flex-col items-center px-2 py-1 border border-transparent hover:border-white transition-all rounded-[2px] cursor-pointer">
                        <Heart size={24} />
                        <span className="hidden lg:block text-xs font-bold leading-none mt-1">Wishlist</span>
                    </Link>

                    {/* Cart */}
                    <Link href="/cart" className="relative flex items-end px-2 py-1 border border-transparent hover:border-white transition-all rounded-[2px] cursor-pointer">
                        <div className="relative">
                            <ShoppingCart size={32} />
                            <span className="absolute -top-1 left-4 bg-amazon-navy-light text-amazon-yellow text-xs font-bold px-1 rounded-full">
                                {cart.reduce((a, b) => a + b.quantity, 0)}
                            </span>
                        </div>
                        <span className="hidden lg:block text-sm font-bold ml-1 mb-1">Cart</span>
                    </Link>
                </div>
            </div>

            {/* Bottom Bar (Desktop/Category Nav) */}
            <div className="hidden md:flex items-center gap-4 bg-amazon-navy-light px-4 py-1.5 text-sm font-medium">
                <button className="flex items-center gap-1 hover:border-white border border-transparent px-1 transition-all rounded-[2px]">
                    <Menu size={20} /> All
                </button>
                <Link href="/" className="hover:border-white border border-transparent px-1 transition-all rounded-[2px]">Amazon miniTV</Link>
                <Link href="/" className="hover:border-white border border-transparent px-1 transition-all rounded-[2px]">Sell</Link>
                <Link href="/" className="hover:border-white border border-transparent px-1 transition-all rounded-[2px]">Best Sellers</Link>
                <Link href="/" className="hover:border-white border border-transparent px-1 transition-all rounded-[2px]">Today's Deals</Link>
                <Link href="/" className="hover:border-white border border-transparent px-1 transition-all rounded-[2px]">Mobiles</Link>
                <Link href="/" className="hover:border-white border border-transparent px-1 transition-all rounded-[2px]">Customer Service</Link>
                <Link href="/" className="hidden lg:block hover:border-white border border-transparent px-1 transition-all rounded-[2px]">Electronics</Link>
            </div>

            {/* Mobile Header (Search only if main nav above) */}
            {/* Mobile search is already inside the form above which is flex-1. Next.js handles responsiveness via Tailwind */}
        </header>
    );
}
