
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';

export async function GET() {
    await connectToDatabase();
    try {
        const products = await Product.find({ isActive: true }).sort({ createdAt: -1 });
        return NextResponse.json(products);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
