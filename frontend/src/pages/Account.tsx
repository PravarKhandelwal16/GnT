import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Loader2 } from 'lucide-react';
import { changePassword, deleteAccount, getMyProfile, updateAvatar, updateMyProfile } from '../api/profile';
import type { UserProfile } from '../api/profile';
import { PageHeader, PageShell } from '../components/Layout';
import { Alert, Avatar, Button, ErrorState, Field, Modal, Skeleton, Stars } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { apiError, formatDate } from '../lib/format';

const EditProfileModal: React.FC<{
  profile: UserProfile;
  onSaved: (profile: UserProfile) => void;
  onClose: () => void;
}> = ({ profile, onSaved, onClose }) => {
  const [form, setForm] = useState({
    name: profile.name,
    phone: profile.phone,
    street: profile.street ?? '',
    city: profile.city ?? '',
    state: profile.state ?? '',
    postalCode: profile.postalCode ?? '',
    country: profile.country ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fields: Array<{ name: keyof typeof form; label: string; required?: boolean }> = [
    { name: 'name', label: 'Full name', required: true },
    { name: 'phone', label: 'Mobile number', required: true },
    { name: 'street', label: 'Street address' },
    { name: 'city', label: 'City' },
    { name: 'state', label: 'State' },
    { name: 'postalCode', label: 'Postal code' },
    { name: 'country', label: 'Country' },
  ];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      onSaved(await updateMyProfile({ ...form, phone: form.phone.replace(/[\s()-]/g, '') }));
    } catch (err) {
      setError(apiError(err));
      setSaving(false);
    }
  };

  return (
    <Modal title="Edit profile" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        {error && <Alert>{error}</Alert>}
        {fields.map(({ name, label, required }) => (
          <Field key={name} label={label} htmlFor={`profile-${name}`}>
            <input
              id={`profile-${name}`}
              required={required}
              className="field"
              value={form[name]}
              onChange={(e) => setForm((current) => ({ ...current, [name]: e.target.value }))}
            />
          </Field>
        ))}
        <Button id="profile-save" type="submit" className="w-full" loading={saving}>
          Save changes
        </Button>
      </form>
    </Modal>
  );
};

const PasswordModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const toast = useToast();
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.next.length < 8) {
      setError('Use at least 8 characters.');
      return;
    }
    if (form.next !== form.confirm) {
      setError('The new passwords do not match.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await changePassword(form.current, form.next);
      toast('Password updated');
      onClose();
    } catch (err) {
      setError(apiError(err));
      setSaving(false);
    }
  };

  const fields = [
    { name: 'current', label: 'Current password', autoComplete: 'current-password' },
    { name: 'next', label: 'New password', autoComplete: 'new-password' },
    { name: 'confirm', label: 'Confirm new password', autoComplete: 'new-password' },
  ] as const;

  return (
    <Modal title="Change password" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        {error && <Alert>{error}</Alert>}
        {fields.map(({ name, label, autoComplete }) => (
          <Field key={name} label={label} htmlFor={`password-${name}`}>
            <input
              id={`password-${name}`}
              type="password"
              required
              autoComplete={autoComplete}
              className="field"
              value={form[name]}
              onChange={(e) => setForm((current) => ({ ...current, [name]: e.target.value }))}
            />
          </Field>
        ))}
        <Button type="submit" className="w-full" loading={saving}>
          Update password
        </Button>
      </form>
    </Modal>
  );
};

const DeleteModal: React.FC<{ balance: number; onClose: () => void }> = ({ balance, onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [password, setPassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleting(true);
    setError('');
    try {
      await deleteAccount(password);
      logout();
      toast('Your account has been deleted');
      navigate('/', { replace: true });
    } catch (err) {
      setError(apiError(err));
      setDeleting(false);
    }
  };

  return (
    <Modal title="Delete your account?" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm leading-relaxed text-textMain-secondary">
          Your live listings will be removed and your {balance.toLocaleString()} credits will be lost. This can't be
          undone.
        </p>
        {error && <Alert>{error}</Alert>}
        <Field label="Enter your password to confirm" htmlFor="delete-password">
          <input
            id="delete-password"
            type="password"
            required
            autoComplete="current-password"
            className="field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <Button type="submit" variant="danger" className="w-full" loading={deleting}>
          Delete my account
        </Button>
      </form>
    </Modal>
  );
};

const Account: React.FC = () => {
  const { refreshUser } = useAuth();
  const toast = useToast();
  const fileInput = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [modal, setModal] = useState<'edit' | 'password' | 'delete' | null>(null);

  const load = () => {
    setIsLoading(true);
    getMyProfile()
      .then(setProfile)
      .catch(() => setProfile(null))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      setProfile(await updateAvatar(file));
      await refreshUser();
    } catch (err) {
      toast(apiError(err), 'error');
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) {
    return (
      <PageShell width="max-w-3xl">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="mt-4 h-64 w-full" />
      </PageShell>
    );
  }

  if (!profile) {
    return (
      <PageShell width="max-w-3xl">
        <ErrorState message="We couldn't load your account." onRetry={load} />
      </PageShell>
    );
  }

  const address = [profile.street, profile.city, profile.state, profile.postalCode, profile.country]
    .filter(Boolean)
    .join(', ');

  const details = [
    ['Email', profile.email],
    ['Mobile', profile.phone],
    ['Address', address || 'Not added yet'],
    ['Member since', formatDate(profile.createdAt)],
  ];

  return (
    <PageShell width="max-w-3xl">
      <PageHeader eyebrow="Account" title="Your details" />

      <section className="panel p-6 sm:p-8">
        <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
          <div className="relative flex-shrink-0">
            <Avatar name={profile.name} image={profile.profileImage} size="h-24 w-24 text-3xl" />
            <button
              type="button"
              aria-label="Change profile picture"
              onClick={() => fileInput.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-textMain-secondary shadow-soft hover:text-primary"
            >
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
            </button>
            <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadAvatar} className="hidden" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="display truncate text-3xl">{profile.name}</h2>
            <p className="mt-1 flex items-center justify-center gap-2 text-sm text-textMain-secondary sm:justify-start">
              {profile.rating ? (
                <>
                  <Stars value={profile.rating} /> {profile.rating.toFixed(1)}
                </>
              ) : (
                'No ratings yet'
              )}
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setModal('edit')}>
            Edit profile
          </Button>
        </div>

        <dl className="mt-8 divide-y divide-border border-t border-border">
          {details.map(([label, value]) => (
            <div key={label} className="flex flex-col gap-0.5 py-3.5 sm:flex-row sm:gap-4">
              <dt className="text-sm text-textMain-secondary sm:w-36 sm:flex-shrink-0">{label}</dt>
              <dd className="min-w-0 break-words text-sm font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="panel mt-4 flex items-center justify-between gap-4 p-6">
        <div>
          <h2 className="font-semibold">Password</h2>
          <p className="text-sm text-textMain-secondary">Keep your account secure.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setModal('password')}>
          Change
        </Button>
      </section>

      <section className="panel mt-4 flex items-center justify-between gap-4 p-6">
        <div>
          <h2 className="font-semibold text-danger">Delete account</h2>
          <p className="text-sm text-textMain-secondary">Removes your listings and credits for good.</p>
        </div>
        <Button variant="ghost" size="sm" className="text-danger hover:text-danger" onClick={() => setModal('delete')}>
          Delete
        </Button>
      </section>

      {modal === 'edit' && (
        <EditProfileModal
          profile={profile}
          onClose={() => setModal(null)}
          onSaved={(updated) => {
            setProfile(updated);
            setModal(null);
            refreshUser();
            toast('Profile saved');
          }}
        />
      )}
      {modal === 'password' && <PasswordModal onClose={() => setModal(null)} />}
      {modal === 'delete' && <DeleteModal balance={profile.creditBalance} onClose={() => setModal(null)} />}
    </PageShell>
  );
};

export default Account;
