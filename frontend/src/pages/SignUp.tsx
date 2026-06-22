import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Phone, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth, SignupFields } from '../context/AuthContext';

/* ─────────────────────── password strength ─────────────────────── */

function getStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  const levels = [
    { label: '', color: 'bg-border' },
    { label: 'Weak', color: 'bg-rose-500' },
    { label: 'Fair', color: 'bg-warning' },
    { label: 'Good', color: 'bg-yellow-400' },
    { label: 'Strong', color: 'bg-success' },
  ] as const;
  return { score, ...levels[score] };
}

/* ─────────────────────── Field component (outside SignUp!) ─────────────────────── */
/*
 * IMPORTANT: defined outside SignUp so React never remounts the input DOM node
 * on a state update. Defining it inside would recreate the component type on
 * every render, causing the focused input to blur after every keystroke.
 */

interface FieldProps {
  id: string;
  name: string;
  label: string;
  type?: string;
  icon: React.ReactNode;
  placeholder: string;
  autoComplete?: string;
  value: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  toggle?: { show: boolean; onToggle: () => void };
}

const Field: React.FC<FieldProps> = ({
  id, name, label, type = 'text', icon, placeholder, autoComplete,
  value, error, onChange, toggle,
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-textMain mb-1.5">
      {label}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
        <span className="text-textMain-secondary">{icon}</span>
      </div>
      <input
        id={id}
        name={name}
        type={toggle ? (toggle.show ? 'text' : 'password') : type}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={[
          'block w-full pl-10 py-2.5 bg-background border rounded-xl text-textMain placeholder-textMain-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all',
          toggle ? 'pr-10' : 'pr-4',
          error ? 'border-rose-500/60' : 'border-border',
        ].join(' ')}
      />
      {toggle && (
        <button
          type="button"
          onClick={toggle.onToggle}
          aria-label={toggle.show ? 'Hide password' : 'Show password'}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-textMain-secondary hover:text-textMain transition-colors"
        >
          {toggle.show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      )}
    </div>
    {error && (
      <p role="alert" className="mt-1 text-xs text-rose-500">{error}</p>
    )}
  </div>
);

/* ─────────────────────── types ─────────────────────── */

interface FormState extends Omit<SignupFields, 'address'> {
  confirmPassword: string;
  terms: boolean;
}

const INITIAL: FormState = {
  fullName: '',
  age: '',
  mobile: '',
  email: '',
  password: '',
  confirmPassword: '',
  terms: false,
};

/* ─────────────────────── component ─────────────────────── */

export const SignUp: React.FC = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(INITIAL);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [isLoading, setIsLoading] = useState(false);

  const strength = getStrength(form.password);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required.';
    if (!form.age.trim() || isNaN(Number(form.age)) || Number(form.age) < 13)
      e.age = 'Please enter a valid age (13+).';
    if (!form.mobile.trim()) e.mobile = 'Mobile number is required.';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'A valid email is required.';
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters.';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match.';
    if (!form.terms) e.terms = 'You must agree to the Terms & Conditions.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      await signup({ ...form, address: '' });
      navigate('/', { replace: true });
    } catch {
      setErrors({ email: 'Something went wrong. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-primary hover:text-primary-hover transition-colors">
            Give &amp; Take
          </Link>
          <h1 className="mt-6 text-3xl font-bold text-textMain">Create Account</h1>
          <p className="mt-2 text-textMain-secondary text-sm">Join the community and start exchanging</p>
        </div>

        <div className="bg-surface border border-border rounded-2xl shadow-soft px-8 py-8">
          <form id="signup-form" onSubmit={handleSubmit} noValidate className="space-y-4">
            <Field
              id="signup-name" name="fullName" label="Full Name"
              icon={<User size={16} />} placeholder="Pravar Khandelwal"
              autoComplete="name" value={form.fullName}
              error={errors.fullName} onChange={handleChange}
            />
            <Field
              id="signup-age" name="age" label="Age" type="number"
              icon={<User size={16} />} placeholder="25"
              value={form.age} error={errors.age} onChange={handleChange}
            />
            <Field
              id="signup-mobile" name="mobile" label="Mobile Number" type="tel"
              icon={<Phone size={16} />} placeholder="+91 98765 43210"
              autoComplete="tel" value={form.mobile}
              error={errors.mobile} onChange={handleChange}
            />
            <Field
              id="signup-email" name="email" label="Email Address" type="email"
              icon={<Mail size={16} />} placeholder="you@example.com"
              autoComplete="email" value={form.email}
              error={errors.email} onChange={handleChange}
            />

            {/* Password */}
            <Field
              id="signup-password" name="password" label="Password"
              icon={<Lock size={16} />} placeholder="••••••••"
              autoComplete="new-password" value={form.password}
              error={errors.password} onChange={handleChange}
              toggle={{ show: showPw, onToggle: () => setShowPw((p) => !p) }}
            />

            {/* Password strength */}
            {form.password && (
              <div className="-mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={[
                        'h-1 flex-1 rounded-full transition-all duration-300',
                        i <= strength.score ? strength.color : 'bg-border',
                      ].join(' ')}
                    />
                  ))}
                </div>
                <p className="text-xs text-textMain-secondary">
                  Strength: <span className="font-medium text-textMain">{strength.label}</span>
                </p>
              </div>
            )}

            {/* Confirm password */}
            <Field
              id="signup-confirm" name="confirmPassword" label="Confirm Password"
              icon={<Lock size={16} />} placeholder="••••••••"
              autoComplete="new-password" value={form.confirmPassword}
              error={errors.confirmPassword} onChange={handleChange}
              toggle={{ show: showConfirm, onToggle: () => setShowConfirm((p) => !p) }}
            />

            {/* Terms */}
            <div>
              <div className="flex items-start gap-2">
                <input
                  id="signup-terms"
                  name="terms"
                  type="checkbox"
                  checked={form.terms}
                  onChange={handleChange}
                  className="mt-0.5 w-4 h-4 rounded border-border accent-primary focus:ring-primary focus:ring-offset-surface"
                />
                <label htmlFor="signup-terms" className="text-sm text-textMain-secondary select-none leading-relaxed">
                  I agree to the{' '}
                  <a href="#" className="text-primary hover:text-primary-hover font-medium">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-primary hover:text-primary-hover font-medium">Privacy Policy</a>
                </label>
              </div>
              {errors.terms && (
                <p role="alert" className="mt-1 text-xs text-rose-500">{errors.terms}</p>
              )}
            </div>

            {/* Submit */}
            <button
              id="signup-submit"
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
                <ArrowRight size={16} />
              )}
              {isLoading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-textMain-secondary">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:text-primary-hover transition-colors">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
