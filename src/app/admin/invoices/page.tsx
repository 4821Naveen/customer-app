'use client';

import { useState } from 'react';
import { Search, FileText, Printer, AlertCircle } from 'lucide-react';
import { generateInvoice } from '@/lib/invoiceGenerator';

export default function InvoicesPage() {
    const [mobile, setMobile] = useState('');
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mobile || mobile.length < 10) return;

        setLoading(true);
        setSearched(true);
        try {
            // Fetch all orders and filter by mobile on client for now 
            // (ideally should be a backend search API, but this is faster to implement without touching backend)
            const res = await fetch('/api/admin-orders');
            if (res.ok) {
                const allOrders = await res.json();
                const filtered = allOrders.filter((order: any) =>
                    order.customer.mobile.includes(mobile)
                );
                // Sort by date desc
                filtered.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setOrders(filtered);
            }
        } catch (err) {
            console.error('Search failed:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 uppercase">Tax Invoices</h1>
                    <p className="text-gray-500 mt-1 font-medium">Search, generate, and print official tax invoices</p>
                </div>
                <div className="bg-gray-100 px-4 py-2 rounded-2xl flex items-center gap-2 text-gray-500 font-bold text-xs">
                    <AlertCircle size={16} className="text-gray-400" />
                    TAX-COMPLIANT SYSTEM
                </div>
            </div>

            {/* Search Section */}
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <FileText size={120} className="text-peca-purple" />
                </div>

                <form onSubmit={handleSearch} className="relative z-10">
                    <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Customer Authentication</h2>
                    <div className="flex flex-col md:flex-row gap-4 items-stretch">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="tel"
                                placeholder="Enter 10-digit mobile number..."
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-lg font-bold focus:ring-4 focus:ring-peca-purple/10 transition-all placeholder:text-gray-300"
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !mobile}
                            className="px-10 py-4 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 transition-all font-black uppercase text-sm tracking-widest disabled:opacity-50 shadow-xl shadow-gray-900/10 active:scale-95 border-b-4 border-gray-950"
                        >
                            {loading ? 'Processing...' : 'Find Records'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Results */}
            {searched && (
                <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {orders.length === 0 ? (
                        <div className="text-center py-24 flex flex-col items-center">
                            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mb-6">
                                <Search size={32} className="text-gray-300" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900">No records found</h3>
                            <p className="text-gray-500 font-medium max-w-xs mt-2">We couldn't find any orders associated with the mobile number "{mobile}"</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 font-black text-[10px] uppercase tracking-[0.15em] text-gray-400 border-b border-gray-100">
                                        <th className="px-8 py-5">Order Reference</th>
                                        <th className="px-8 py-5">Customer Billing</th>
                                        <th className="px-8 py-5">Transaction Summary</th>
                                        <th className="px-8 py-5">Payment Status</th>
                                        <th className="px-8 py-5 text-right">Invoice Generation</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 font-medium">
                                    {orders.map((order) => (
                                        <tr key={order._id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="font-black text-gray-900 mb-1 leading-none uppercase tracking-tight">#{order.orderId}</div>
                                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest group-hover:text-peca-purple transition-colors">
                                                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="font-bold text-gray-900">{order.customer.name}</div>
                                                <div className="text-[10px] text-gray-400 font-bold">{order.customer.mobile}</div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="text-base font-black text-gray-900 uppercase">₹{order.totalAmount?.toLocaleString()}</div>
                                                <div className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{order.products.length} Items Included</div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    order.status === 'cancelled' ? 'bg-red-50 text-red-600 border-red-100' :
                                                        'bg-blue-50 text-blue-600 border-blue-100'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button
                                                    onClick={() => generateInvoice(order)}
                                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-peca-purple text-white rounded-xl hover:bg-peca-purple/90 transition-all text-[10px] font-black uppercase tracking-widest shadow-lg shadow-peca-purple/20 active:scale-95"
                                                >
                                                    <Printer size={14} className="stroke-[2.5px]" /> Print Tax Invoice
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {!searched && (
                <div className="text-center py-20 opacity-20 flex flex-col items-center">
                    <Search size={80} className="stroke-[1px]" />
                    <p className="font-black uppercase tracking-[0.2em] text-sm mt-4">Search mobile to generate invoices</p>
                </div>
            )}
        </div>
    );
}
