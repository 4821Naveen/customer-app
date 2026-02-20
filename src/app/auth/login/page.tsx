
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useUser();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();
            if (res.ok) {
                login(data.user);
                if (data.user.role === 'super_user') {
                    router.push('/admin');
                } else {
                    router.push('/');
                }
            } else {
                setError(data.error || 'Invalid credentials');
            }
        } catch (err) {
            setError('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-peca-bg-alt px-4 py-12">
            <div className="max-w-md w-full p-8 bg-white rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-peca-text tracking-tighter mb-2">Welcome Back</h1>
                    <p className="text-sm text-peca-text-light font-medium uppercase tracking-widest">Sign in to your account</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100 text-center uppercase tracking-wider">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-peca-text-light mb-2 ml-1">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full px-5 py-3.5 bg-peca-bg-alt border-none rounded-2xl text-sm focus:ring-2 focus:ring-peca-purple/20 transition-all outline-none"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-peca-text-light mb-2 ml-1">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full px-5 py-3.5 bg-peca-bg-alt border-none rounded-2xl text-sm focus:ring-2 focus:ring-peca-purple/20 transition-all outline-none"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-slate-900 text-white font-black uppercase tracking-[0.2em] py-4 rounded-2xl hover:bg-slate-800 transition-all shadow-lg active:scale-95 disabled:opacity-50 text-[10px]"
                    >
                        {loading ? 'Authenticating...' : 'Sign In Now'}
                    </button>
                </form>

                <div className="mt-8 pt-8 border-t border-gray-100 text-center">
                    <p className="text-xs text-peca-text-light font-bold uppercase tracking-widest">
                        Don't have an account?{' '}
                        <Link href="/auth/register" className="text-peca-purple hover:underline decoration-2 underline-offset-4 ml-1">
                            Register Here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
