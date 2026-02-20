
'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { Minus, Plus, ShoppingBag } from 'lucide-react';

export default function AddToCartButton({ product }: { product: any }) {
    const { addToCart } = useCart();
    const [qty, setQty] = useState(1);

    const handleAdd = () => {
        const finalPrice = product.offerPrice && product.offerPrice < product.price ? product.offerPrice : product.price;
        addToCart({
            productId: product._id,
            name: product.name,
            price: finalPrice,
            image: product.images[0] || '',
            quantity: qty
        });
        alert('Added to Cart!');
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between bg-peca-bg-alt p-2 rounded-2xl border border-gray-100">
                <span className="font-bold text-peca-text-light px-4">Selection</span>
                <div className="flex items-center bg-white rounded-xl shadow-sm overflow-hidden">
                    <button
                        onClick={() => setQty(Math.max(1, qty - 1))}
                        className="p-3 hover:bg-gray-50 text-peca-purple transition-colors"
                    >
                        <Minus size={20} className="stroke-[3px]" />
                    </button>
                    <span className="w-10 text-center font-black text-peca-text">{qty}</span>
                    <button
                        onClick={() => setQty(Math.min(product.stock || 99, qty + 1))}
                        className="p-3 hover:bg-gray-50 text-peca-purple transition-colors"
                    >
                        <Plus size={20} className="stroke-[3px]" />
                    </button>
                </div>
            </div>

            <div className="flex gap-4">
                <button
                    onClick={handleAdd}
                    disabled={!product.stock}
                    className="flex-1 bg-gradient-to-r from-peca-purple to-peca-purple-dark text-white py-4.5 rounded-[22px] font-black text-lg shadow-xl shadow-peca-purple/30 hover:shadow-peca-purple/40 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-3 tracking-wide"
                >
                    <ShoppingBag size={22} />
                    {product.stock ? 'Add to Cart' : 'Out of Stock'}
                </button>
            </div>
        </div>
    );
}
