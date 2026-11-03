import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../api/profile';
import { AuthLayout } from '../components/AuthLayout';
import { PasswordInput } from '../components/PasswordInput';
import { Alert, Button, Field, buttonClasses } from '../components/ui';
import { apiError } from '../lib/format';

const ResetPassword: React.FC = () => {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Use at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('The passwords do not match.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  if (done) {
    return (
      <AuthLayout title="Password updated" subtitle="You can log in with your new password.">
        <Link to="/login" className={buttonClasses('primary', 'lg', 'w-full')}>
          Log in
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Choose a new password">
      <form onSubmit={submit} className="space-y-5">
        {!token && <Alert>This link is incomplete. Request a new one from the login page.</Alert>}
        {error && <Alert>{error}</Alert>}
        <Field label="New password" htmlFor="reset-password">
          <PasswordInput id="reset-password" required autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <Field label="Confirm new password" htmlFor="reset-confirm">
          <PasswordInput id="reset-confirm" required autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </Field>
        <Button type="submit" size="lg" className="w-full" loading={isLoading} disabled={!token}>
          Update password
        </Button>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
