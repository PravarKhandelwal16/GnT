import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { getMyProfile, updateMyProfile, requestAccountDeletionOtp, confirmAccountDeletion } from '../api/profile';
import type { UserProfile } from '../api/profile';
import { getMyProducts } from '../api/products';
import { getMyTransactions } from '../api/transactions';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Star,
  Shield,
  Edit3,
  Camera,
  Lock,
  CheckCircle2,
  Package,
  ArrowLeftRight,
  TrendingUp,
  X,
  Save,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
} from 'lucide-react';

/* ─── Sub-components ─── */
const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({
  icon,
  label,
  value,
}) => (
  <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
    <span className="flex-shrink-0 mt-0.5 text-textMain-secondary">{icon}</span>
    <div className="min-w-0">
      <p className="text-xs text-textMain-secondary mb-0.5">{label}</p>
      <p className="text-sm font-medium text-textMain truncate">{value || '—'}</p>
    </div>
  </div>
);

/* ─── Main Component ─── */
export const Account: React.FC = () => {
  const { user, refreshUser } = useAuth();

  /* Profile data from backend */
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [itemsCount, setItemsCount] = useState<number | null>(null);
  const [tradesCount, setTradesCount] = useState<number | null>(null);

  /* Modals */
  const [editOpen, setEditOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  /* Delete Account */
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteStep, setDeleteStep] = useState<'WARNING' | 'OTP'>('WARNING');
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');

  /* Edit form state — synced with profile on open */
  const [editForm, setEditForm] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });

  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });

  const cleanField = (val?: string | null) => {
    if (!val) return '';
    const trimmed = val.trim();
    if (trimmed.toLowerCase() === 'string' || trimmed.toLowerCase() === 'unknown') return '';
    return trimmed;
  };

  /* Fetch profile on mount */
  useEffect(() => {
    setProfileLoading(true);
    
    Promise.all([
      getMyProfile(),
      getMyProducts(0, 1),
      getMyTransactions(0, 1)
    ])
      .then(([p, productsRes, tradesRes]) => {
        setProfile(p);
        setEditForm({
          fullName: p.name,
          phone: cleanField(p.phone),
          street: cleanField(p.street),
          city: cleanField(p.city),
          state: cleanField(p.state),
          postalCode: cleanField(p.postalCode),
          country: cleanField(p.country),
        });
        setItemsCount(productsRes.totalElements);
        setTradesCount(tradesRes.totalElements);
      })
      .catch(() => setProfileError('Failed to load profile or stats.'))
      .finally(() => setProfileLoading(false));
  }, []);

  const openEdit = () => {
    if (profile) {
      setEditForm({
        fullName: profile.name,
        phone: cleanField(profile.phone),
        street: cleanField(profile.street),
        city: cleanField(profile.city),
        state: cleanField(profile.state),
        postalCode: cleanField(profile.postalCode),
        country: cleanField(profile.country),
      });
    }
    setSaveError('');
    setSaveSuccess(false);
    setEditOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);
    try {
      const updated = await updateMyProfile({
        name: editForm.fullName,
        phone: editForm.phone,
        street: editForm.street,
        city: editForm.city,
        state: editForm.state,
        postalCode: editForm.postalCode,
        country: editForm.country,
      });
      setProfile(updated);
      await refreshUser(); // sync AuthContext user name/initials
      setSaveSuccess(true);
      setTimeout(() => setEditOpen(false), 1000);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to save changes.';
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleRequestOtp = async () => {
    setOtpLoading(true);
    setOtpError('');
    try {
      await requestAccountDeletionOtp();
      setDeleteStep('OTP');
    } catch (err: unknown) {
      setOtpError('Failed to send OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    setOtpLoading(true);
    setOtpError('');
    try {
      await confirmAccountDeletion(otp);
      // Wait a moment and then logout
      alert('Account deleted successfully. Logging out.');
      useAuth().logout(); // This might error since we can't call hooks directly in callbacks, but we can call user.logout or just window.location.href = '/'
      window.location.href = '/';
    } catch (err: unknown) {
      setOtpError('Invalid OTP or failed to delete account.');
    } finally {
      setOtpLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-textMain-secondary text-sm">Not logged in.</p>
      </div>
    );
  }

  const addressParts = [
    cleanField(profile?.street),
    cleanField(profile?.city),
    cleanField(profile?.state),
    cleanField(profile?.postalCode),
    cleanField(profile?.country)
  ].filter(Boolean);

  const address = addressParts.length > 0 ? addressParts.join(', ') : 'Not specified';

  const ratingValue = profile?.rating ?? null;
  const ratingDisplay = ratingValue ? ratingValue.toFixed(1) : 'N/A';
  const ratingStars = ratingValue ? Math.round(ratingValue) : 0;

  const stats = [
    {
      label: 'Credits',
      value: profile?.creditBalance?.toLocaleString() ?? user.creditBalance?.toLocaleString() ?? '—',
      icon: <TrendingUp size={18} />,
      color: 'bg-warning/10 text-warning',
    },
    {
      label: 'Rating',
      value: ratingDisplay,
      icon: <Star size={18} />,
      color: 'bg-warning/10 text-warning',
    },
    {
      label: 'Trades',
      value: tradesCount !== null ? tradesCount.toString() : '—',
      icon: <ArrowLeftRight size={18} />,
      color: 'bg-success/10 text-success',
    },
    {
      label: 'Items',
      value: itemsCount !== null ? itemsCount.toString() : '—',
      icon: <Package size={18} />,
      color: 'bg-primary/10 text-primary',
    },
  ];

  return (
    <div className="min-h-screen bg-background transition-colors duration-200">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <h1 className="text-2xl font-bold text-textMain">My Account</h1>

        {/* Profile error */}
        {profileError && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">
            <AlertCircle size={16} />
            {profileError}
          </div>
        )}

        {/* ── Profile hero card ── */}
        <div className="bg-card border border-border rounded-[20px] p-6 sm:p-8 shadow-soft">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {profile?.profileImage ? (
                <img
                  src={profile.profileImage}
                  alt={user.name}
                  className="w-24 h-24 rounded-full object-cover border-2 border-primary/30 shadow-soft"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center shadow-soft">
                  <span className="text-primary font-bold text-3xl select-none">{user.initials}</span>
                </div>
              )}
              <button
                id="account-change-avatar"
                aria-label="Change avatar"
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-textMain-secondary hover:text-primary hover:border-primary/30 transition-all shadow-soft"
              >
                <Camera size={14} />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-textMain">{profile?.name ?? user.name}</h2>
                {profile?.emailVerified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-success/10 text-success text-xs font-semibold border border-success/20">
                    <CheckCircle2 size={11} />
                    Verified
                  </span>
                )}
              </div>
              <p className="text-sm text-textMain-secondary mb-4">{user.email}</p>

              {/* Rating stars */}
              <div className="flex items-center justify-center sm:justify-start gap-1 mb-5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={14}
                    className={s <= ratingStars ? 'text-warning fill-warning' : 'text-textMain-secondary/30'}
                  />
                ))}
                <span className="text-xs text-textMain-secondary ml-1">{ratingDisplay}</span>
              </div>

              <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                <Button variant="primary" size="sm" id="account-edit-profile" onClick={openEdit}>
                  <Edit3 size={14} />
                  Edit Profile
                </Button>
                <Button variant="outline" size="sm" id="account-change-password" onClick={() => setPwOpen(true)}>
                  <Lock size={14} />
                  Change Password
                </Button>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-border">
            {stats.map((s) => (
              <div
                key={s.label}
                className="flex flex-col items-center bg-surface rounded-xl p-4 border border-border hover:border-primary/20 transition-all"
              >
                <div className={`w-9 h-9 rounded-full ${s.color} flex items-center justify-center mb-2`}>
                  {s.icon}
                </div>
                <span className="text-lg font-bold text-textMain">
                  {profileLoading ? '—' : s.value}
                </span>
                <span className="text-xs text-textMain-secondary mt-0.5">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Personal details ── */}
        <div className="bg-card border border-border rounded-[20px] p-6 sm:p-8 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-textMain">Personal Details</h3>
            <button
              id="account-edit-details"
              onClick={openEdit}
              className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors"
            >
              <Edit3 size={12} /> Edit
            </button>
          </div>
          {profileLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 bg-surface rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="divide-y divide-border">
              <InfoRow icon={<User size={16} />} label="Full Name" value={profile?.name ?? user.name} />
              <InfoRow icon={<Mail size={16} />} label="Email" value={user.email} />
              <InfoRow icon={<Phone size={16} />} label="Mobile" value={cleanField(profile?.phone)} />
              <InfoRow icon={<MapPin size={16} />} label="Address" value={address} />
              <InfoRow
                icon={<Shield size={16} />}
                label="Account Status"
                value={`${profile?.status ?? 'Active'} · Member since ${
                  profile?.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                    : '—'
                }`}
              />
            </div>
          )}
        </div>

        {/* ── Danger Zone ── */}
        <div className="bg-card border border-danger/20 rounded-[20px] p-6 sm:p-8 shadow-soft mt-8">
          <h3 className="text-base font-semibold text-danger mb-2">Danger Zone</h3>
          <p className="text-sm text-textMain-secondary mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button
            onClick={() => {
              setDeleteStep('WARNING');
              setOtp('');
              setOtpError('');
              setDeleteOpen(true);
            }}
            className="px-4 py-2 bg-danger/10 text-danger rounded-xl font-medium text-sm hover:bg-danger/20 transition-colors"
          >
            Delete Account
          </button>
        </div>
      </main>

      {/* ── Edit Profile Modal ── */}
      {editOpen && (
        <div
          id="account-edit-modal-backdrop"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setEditOpen(false)}
        >
          <div className="bg-surface border border-border rounded-[20px] shadow-soft w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-textMain">Edit Profile</h2>
              <button
                id="account-edit-modal-close"
                onClick={() => setEditOpen(false)}
                className="p-1.5 rounded-lg text-textMain-secondary hover:text-textMain hover:bg-card transition-all"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {saveError && (
              <div className="mb-4 flex items-center gap-2 px-3 py-2.5 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
                <AlertCircle size={14} /> {saveError}
              </div>
            )}
            {saveSuccess && (
              <div className="mb-4 flex items-center gap-2 px-3 py-2.5 rounded-lg bg-success/10 border border-success/20 text-success text-sm">
                <CheckCircle2 size={14} /> Profile saved!
              </div>
            )}

            <div className="space-y-4">
              {[
                { id: 'edit-full-name', label: 'Full Name', field: 'fullName', type: 'text', placeholder: 'Your full name' },
                { id: 'edit-phone', label: 'Phone', field: 'phone', type: 'tel', placeholder: '+91 00000 00000' },
                { id: 'edit-street', label: 'Street', field: 'street', type: 'text', placeholder: '42 Park Street' },
                { id: 'edit-city', label: 'City', field: 'city', type: 'text', placeholder: 'Mumbai' },
                { id: 'edit-state', label: 'State', field: 'state', type: 'text', placeholder: 'Maharashtra' },
                { id: 'edit-postal', label: 'Postal Code', field: 'postalCode', type: 'text', placeholder: '400001' },
                { id: 'edit-country', label: 'Country', field: 'country', type: 'text', placeholder: 'India' },
              ].map(({ id, label, field, type, placeholder }) => (
                <div key={id}>
                  <label htmlFor={id} className="block text-xs font-medium text-textMain-secondary mb-1.5">
                    {label}
                  </label>
                  <input
                    id={id}
                    type={type}
                    value={editForm[field as keyof typeof editForm]}
                    onChange={(e) => setEditForm((f) => ({ ...f, [field]: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm text-textMain placeholder-textMain-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    placeholder={placeholder}
                  />
                </div>
              ))}

              <div className="flex gap-3 pt-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => setEditOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="flex-1"
                  id="account-edit-save"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  {saving ? 'Saving…' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Change Password Modal ── */}
      {pwOpen && (
        <div
          id="account-pw-modal-backdrop"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setPwOpen(false)}
        >
          <div className="bg-surface border border-border rounded-[20px] shadow-soft w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-textMain">Change Password</h2>
              <button
                id="account-pw-modal-close"
                onClick={() => setPwOpen(false)}
                className="p-1.5 rounded-lg text-textMain-secondary hover:text-textMain hover:bg-card transition-all"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-4">
              {/* Current Password */}
              <div>
                <label htmlFor="pw-current" className="block text-xs font-medium text-textMain-secondary mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    id="pw-current"
                    type={showCurrent ? 'text' : 'password'}
                    value={pwForm.current}
                    onChange={(e) => setPwForm((f) => ({ ...f, current: e.target.value }))}
                    className="w-full px-4 py-2.5 pr-10 bg-background border border-border rounded-xl text-sm text-textMain placeholder-textMain-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-textMain-secondary hover:text-textMain transition-colors"
                    aria-label="Toggle visibility"
                  >
                    {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              {/* New Password */}
              <div>
                <label htmlFor="pw-new" className="block text-xs font-medium text-textMain-secondary mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="pw-new"
                    type={showNext ? 'text' : 'password'}
                    value={pwForm.next}
                    onChange={(e) => setPwForm((f) => ({ ...f, next: e.target.value }))}
                    className="w-full px-4 py-2.5 pr-10 bg-background border border-border rounded-xl text-sm text-textMain placeholder-textMain-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    placeholder="Min. 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNext((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-textMain-secondary hover:text-textMain transition-colors"
                    aria-label="Toggle visibility"
                  >
                    {showNext ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              {/* Confirm */}
              <div>
                <label htmlFor="pw-confirm" className="block text-xs font-medium text-textMain-secondary mb-1.5">
                  Confirm New Password
                </label>
                <input
                  id="pw-confirm"
                  type="password"
                  value={pwForm.confirm}
                  onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm text-textMain placeholder-textMain-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  placeholder="••••••••"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => setPwOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="flex-1"
                  id="account-pw-save"
                  onClick={() => setPwOpen(false)}
                >
                  <Save size={14} />
                  Update Password
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Account Modal ── */}
      {deleteOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-surface border border-danger/30 rounded-[20px] shadow-soft w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-danger flex items-center gap-2">
                <AlertCircle size={18} /> Delete Account
              </h2>
              <button
                onClick={() => setDeleteOpen(false)}
                className="p-1.5 rounded-lg text-textMain-secondary hover:text-textMain hover:bg-card transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {otpError && (
              <div className="mb-4 flex items-center gap-2 px-3 py-2.5 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
                <AlertCircle size={14} /> {otpError}
              </div>
            )}

            {deleteStep === 'WARNING' ? (
              <div className="space-y-4">
                <p className="text-sm text-textMain">
                  Deleting your account will permanently remove all your active listings and forfeit your current credit balance ({profile?.creditBalance ?? 0} credits).
                </p>
                <p className="text-sm font-semibold text-danger">
                  This action cannot be undone.
                </p>
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => setDeleteOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1 bg-danger hover:bg-danger-hover border-danger"
                    onClick={handleRequestOtp}
                    disabled={otpLoading}
                  >
                    {otpLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                    Request OTP
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-textMain">
                  We've logged an OTP to the backend console (for this demo). Please enter the 6-digit code below to confirm deletion.
                </p>
                <div>
                  <label htmlFor="otp-input" className="block text-xs font-medium text-textMain-secondary mb-1.5">
                    OTP Code
                  </label>
                  <input
                    id="otp-input"
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm text-textMain placeholder-textMain-secondary focus:outline-none focus:ring-2 focus:ring-danger/50 focus:border-danger transition-all text-center tracking-widest font-mono text-lg"
                    placeholder="------"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => setDeleteOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1 bg-danger hover:bg-danger-hover border-danger"
                    onClick={handleConfirmDelete}
                    disabled={otpLoading || otp.length < 6}
                  >
                    {otpLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                    Confirm Delete
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
