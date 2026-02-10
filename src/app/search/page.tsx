
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import AnimationWrapper from '@/components/ui/AnimationWrapper';
import { Search as SearchIcon, Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

function SearchContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (query) {
            setLoading(true);
            fetch(`/api/products/search?q=${encodeURIComponent(query)}`)
                .then(res => res.json())
                .then(data => setResults(data.products || [])) // Assuming API returns { products: [] }
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [query]);

    return (
        <div className="pt-8 md:pt-12 container mx-auto px-4">
            <AnimationWrapper animation="fade-up">
                <h1 className="text-3xl font-black text-peca-text mb-8 flex items-center gap-3">
                    <div className="p-3 bg-peca-purple/10 rounded-2xl text-peca-purple">
                        <SearchIcon size={24} />
                    </div>
                    Results for "{query}"
                </h1>

                {loading ? (
                    <div className="flex justify-center py-24">
                        <Loader2 className="animate-spin text-peca-purple" size={48} />
                    </div>
                ) : results.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {results.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-white rounded-[40px] border border-gray-50">
                        <p className="text-xl font-bold text-peca-text mb-2">No matches found</p>
                        <p className="text-peca-text-light italic">Try searching for something else!</p>
                    </div>
                )}
            </AnimationWrapper>
        </div>
    );
}

export default function SearchPage() {
    return (
        <div className="min-h-screen bg-peca-bg-alt">
            <Suspense fallback={
                <div className="flex justify-center py-40">
                    <Loader2 className="animate-spin text-peca-purple" size={48} />
                </div>
            }>
                <SearchContent />
            </Suspense>
        </div>
    );
}
