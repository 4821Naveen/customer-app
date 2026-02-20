'use client';

import { useEffect } from 'react';
import { useBrandingContext } from '@/context/BrandingContext';

export function useBranding(defaultTitle: string = 'Store') {
    const { name, logoUrl, loading, refreshBranding } = useBrandingContext();

    useEffect(() => {
        if (name) {
            if (defaultTitle === 'Store' || defaultTitle === 'Home' || !defaultTitle) {
                document.title = name;
            } else {
                document.title = `${defaultTitle} | ${name}`;
            }
        }
    }, [name, defaultTitle]);

    return {
        name,
        logo: logoUrl,
        loading,
        refreshBranding
    };
}
