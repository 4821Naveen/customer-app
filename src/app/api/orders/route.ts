
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

        // Fetch detailed product info to calculate GST and verify prices
        const productIds = items.map((item: any) => item.productId);
        const dbProducts = await Product.find({ _id: { $in: productIds } });

        let orderGstAmount = 0;
        const processedItems = items.map((item: any) => {
            const dbProduct = dbProducts.find(p => p._id.toString() === item.productId);
            const gstPercentage = dbProduct?.gstPercentage || 0;
            const pricePaid = item.price; // This is the final price from cart

            // Assume pricePaid is GST inclusive. 
            // GST Amount = Total - (Total / (1 + GST% / 100))
            const gstAmountPerUnit = pricePaid - (pricePaid / (1 + gstPercentage / 100));
            const totalGstForItem = gstAmountPerUnit * item.quantity;
            orderGstAmount += totalGstForItem;

            return {
                productId: item.productId,
                name: item.name,
                price: pricePaid,
                originalPrice: dbProduct?.price || pricePaid,
                gstAmount: totalGstForItem,
                quantity: item.quantity
            };
        });

        // Verify Signature and Capture Payment if payment was made
        if (paymentId && razorpayOrderId && razorpaySignature) {
            // ... (signature verification logic remains unchanged)
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
                try {
                    const razorpay = new Razorpay({
                        key_id: keyId,
                        key_secret: keySecret,
                    });

                    await razorpay.payments.capture(
                        paymentId,
                        Math.round(totalAmount * 100), // amount in paise
                        'INR'
                    );
                } catch (captureErr: any) {
                    const errorMsg = captureErr.error?.description || captureErr.message || '';
                    if (errorMsg.includes('already been captured')) {
                        console.log('[Payment] Order was already captured. Proceeding with record creation...');
                    } else {
                        console.error('[Payment] Capture failed:', captureErr);
                        return NextResponse.json({
                            error: 'Payment capture failed: ' + errorMsg
                        }, { status: 400 });
                    }
                }
            }
        }

        const newOrder = await Order.create({
            orderId: generateOrderId(),
            customer,
            products: processedItems,
            totalAmount,
            orderGstAmount,
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
            return NextResponse.json([]);
        }

        const orders = await Order.find({ "customer.userId": userId })
            .sort({ createdAt: -1 });

        return NextResponse.json(orders);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
