
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import CompanyDetails from '@/models/CompanyDetails';

export async function GET() {
    await connectToDatabase();
    try {
        let details = await CompanyDetails.findOne();
        if (!details) {
            // Return defaults if not found
            return NextResponse.json({
                name: 'My Shop',
                email: '',
                address: '',
                mobile: '',
                paymentGateway: { isActive: false, keyId: '' }
            });
        }

        // Pick only public fields for the customer app
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
