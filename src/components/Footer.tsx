
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface CompanySettings {
    name: string;
    logoUrl?: string;
    email?: string;
    address?: string;
}

export default function Footer() {
    const [settings, setSettings] = useState<CompanySettings | null>(null);

    useEffect(() => {
        fetch('/api/settings/company')
            .then(res => res.json())
            .then(data => setSettings(data))
            .catch(err => console.error('Footer settings fetch error:', err));
    }, []);
    return (
        <footer className="bg-white border-t border-gray-100 pt-16 pb-24 md:pb-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-10">
                    <div className="md:col-span-1">
                        <div className="flex items-center gap-2 mb-6">
                            {settings?.logoUrl ? (
                                <img src={settings.logoUrl} alt="Logo" className="w-8 h-8 object-contain" />
                            ) : (
                                <div className="w-10 h-10 bg-peca-purple rounded-2xl flex items-center justify-center text-xl text-slate-900 shadow-lg shadow-peca-purple/20 font-black">
                                    {settings?.name?.charAt(0) || 'S'}
                                </div>
                            )}
                            <span className="text-2xl font-black text-peca-text tracking-tighter uppercase">
                                {settings?.name || 'SHOP'}<span className="text-slate-900">.</span>
                            </span>
                        </div>
                        <p className="text-sm text-peca-text-light leading-relaxed mb-6">
                            Quality products, delivered fresh and fast to your doorstep.
                        </p>
                        {settings?.email && (
                            <p className="text-[11px] font-black text-peca-text uppercase tracking-widest mb-1">{settings.email}</p>
                        )}
                        {settings?.address && (
                            <p className="text-[10px] font-bold text-peca-text-light leading-relaxed">{settings.address}</p>
                        )}
                    </div>

                    <div>
                        <h4 className="font-black text-peca-text mb-6 uppercase text-xs tracking-widest">Explore</h4>
                        <ul className="space-y-4 text-sm font-bold text-peca-text-light">
                            <li><Link href="/" className="hover:text-peca-purple transition-colors">Home</Link></li>
                            <li><Link href="/search" className="hover:text-peca-purple transition-colors">Search</Link></li>
                            <li><Link href="/wishlist" className="hover:text-peca-purple transition-colors">Wishlist</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-black text-peca-text mb-6 uppercase text-xs tracking-widest">Support</h4>
                        <ul className="space-y-4 text-sm font-bold text-peca-text-light">
                            <li><Link href="/profile" className="hover:text-peca-purple transition-colors">Account</Link></li>
                            <li><Link href="#" className="hover:text-peca-purple transition-colors">Help Center</Link></li>
                            <li><Link href="#" className="hover:text-peca-purple transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    <div>
                        <div className="bg-peca-bg-alt p-6 rounded-[32px] border border-gray-100 shadow-inner shadow-black/5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 text-center">Join Our Newsletter</p>
                            <div className="flex bg-white p-2 rounded-2xl shadow-sm border border-gray-100 ring-4 ring-peca-bg-alt">
                                <input type="email" placeholder="Enter your email..." className="flex-1 bg-transparent px-3 text-xs outline-none font-medium text-slate-600" />
                                <button className="bg-peca-purple text-slate-900 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-peca-purple/20">Join</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[10px] font-black text-peca-text-light uppercase tracking-widest">© 2026 SHOP APP. ALL RIGHTS RESERVED.</p>
                    <div className="flex flex-col md:flex-row items-center justify-center md:justify-end gap-4 md:gap-6 text-[10px] font-black text-peca-text-light uppercase tracking-widest">
                        <span>INSTAGRAM</span>
                        <span>TWITTER</span>
                        <span>FACEBOOK</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
