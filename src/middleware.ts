
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value;

    // 1. Protect Admin Routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
        if (!token) {
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }

        try {
            const { payload } = await jwtVerify(token, JWT_SECRET);
            if (payload.role !== 'super_user') {
                return NextResponse.redirect(new URL('/', request.url));
            }
        } catch (err) {
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }
    }

    // 2. Protect Checkout/Profile (Optional, but good practice)
    if (request.nextUrl.pathname.startsWith('/checkout') || request.nextUrl.pathname.startsWith('/profile')) {
        if (!token) {
            // Some apps allow guest checkout, but for profile we need login
            if (request.nextUrl.pathname.startsWith('/profile')) {
                return NextResponse.redirect(new URL('/auth/login?redirect=' + request.nextUrl.pathname, request.url));
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/profile/:path*', '/checkout/:path*'],
};
