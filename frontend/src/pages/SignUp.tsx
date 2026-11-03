import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthLayout } from '../components/AuthLayout';
import { PasswordInput } from '../components/PasswordInput';
import { Alert, Button, Field } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { apiError } from '../lib/format';

const INITIAL = {
  fullName: '',
  dateOfBirth: '',
  mobile: '',
  email: '',
  password: '',
  confirmPassword: '',
  terms: false,
};

type Form = typeof INITIAL;
type Errors = Partial<Record<keyof Form, string>>;

/* Maps backend field names onto this form. */
const SERVER_FIELDS: Record<string, keyof Form> = {
  name: 'fullName',
  phone: 'mobile',
  email: 'email',
  password: 'password',
  dateOfBirth: 'dateOfBirth',
};

const SignUp: React.FC = () => {
  const { signup } = useAuth();
  const location = useLocation();

  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
    setErrors((current) => ({ ...current, [name]: '' }));
  };

  const validate = (phone: string): boolean => {
    const next: Errors = {};
    if (!form.fullName.trim()) next.fullName = 'Enter your full name.';
    const age = (Date.now() - new Date(form.dateOfBirth).getTime()) / (365.25 * 24 * 3600 * 1000);
    if (!form.dateOfBirth || Number.isNaN(age)) next.dateOfBirth = 'Enter your date of birth.';
    else if (age < 13) next.dateOfBirth = 'You must be at least 13 years old.';
    if (!/^\+?[1-9]\d{6,14}$/.test(phone)) next.mobile = 'Enter a valid number, such as +919876543210.';
    if (!/\S+@\S+\.\S+/.test(form.email)) next.email = 'Enter a valid email address.';
    if (form.password.length < 8) next.password = 'Use at least 8 characters.';
    if (form.password !== form.confirmPassword) next.confirmPassword = 'The passwords do not match.';
    if (!form.terms) next.terms = 'Please accept the terms to continue.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const phone = form.mobile.replace(/[\s()-]/g, '');
    if (!validate(phone)) return;

    setIsLoading(true);
    setFormError('');
    try {
      // On success GuestRoute sends them onwards.
      await signup({ ...form, mobile: phone });
    } catch (err) {
      setIsLoading(false);
      const fieldErrors = axios.isAxiosError(err) ? err.response?.data?.errors : undefined;
      if (fieldErrors) {
        const mapped: Errors = {};
        Object.entries(fieldErrors as Record<string, string>).forEach(([field, message]) => {
          if (SERVER_FIELDS[field]) mapped[SERVER_FIELDS[field]] = message;
        });
        setErrors(mapped);
      } else {
        setFormError(apiError(err));
      }
    }
  };

  const fields: Array<{ name: keyof Form; label: string; type: string; autoComplete: string; placeholder?: string }> = [
    { name: 'fullName', label: 'Full name', type: 'text', autoComplete: 'name' },
    { name: 'email', label: 'Email', type: 'email', autoComplete: 'email', placeholder: 'you@example.com' },
    { name: 'mobile', label: 'Mobile number', type: 'tel', autoComplete: 'tel', placeholder: '+91 98765 43210' },
    { name: 'dateOfBirth', label: 'Date of birth', type: 'date', autoComplete: 'bday' },
  ];

  return (
    <AuthLayout title="Join Give & Take" subtitle="Your first 350 credits are on us.">
      <form onSubmit={submit} noValidate className="space-y-4">
        {formError && <Alert>{formError}</Alert>}
        {fields.map(({ name, label, type, autoComplete, placeholder }) => (
          <Field key={name} label={label} htmlFor={`signup-${name}`} error={errors[name]}>
            <input
              id={`signup-${name}`}
              name={name}
              type={type}
              autoComplete={autoComplete}
              placeholder={placeholder}
              className="field"
              value={form[name] as string}
              onChange={change}
            />
          </Field>
        ))}
        <Field label="Password" htmlFor="signup-password" error={errors.password}>
          <PasswordInput id="signup-password" name="password" autoComplete="new-password" value={form.password} onChange={change} />
        </Field>
        <Field label="Confirm password" htmlFor="signup-confirm" error={errors.confirmPassword}>
          <PasswordInput id="signup-confirm" name="confirmPassword" autoComplete="new-password" value={form.confirmPassword} onChange={change} />
        </Field>

        <div>
          <label className="flex items-start gap-2 text-sm text-textMain-secondary">
            <input id="signup-terms" name="terms" type="checkbox" className="mt-0.5 h-4 w-4 accent-[rgb(var(--accent-primary))]" checked={form.terms} onChange={change} />
            <span>
              I agree to the{' '}
              <Link to="/terms" target="_blank" className="font-medium text-primary hover:underline">Terms</Link> and{' '}
              <Link to="/privacy" target="_blank" className="font-medium text-primary hover:underline">Privacy Policy</Link>
            </span>
          </label>
          {errors.terms && <p role="alert" className="mt-1.5 text-xs text-danger">{errors.terms}</p>}
        </div>

        <Button id="signup-submit" type="submit" size="lg" className="w-full" loading={isLoading}>
          Create account
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-textMain-secondary">
        Already a member?{' '}
        <Link to="/login" state={location.state} className="font-semibold text-primary hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default SignUp;
