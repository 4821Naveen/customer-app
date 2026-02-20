'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface BrandingData {
    name: string;
    logoUrl: string;
    loading: boolean;
}

interface BrandingContextType extends BrandingData {
    refreshBranding: () => Promise<void>;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export function BrandingProvider({ children }: { children: React.ReactNode }) {
    const [branding, setBranding] = useState<BrandingData>({
        name: '',
        logoUrl: '',
        loading: true
    });

    const fetchBranding = useCallback(async () => {
        try {
            const res = await fetch('/api/settings/company');
            const data = await res.json();
            if (data && !data.error) {
                setBranding({
                    name: data.name || '',
                    logoUrl: data.logoUrl || '',
                    loading: false
                });

                // Update Favicon logic moved here for broad support
                if (data.logoUrl) {
                    const link: HTMLLinkElement = document.querySelector("link[rel*='icon']") || document.createElement('link');
                    link.type = 'image/x-icon';
                    link.rel = 'shortcut icon';
                    link.href = data.logoUrl;
                    if (!document.querySelector("link[rel*='icon']")) {
                        document.getElementsByTagName('head')[0].appendChild(link);
                    }
                }
            }
        } catch (err) {
            console.error('Failed to fetch branding:', err);
            setBranding(prev => ({ ...prev, loading: false }));
        }
    }, []);

    useEffect(() => {
        fetchBranding();
    }, [fetchBranding]);

    const refreshBranding = async () => {
        await fetchBranding();
    };

    return (
        <BrandingContext.Provider value={{ ...branding, refreshBranding }}>
            {children}
        </BrandingContext.Provider>
    );
}

export function useBrandingContext() {
    const context = useContext(BrandingContext);
    if (context === undefined) {
        throw new Error('useBrandingContext must be used within a BrandingProvider');
    }
    return context;
}
