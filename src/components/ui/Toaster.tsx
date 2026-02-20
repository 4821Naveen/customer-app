
'use client';

import { useToast } from '@/context/ToastContext';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';

export default function Toaster() {
    const { toasts, removeToast } = useToast();

    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-24 md:bottom-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
            ))}
        </div>
    );
}

function ToastItem({ toast, onClose }: { toast: any; onClose: () => void }) {
    const icons = {
        success: <CheckCircle className="text-green-500" size={20} />,
        error: <AlertCircle className="text-red-500" size={20} />,
        info: <Info className="text-blue-500" size={20} />,
        warning: <AlertTriangle className="text-amber-500" size={20} />,
    };

    const styles = {
        success: 'border-green-100 bg-green-50 text-green-800',
        error: 'border-red-100 bg-red-50 text-red-800',
        info: 'border-blue-100 bg-blue-50 text-blue-800',
        warning: 'border-amber-100 bg-amber-50 text-amber-800',
    };

    return (
        <div className={clsx(
            "pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-lg transition-all animate-in fade-in slide-in-from-right-4 duration-300 min-w-[300px] max-w-md",
            styles[toast.type as keyof typeof styles]
        )}>
            <div className="flex-shrink-0">
                {icons[toast.type as keyof typeof icons]}
            </div>
            <p className="text-sm font-bold flex-1">{toast.message}</p>
            <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-black/5 transition-colors"
            >
                <X size={16} />
            </button>
        </div>
    );
}
