
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';

export async function POST(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    await connectToDatabase();
    try {
        const { reason } = await req.json();
        const orderId = params.id;

        console.log('[Cancel Request] Order ID:', orderId);
        console.log('[Cancel Request] Reason:', reason);

        const order = await Order.findOne({ orderId });
        if (!order) {
            console.error('[Cancel Request] Order not found:', orderId);
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        console.log('[Cancel Request] Order status:', order.status);
        console.log('[Cancel Request] Existing cancellation request:', order.cancellationRequest);

        // Allow cancellation for orders that haven't been shipped yet
        const cancellableStatuses = ['placed', 'confirmed', 'packed'];
        if (!cancellableStatuses.includes(order.status)) {
            console.error('[Cancel Request] Order cannot be cancelled, status:', order.status);
            return NextResponse.json({
                error: `Order cannot be cancelled at this stage. Current status: ${order.status}`
            }, { status: 400 });
        }

        // Check if already cancelled or has pending request
        if (order.status === 'cancelled') {
            return NextResponse.json({ error: 'Order is already cancelled' }, { status: 400 });
        }

        if (order.cancellationRequest?.requested && order.cancellationRequest?.status === 'pending') {
            return NextResponse.json({ error: 'Cancellation request already submitted' }, { status: 400 });
        }

        order.cancellationRequest = {
            requested: true,
            reason: reason || 'No reason provided',
            status: 'pending',
            requestedAt: new Date(),
        };

        await order.save();

        console.log('[Cancel Request] Cancellation request saved successfully');
        return NextResponse.json({ success: true, message: 'Cancellation request submitted' });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
