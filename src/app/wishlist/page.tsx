
'use client';

import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { Trash2, ShoppingCart, Heart } from 'lucide-react';

export default function WishlistPage() {
    const { wishlist, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();

    const handleAddToCart = (product: any) => {
        addToCart({
            productId: product.productId,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
        alert('Added to Cart');
    };

    return (
        <div className="min-h-screen bg-peca-bg-alt pt-8 pb-20">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="flex items-center gap-3 mb-10">
                    <div className="p-3 bg-peca-orange/10 rounded-2xl text-peca-orange">
                        <Heart className="fill-current" size={28} />
                    </div>
                    <h1 className="text-3xl font-black text-peca-text">Your Favorites</h1>
                </div>

                {wishlist.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[40px] border border-gray-100 shadow-sm px-6">
                        <div className="w-20 h-20 bg-peca-bg-alt rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">💝</div>
                        <p className="text-xl font-black text-peca-text mb-2">Nothing here yet</p>
                        <p className="text-peca-text-light mb-8 italic">Add some items you love to find them easily later!</p>
                        <Link href="/" className="inline-block bg-peca-purple text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-peca-purple/20 hover:scale-105 transition-transform">
                            Start Exploring
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {wishlist.map((item) => (
                            <div key={item.productId} className="bg-white p-5 rounded-[32px] border border-gray-50 flex flex-col sm:flex-row gap-6 group hover:shadow-xl hover:shadow-peca-purple/5 transition-all">
                                <Link href={`/product/${item.productId}`} className="w-full sm:w-40 h-40 bg-peca-bg-alt rounded-3xl overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                                    {item.image ? (
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">No Image</div>
                                    )}
                                    <button
                                        onClick={() => removeFromWishlist(item.productId)}
                                        className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-400 hover:text-peca-orange transition-colors shadow-sm"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </Link>
                                <div className="flex-1 flex flex-col justify-between py-1">
                                    <div>
                                        <Link href={`/product/${item.productId}`}>
                                            <h3 className="font-black text-xl text-peca-text hover:text-peca-purple transition-colors line-clamp-1 mb-1">{item.name}</h3>
                                        </Link>
                                        <p className="text-sm text-peca-text-light italic mb-3">Chef's Special Recommendation</p>
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="text-2xl font-black text-peca-purple">₹{item.price}</span>
                                            <span className="px-2 py-0.5 bg-peca-orange/10 text-peca-orange text-[10px] font-black rounded-lg uppercase tracking-wider">Top Rated</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 mt-auto">
                                        <button
                                            onClick={() => handleAddToCart(item)}
                                            className="flex-1 sm:flex-none bg-gradient-to-r from-peca-purple to-peca-purple-dark text-white px-8 py-3 rounded-2xl font-black text-sm transition-all shadow-lg shadow-peca-purple/20 active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            <ShoppingCart size={18} />
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
