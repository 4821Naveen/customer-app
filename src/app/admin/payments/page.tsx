
'use client';

import { useEffect, useState } from 'react';
import { clsx } from 'clsx';
import {
    ArrowUpRight,
    TrendingUp,
    CheckCircle2,
    XCircle,
    Clock,
    CreditCard,
    Wallet,
    Banknote,
    Users,
    Search,
    Filter,
    Download
} from 'lucide-react';

export default function PaymentsPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [methodFilter, setMethodFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = () => {
        fetch('/api/admin-orders')
            .then(res => res.json())
            .then(data => {
                // Filter orders that have payment info or just show all
                const validTxns = data.filter((o: any) => o.paymentId || o.paymentStatus !== 'pending');
                // process method if possible, for now map to a display friendlier object
                const processed = validTxns.map((t: any) => ({
                    ...t,
                    // Mocking method for now as it's not in DB, 
                    // in real prod we'd save this from webhook. 
                    // We can randomize or leave generic if unknown.
                    // For now let's try to infer or leave blank, 
                    // BUT user wants to filter. Let's add a placeholder 
                    // or if paymentId starts with 'pay_', likely Razorpay.
                    method: t.paymentId ? 'Online' : 'Cash'
                }));
                setTransactions(processed);
            })
            .finally(() => setLoading(false));
    };

    const getFilteredTransactions = () => {
        let filtered = transactions;

        if (statusFilter) {
            filtered = filtered.filter(t => t.paymentStatus === statusFilter);
        }

        if (methodFilter) {
            filtered = filtered.filter(t => t.method === methodFilter);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(t =>
                (t.paymentId && t.paymentId.toLowerCase().includes(query)) ||
                (t.customer?.name && t.customer.name.toLowerCase().includes(query)) ||
                (t.orderId && t.orderId.toLowerCase().includes(query))
            );
        }

        return filtered;
    };

    const stats = {
        totalRevenue: transactions
            .filter(t => t.paymentStatus === 'success')
            .reduce((sum, t) => sum + (t.totalAmount || 0), 0),
        refundedAmount: transactions
            .filter(t => t.paymentStatus === 'refunded')
            .reduce((sum, t) => sum + (t.totalAmount || 0), 0),
        pendingAmount: transactions
            .filter(t => t.paymentStatus !== 'success' && t.paymentStatus !== 'refunded')
            .reduce((sum, t) => sum + (t.totalAmount || 0), 0),
        successCount: transactions.filter(t => t.paymentStatus === 'success').length,
    };

    const handleExportExcel = () => {
        const filtered = getFilteredTransactions();
        const excelData = filtered.map(t => ({
            'Payment ID': t.paymentId || 'N/A',
            'Order ID': t.orderId,
            'Amount': t.totalAmount,
            'Status': t.paymentStatus?.toUpperCase(),
            'Date': new Date(t.createdAt).toLocaleDateString(),
            'Method': t.method || 'N/A'
        }));

        import('xlsx').then(XLSX => {
            const worksheet = XLSX.utils.json_to_sheet(excelData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");
            const dateStr = new Date().toISOString().split('T')[0];
            XLSX.writeFile(workbook, `Payments_Report_${dateStr}.xlsx`);
        });
    };

    if (loading) return <div>Loading...</div>;

    const filteredTransactions = getFilteredTransactions();

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900">Transactions & Payments</h1>
                    <p className="text-gray-500 mt-1 font-medium">Monitor financial activity and payment statuses</p>
                </div>
                <button
                    onClick={handleExportExcel}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-2xl hover:bg-green-700 transition-all font-bold text-sm shadow-lg shadow-green-600/20 active:scale-95 border-b-4 border-green-800"
                >
                    <Download size={18} className="stroke-[2.5px]" /> EXPORT REPORT (XLSX)
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <TrendingUp size={64} className="text-emerald-600" />
                    </div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Revenue</p>
                    <h2 className="text-3xl font-black text-gray-900 mt-2">₹{stats.totalRevenue.toLocaleString()}</h2>
                    <div className="mt-4 flex items-center gap-2 text-emerald-600">
                        <CheckCircle2 size={14} className="stroke-[3px]" />
                        <span className="text-[10px] font-black uppercase tracking-wider">{stats.successCount} Successful Txns</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <XCircle size={64} className="text-red-600" />
                    </div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Refunded Total</p>
                    <h2 className="text-3xl font-black text-red-600 mt-2">₹{stats.refundedAmount.toLocaleString()}</h2>
                    <div className="mt-4 flex items-center gap-2 text-red-500">
                        <Clock size={14} className="stroke-[3px]" />
                        <span className="text-[10px] font-black uppercase tracking-wider tracking-widest">Processed via Razorpay</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Wallet size={64} className="text-blue-600" />
                    </div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Pending/Failed</p>
                    <h2 className="text-3xl font-black text-gray-900 mt-2">₹{stats.pendingAmount.toLocaleString()}</h2>
                    <div className="mt-4 flex items-center gap-2 text-gray-500">
                        <Clock size={14} className="stroke-[3px]" />
                        <span className="text-[10px] font-black uppercase tracking-wider">Awaiting Confirmation</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Users size={64} className="text-indigo-600" />
                    </div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Transaction Load</p>
                    <h2 className="text-3xl font-black text-gray-900 mt-2">{transactions.length}</h2>
                    <div className="mt-4 flex items-center gap-2 text-indigo-600">
                        <ArrowUpRight size={14} className="stroke-[3px]" />
                        <span className="text-[10px] font-black uppercase tracking-wider">All-time Recorded</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px] relative">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Search Details</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Payment ID, Customer, Order..."
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-peca-purple/20 transition-all placeholder:text-gray-400"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="w-48">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Payment Status</label>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <select
                            className="w-full pl-9 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-peca-purple/20 transition-all appearance-none cursor-pointer"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            <option value="success">Success</option>
                            <option value="refunded">Refunded</option>
                            <option value="pending">Pending</option>
                        </select>
                    </div>
                </div>

                <div className="w-48">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Method</label>
                    <select
                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-peca-purple/20 transition-all cursor-pointer"
                        value={methodFilter}
                        onChange={(e) => setMethodFilter(e.target.value)}
                    >
                        <option value="">All Methods</option>
                        <option value="Online">Online</option>
                        <option value="Cash">Cash on Delivery</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 font-black text-[10px] uppercase tracking-[0.15em] text-gray-400 border-b border-gray-100">
                                <th className="px-8 py-5">Payment / Reference</th>
                                <th className="px-8 py-5">Customer info</th>
                                <th className="px-8 py-5">Total Amount</th>
                                <th className="px-8 py-5">Transaction Status</th>
                                <th className="px-8 py-5">Method</th>
                                <th className="px-8 py-5 text-right">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 font-medium">
                            {filteredTransactions.map((txn) => (
                                <tr key={txn._id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="font-black text-gray-900 mb-1">#{txn.orderId}</div>
                                        <div className="font-mono text-[10px] text-gray-400 group-hover:text-peca-purple transition-colors">
                                            {txn.paymentId || 'NO-REF-FOUND'}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="font-bold text-gray-900">{txn.customer?.name || 'Guest'}</div>
                                        <div className="text-[10px] text-gray-400 font-bold">{txn.customer?.mobile || 'N/A'}</div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="text-lg font-black text-gray-900">₹{txn.totalAmount?.toLocaleString()}</div>
                                        <div className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Gross Amount</div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={clsx(
                                            'inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 shadow-sm',
                                            txn.paymentStatus === 'success'
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                : txn.paymentStatus === 'refunded'
                                                    ? 'bg-orange-50 text-orange-600 border-orange-100'
                                                    : 'bg-gray-50 text-gray-400 border-gray-100'
                                        )}>
                                            <div className={clsx(
                                                'w-1.5 h-1.5 rounded-full',
                                                txn.paymentStatus === 'success' ? 'bg-emerald-500 animate-pulse' :
                                                    txn.paymentStatus === 'refunded' ? 'bg-orange-500' : 'bg-gray-400'
                                            )} />
                                            {txn.paymentStatus || 'unknown'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            {txn.method === 'Online' ? (
                                                <CreditCard size={16} className="text-peca-purple stroke-[2.5px]" />
                                            ) : (
                                                <Banknote size={16} className="text-amber-600 stroke-[2.5px]" />
                                            )}
                                            <span className="font-bold text-gray-700">{txn.method}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="text-xs font-black text-gray-900">
                                            {new Date(txn.createdAt).toLocaleDateString('en-IN', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </div>
                                        <div className="text-[10px] font-black text-gray-400 mt-0.5">
                                            {new Date(txn.createdAt).toLocaleTimeString('en-IN', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                hour12: true
                                            })}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredTransactions.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-4 opacity-30">
                                            <Search size={64} className="stroke-[1px]" />
                                            <p className="font-black uppercase tracking-widest text-sm">No transaction records found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
