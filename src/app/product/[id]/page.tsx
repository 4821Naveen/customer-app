
import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';
import AmazonNavbar from '@/components/AmazonNavbar';
import AddToCartButton from '@/components/AddToCartButton'; // We'll create this client component
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ProductPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;

    // Validate MongoDB ObjectId format to prevent CastError
    if (!params.id.match(/^[0-9a-fA-F]{24}$/)) {
        notFound();
    }

    await connectToDatabase();
    const product = await Product.findById(params.id).lean();

    if (!product) notFound();

    const p = JSON.parse(JSON.stringify(product));

    return (
        <div className="min-h-screen bg-peca-bg-alt pb-24">
            <div className="pt-6 md:pt-10 container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-8 lg:gap-16 bg-white p-6 md:p-10 rounded-[40px] shadow-sm border border-gray-100">
                    <div className="bg-peca-bg-alt rounded-[32px] overflow-hidden aspect-[4/5] relative">
                        {p.images[0] ? (
                            <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-300">No Image</div>
                        )}
                    </div>

                    <div className="flex flex-col">
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="px-3 py-1 bg-peca-purple/10 text-peca-purple text-xs font-bold rounded-full">
                                    {p.category || 'Popular'}
                                </span>
                            </div>
                            <h1 className="text-3xl lg:text-5xl font-black text-peca-text leading-tight mb-4">{p.name}</h1>
                            <p className="text-peca-text-light leading-relaxed">
                                {p.description || "Indulge in our chef's special creation, prepared with the finest ingredients and a touch of Pecafoo magic."}
                            </p>
                        </div>
                        <div className="mt-auto space-y-8">
                            <div className="flex items-baseline gap-3">
                                <span className="text-4xl font-black text-peca-purple">₹{p.offerPrice ? p.offerPrice : p.price}</span>
                                {p.offerPrice && (
                                    <span className="text-xl text-gray-400 line-through">₹{p.price}</span>
                                )}
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <AddToCartButton product={p} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
