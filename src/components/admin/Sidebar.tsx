
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    CreditCard,
    Settings,
    FileText,
    Menu,
    X,
    LogOut
} from 'lucide-react';
import { clsx } from 'clsx';
import { useBranding } from '@/hooks/useBranding';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';

const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Payments', href: '/admin/payments', icon: CreditCard },
    { name: 'Invoices', href: '/admin/invoices', icon: FileText },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const { name, logo } = useBranding('Admin Panel');
    const { user, logout } = useUser();
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.push('/auth/login');
    };

    const toggleSidebar = () => setIsOpen(!isOpen);

    return (
        <>
            {/* ... */}
            <aside className={clsx(
                "bg-white h-screen fixed left-0 top-0 border-r border-gray-200 w-64 z-40 transition-transform duration-300 ease-in-out md:translate-x-0 overflow-y-auto",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-6 border-b border-gray-100 flex items-center justify-center">
                    {logo ? (
                        <img src={logo} alt={name} className="w-12 h-12 object-contain" />
                    ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-sm">
                            {name?.charAt(0) || 'A'}
                        </div>
                    )}
                </div>

                <nav className="p-4 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        // Check direct match or if it's a sub-route (but not just '/')
                        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={clsx(
                                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium',
                                    isActive
                                        ? 'bg-blue-50 text-blue-600 shadow-sm'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                )}
                            >
                                <Icon size={20} className={isActive ? "stroke-[2.5px]" : "stroke-[2px]"} />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3 px-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs uppercase">
                            {user?.name?.slice(0, 2) || 'AD'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'Administrator'}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email || 'admin@shop.com'}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all font-bold text-sm group"
                    >
                        <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
