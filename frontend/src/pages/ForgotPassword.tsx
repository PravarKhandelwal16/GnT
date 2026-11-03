import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../api/profile';
import { AuthLayout } from '../components/AuthLayout';
import { Alert, Button, Field } from '../components/ui';
import { apiError } from '../lib/format';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const backToLogin = (
    <Link to="/login" className="font-semibold text-primary hover:underline">
      Back to login
    </Link>
  );

  if (sent) {
    return (
      <AuthLayout title="Check your inbox" subtitle={`If ${email} has an account, a reset link is on its way. It expires in 30 minutes.`}>
        <p className="text-sm">{backToLogin}</p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Forgot your password?" subtitle="We'll email you a link to choose a new one.">
      <form onSubmit={submit} className="space-y-5">
        {error && <Alert>{error}</Alert>}
        <Field label="Email" htmlFor="forgot-email">
          <input
            id="forgot-email"
            type="email"
            required
            autoComplete="email"
            className="field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </Field>
        <Button type="submit" size="lg" className="w-full" loading={isLoading}>
          Send reset link
        </Button>
      </form>
      <p className="mt-6 text-center text-sm">{backToLogin}</p>
    </AuthLayout>
  );
};

export default ForgotPassword;
