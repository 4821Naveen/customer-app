
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';

export async function POST(req: Request) {
    await connectToDatabase();
    try {
        const body = await req.json();
        const { userId, name, email, mobile, address } = body;

        // Upsert User
        const user = await User.findOneAndUpdate(
            { userId }, // Search by custom userId (UUID)
            { userId, name, email, mobile, address },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        return NextResponse.json(user);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
