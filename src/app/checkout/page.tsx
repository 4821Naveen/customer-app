'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldCheck, CreditCard, Lock as LockIcon, AlertCircle } from 'lucide-react';
import Script from 'next/script';
import Link from 'next/link';

declare global {
    interface Window {
        Razorpay: any;
    }
}

interface CompanySettings {
    paymentGateway?: {
        isActive: boolean;
        keyId: string;
    };
}


import { useUser } from '@/context/UserContext';
import { useToast } from '@/context/ToastContext';

export default function CheckoutPage() {
    const { cart, cartTotal, clearCart } = useCart();
    const router = useRouter();
    const { user, loading: userLoading } = useUser();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState<CompanySettings | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        email: '',
        address: '',
        preferredDate: '',
    });

    useEffect(() => {
        if (!userLoading && !user) {
            showToast('Please login to place an order', 'warning');
            router.push('/auth/login?redirect=/checkout');
            return;
        }

        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || '',
                mobile: user.mobile || '',
                email: user.email || '',
                address: user.address || ''
            }));
        }

        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/settings/company');
                if (res.ok) {
                    const data = await res.json();
                    setSettings(data);
                }
            } catch (e) {
                console.error('Failed to fetch settings:', e);
            }
        };

        fetchSettings();
    }, [user, userLoading]);

    if (userLoading) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
    }

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-peca-bg-alt flex flex-col items-center justify-center pt-20">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 text-4xl shadow-sm">🛒</div>
                <p className="text-xl font-black text-peca-text mb-4">Your basket is empty!</p>
                <Link href="/" className="bg-peca-purple text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-peca-purple/20">
                    Back to Menu
                </Link>
            </div>
        );
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await initializeRazorpay();

            if (!res) {
                showToast("Razorpay SDK Failed to load", "error");
                setLoading(false);
                return;
            }

            // 1. Create Order on backend
            const orderRes = await fetch('/api/payments/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: cartTotal }),
            });

            if (!orderRes.ok) {
                const err = await orderRes.json();
                showToast(err.error || "Failed to create payment order", "error");
                setLoading(false);
                return;
            }

            const { orderId, keyId } = await orderRes.json();

            const options = {
                key: keyId,
                amount: cartTotal * 100,
                currency: "INR",
                name: "Shop Checkout",
                description: "Order Payment",
                order_id: orderId,
                handler: async function (response: any) {
                    await createOrder(
                        response.razorpay_payment_id,
                        orderId,
                        response.razorpay_signature
                    );
                },
                prefill: {
                    name: formData.name,
                    email: formData.email,
                    contact: formData.mobile,
                },
                theme: {
                    color: "#facc15",
                },
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.on('payment.failed', function (response: any) {
                showToast(response.error.description, "error");
                setLoading(false);
            });

            rzp1.open();

        } catch (error) {
            console.error(error);
            showToast("An error occurred during payment initiation", "error");
            setLoading(false);
        }
    };

    const initializeRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => {
                resolve(true);
            };
            script.onerror = () => {
                resolve(false);
            };
            document.body.appendChild(script);
        });
    };

    const createOrder = async (paymentId?: string, razorpayOrderId?: string, razorpaySignature?: string) => {
        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer: { ...formData, userId: user?._id || user?.userId },
                    items: cart.map(item => ({
                        productId: item.productId,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                    })),
                    paymentId,
                    razorpayOrderId,
                    razorpaySignature,
                    totalAmount: cartTotal,
                    dates: { preferredDate: formData.preferredDate }
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Order creation failed');
            }
            const data = await res.json();

            // Clear cart and redirect
            clearCart();
            showToast('Order placed successfully!', 'success');
            router.push(`/order-success?id=${data.orderId}`);
        } catch (error: any) {
            showToast(error.message || 'Order creation failed after payment. Please contact support.', 'error');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-peca-bg-alt pb-24">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

            <div className="pt-24 container mx-auto px-4 max-w-3xl">
                <div className="flex items-center gap-3 mb-10">
                    <div className="p-3 bg-peca-purple/10 rounded-2xl text-peca-purple shadow-sm">
                        <LockIcon className="fill-current" size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-peca-text">Secure Checkout</h1>
                        <p className="text-sm text-peca-text-light italic">Fast as a flash, fresh as a daisy 🍣</p>
                    </div>
                </div>

                <form onSubmit={handlePayment} className="grid md:grid-cols-12 gap-10">
                    <div className="md:col-span-7 space-y-8">
                        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-full bg-peca-orange/20 flex items-center justify-center text-xs font-black text-peca-orange">1</div>
                                <h2 className="text-xl font-black text-peca-text">Where's it going?</h2>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-peca-text-light uppercase tracking-widest px-1">Receiver Name</label>
                                    <input required name="name" value={formData.name} onChange={handleChange} className="w-full bg-peca-bg-alt border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-peca-purple/20 transition-all outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-peca-text-light uppercase tracking-widest px-1">Mobile</label>
                                    <input required name="mobile" value={formData.mobile} onChange={handleChange} className="w-full bg-peca-bg-alt border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-peca-purple/20 transition-all outline-none" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-peca-text-light uppercase tracking-widest px-1">Email (Optional)</label>
                                <input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full bg-peca-bg-alt border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-peca-purple/20 transition-all outline-none" placeholder="For the receipt!" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-peca-text-light uppercase tracking-widest px-1">Full Delivery Address</label>
                                <textarea required name="address" value={formData.address} onChange={handleChange} className="w-full bg-peca-bg-alt border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-peca-purple/20 transition-all outline-none h-28 resize-none" placeholder="Flat, Street, Landmark..." />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-peca-text-light uppercase tracking-widest px-1">Preferred Delivery Date</label>
                                <input type="date" name="preferredDate" value={formData.preferredDate} onChange={handleChange} className="w-full bg-peca-bg-alt border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-peca-purple/20 transition-all outline-none" />
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-5 space-y-8">
                        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 sticky top-24">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 rounded-full bg-peca-purple/20 flex items-center justify-center text-xs font-black text-peca-purple">2</div>
                                <h2 className="text-xl font-black text-peca-text">Total Payabe</h2>
                            </div>

                            <div className="p-6 bg-peca-bg-alt rounded-[32px] mb-8">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-bold text-peca-text-light">Grand Total</span>
                                    <span className="text-3xl font-black text-peca-purple">₹{cartTotal}</span>
                                </div>
                                <p className="text-[10px] text-green-600 font-black italic">✓ Free Express Delivery included</p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || settings?.paymentGateway?.isActive === false}
                                className="w-full bg-gradient-to-r from-peca-purple to-peca-purple-dark text-white py-5 rounded-[22px] font-black hover:shadow-2xl hover:shadow-peca-purple/40 disabled:opacity-50 flex items-center justify-center gap-3 transition-all text-lg mb-4"
                            >
                                {loading ? <Loader2 className="animate-spin h-6 w-6" /> : (
                                    <>
                                        <CreditCard size={22} className="stroke-[3px]" />
                                        {settings?.paymentGateway?.isActive === false ? 'Payment Disabled' : 'Pay & Place Order'}
                                    </>
                                )}
                            </button>

                            {settings?.paymentGateway?.isActive === false && (
                                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-2 mb-4">
                                    <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={14} />
                                    <p className="text-[10px] font-bold text-amber-800 leading-tight">Payments are currently disabled for this store. Please contact the owner.</p>
                                </div>
                            )}

                            <div className="flex items-center justify-center gap-2 text-peca-text-light grayscale opacity-60">
                                <ShieldCheck size={14} />
                                <span className="text-[10px] font-black uppercase tracking-tighter">Secured by Razorpay</span>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
