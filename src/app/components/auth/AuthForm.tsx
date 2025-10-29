'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

type Variant = 'signin' | 'signup';

export default function AuthForm({ variant }: { variant: Variant }) {
  const router = useRouter();
  const isSignup = variant === 'signup';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (isSignup && password !== repeatPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      if (isSignup) {
        const res = await fetch('/api/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || data.error || 'Failed to sign up');
        }
      }

      const res = await signIn('credentials', { email, password, redirect: false });
      if (res?.error) throw new Error(res.error);

      router.push(isSignup ? '/profile' : '/explore');
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded-xl border border-zinc-700 bg-zinc-900 p-6 shadow-md"
      >
        <h2 className="text-2xl font-bold text-zinc-50">
          {isSignup ? 'Sign Up' : 'Sign In'}
        </h2>

        {error && <p className="text-sm text-rose-300">{error}</p>}

        <div>
          <label className="mb-1 block text-sm text-zinc-300">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg bg-zinc-800 p-2 text-zinc-100 ring-1 ring-zinc-700 focus:outline-none focus:ring-2 focus:ring-violet-400"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-zinc-300">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full rounded-lg bg-zinc-800 p-2 text-zinc-100 ring-1 ring-zinc-700 focus:outline-none focus:ring-2 focus:ring-violet-400"
            required
          />
        </div>

        {isSignup && (
          <div>
            <label className="mb-1 block text-sm text-zinc-300">Repeat Password</label>
            <input
              type="password"
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              placeholder="Repeat password"
              className="w-full rounded-lg bg-zinc-800 p-2 text-zinc-100 ring-1 ring-zinc-700 focus:outline-none focus:ring-2 focus:ring-violet-400"
              required
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-violet-600 py-2 font-medium text-white transition hover:bg-violet-500 disabled:opacity-60"
        >
          {loading ? (isSignup ? 'Signing up…' : 'Signing in…') : (isSignup ? 'Sign Up' : 'Sign In')}
        </button>

        <p className="text-center text-sm text-zinc-400">
          {isSignup ? 'Already have an account?' : "Don’t have an account?"}{' '}
          <a
            className="text-violet-400 hover:text-violet-300 underline underline-offset-4"
            href={isSignup ? '/signin' : '/signup'}
          >
            {isSignup ? 'Sign in' : 'Sign up'}
          </a>
        </p>
      </form>
    </div>
  );
}
