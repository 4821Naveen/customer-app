
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mobile, setMobile] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, mobile }),
            });

            const data = await res.json();
            if (res.ok) {
                router.push('/auth/login?registered=true');
            } else {
                setError(data.error || 'Registration failed');
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
                    <h1 className="text-3xl font-black text-peca-text tracking-tighter mb-2">Create Account</h1>
                    <p className="text-sm text-peca-text-light font-medium uppercase tracking-widest">Join our community today</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100 text-center uppercase tracking-wider">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-peca-text-light mb-2 ml-1">Full Name</label>
                        <input
                            type="text"
                            required
                            className="w-full px-5 py-3.5 bg-peca-bg-alt border-none rounded-2xl text-sm focus:ring-2 focus:ring-peca-purple/20 transition-all outline-none"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
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
                        <label className="block text-[10px] font-black uppercase tracking-widest text-peca-text-light mb-2 ml-1">Mobile Number</label>
                        <input
                            type="tel"
                            className="w-full px-5 py-3.5 bg-peca-bg-alt border-none rounded-2xl text-sm focus:ring-2 focus:ring-peca-purple/20 transition-all outline-none"
                            placeholder="+1234567890"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
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
                        className="w-full bg-slate-900 text-white font-black uppercase tracking-[0.2em] py-4 rounded-2xl hover:bg-slate-800 transition-all shadow-lg active:scale-95 disabled:opacity-50 text-[10px] mt-2"
                    >
                        {loading ? 'Creating Account...' : 'Register Account'}
                    </button>
                </form>

                <div className="mt-8 pt-8 border-t border-gray-100 text-center">
                    <p className="text-xs text-peca-text-light font-bold uppercase tracking-widest">
                        Already have an account?{' '}
                        <Link href="/auth/login" className="text-peca-purple hover:underline decoration-2 underline-offset-4 ml-1">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
