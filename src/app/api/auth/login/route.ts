
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export async function POST(req: Request) {
    await connectToDatabase();
    try {
        const { email, password } = await req.json();

        // 1. Super User Bypass
        const superEmail = process.env.SUPER_USER_EMAIL;
        const superPass = process.env.SUPER_USER_PASSWORD;

        if (superEmail && superPass && email === superEmail && password === superPass) {
            const token = jwt.sign(
                { email: superEmail, role: 'super_user' },
                JWT_SECRET,
                { expiresIn: '1d' }
            );

            const cookie = serialize('auth_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 86400,
                path: '/'
            });

            const response = NextResponse.json({
                success: true,
                user: { email: superEmail, role: 'super_user', name: 'Super Admin' }
            });
            response.headers.set('Set-Cookie', cookie);
            return response;
        }

        // 2. Regular User Login
        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        const cookie = serialize('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 86400,
            path: '/'
        });

        const response = NextResponse.json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                mobile: user.mobile
            }
        });
        response.headers.set('Set-Cookie', cookie);
        return response;

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
