
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User'; // Assuming we have User model, if not we will mock or create one.
// Since we don't have a robust User Auth yet (it was skipped in MVP), we will simulate a single "Guest/Demo" user or rely on localStorage user ID passed in headers.
// For now, let's fetch orders based on a "userId" or "mobile" provided in query for MVP, or better, implement a simple User model if it exists.
// Checking previous turn... we had `models/Users` mentioned in task List.
// Let's assume basic user management.

export async function GET(req: Request) {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId'); // In a real app, use Session/Cookie

    if (!userId) {
        return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    try {
        const orders = await Order.find({ 'customer.userId': userId }).sort({ createdAt: -1 });
        return NextResponse.json({ orders });
    } catch (err) {
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }
}
