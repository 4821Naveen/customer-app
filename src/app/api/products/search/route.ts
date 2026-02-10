
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';

export async function GET(req: Request) {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');

    if (!q) {
        return NextResponse.json({ products: [] });
    }

    try {
        const products = await Product.find({
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { category: { $regex: q, $options: 'i' } }
            ]
        }).limit(20);

        return NextResponse.json({ products });
    } catch (error) {
        return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }
}
