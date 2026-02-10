
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface WishlistItem {
    productId: string;
    name: string;
    price: number;
    image: string;
}

interface WishlistContextType {
    wishlist: WishlistItem[];
    addToWishlist: (product: WishlistItem) => void;
    removeFromWishlist: (productId: string) => void;
    isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
    const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

    useEffect(() => {
        const savedWishlist = localStorage.getItem('wishlist');
        if (savedWishlist) {
            setWishlist(JSON.parse(savedWishlist));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }, [wishlist]);

    const addToWishlist = (product: WishlistItem) => {
        setWishlist(prev => {
            if (prev.find(item => item.productId === product.productId)) return prev;
            return [...prev, product];
        });
    };

    const removeFromWishlist = (productId: string) => {
        setWishlist(prev => prev.filter(item => item.productId !== productId));
    };

    const isInWishlist = (productId: string) => {
        return wishlist.some(item => item.productId === productId);
    };

    return (
        <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
}
