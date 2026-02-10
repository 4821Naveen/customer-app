
'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();

    return (
        <div className="min-h-screen bg-peca-bg-alt pt-8 pb-20">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="flex items-center gap-3 mb-10">
                    <div className="p-3 bg-peca-purple/10 rounded-2xl text-slate-900 border border-peca-purple/20">
                        <ShoppingBag className="fill-peca-purple" size={28} />
                    </div>
                    <h1 className="text-3xl font-black text-peca-text">Shopping Cart</h1>
                </div>

                {cart.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-[40px] border border-gray-100 shadow-sm px-6">
                        <div className="w-24 h-24 bg-peca-bg-alt rounded-[32px] flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner shadow-black/5">🛍️</div>
                        <p className="text-xl font-black text-peca-text mb-2 tracking-tighter">Your cart is empty</p>
                        <p className="text-peca-text-light mb-8 italic font-medium">Find some amazing items to add!</p>
                        <Link href="/" className="inline-block bg-peca-purple text-slate-900 px-10 py-5 rounded-[22px] font-black shadow-xl shadow-peca-purple/30 hover:shadow-peca-purple/40 hover:-translate-y-1 active:scale-95 transition-all uppercase tracking-widest text-[11px]">
                            Continue Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-12 gap-10 items-start">
                        <div className="lg:col-span-8 space-y-6">
                            {cart.map((item) => (
                                <div key={item.productId} className="bg-white p-5 rounded-[32px] border border-gray-50 flex gap-6 group hover:shadow-xl hover:shadow-peca-purple/5 transition-all">
                                    <div className="w-28 h-28 bg-peca-bg-alt rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center relative p-1">
                                        {item.image ? (
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-xl" />
                                        ) : (
                                            <div className="text-gray-300">No Image</div>
                                        )}
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between py-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-black text-lg text-peca-text line-clamp-1">{item.name}</h3>
                                                <p className="text-peca-purple font-black mt-1">₹{item.price}</p>
                                            </div>
                                            <button onClick={() => removeFromCart(item.productId)} className="text-gray-300 hover:text-peca-orange transition-colors p-2">
                                                <Trash2 size={20} />
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between mt-4">
                                            <div className="flex items-center bg-peca-bg-alt rounded-xl overflow-hidden p-1 border border-gray-50">
                                                <button onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))} className="p-1 px-3 bg-white rounded-lg shadow-sm hover:bg-gray-50 text-peca-purple transition-all"><Minus size={14} className="stroke-[3px]" /></button>
                                                <span className="px-4 font-black text-peca-text text-sm">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="p-1 px-3 bg-white rounded-lg shadow-sm hover:bg-gray-50 text-peca-purple transition-all"><Plus size={14} className="stroke-[3px]" /></button>
                                            </div>
                                            <span className="font-black text-peca-text">₹{item.price * item.quantity}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="lg:col-span-4 bg-white p-8 rounded-[40px] border border-gray-50 shadow-sm sticky top-24">
                            <h3 className="font-black text-xl text-peca-text mb-6">Total Bill</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-peca-text-light font-medium">Original Prices</span>
                                    <span className="font-black text-peca-text">₹{cartTotal}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-peca-text-light font-medium">Delivery Fee</span>
                                    <span className="text-peca-orange font-black">Free</span>
                                </div>
                                <div className="h-px bg-gray-50 my-2" />
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-peca-text font-black text-lg">Total Amount</span>
                                    <span className="font-black text-2xl text-peca-purple">₹{cartTotal}</span>
                                </div>
                                <p className="text-[10px] text-center text-peca-text-light pt-2 italic">Prices inclusive of all taxes</p>
                            </div>
                            <Link
                                href="/checkout"
                                className="block w-full bg-gradient-to-r from-peca-purple to-peca-purple-dark text-slate-900 text-center py-5 rounded-[22px] font-black text-lg shadow-xl shadow-peca-purple/40 hover:shadow-peca-purple/50 active:scale-95 transition-all mt-8 tracking-wider uppercase"
                            >
                                Checkout Now
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
