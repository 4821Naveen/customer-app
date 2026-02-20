
'use client';

import Link from 'next/link';
import { ShoppingCart, Search, User, MapPin } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';

interface CompanySettings {
    name: string;
    logoUrl?: string;
}

export default function PecafooNavbar() {
    const { cart } = useCart();
    const { user: profileUser } = useUser();
    const [searchQuery, setSearchQuery] = useState('');
    const [settings, setSettings] = useState<CompanySettings | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetch('/api/settings/company')
            .then(res => res.json())
            .then(data => setSettings(data))
            .catch(err => console.error('Settings fetch error:', err));
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm overflow-hidden">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-2 sm:gap-4">

                <Link href="/" className="flex items-center gap-1.5 shrink-0 z-10">
                    {settings?.logoUrl ? (
                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl overflow-hidden shadow-sm ring-1 ring-gray-100">
                            <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="w-8 h-8 bg-gradient-to-br from-peca-purple to-peca-purple-dark rounded-lg flex items-center justify-center text-slate-900 font-black text-xl shadow-sm">
                            {settings?.name?.charAt(0) || 'S'}
                        </div>
                    )}
                    <span className="text-xl font-black tracking-tight text-peca-text hidden xs:block uppercase">
                        {settings?.name || 'SHOP'}
                    </span>
                </Link>

                {/* Search Bar (Desktop) */}
                <form
                    onSubmit={handleSearch}
                    className="flex-1 max-w-xl relative hidden md:block"
                >
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Search size={18} />
                    </div>
                    <input
                        type="search"
                        placeholder="Search for items..."
                        className="w-full pl-10 pr-4 py-2.5 bg-peca-bg-alt border-none rounded-2xl text-sm focus:ring-2 focus:ring-peca-purple/20 outline-none transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </form>

                {/* Action Items */}
                <div className="flex items-center gap-1 sm:gap-4 shrink-0">
                    <button className="md:hidden p-2 text-peca-text hover:bg-peca-purple/10 rounded-full transition-all">
                        <Search size={20} className="stroke-[2.5px]" />
                    </button>

                    {profileUser ? (
                        <div className="flex items-center gap-2">
                            {profileUser.role === 'super_user' && (
                                <Link
                                    href="/admin"
                                    className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-peca-purple hover:text-peca-purple-dark px-3 py-1 bg-peca-purple/10 rounded-lg transition-all"
                                >
                                    Admin Panel
                                </Link>
                            )}
                            <Link
                                href="/profile"
                                className="flex items-center gap-2 p-1.5 pr-3 md:p-2 md:pr-4 text-peca-text hover:bg-peca-purple/10 rounded-full transition-all group border border-gray-100"
                                aria-label="Profile"
                            >
                                <User size={20} className="stroke-[2.5px]" />
                                <span className="text-[10px] md:text-xs font-black truncate max-w-[80px] md:max-w-[120px] text-peca-text-light group-hover:text-peca-text transition-colors">
                                    Hi, {profileUser.name.split(' ')[0]}
                                </span>
                            </Link>
                        </div>
                    ) : (
                        <Link
                            href="/auth/login"
                            className="flex items-center gap-2 px-5 py-2.5 bg-peca-purple text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:scale-105 transition-all shadow-lg shadow-peca-purple/20"
                        >
                            <User size={16} className="stroke-[3px]" />
                            <span className="hidden sm:inline">Sign In</span>
                        </Link>
                    )}

                    <Link
                        href="/cart"
                        className="relative p-2 text-peca-text hover:bg-peca-purple/10 rounded-full transition-all"
                        aria-label="Cart"
                    >
                        <ShoppingCart size={20} className="stroke-[2.5px]" />
                        {cart.length > 0 && (
                            <span className="absolute top-1 right-1 bg-slate-900 text-white text-[9px] font-black px-1 py-0.5 rounded-full min-w-[16px] text-center shadow-sm">
                                {cart.reduce((a, b) => a + b.quantity, 0)}
                            </span>
                        )}
                    </Link>
                </div>
            </div>

            {/* Mobile Search Overlay Sub-header */}
            <div className="md:hidden px-4 pb-3">
                <form onSubmit={handleSearch} className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Search size={16} />
                    </div>
                    <input
                        type="search"
                        placeholder="Search Store"
                        className="w-full pl-10 pr-4 py-2 bg-peca-bg-alt border-none rounded-xl text-sm outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </form>
            </div>
        </header>
    );
}
