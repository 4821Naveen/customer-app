
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingCart, User, Search, Menu, Heart } from 'lucide-react';
import { clsx } from 'clsx';
import { useCart } from '../context/CartContext';

export default function BottomNav() {
    const pathname = usePathname();
    const { cart } = useCart();

    const navItems = [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Wishlist', href: '/wishlist', icon: Heart },
        { name: 'Cart', href: '/cart', icon: ShoppingCart },
        { name: 'Account', href: '/profile', icon: User },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 md:hidden z-50 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.08)]">
            <div className="flex justify-between items-center h-16 w-full max-w-lg mx-auto overflow-hidden">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={clsx(
                                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300",
                                isActive ? "text-peca-purple scale-110" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            <div className="relative">
                                <Icon size={24} className={isActive ? "stroke-[2.5px]" : "stroke-[2px]"} />
                                {item.name === 'Cart' && cart.length > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 bg-peca-purple text-white text-[9px] font-black w-4.5 h-4.5 flex items-center justify-center rounded-full shadow-sm ring-2 ring-white">
                                        {cart.reduce((a, b) => a + b.quantity, 0)}
                                    </span>
                                )}
                            </div>
                            <span className={clsx("text-[10px] font-medium transition-opacity", isActive ? "opacity-100" : "opacity-70")}>
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
