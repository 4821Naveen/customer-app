
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import CompanyDetails from '@/models/CompanyDetails';
import crypto from 'crypto';
import Product from '@/models/Product';
import Razorpay from 'razorpay';
import { v4 as uuidv4 } from 'uuid'; // Standard node uuid or customized

// Simple custom ID generator if uuid not installed
const generateOrderId = () => `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

export async function POST(req: Request) {
    await connectToDatabase();
    try {
        const body = await req.json();
        const { customer, items, paymentId, razorpayOrderId, razorpaySignature, dates } = body;

        if (!customer || !items || !items.length) {
            return NextResponse.json({ error: 'Invalid order data' }, { status: 400 });
        }

        const totalAmount = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

        // Verify Signature and Capture Payment if payment was made
        if (paymentId && razorpayOrderId && razorpaySignature) {
            const details = await CompanyDetails.findOne();
            const keySecret = details?.paymentGateway?.keySecret;
            const keyId = details?.paymentGateway?.keyId;

            if (keySecret && keyId) {
                // 1. Verify Signature
                const generated_signature = crypto
                    .createHmac('sha256', keySecret)
                    .update(razorpayOrderId + "|" + paymentId)
                    .digest('hex');

                if (generated_signature !== razorpaySignature) {
                    return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
                }

                // 2. Capture the Payment
                console.log('[Payment] Signature verified. Capturing payment:', paymentId);
                try {
                    const razorpay = new Razorpay({
                        key_id: keyId,
                        key_secret: keySecret,
                    });

                    const captureResponse = await razorpay.payments.capture(
                        paymentId,
                        totalAmount * 100, // amount in paise
                        'INR'
                    );

                    console.log('[Payment] Captured successfully:', captureResponse.id);
                    console.log('[Payment] Capture status:', captureResponse.status);
                } catch (captureErr: any) {
                    console.error('[Payment] Capture failed:', captureErr);
                    console.error('[Payment] Capture error details:', JSON.stringify(captureErr, null, 2));
                    return NextResponse.json({
                        error: 'Payment capture failed: ' + (captureErr.error?.description || captureErr.message)
                    }, { status: 400 });
                }
            }
        }

        const newOrder = await Order.create({
            orderId: generateOrderId(),
            customer,
            products: items.map((item: any) => ({
                productId: item.productId,
                name: item.name,
                price: item.price,
                quantity: item.quantity
            })),
            totalAmount,
            status: 'placed',
            paymentStatus: paymentId ? 'success' : 'pending',
            paymentId: paymentId,
            razorpayDetails: {
                orderId: razorpayOrderId,
                signature: razorpaySignature
            },
            dates: {
                bookingDate: new Date(),
                preferredDeliveryDate: dates?.preferredDate,
            }
        });

        return NextResponse.json({ success: true, orderId: newOrder.orderId });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
export async function GET(req: Request) {
    await connectToDatabase();
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'UserId is required' }, { status: 400 });
        }

        const orders = await Order.find({ "customer.userId": userId })
            .sort({ createdAt: -1 });

        return NextResponse.json(orders);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
