
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
    await connectToDatabase();
    try {
        const { name, email, password, mobile } = await req.json();

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = await User.create({
            userId: uuidv4(), // Legacy fallback
            name,
            email,
            password: hashedPassword,
            mobile,
            role: 'customer'
        });

        return NextResponse.json({
            success: true,
            message: 'Registration successful',
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email
            }
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
