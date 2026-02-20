
'use client';

import { useEffect, useState } from 'react';
import {
    Eye,
    CheckCircle,
    XCircle,
    FileText,
    ShoppingBag,
    AlertCircle,
    Package,
    ArrowRight,
    Printer,
    TrendingUp,
    Clock,
    Truck,
    Search,
    Filter,
    Download
} from 'lucide-react';
import { clsx } from 'clsx';
import { generateInvoice } from '@/lib/invoiceGenerator';
import ConfirmModal from '@/components/admin/ConfirmModal';
import CancellationDetailsModal from '@/components/admin/CancellationDetailsModal';

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'info' | 'warning' | 'danger' | 'success';
        confirmText: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        confirmText: 'Confirm',
        onConfirm: () => { }
    });

    // Cancellation details modal state
    const [cancellationModal, setCancellationModal] = useState<{
        isOpen: boolean;
        order: any;
    }>({
        isOpen: false,
        order: null
    });

    const [dateRange, setDateRange] = useState({
        start: '',
        end: ''
    });

    const [mobileFilter, setMobileFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

    const toggleSelectOrder = (orderId: string) => {
        setSelectedOrders(prev =>
            prev.includes(orderId)
                ? prev.filter(id => id !== orderId)
                : [...prev, orderId]
        );
    };

    const toggleSelectAll = () => {
        const filtered = getFilteredOrders();
        if (selectedOrders.length === filtered.length && filtered.length > 0) {
            setSelectedOrders([]);
        } else {
            setSelectedOrders(filtered.map(o => o._id));
        }
    };

    const isAllSelected = () => {
        const filtered = getFilteredOrders();
        return filtered.length > 0 && selectedOrders.length === filtered.length;
    };

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/admin-orders');
            if (!res.ok) {
                const errData = await res.json();
                console.error('API Error:', errData);
                setOrders([]);
                return;
            }
            const data = await res.json();
            if (Array.isArray(data)) {
                setOrders(data);
            } else {
                console.error('Data is not an array:', data);
                setOrders([]);
            }
        } catch (err) {
            console.error(err);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const getFilteredOrders = () => {
        let filtered = orders;

        // Date Filter
        if (dateRange.start || dateRange.end) {
            filtered = filtered.filter(order => {
                const orderDate = new Date(order.createdAt);
                const start = dateRange.start ? new Date(dateRange.start) : new Date('1970-01-01');
                const end = dateRange.end ? new Date(dateRange.end) : new Date();
                end.setHours(23, 59, 59, 999);
                return orderDate >= start && orderDate <= end;
            });
        }

        // Status Filter
        if (statusFilter) {
            filtered = filtered.filter(order => order.status === statusFilter);
        }

        // Mobile Filter
        if (mobileFilter) {
            filtered = filtered.filter(order =>
                order.customer.mobile.includes(mobileFilter)
            );
        }

        // Search Filter (Order ID or Payment ID)
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(order =>
                (order.orderId && order.orderId.toLowerCase().includes(query)) ||
                (order.paymentId && order.paymentId.toLowerCase().includes(query)) ||
                (order.customer.name && order.customer.name.toLowerCase().includes(query))
            );
        }

        return filtered;
    };

    const stats = {
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => ['placed', 'processing'].includes(o.status)).length,
        inTransit: orders.filter(o => o.status === 'shipped').length,
        completedToday: orders.filter(o => {
            const orderDate = new Date(o.createdAt).toDateString();
            const today = new Date().toDateString();
            return orderDate === today && o.status === 'delivered';
        }).length
    };

    const handleExportExcel = () => {
        const filteredOrders = getFilteredOrders();

        // Flatten data for Excel
        const excelData = filteredOrders.map(order => ({
            'Order ID': order.orderId,
            'Date': new Date(order.createdAt).toLocaleDateString(),
            'Customer Name': order.customer.name,
            'Mobile': order.customer.mobile,
            'Address': order.customer.address,
            'Amount': order.totalAmount,
            'Status': order.status.toUpperCase(),
            'Items': order.products.map((p: any) => `${p.name} (x${p.quantity})`).join(', '),
            'Payment Status': order.paymentStatus || 'Pending',
            'Payment ID': order.paymentId || 'N/A'
        }));

        // Dynamically import xlsx to avoid SSR issues
        import('xlsx').then(XLSX => {
            const worksheet = XLSX.utils.json_to_sheet(excelData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

            // Generate filename with date
            const dateStr = new Date().toISOString().split('T')[0];
            XLSX.writeFile(workbook, `Orders_Report_${dateStr}.xlsx`);
        });
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const updateStatus = async (id: string, status: string) => {
        const statusMessages: Record<string, { title: string; message: string; type: 'info' | 'warning' | 'danger' | 'success' }> = {

            processing: {
                title: 'Move to Processing',
                message: 'Set this order as processing? The customer will see this update.',
                type: 'info'
            },
            shipped: {
                title: 'Mark as Shipped',
                message: 'Confirm that this order has been shipped? Tracking will be updated.',
                type: 'success'
            },
            delivered: {
                title: 'Mark as Delivered',
                message: 'Confirm that this order has been successfully delivered to the customer?',
                type: 'success'
            },
            cancelled: {
                title: 'Cancel Order',
                message: 'Are you sure you want to cancel this order? This action cannot be undone.',
                type: 'danger'
            }
        };

        const config = statusMessages[status] || {
            title: 'Update Status',
            message: `Mark order as ${status}?`,
            type: 'info' as const
        };

        setModalConfig({
            isOpen: true,
            title: config.title,
            message: config.message,
            type: config.type,
            confirmText: 'Yes, Proceed',
            onConfirm: async () => {
                try {
                    await fetch(`/api/admin-orders/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status }),
                    });
                    fetchOrders();
                } catch (err) {
                    console.error('Failed to update status:', err);
                }
            }
        });
    };

    const handleRefund = async (orderId: string) => {
        setModalConfig({
            isOpen: true,
            title: 'Process Refund',
            message: 'Approve this cancellation request and issue a full refund? This action cannot be undone.',
            type: 'warning',
            confirmText: 'Yes, Refund',
            onConfirm: async () => {
                try {
                    const res = await fetch(`/api/admin-orders/${orderId}/refund`, {
                        method: 'POST'
                    });
                    if (res.ok) {
                        fetchOrders();
                    } else {
                        const err = await res.json();
                        console.error(err.error || 'Refund failed');
                    }
                } catch (err) {
                    console.error('Error processing refund:', err);
                }
            }
        });
    };

    const showCancellationDetails = (order: any) => {
        setCancellationModal({
            isOpen: true,
            order: order
        });
    };

    const handleApproveCancellation = async () => {
        if (!cancellationModal.order) return;
        try {
            const res = await fetch(`/api/admin-orders/${cancellationModal.order.orderId}/refund`, {
                method: 'POST'
            });
            if (res.ok) {
                fetchOrders();
            }
        } catch (err) {
            console.error('Error processing refund:', err);
        }
    };

    const handleRejectCancellation = async () => {
        if (!cancellationModal.order) return;
        try {
            const res = await fetch(`/api/admin-orders/${cancellationModal.order.orderId}/reject-cancellation`, {
                method: 'POST'
            });
            if (res.ok) {
                fetchOrders();
            }
        } catch (err) {
            console.error('Error rejecting cancellation:', err);
        }
    };

    const statusColors: any = {
        placed: 'bg-yellow-50 text-yellow-600 border-yellow-100',
        processing: 'bg-blue-50 text-blue-600 border-blue-100',
        shipped: 'bg-indigo-50 text-indigo-600 border-indigo-100',
        delivered: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        cancel_requested: 'bg-orange-50 text-orange-600 border-orange-100',
        cancelled: 'bg-red-50 text-red-600 border-red-100',
        refunded: 'bg-gray-50 text-gray-400 border-gray-100',
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-peca-purple"></div>
        </div>
    );

    return (
        <div className="space-y-6">
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print-area, .print-area * {
                        visibility: visible;
                    }
                    .print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>

            {/* Print Area (Hidden by default, shown only in print) */}
            <div className="print-area hidden print:block">
                <div className="space-y-8 p-4">
                    {getFilteredOrders()
                        .filter(order => selectedOrders.includes(order._id))
                        .map((order, idx) => (
                            <div key={idx} className="p-8 border-2 border-dashed border-gray-400 rounded-3xl mb-8 break-inside-avoid">
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="border-b pb-4 border-gray-200">
                                        <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1">Customer Name</h2>
                                        <p className="text-2xl font-black text-gray-900">{order.customer.name}</p>
                                    </div>
                                    <div className="border-b pb-4 border-gray-200">
                                        <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1">Delivery Address</h2>
                                        <p className="text-xl font-bold text-gray-800 leading-tight">{order.customer.address}</p>
                                    </div>
                                    <div className="flex gap-12">
                                        <div className="flex-1 border-b pb-4 border-gray-200">
                                            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1">Phone Number</h2>
                                            <p className="text-2xl font-black text-peca-purple">{order.customer.mobile}</p>
                                        </div>
                                        <div className="flex-1 border-b pb-4 border-gray-200">
                                            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1">Order Ref</h2>
                                            <p className="text-xl font-mono font-bold text-gray-500">#{order.orderId}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Products (IDs)</h2>
                                        <div className="grid grid-cols-2 gap-2 text-xs font-bold text-gray-600">
                                            {order.products.map((p: any, pIdx: number) => (
                                                <div key={pIdx} className="bg-gray-100 px-3 py-2 rounded-xl flex justify-between items-center">
                                                    <span>{p.name}</span>
                                                    <span className="text-[10px] bg-white px-2 py-0.5 rounded-full ml-2">ID: {p.productId ? String(p.productId).slice(-6) : 'N/A'}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
            {/* Print Header */}
            <div className="print-header hidden print:block mb-6">
                <h1 className="text-2xl font-bold">Order Report</h1>
                <p className="text-sm text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
            </div>

            <div className="no-print">
                <div className="no-print space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-gray-900 uppercase">Order Management</h1>
                            <p className="text-gray-500 mt-1 font-medium">Track and manage customer orders efficiently</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleExportExcel}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-2xl hover:bg-green-700 transition-all font-bold text-sm shadow-lg shadow-green-600/20 active:scale-95 border-b-4 border-green-800"
                            >
                                <Download size={18} className="stroke-[2.5px]" /> EXPORT REPORT
                            </button>
                            <button
                                onClick={() => window.print()}
                                disabled={selectedOrders.length === 0}
                                className={clsx(
                                    "flex items-center justify-center gap-2 px-6 py-3 rounded-2xl transition-all font-bold text-sm shadow-lg active:scale-95 border-b-4",
                                    selectedOrders.length > 0
                                        ? "bg-gray-900 text-white hover:bg-gray-800 border-gray-950 shadow-gray-900/10"
                                        : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                )}
                            >
                                <Printer size={18} className="stroke-[2.5px]" /> PRINT SELECTED ({selectedOrders.length})
                            </button>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform text-peca-purple">
                                <ShoppingBag size={64} />
                            </div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Orders</p>
                            <h2 className="text-3xl font-black text-gray-900 mt-2">{stats.totalOrders}</h2>
                            <div className="mt-4 flex items-center gap-2 text-peca-purple">
                                <TrendingUp size={14} className="stroke-[3px]" />
                                <span className="text-[10px] font-black uppercase tracking-wider">All-time Recorded</span>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform text-amber-600">
                                <Clock size={64} />
                            </div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Pending Fulfillment</p>
                            <h2 className="text-3xl font-black text-amber-600 mt-2">{stats.pendingOrders}</h2>
                            <div className="mt-4 flex items-center gap-2 text-amber-600">
                                <AlertCircle size={14} className="stroke-[3px]" />
                                <span className="text-[10px] font-black uppercase tracking-wider tracking-widest">Awaiting Processing</span>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform text-indigo-600">
                                <Truck size={64} />
                            </div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">In Transit</p>
                            <h2 className="text-3xl font-black text-indigo-600 mt-2">{stats.inTransit}</h2>
                            <div className="mt-4 flex items-center gap-2 text-indigo-600">
                                <Package size={14} className="stroke-[3px]" />
                                <span className="text-[10px] font-black uppercase tracking-wider">On the Way</span>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform text-emerald-600">
                                <CheckCircle size={64} />
                            </div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Completed Today</p>
                            <h2 className="text-3xl font-black text-emerald-600 mt-2">{stats.completedToday}</h2>
                            <div className="mt-4 flex items-center gap-2 text-emerald-600">
                                <TrendingUp size={14} className="stroke-[3px]" />
                                <span className="text-[10px] font-black uppercase tracking-wider">Delivered Successfully</span>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                            <div className="relative">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Search Details</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Order ID, Customer..."
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-peca-purple/10 transition-all placeholder:text-gray-300"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Order Status</label>
                                <div className="relative">
                                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                    <select
                                        className="w-full pl-9 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-peca-purple/10 transition-all appearance-none cursor-pointer"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                    >
                                        <option value="">All Statuses</option>
                                        <option value="placed">Placed</option>
                                        <option value="processing">Processing</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancel_requested">Cancel Requested</option>
                                        <option value="cancelled">Cancelled</option>
                                        <option value="refunded">Refunded</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Mobile Number</label>
                                <input
                                    type="text"
                                    placeholder="Filter by mobile..."
                                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-peca-purple/10 transition-all placeholder:text-gray-300"
                                    value={mobileFilter}
                                    onChange={(e) => setMobileFilter(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Start Date</label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-xs font-bold focus:ring-4 focus:ring-peca-purple/10 transition-all"
                                        value={dateRange.start}
                                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">End Date</label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-xs font-bold focus:ring-4 focus:ring-peca-purple/10 transition-all"
                                        value={dateRange.end}
                                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={`bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden ${selectedOrders.length > 0 ? 'print-selection-mode' : ''} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                    {orders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                <ShoppingBag size={48} className="text-gray-200" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900">No orders yet</h3>
                            <p className="text-gray-500 max-w-sm mt-2 font-medium">When customers place orders, they will appear here in real-time.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 font-black text-[10px] uppercase tracking-[0.15em] text-gray-400 border-b border-gray-100">
                                        <th className="px-8 py-5 w-4 no-print">
                                            <input
                                                type="checkbox"
                                                className="w-5 h-5 rounded-lg border-2 border-gray-200 text-peca-purple focus:ring-peca-purple transition-all cursor-pointer"
                                                checked={isAllSelected()}
                                                onChange={toggleSelectAll}
                                            />
                                        </th>
                                        <th className="px-8 py-5">Order Reference</th>
                                        <th className="px-8 py-5">Customer details</th>
                                        <th className="px-8 py-5 w-1/4">Order Items</th>
                                        <th className="px-8 py-5">Financial Summary</th>
                                        <th className="px-8 py-5">Fullfillment Status</th>
                                        <th className="px-8 py-5 text-right no-print">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 font-medium">
                                    {getFilteredOrders().map((order) => (
                                        <tr
                                            key={order._id}
                                            className={clsx(
                                                "hover:bg-gray-50/50 transition-colors group",
                                                selectedOrders.includes(order._id) ? "bg-peca-purple/[0.02]" : "",
                                                selectedOrders.length > 0 && !selectedOrders.includes(order._id) ? "print:hidden" : ""
                                            )}
                                        >
                                            <td className="px-8 py-6 w-4 no-print">
                                                <input
                                                    type="checkbox"
                                                    className="w-5 h-5 rounded-lg border-2 border-gray-200 text-peca-purple focus:ring-peca-purple transition-all cursor-pointer"
                                                    checked={selectedOrders.includes(order._id)}
                                                    onChange={() => toggleSelectOrder(order._id)}
                                                />
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="font-black text-gray-900 mb-1 leading-none uppercase tracking-tight">#{order.orderId}</div>
                                                <div className="font-mono text-[10px] text-gray-400 group-hover:text-peca-purple transition-colors">
                                                    {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="font-bold text-gray-900">{order.customer.name}</div>
                                                <div className="text-[10px] text-gray-400 font-bold">{order.customer.mobile}</div>
                                                <div className="text-[10px] text-gray-400 font-bold opacity-60 truncate max-w-[150px]">{order.customer.email || 'NO-EMAIL-FOUND'}</div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="space-y-1.5">
                                                    {order.products.map((p: any, idx: number) => (
                                                        <div key={idx} className="flex items-center gap-2 group/item">
                                                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center font-black text-[10px] text-gray-400 border border-gray-100 group-hover/item:border-peca-purple/30 group-hover/item:text-peca-purple transition-colors">
                                                                {p.quantity}x
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-[11px] font-bold text-gray-700 truncate">{p.name}</div>
                                                                <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Rate: ₹{p.price}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="text-xl font-black text-gray-900 leading-none">₹{order.totalAmount?.toLocaleString()}</div>
                                                <div className="mt-1.5 inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                                                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                                    {order.paymentStatus || 'Paid'}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={clsx(
                                                    'inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 shadow-sm',
                                                    statusColors[order.status] || 'bg-gray-50 text-gray-400 border-gray-100'
                                                )}>
                                                    <div className={clsx(
                                                        'w-1.5 h-1.5 rounded-full',
                                                        ['placed', 'processing', 'shipped'].includes(order.status) ? 'bg-current animate-pulse' : 'bg-current'
                                                    )} />
                                                    {order.status.replace('_', ' ')}
                                                </span>
                                                {(order.cancellationRequest?.requested || order.status === 'cancel_requested') && order.status !== 'cancelled' && order.status !== 'refunded' && (
                                                    <button
                                                        onClick={() => showCancellationDetails(order)}
                                                        className="mt-2.5 flex items-center justify-center gap-1 text-[9px] font-black text-white bg-gradient-to-r from-orange-500 to-red-600 px-3 py-2 rounded-xl shadow-lg shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all w-full"
                                                    >
                                                        <AlertCircle size={10} className="stroke-[3px]" /> VIEW REQUEST
                                                    </button>
                                                )}
                                            </td>
                                            <td className="px-8 py-6 text-right space-x-2 no-print">
                                                {/* Step 1: Processing */}
                                                {order.status === 'placed' && (
                                                    <button
                                                        onClick={() => updateStatus(order._id, 'processing')}
                                                        className="w-10 h-10 inline-flex items-center justify-center text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all border border-blue-100 shadow-sm active:scale-90"
                                                        title="Move to Processing"
                                                    >
                                                        <Package size={18} className="stroke-[2.5px]" />
                                                    </button>
                                                )}

                                                {/* Step 2: Ship */}
                                                {order.status === 'processing' && (
                                                    <button
                                                        onClick={() => updateStatus(order._id, 'shipped')}
                                                        className="w-10 h-10 inline-flex items-center justify-center text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all border border-indigo-100 shadow-sm active:scale-90"
                                                        title="Mark Shipped"
                                                    >
                                                        <ArrowRight size={18} className="stroke-[2.5px]" />
                                                    </button>
                                                )}
                                                {/* Step 3: Deliver */}
                                                {order.status === 'shipped' && (
                                                    <button
                                                        onClick={() => updateStatus(order._id, 'delivered')}
                                                        className="w-10 h-10 inline-flex items-center justify-center text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all border border-emerald-100 shadow-sm active:scale-90"
                                                        title="Mark Delivered"
                                                    >
                                                        <CheckCircle size={18} className="stroke-[2.5px]" />
                                                    </button>
                                                )}
                                                {/* Cancel/Refund */}
                                                {order.status !== 'cancelled' && order.status !== 'refunded' && (
                                                    <button
                                                        onClick={() => {
                                                            if (order.cancellationRequest?.requested || order.status === 'cancel_requested') {
                                                                handleRefund(order.orderId);
                                                            } else {
                                                                updateStatus(order._id, 'cancelled');
                                                            }
                                                        }}
                                                        className={clsx(
                                                            "w-10 h-10 inline-flex items-center justify-center rounded-xl transition-all border shadow-sm active:scale-90",
                                                            (order.cancellationRequest?.requested || order.status === 'cancel_requested')
                                                                ? "text-orange-600 bg-orange-50 hover:bg-orange-100 border-orange-100"
                                                                : "text-red-500 bg-red-50 hover:bg-red-100 border-red-100"
                                                        )}
                                                        title={(order.cancellationRequest?.requested || order.status === 'cancel_requested') ? "Approve Refund" : "Cancel Order"}
                                                    >
                                                        {(order.cancellationRequest?.requested || order.status === 'cancel_requested')
                                                            ? <CheckCircle size={18} className="stroke-[2.5px]" />
                                                            : <XCircle size={18} className="stroke-[2.5px]" />}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Custom Confirmation Modal */}
            <ConfirmModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                onConfirm={modalConfig.onConfirm}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
                confirmText={modalConfig.confirmText}
                cancelText="Cancel"
            />

            {/* Cancellation Details Modal */}
            <CancellationDetailsModal
                isOpen={cancellationModal.isOpen}
                onClose={() => setCancellationModal({ isOpen: false, order: null })}
                onApprove={handleApproveCancellation}
                onReject={handleRejectCancellation}
                order={cancellationModal.order}
            />
        </div>
    );
}
