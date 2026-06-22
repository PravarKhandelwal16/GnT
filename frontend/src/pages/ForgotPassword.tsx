import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Send, ArrowLeft, CheckCircle } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setIsLoading(true);
    // Simulate network
    await new Promise((r) => setTimeout(r, 800));
    setIsLoading(false);
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-primary hover:text-primary-hover transition-colors">
            Give &amp; Take
          </Link>
        </div>

        <div className="bg-surface border border-border rounded-2xl shadow-soft px-8 py-8">
          {sent ? (
            /* ── Success state ── */
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={28} className="text-success" />
              </div>
              <h1 className="text-xl font-bold text-textMain mb-2">Check your inbox</h1>
              <p className="text-sm text-textMain-secondary leading-relaxed mb-6">
                Password reset link sent successfully to{' '}
                <span className="font-medium text-textMain">{email}</span>.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm text-primary font-semibold hover:text-primary-hover transition-colors"
              >
                <ArrowLeft size={15} />
                Back to Login
              </Link>
            </div>
          ) : (
            /* ── Form state ── */
            <>
              <div className="mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                  <Mail size={22} className="text-primary" />
                </div>
                <h1 className="text-xl font-bold text-textMain mb-1">Forgot Password?</h1>
                <p className="text-sm text-textMain-secondary leading-relaxed">
                  Enter your email address and we&apos;ll send you a reset link.
                </p>
              </div>

              <form id="forgot-password-form" onSubmit={handleSubmit} noValidate className="space-y-4">
                {error && (
                  <div role="alert" className="px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="forgot-email" className="block text-sm font-medium text-textMain mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail size={16} className="text-textMain-secondary" />
                    </div>
                    <input
                      id="forgot-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      placeholder="you@example.com"
                      className={[
                        'block w-full pl-10 pr-4 py-2.5 bg-background border rounded-xl text-textMain placeholder-textMain-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all',
                        error ? 'border-rose-500/60' : 'border-border',
                      ].join(' ')}
                    />
                  </div>
                </div>

                <button
                  id="forgot-submit"
                  type="submit"
                  disabled={isLoading}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface"
                >
                  {isLoading ? (
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  ) : (
                    <Send size={15} />
                  )}
                  {isLoading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-sm text-textMain-secondary hover:text-textMain transition-colors"
                >
                  <ArrowLeft size={14} />
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
