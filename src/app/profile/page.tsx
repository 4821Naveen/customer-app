
'use client';

import { useEffect, useState } from 'react';
import { useCart } from '@/context/CartContext';
import { Loader2, Save, Package, Download, User, XCircle, AlertCircle, CheckCircle2, LogOut } from 'lucide-react';
import AnimationWrapper from '@/components/ui/AnimationWrapper';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useUser } from '@/context/UserContext';


import { useToast } from '@/context/ToastContext';

export default function ProfilePage() {
    const { user, logout: contextLogout, loading: userLoading } = useUser();
    const { showToast } = useToast();

    const [profile, setProfile] = useState({
        name: '',
        email: '',
        mobile: '',
        address: ''
    });
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [cancelling, setCancelling] = useState<string | null>(null);
    const [cancelReason, setCancelReason] = useState('');

    useEffect(() => {
        if (!userLoading && user) {
            setProfile({
                name: user.name || '',
                email: user.email || '',
                mobile: user.mobile || '',
                address: user.address || ''
            });
            fetchOrders(user._id || user.userId || '');
        } else if (!userLoading && !user) {
            setLoading(false);
        }
    }, [user, userLoading]);

    const fetchOrders = async (id: string) => {
        if (!id || id === '' || id === 'undefined') {
            console.log('[Profile] Invalid userId skipping fetchOrders');
            setLoading(false);
            return;
        }
        try {
            const res = await fetch(`/api/orders?userId=${id}`);
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setSaving(true);
        try {
            const res = await fetch('/api/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user._id || user.userId, ...profile })
            });
            if (res.ok) {
                showToast('Profile Updated Successfully!', 'success');
            } else {
                showToast('Failed to update profile', 'error');
            }
        } catch (error) {
            showToast('An error occurred', 'error');
        } finally {
            setSaving(false);
        }
    };

    const downloadInvoice = async (order: any) => {
        try {
            const companyRes = await fetch('/api/settings/company');
            const company = companyRes.ok ? await companyRes.json() : {};

            const doc = new jsPDF();

            // Header
            doc.setFontSize(20);
            doc.text(company.name || 'Company Name', 14, 22);

            doc.setFontSize(10);
            doc.text(company.address || '', 14, 30);
            doc.text(`Mobile: ${company.mobile || ''}`, 14, 35);

            // Invoice Details
            doc.text(`Invoice #: INV-${order.orderId}`, 140, 30);
            doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 140, 35);

            doc.text(`Customer: ${order.customer.name}`, 14, 45);
            doc.text(`Address: ${order.customer.address}`, 14, 50);

            // Table
            const tableColumn = ["Product", "Qty", "Price", "GST", "Total"];
            const tableRows: any[] = [];

            order.products.forEach((product: any) => {
                const tableRow = [
                    product.name,
                    product.quantity,
                    `Rs ${product.price}`,
                    `Rs ${(product.gstAmount || 0).toFixed(2)}`,
                    `Rs ${(product.price * product.quantity).toFixed(2)}`,
                ];
                tableRows.push(tableRow);
            });

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 60,
            });

            const finalY = (doc as any).lastAutoTable.finalY + 10;

            doc.setFontSize(12);
            doc.text(`Total Amount: Rs ${order.totalAmount}`, 14, finalY);
            if (order.orderGstAmount) {
                doc.setFontSize(10);
                doc.text(`Incl. GST: Rs ${order.orderGstAmount.toFixed(2)}`, 14, finalY + 7);
            }

            if (order.paymentStatus === 'refunded') {
                doc.setTextColor(255, 0, 0);
                doc.text(`REFUNDED`, 14, finalY + 15);
            }

            doc.save(`invoice_${order.orderId}.pdf`);
            showToast('Invoice Downloaded', 'info');
        } catch (err) {
            showToast('Failed to generate invoice', 'error');
        }
    };

    const handleCancelRequest = async (orderId: string) => {
        if (!cancelReason.trim()) {
            showToast('Please provide a reason for cancellation', 'warning');
            return;
        }

        try {
            const res = await fetch(`/api/orders/${orderId}/cancel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: cancelReason })
            });

            if (res.ok) {
                showToast('Cancellation request submitted!', 'success');
                setCancelling(null);
                setCancelReason('');
                if (user) fetchOrders(user._id || user.userId || '');
            } else {
                const err = await res.json();
                showToast(err.error || 'Failed to submit request', 'error');
            }
        } catch (error) {
            showToast('An error occurred', 'error');
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <AnimationWrapper className="min-h-screen bg-peca-bg-alt pt-8 pb-20">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="flex items-center gap-3 mb-10">
                    <div className="p-3 bg-peca-purple/10 rounded-2xl text-slate-900 border border-peca-purple/20">
                        <User className="fill-peca-purple" size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-peca-text">My Account</h1>
                        <p className="text-sm text-peca-text-light">Manage your profile and track orders</p>
                    </div>

                    <button
                        onClick={contextLogout}
                        className="ml-auto flex items-center gap-2 px-6 py-2.5 bg-red-50 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-100 transition-all border border-red-100/50"
                    >
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Personal Details */}
                    <div className="lg:col-span-5">
                        <section className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm h-fit">
                            <h2 className="text-xl font-black text-peca-text mb-8 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-peca-purple rounded-full" />
                                Details
                            </h2>
                            <form onSubmit={handleSave} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-peca-text-light uppercase tracking-widest px-1">Full Name</label>
                                    <input
                                        value={profile.name}
                                        onChange={e => setProfile({ ...profile, name: e.target.value })}
                                        className="w-full bg-peca-bg-alt border-none rounded-2xl p-4 text-sm font-bold text-peca-text placeholder:text-slate-400 focus:ring-2 focus:ring-peca-purple/20 transition-all outline-none"
                                        placeholder="Enter your name"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-peca-text-light uppercase tracking-widest px-1">Mobile</label>
                                    <input
                                        value={profile.mobile}
                                        onChange={e => setProfile({ ...profile, mobile: e.target.value })}
                                        className="w-full bg-peca-bg-alt border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-peca-purple/20 transition-all outline-none"
                                        placeholder="Enter mobile number"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-peca-text-light uppercase tracking-widest px-1">Email Address</label>
                                    <input
                                        type="email"
                                        value={profile.email}
                                        onChange={e => setProfile({ ...profile, email: e.target.value })}
                                        className="w-full bg-peca-bg-alt border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-peca-purple/20 transition-all outline-none"
                                        placeholder="your@email.com"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-peca-text-light uppercase tracking-widest px-1">Delivery Location</label>
                                    <textarea
                                        value={profile.address}
                                        onChange={e => setProfile({ ...profile, address: e.target.value })}
                                        className="w-full bg-peca-bg-alt border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-peca-purple/20 transition-all outline-none min-h-[120px] resize-none"
                                        placeholder="Write your full address here..."
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full bg-gradient-to-r from-peca-purple to-peca-purple-dark text-slate-900 py-5 rounded-[24px] font-black text-lg shadow-xl shadow-peca-purple/30 hover:shadow-peca-purple/40 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-3 mt-4 uppercase tracking-widest"
                                >
                                    {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} className="stroke-[2.5px]" />}
                                    Update Profile
                                </button>
                            </form>
                        </section>
                    </div>

                    {/* Order History */}
                    <div className="lg:col-span-7">
                        <section className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm min-h-full">
                            <h2 className="text-xl font-black text-peca-text mb-8 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-peca-orange rounded-full" />
                                Order History
                            </h2>
                            <div className="space-y-6">
                                {orders.length === 0 ? (
                                    <div className="text-center py-24">
                                        <div className="w-20 h-20 bg-peca-bg-alt rounded-full flex items-center justify-center mx-auto mb-6 text-3xl opacity-50">📦</div>
                                        <p className="text-lg font-black text-peca-text mb-1">No orders yet</p>
                                        <p className="text-sm text-peca-text-light italic">Your past orders will appear right here.</p>
                                    </div>
                                ) : (
                                    orders.map(order => (
                                        <div key={order._id} className="p-6 bg-peca-bg-alt rounded-[32px] border border-gray-50 hover:bg-white hover:border-peca-purple/20 transition-all group">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <p className="font-black text-peca-text text-lg">Order #{order.orderId}</p>
                                                    <p className="text-[11px] font-bold text-peca-text-light uppercase tracking-wider">{new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter
                                                    ${order.status === 'delivered' ? 'bg-green-500/10 text-green-600' :
                                                        order.status === 'cancelled' ? 'bg-red-500/10 text-red-600' :
                                                            order.status === 'placed' ? 'bg-amber-500/10 text-amber-600 border border-amber-200/50' :
                                                                order.status === 'processing' ? 'bg-blue-500/10 text-blue-600 border border-blue-200/50' :
                                                                    'bg-peca-orange/10 text-peca-orange border border-peca-orange/20'}
                                                `}>
                                                    {order.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/50">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-peca-text-light uppercase tracking-widest">Amount Paid</span>
                                                    <span className="font-black text-2xl text-peca-purple">₹{order.totalAmount}</span>
                                                </div>

                                                <div className="flex gap-2">
                                                    {order.status !== 'cancelled' && order.status !== 'delivered' && !order.cancellationRequest?.requested && (
                                                        <button
                                                            onClick={() => setCancelling(order.orderId)}
                                                            className="bg-white px-4 py-2 rounded-xl text-xs font-black text-red-500 flex items-center gap-2 shadow-sm hover:shadow-md transition-all border border-gray-50"
                                                        >
                                                            <XCircle size={14} /> Cancel Order
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Refund Approved Notification */}
                                            {order.status === 'cancelled' && order.cancellationRequest?.status === 'approved' && (
                                                <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-xl animate-pulse">
                                                    <div className="flex items-start gap-3">
                                                        <div className="p-2 bg-green-500 rounded-full">
                                                            <CheckCircle2 size={20} className="text-white" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-black text-green-900 text-sm mb-1">✅ Refund Approved!</h4>
                                                            <p className="text-xs text-green-800 leading-relaxed">
                                                                Your cancellation request has been approved. The refund of <span className="font-bold">₹{order.totalAmount}</span> will be processed to your bank account within <span className="font-bold">1-2 business days</span>.
                                                            </p>
                                                            {order.cancellationRequest?.processedAt && (
                                                                <p className="text-[10px] text-green-600 mt-2 font-semibold">
                                                                    Processed on: {new Date(order.cancellationRequest.processedAt).toLocaleString()}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Cancellation Pending Notification */}
                                            {order.cancellationRequest?.requested && order.cancellationRequest?.status === 'pending' && (
                                                <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 rounded-xl">
                                                    <div className="flex items-start gap-3">
                                                        <div className="p-2 bg-amber-500 rounded-full animate-pulse">
                                                            <AlertCircle size={20} className="text-white" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-black text-amber-900 text-sm mb-1">⏳ Cancellation Pending</h4>
                                                            <p className="text-xs text-amber-800 leading-relaxed">
                                                                Your cancellation request is under review. You'll be notified once the admin processes your request.
                                                            </p>
                                                            <p className="text-[10px] text-amber-600 mt-2 font-semibold">
                                                                Reason: {order.cancellationRequest.reason}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Cancellation Rejected Notification */}
                                            {order.cancellationRequest?.status === 'rejected' && (
                                                <div className="mt-4 p-4 bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 rounded-xl">
                                                    <div className="flex items-start gap-3">
                                                        <div className="p-2 bg-red-500 rounded-full">
                                                            <XCircle size={20} className="text-white" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-black text-red-900 text-sm mb-1">❌ Cancellation Rejected</h4>
                                                            <p className="text-xs text-red-800 leading-relaxed">
                                                                Your cancellation request has been declined. The order will proceed as normal.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Status Timeline & Invoice */}
                                            {order.status !== 'cancelled' && order.status !== 'refunded' && (
                                                <div className="mt-8 pt-6 border-t border-white/50">
                                                    <div className="flex justify-between items-center mb-6">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-1.5 h-4 bg-peca-purple rounded-full" />
                                                            <span className="text-xs font-black text-peca-text uppercase tracking-widest">Track Status</span>
                                                        </div>
                                                        <button
                                                            onClick={() => downloadInvoice(order)}
                                                            className="bg-peca-purple/10 px-4 py-2 rounded-xl text-[10px] font-black text-peca-purple flex items-center gap-2 hover:bg-peca-purple hover:text-white transition-all"
                                                        >
                                                            <Download size={14} /> Download Invoice
                                                        </button>
                                                    </div>
                                                    <div className="flex justify-between items-start">
                                                        {[
                                                            { label: 'Placed', active: true },
                                                            { label: 'Processing', active: ['processing', 'shipped', 'delivered', 'cancel_requested'].includes(order.status) },
                                                            { label: 'Shipped', active: ['shipped', 'delivered'].includes(order.status) },
                                                            { label: 'Delivered', active: order.status === 'delivered' }
                                                        ].map((step, idx) => (
                                                            <div key={idx} className="flex flex-col items-center flex-1 relative group/step">
                                                                {idx !== 3 && (
                                                                    <div className={`absolute top-2.5 left-1/2 w-full h-0.5 ${step.active ? 'bg-peca-purple' : 'bg-gray-200'}`} />
                                                                )}
                                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center z-10
                                                                    ${step.active ? 'bg-peca-purple text-white' : 'bg-gray-100 text-gray-400'}
                                                                    transition-colors duration-500
                                                                `}>
                                                                    {step.active ? <CheckCircle2 size={12} strokeWidth={3} /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                                                                </div>
                                                                <span className={`mt-2 text-[10px] font-black uppercase tracking-tighter ${step.active ? 'text-peca-text' : 'text-gray-400'}`}>
                                                                    {step.label}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Cancellation Inputs */}
                                            {cancelling === order.orderId && (
                                                <div className="mt-4 p-6 bg-white rounded-3xl border-2 border-red-100 animate-in fade-in slide-in-from-top-2 duration-300">
                                                    <p className="text-sm font-black text-peca-text mb-4 uppercase tracking-widest">Why do you want to cancel?</p>
                                                    <textarea
                                                        value={cancelReason}
                                                        onChange={e => setCancelReason(e.target.value)}
                                                        className="w-full bg-peca-bg-alt border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-red-100 transition-all outline-none min-h-[100px] resize-none mb-4"
                                                        placeholder="Please tell us why..."
                                                    />
                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={() => handleCancelRequest(order.orderId)}
                                                            className="flex-1 bg-red-500 text-white py-3 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-red-200"
                                                        >
                                                            Submit Request
                                                        </button>
                                                        <button
                                                            onClick={() => { setCancelling(null); setCancelReason(''); }}
                                                            className="px-6 py-3 bg-peca-bg-alt text-peca-text-light rounded-xl font-black text-sm uppercase tracking-widest"
                                                        >
                                                            Nevermind
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </AnimationWrapper>
    );
}
