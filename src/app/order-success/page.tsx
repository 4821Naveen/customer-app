'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, ArrowRight, ShoppingBag, Loader2 } from 'lucide-react';
import AnimationWrapper from '@/components/ui/AnimationWrapper';

function OrderSuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('id');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <AnimationWrapper className="min-h-screen bg-peca-bg-alt flex items-center justify-center px-4 py-20">
            <div className="max-w-md w-full bg-white rounded-[48px] p-10 shadow-2xl shadow-peca-purple/10 border border-gray-100 text-center">
                <div className="w-24 h-24 bg-gradient-to-tr from-peca-purple to-peca-purple-dark rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-peca-purple/30 animate-in zoom-in duration-500">
                    <CheckCircle className="text-white" size={48} strokeWidth={2.5} />
                </div>

                <h1 className="text-3xl font-black text-peca-text mb-2">Order Confirmed!</h1>
                <p className="text-peca-text-light font-medium mb-8">
                    Your order has been placed successfully and is being prepared with care.
                </p>

                <div className="bg-peca-bg-alt rounded-3xl p-6 mb-10 text-left border border-white">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white rounded-xl">
                            <Package size={18} className="text-peca-purple" />
                        </div>
                        <span className="text-xs font-black text-peca-text-light uppercase tracking-widest">Order Details</span>
                    </div>
                    <p className="text-sm font-black text-peca-text flex justify-between items-center">
                        Order ID <span className="text-peca-purple font-mono">#{orderId || 'N/A'}</span>
                    </p>
                </div>

                <div className="space-y-4">
                    <Link
                        href="/profile"
                        className="w-full bg-peca-text text-white py-5 rounded-3xl font-black text-lg flex items-center justify-center gap-3 hover:translate-y-[-2px] transition-all active:scale-95 shadow-lg shadow-gray-200"
                    >
                        Track Order <ArrowRight size={20} />
                    </Link>

                    <Link
                        href="/"
                        className="w-full bg-peca-bg-alt text-peca-text py-5 rounded-3xl font-black text-lg flex items-center justify-center gap-3 hover:bg-gray-100 transition-all"
                    >
                        <ShoppingBag size={20} /> Continue Shopping
                    </Link>
                </div>
            </div>
        </AnimationWrapper>
    );
}

export default function OrderSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-peca-bg-alt">
                <Loader2 className="w-10 h-10 text-peca-purple animate-spin" />
            </div>
        }>
            <OrderSuccessContent />
        </Suspense>
    );
}
