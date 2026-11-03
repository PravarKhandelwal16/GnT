import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { PasswordInput } from '../components/PasswordInput';
import { Alert, Button, Field } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { apiError } from '../lib/format';

const Login: React.FC = () => {
  const { login } = useAuth();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      // On success GuestRoute sends them back to where they came from.
      await login(email, password, remember);
    } catch (err) {
      setError(apiError(err, 'Invalid email or password.'));
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to carry on.">
      <form onSubmit={submit} className="space-y-5">
        {error && <Alert>{error}</Alert>}
        <Field label="Email" htmlFor="login-email">
          <input
            id="login-email"
            type="email"
            required
            autoComplete="email"
            className="field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </Field>
        <Field label="Password" htmlFor="login-password">
          <PasswordInput
            id="login-password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-textMain-secondary">
            <input type="checkbox" className="h-4 w-4 accent-[rgb(var(--accent-primary))]" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            Keep me logged in
          </label>
          <Link to="/forgot-password" className="font-medium text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button id="login-submit" type="submit" size="lg" className="w-full" loading={isLoading}>
          Log in
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-textMain-secondary">
        New here?{' '}
        <Link to="/signup" state={location.state} className="font-semibold text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Login;
