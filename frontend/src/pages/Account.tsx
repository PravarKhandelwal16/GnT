import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/Button';
import { useAuth } from '../hooks/useAuth';
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
} from 'lucide-react';

/* ─── Types ─── */
interface StatCard {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

interface EditForm {
  fullName: string;
  mobile: string;
  address: string;
}

interface PasswordForm {
  current: string;
  next: string;
  confirm: string;
}

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
      <p className="text-sm font-medium text-textMain truncate">{value}</p>
    </div>
  </div>
);

/* ─── Main Component ─── */
export const Account: React.FC = () => {
  const { user } = useAuth();

  const [editOpen, setEditOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);

  const [editForm, setEditForm] = useState<EditForm>({
    fullName: user?.name ?? '',
    mobile: '+91 98765 43210',
    address: '42, Park Street, Mumbai, 400001',
  });

  const [pwForm, setPwForm] = useState<PasswordForm>({
    current: '',
    next: '',
    confirm: '',
  });

  const stats: StatCard[] = [
    {
      label: 'Credits',
      value: '1,240',
      icon: <TrendingUp size={18} />,
      color: 'bg-warning/10 text-warning',
    },
    {
      label: 'Items Listed',
      value: 12,
      icon: <Package size={18} />,
      color: 'bg-primary/10 text-primary',
    },
    {
      label: 'Trades Done',
      value: 8,
      icon: <ArrowLeftRight size={18} />,
      color: 'bg-success/10 text-success',
    },
    {
      label: 'Rating',
      value: '4.8',
      icon: <Star size={18} />,
      color: 'bg-warning/10 text-warning',
    },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-textMain-secondary text-sm">Not logged in.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-200">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <h1 className="text-2xl font-bold text-textMain">My Account</h1>

        {/* ── Profile hero card ── */}
        <div className="bg-card border border-border rounded-[20px] p-6 sm:p-8 shadow-soft">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center shadow-soft">
                <span className="text-primary font-bold text-3xl select-none">{user.initials}</span>
              </div>
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
                <h2 className="text-xl font-bold text-textMain">{user.name}</h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-success/10 text-success text-xs font-semibold border border-success/20">
                  <CheckCircle2 size={11} />
                  Verified
                </span>
              </div>
              <p className="text-sm text-textMain-secondary mb-4">{user.email}</p>

              {/* Rating stars */}
              <div className="flex items-center justify-center sm:justify-start gap-1 mb-5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={14}
                    className={s <= 4 ? 'text-warning fill-warning' : 'text-warning fill-warning/30'}
                  />
                ))}
                <span className="text-xs text-textMain-secondary ml-1">4.8 (23 reviews)</span>
              </div>

              <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                <Button
                  variant="primary"
                  size="sm"
                  id="account-edit-profile"
                  onClick={() => setEditOpen(true)}
                >
                  <Edit3 size={14} />
                  Edit Profile
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  id="account-change-password"
                  onClick={() => setPwOpen(true)}
                >
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
                <span className="text-lg font-bold text-textMain">{s.value}</span>
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
              onClick={() => setEditOpen(true)}
              className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors"
            >
              <Edit3 size={12} /> Edit
            </button>
          </div>
          <div className="divide-y divide-border">
            <InfoRow icon={<User size={16} />} label="Full Name" value={editForm.fullName || user.name} />
            <InfoRow icon={<Mail size={16} />} label="Email" value={user.email} />
            <InfoRow icon={<Phone size={16} />} label="Mobile" value={editForm.mobile} />
            <InfoRow icon={<MapPin size={16} />} label="Address" value={editForm.address} />
            <InfoRow icon={<Shield size={16} />} label="Account Status" value="Active · Member since Jun 2024" />
          </div>
        </div>

        {/* ── Recent Reviews ── */}
        <div className="bg-card border border-border rounded-[20px] p-6 sm:p-8 shadow-soft">
          <h3 className="text-base font-semibold text-textMain mb-4">Recent Reviews</h3>
          <div className="space-y-4">
            {[
              { name: 'Alex G.', rating: 5, text: 'Great seller! Item was exactly as described. Super smooth exchange.', date: 'Jun 18, 2024' },
              { name: 'Sarah M.', rating: 4, text: 'Good communication, item in good condition. Would trade again.', date: 'Jun 10, 2024' },
              { name: 'Rahul K.', rating: 5, text: 'Perfect condition item and very responsive. Highly recommend!', date: 'May 28, 2024' },
            ].map((review) => (
              <div key={review.name} className="bg-surface rounded-xl p-4 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">{review.name[0]}</span>
                    </div>
                    <span className="text-sm font-medium text-textMain">{review.name}</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} size={11} className={s <= review.rating ? 'text-warning fill-warning' : 'text-textMain-secondary/30 fill-textMain-secondary/10'} />
                    ))}
                    <span className="text-xs text-textMain-secondary ml-1">{review.date}</span>
                  </div>
                </div>
                <p className="text-sm text-textMain-secondary leading-relaxed">{review.text}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* ── Edit Profile Modal ── */}
      {editOpen && (
        <div
          id="account-edit-modal-backdrop"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-modal-in"
          onClick={(e) => e.target === e.currentTarget && setEditOpen(false)}
        >
          <div className="bg-surface border border-border rounded-[20px] shadow-soft w-full max-w-md p-6">
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
            <div className="space-y-4">
              <div>
                <label htmlFor="edit-full-name" className="block text-xs font-medium text-textMain-secondary mb-1.5">
                  Full Name
                </label>
                <input
                  id="edit-full-name"
                  type="text"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm((f) => ({ ...f, fullName: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm text-textMain placeholder-textMain-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label htmlFor="edit-mobile" className="block text-xs font-medium text-textMain-secondary mb-1.5">
                  Mobile Number
                </label>
                <input
                  id="edit-mobile"
                  type="tel"
                  value={editForm.mobile}
                  onChange={(e) => setEditForm((f) => ({ ...f, mobile: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm text-textMain placeholder-textMain-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  placeholder="+91 00000 00000"
                />
              </div>
              <div>
                <label htmlFor="edit-address" className="block text-xs font-medium text-textMain-secondary mb-1.5">
                  Address
                </label>
                <textarea
                  id="edit-address"
                  rows={3}
                  value={editForm.address}
                  onChange={(e) => setEditForm((f) => ({ ...f, address: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm text-textMain placeholder-textMain-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
                  placeholder="Your full address"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => setEditOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="flex-1"
                  id="account-edit-save"
                  onClick={() => setEditOpen(false)}
                >
                  <Save size={14} />
                  Save Changes
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
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-modal-in"
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
                    aria-label="Toggle current password visibility"
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
                    aria-label="Toggle new password visibility"
                  >
                    {showNext ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              {/* Confirm Password */}
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
    </div>
  );
};
