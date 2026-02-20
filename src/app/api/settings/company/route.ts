
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import CompanyDetails from '@/models/CompanyDetails';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');

export async function GET(req: Request) {
    await connectToDatabase();
    try {
        let details = await CompanyDetails.findOne();
        if (!details) {
            details = await CompanyDetails.create({});
        }

        // Check for role to decide on masking
        const cookie = req.headers.get('cookie');
        const token = cookie?.split('; ').find(row => row.startsWith('auth_token='))?.split('=')[1];

        let isSuperUser = false;
        if (token) {
            try {
                const { payload } = await jwtVerify(token, JWT_SECRET);
                if (payload.role === 'super_user') {
                    isSuperUser = true;
                }
            } catch (err) {
                // Not super user or invalid token
            }
        }

        if (isSuperUser) {
            return NextResponse.json(details);
        }

        // Mask internal fields for customers
        const publicSettings = {
            name: details.name,
            logoUrl: details.logoUrl,
            email: details.email,
            address: details.address,
            mobile: details.mobile,
            paymentGateway: {
                isActive: details.paymentGateway?.isActive || false,
                keyId: details.paymentGateway?.keyId || ''
            }
        };

        return NextResponse.json(publicSettings);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    await connectToDatabase();
    try {
        // Simple auth check for PUT (only admin should update)
        const cookie = req.headers.get('cookie');
        const token = cookie?.split('; ').find(row => row.startsWith('auth_token='))?.split('=')[1];

        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { payload } = await jwtVerify(token, JWT_SECRET);
        if (payload.role !== 'super_user') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const details = await CompanyDetails.findOneAndUpdate({}, body, {
            new: true,
            upsert: true,
            runValidators: true,
            setDefaultsOnInsert: true,
        });
        return NextResponse.json(details);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
