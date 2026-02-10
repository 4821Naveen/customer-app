
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await connectToDatabase();
    const { id } = await params;

    // Wait, typical Next.js app router dynamic route: src/app/api/user/[id]/route.ts
    // I will write this file to THAT path.

    try {
        const user = await User.findOne({ userId: id });
        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
}
