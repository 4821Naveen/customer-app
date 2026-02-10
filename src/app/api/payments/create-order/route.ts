
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import connectToDatabase from '@/lib/db';
import CompanyDetails from '@/models/CompanyDetails';

export async function POST(req: Request) {
    await connectToDatabase();
    try {
        const { amount, currency = 'INR' } = await req.json();

        const details = await CompanyDetails.findOne();
        if (!details || !details.paymentGateway?.isActive || !details.paymentGateway?.keyId || !details.paymentGateway?.keySecret) {
            return NextResponse.json({ error: 'Payment gateway not configured' }, { status: 400 });
        }

        const razorpay = new Razorpay({
            key_id: details.paymentGateway.keyId,
            key_secret: details.paymentGateway.keySecret,
        });

        const options = {
            amount: Math.round(amount * 100), // amount in the smallest currency unit
            currency,
            receipt: `rcpt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);
        return NextResponse.json({
            orderId: order.id,
            keyId: details.paymentGateway.keyId
        });

    } catch (error: any) {
        console.error('Razorpay Order Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
