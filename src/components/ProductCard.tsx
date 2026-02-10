
'use client';

import Link from 'next/link';
import { ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import AnimationWrapper from '@/components/ui/AnimationWrapper';

interface ProductCardProps {
    product: any;
}

export default function ProductCard({ product }: ProductCardProps) {
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

    const isFavorite = isInWishlist(product._id);

    const handleCreate = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation
        addToCart({
            productId: product._id,
            name: product.name,
            price: product.price,
            image: product.images[0] || '',
            quantity: 1
        });
        alert('Added to Cart');
    };

    const toggleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        if (isFavorite) {
            removeFromWishlist(product._id);
        } else {
            addToWishlist({
                productId: product._id,
                name: product.name,
                price: product.price,
                image: product.images[0] || ''
            });
        }
    };

    return (
        <AnimationWrapper className="bg-white rounded-3xl overflow-hidden border border-gray-100 p-2 hover:shadow-xl hover:shadow-peca-purple/5 transition-all duration-300 group">
            <Link href={`/product/${product._id}`} className="flex flex-row md:flex-col h-full gap-4">
                {/* Image Section */}
                <div className="w-1/3 md:w-full aspect-square md:aspect-[4/5] bg-peca-bg-alt rounded-2xl flex items-center justify-center p-3 md:p-4 relative overflow-hidden flex-shrink-0">
                    {product.images[0] ? (
                        <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover rounded-xl group-hover:scale-110 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                            No Image
                        </div>
                    )}

                    <button
                        onClick={toggleWishlist}
                        className="absolute top-2 right-2 md:top-3 md:right-3 p-1.5 md:p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm transition-all z-10"
                    >
                        <Heart
                            size={16}
                            className={isFavorite ? "fill-peca-purple text-peca-purple" : "text-gray-400"}
                        />
                    </button>

                    {/* Quick Add Button Overlay - Desktop only */}
                    <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 hidden md:block">
                        <button
                            onClick={handleCreate}
                            className="w-full bg-peca-purple text-slate-900 py-2.5 px-4 rounded-xl font-black flex items-center justify-center gap-2 shadow-xl shadow-peca-purple/20 active:scale-95 transition-all text-sm uppercase tracking-wide"
                        >
                            <ShoppingCart size={18} className="stroke-[2.5px]" />
                            Add to Cart
                        </button>
                    </div>
                </div>

                {/* Info Section */}
                <div className="py-1 md:px-2 md:pb-2 flex flex-col flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1 gap-2">
                        <h3 className="text-sm md:text-[15px] font-black text-peca-text line-clamp-2 leading-tight flex-1">
                            {product.name}
                        </h3>
                        <div className="bg-slate-900 px-2 py-0.5 rounded-lg flex items-center gap-1 shrink-0">
                            <span className="text-[10px] font-black text-peca-purple">⭐ 4.8</span>
                        </div>
                    </div>

                    <p className="text-[10px] md:text-xs font-bold text-peca-text-light mb-2 line-clamp-1">
                        {product.category || 'General'}
                    </p>

                    {/* Price Section */}
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                        <div className="flex flex-col">
                            {product.offerPrice && (
                                <span className="text-[10px] text-gray-400 line-through">₹{product.price}</span>
                            )}
                            <span className="text-base md:text-lg font-black text-slate-900">
                                ₹{product.offerPrice ? product.offerPrice : product.price}
                            </span>
                        </div>

                        {/* Mobile Add Button */}
                        <button
                            onClick={handleCreate}
                            className="md:hidden w-10 h-10 rounded-xl bg-peca-purple text-slate-900 flex items-center justify-center shadow-xl shadow-peca-purple/20 active:scale-90 transition-all border border-peca-purple-dark/20"
                        >
                            <ShoppingCart size={18} className="stroke-[2.5px]" />
                        </button>
                    </div>
                </div>
            </Link>
        </AnimationWrapper>
    );
}
