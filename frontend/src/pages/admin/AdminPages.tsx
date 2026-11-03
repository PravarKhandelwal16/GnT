import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Flag, Search } from 'lucide-react';
import { admin } from '../../api/admin';
import type { ExchangeRow, ListingRow, MemberRow, Overview, ReportRow, Role } from '../../api/admin';
import { Alert, Button, Credits, Field, ProductImage, Skeleton } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { apiError, formatDate, formatDateTime } from '../../lib/format';
import { ActionModal, AdminHeader, ListState, Pager, RoleBadge, Status, label, useIsOwner, usePaged } from './shared';

/* ── Overview ─────────────────────────────────────────────────────────────── */

export const AdminOverview: React.FC = () => {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    admin.overview().then(setData).catch((err) => setError(apiError(err)));
  }, []);

  if (error) return <Alert>{error}</Alert>;

  const groups: Array<{ title: string; items: Array<[string, number | undefined, string?]> }> = [
    {
      title: 'Needs attention',
      items: [
        ['Open reports', data?.openReports, '/admin/reports'],
        ['Open exchanges', data?.openExchanges, '/admin/exchanges?status=INITIATED'],
        ['Suspended members', data?.suspendedMembers, '/admin/members?status=SUSPENDED'],
      ],
    },
    {
      title: 'Community',
      items: [
        ['Members', data?.totalMembers, '/admin/members'],
        ['Active members', data?.activeMembers],
        ['Joined in the last 7 days', data?.newMembersLast7Days],
      ],
    },
    {
      title: 'Market',
      items: [
        ['Live listings', data?.liveListings, '/admin/listings?status=ACTIVE'],
        ['Reserved', data?.reservedListings, '/admin/listings?status=LOCKED'],
        ['Exchanged', data?.exchangedListings, '/admin/listings?status=EXCHANGED'],
        ['Removed by staff', data?.removedListings, '/admin/listings?status=REJECTED'],
        ['Completed exchanges', data?.completedExchanges],
        ['Cancelled or expired', data?.cancelledOrExpiredExchanges],
      ],
    },
    {
      title: 'Credits',
      items: [
        ['In member wallets', data?.creditsInWallets],
        ['Held in open exchanges', data?.creditsHeldInExchanges],
        ['Exchanged in the last 30 days', data?.creditsExchangedLast30Days],
      ],
    },
  ];

  return (
    <>
      <AdminHeader title="Overview" description="The state of the marketplace right now." />
      <div className="space-y-8">
        {groups.map((group) => (
          <section key={group.title}>
            <h2 className="mb-3 text-sm font-semibold text-textMain-secondary">{group.title}</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {group.items.map(([name, value, to]) => {
                const body = (
                  <>
                    <p className="text-xs text-textMain-secondary">{name}</p>
                    {value === undefined ? (
                      <Skeleton className="mt-2 h-8 w-16" />
                    ) : (
                      <p className="tabular display mt-1 text-3xl">{value.toLocaleString()}</p>
                    )}
                  </>
                );
                return to ? (
                  <Link key={name} to={to} className="panel p-4 transition-shadow hover:shadow-soft-hover">
                    {body}
                  </Link>
                ) : (
                  <div key={name} className="panel p-4">
                    {body}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </>
  );
};

/* ── Filters ──────────────────────────────────────────────────────────────── */

function useQueryParam(name: string, fallback = ''): [string, (value: string) => void] {
  const [value, setValue] = useState(() => new URLSearchParams(window.location.search).get(name) ?? fallback);
  return [value, setValue];
}

const SearchInput: React.FC<{ value: string; onChange: (value: string) => void; placeholder: string }> = ({
  value,
  onChange,
  placeholder,
}) => {
  const [text, setText] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => onChange(text.trim()), 300);
    return () => clearTimeout(timer);
  }, [text, onChange]);
  return (
    <div className="relative flex-1">
      <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-textMain-secondary" />
      <input type="search" aria-label={placeholder} placeholder={placeholder} value={text} onChange={(e) => setText(e.target.value)} className="field pl-10" />
    </div>
  );
};

const Select: React.FC<{ label: string; value: string; onChange: (v: string) => void; options: string[] }> = ({
  label: name,
  value,
  onChange,
  options,
}) => (
  <select aria-label={name} value={value} onChange={(e) => onChange(e.target.value)} className="field sm:w-48">
    <option value="">All {name.toLowerCase()}</option>
    {options.map((o) => (
      <option key={o} value={o}>
        {label(o)}
      </option>
    ))}
  </select>
);

/* ── Reports ──────────────────────────────────────────────────────────────── */

export const AdminReports: React.FC = () => {
  const toast = useToast();
  const [status, setStatus] = useQueryParam('status', 'OPEN');
  const [resolving, setResolving] = useState<{ report: ReportRow; outcome: 'DISMISS' | 'TAKE_DOWN' } | null>(null);
  const list = usePaged((page) => admin.reports({ status, page }), [status]);

  return (
    <>
      <AdminHeader title="Reports" description="Listings members have flagged. Remove the listing or dismiss the report." />
      <div className="mb-5 flex gap-2">
        {['OPEN', 'CLOSED', ''].map((value) => (
          <button key={value || 'all'} type="button" aria-pressed={status === value} onClick={() => setStatus(value)} className={`chip ${status === value ? 'chip-active' : 'chip-idle'}`}>
            {value ? label(value) : 'All'}
          </button>
        ))}
      </div>

      <ListState loading={list.loading} error={list.error} empty={!list.data?.content.length} emptyText="No reports here. Nice." />
      {!list.loading && !list.error && (
        <ul className="space-y-3">
          {list.data?.content.map((report) => (
            <li key={report.id} className="panel p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Flag size={15} className="text-danger" />
                    <span className="font-semibold">{report.reason}</span>
                    <Status value={report.status} />
                  </div>
                  <p className="mt-1 text-sm text-textMain-secondary">
                    <Link to={`/product/${report.productId}`} className="font-medium text-textMain hover:text-primary">
                      {report.productTitle}
                    </Link>{' '}
                    by <Link to={`/admin/members/${report.ownerId}`} className="hover:text-primary">{report.ownerName}</Link> · reported by{' '}
                    <Link to={`/admin/members/${report.reporterId}`} className="hover:text-primary">{report.reporterName}</Link> ·{' '}
                    {formatDateTime(report.createdAt)}
                  </p>
                  {report.description && <p className="mt-2 text-sm">“{report.description}”</p>}
                  {report.resolutionNote && (
                    <p className="mt-2 text-sm text-textMain-secondary">
                      {report.resolutionNote} — {report.resolvedByName}, {report.resolvedAt && formatDateTime(report.resolvedAt)}
                    </p>
                  )}
                </div>
                {report.status === 'OPEN' && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => setResolving({ report, outcome: 'DISMISS' })}>
                      Dismiss
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => setResolving({ report, outcome: 'TAKE_DOWN' })}>
                      Remove listing
                    </Button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      <Pager page={list.page} totalPages={list.data?.totalPages ?? 0} onChange={list.setPage} />

      {resolving && (
        <ActionModal
          title={resolving.outcome === 'TAKE_DOWN' ? 'Remove this listing?' : 'Dismiss this report?'}
          description={
            resolving.outcome === 'TAKE_DOWN'
              ? `“${resolving.report.productTitle}” leaves the market and its listing reward is reversed from the owner's wallet.`
              : 'The listing stays live and the report is closed.'
          }
          confirmLabel={resolving.outcome === 'TAKE_DOWN' ? 'Remove listing' : 'Dismiss report'}
          danger={resolving.outcome === 'TAKE_DOWN'}
          reasonLabel="Note for the record"
          onConfirm={async (note) => {
            await admin.resolveReport(resolving.report.id, resolving.outcome, note);
            toast('Report closed');
            list.reload();
          }}
          onClose={() => setResolving(null)}
        />
      )}
    </>
  );
};

/* ── Listings ─────────────────────────────────────────────────────────────── */

export const AdminListings: React.FC = () => {
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useQueryParam('status');
  const [acting, setActing] = useState<{ listing: ListingRow; action: 'takeDown' | 'restore' } | null>(null);
  const list = usePaged((page) => admin.listings({ query, status, page }), [query, status]);

  return (
    <>
      <AdminHeader title="Listings" description="Every listing, including removed and exchanged ones." />
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <SearchInput value={query} onChange={setQuery} placeholder="Search by title or owner" />
        <Select label="Statuses" value={status} onChange={setStatus} options={['ACTIVE', 'LOCKED', 'EXCHANGED', 'REJECTED', 'DELETED']} />
      </div>

      <ListState loading={list.loading} error={list.error} empty={!list.data?.content.length} emptyText="No listings match." />
      {!list.loading && !list.error && (
        <ul className="panel divide-y divide-border">
          {list.data?.content.map((listing) => (
            <li key={listing.id} className="flex flex-wrap items-center gap-4 p-4">
              <ProductImage src={listing.primaryMediaUrl} alt="" className="h-14 w-14 flex-shrink-0 rounded-lg" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link to={`/product/${listing.id}`} className="truncate font-medium hover:text-primary">
                    {listing.title}
                  </Link>
                  <Status value={listing.status} />
                  {listing.openReports > 0 && (
                    <span className="text-xs font-semibold text-danger">
                      {listing.openReports} open report{listing.openReports > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-sm text-textMain-secondary">
                  <Link to={`/admin/members/${listing.ownerId}`} className="hover:text-primary">{listing.ownerName}</Link> · {listing.city} ·{' '}
                  <Credits value={listing.creditValue} size={12} /> · {formatDate(listing.createdAt)}
                </p>
              </div>
              {listing.status === 'ACTIVE' && (
                <Button size="sm" variant="secondary" className="text-danger" onClick={() => setActing({ listing, action: 'takeDown' })}>
                  Remove
                </Button>
              )}
              {listing.status === 'REJECTED' && (
                <Button size="sm" variant="secondary" onClick={() => setActing({ listing, action: 'restore' })}>
                  Restore
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
      <Pager page={list.page} totalPages={list.data?.totalPages ?? 0} onChange={list.setPage} />

      {acting && (
        <ActionModal
          title={acting.action === 'takeDown' ? 'Remove this listing?' : 'Restore this listing?'}
          description={
            acting.action === 'takeDown'
              ? `“${acting.listing.title}” leaves the market and up to ${acting.listing.listingBonus.toLocaleString()} credits of listing reward are reversed.`
              : `“${acting.listing.title}” goes back on the market and the owner's listing reward is paid back.`
          }
          confirmLabel={acting.action === 'takeDown' ? 'Remove listing' : 'Restore listing'}
          danger={acting.action === 'takeDown'}
          onConfirm={async (reason) => {
            await (acting.action === 'takeDown' ? admin.takeDown(acting.listing.id, reason) : admin.restore(acting.listing.id, reason));
            toast(acting.action === 'takeDown' ? 'Listing removed' : 'Listing restored');
            list.reload();
          }}
          onClose={() => setActing(null)}
        />
      )}
    </>
  );
};

/* ── Members ──────────────────────────────────────────────────────────────── */

export const AdminMembers: React.FC = () => {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useQueryParam('status');
  const [role, setRole] = useQueryParam('role');
  const list = usePaged((page) => admin.members({ query, status, role, page }), [query, status, role]);

  return (
    <>
      <AdminHeader title="Members" description="Look someone up by name, email or phone." />
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <SearchInput value={query} onChange={setQuery} placeholder="Search members" />
        <Select label="Statuses" value={status} onChange={setStatus} options={['ACTIVE', 'SUSPENDED', 'DELETED']} />
        <Select label="Roles" value={role} onChange={setRole} options={['USER', 'MODERATOR', 'ADMIN']} />
      </div>

      <ListState loading={list.loading} error={list.error} empty={!list.data?.content.length} emptyText="No members match." />
      {!list.loading && !list.error && (
        <ul className="panel divide-y divide-border">
          {list.data?.content.map((m) => (
            <li key={m.id}>
              <Link to={`/admin/members/${m.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 p-4 transition-colors hover:bg-textMain/[0.03]">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{m.name}</span>
                    <RoleBadge role={m.role} />
                    {m.status !== 'ACTIVE' && <Status value={m.status} />}
                  </div>
                  <p className="truncate text-sm text-textMain-secondary">
                    {m.email} · {m.phone}
                  </p>
                </div>
                <div className="text-sm text-textMain-secondary">
                  <Credits value={m.creditBalance} size={13} className="text-textMain" /> · joined {formatDate(m.createdAt)}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Pager page={list.page} totalPages={list.data?.totalPages ?? 0} onChange={list.setPage} />
    </>
  );
};

type MemberAction = 'suspend' | 'reactivate' | 'credits' | 'role';

export const AdminMemberDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const isOwner = useIsOwner();
  const { user: me } = useAuth();
  const [member, setMember] = useState<MemberRow | null>(null);
  const [error, setError] = useState('');
  const [action, setAction] = useState<MemberAction | null>(null);
  const [amount, setAmount] = useState('');
  const [role, setRole] = useState<Role>('USER');
  const [tab, setTab] = useState<'credits' | 'listings' | 'exchanges'>('credits');

  useEffect(() => {
    if (!id) return;
    admin.member(id).then((m) => {
      setMember(m);
      setRole(m.role);
    }).catch((err) => setError(apiError(err)));
  }, [id]);

  const credits = usePaged((page) => (tab === 'credits' && id ? admin.memberCredits(id, page) : Promise.resolve(null as never)), [id, tab, member?.creditBalance]);
  const listings = usePaged((page) => (tab === 'listings' && id ? admin.listings({ ownerId: id, page }) : Promise.resolve(null as never)), [id, tab]);
  const exchanges = usePaged((page) => (tab === 'exchanges' && id ? admin.exchanges({ userId: id, page }) : Promise.resolve(null as never)), [id, tab]);

  if (error) return <Alert>{error}</Alert>;
  if (!member) return <Skeleton className="h-64 w-full" />;

  const isSelf = me?.id === member.id;
  const canSuspend = !isSelf && member.status === 'ACTIVE' && (isOwner || member.role === 'USER');

  return (
    <>
      <Link to="/admin/members" className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-textMain-secondary hover:text-textMain">
        <ArrowLeft size={15} /> Members
      </Link>

      <section className="panel p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="display text-3xl">{member.name}</h1>
              <RoleBadge role={member.role} />
              <Status value={member.status} />
            </div>
            <p className="mt-1 text-sm text-textMain-secondary">
              {member.email} · {member.phone}
              {member.city ? ` · ${member.city}` : ''} · joined {formatDate(member.createdAt)}
            </p>
          </div>
          <p className="text-2xl">
            <Credits value={member.creditBalance} size={20} />
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-5">
          {canSuspend && (
            <Button size="sm" variant="secondary" className="text-danger" onClick={() => setAction('suspend')}>
              Suspend
            </Button>
          )}
          {member.status === 'SUSPENDED' && (
            <Button size="sm" variant="secondary" onClick={() => setAction('reactivate')}>
              Reactivate
            </Button>
          )}
          {isOwner && member.status !== 'DELETED' && (
            <Button size="sm" variant="secondary" onClick={() => setAction('credits')}>
              Adjust credits
            </Button>
          )}
          {isOwner && member.status === 'ACTIVE' && (
            <Button size="sm" variant="secondary" onClick={() => setAction('role')}>
              Change role
            </Button>
          )}
          {!isOwner && <p className="text-xs text-textMain-secondary">Credit adjustments and roles are handled by an owner.</p>}
        </div>
      </section>

      <div className="mb-4 mt-8 flex gap-2">
        {(['credits', 'listings', 'exchanges'] as const).map((value) => (
          <button key={value} type="button" aria-pressed={tab === value} onClick={() => setTab(value)} className={`chip ${tab === value ? 'chip-active' : 'chip-idle'}`}>
            {value === 'credits' ? 'Credit ledger' : value === 'listings' ? 'Listings' : 'Exchanges'}
          </button>
        ))}
      </div>

      {tab === 'credits' && (
        <>
          <ListState loading={credits.loading} error={credits.error} empty={!credits.data?.content.length} emptyText="No credit activity." />
          {!credits.loading && credits.data && credits.data.content.length > 0 && (
            <ul className="panel divide-y divide-border">
              {credits.data.content.map((entry) => (
                <li key={entry.id} className="flex items-center justify-between gap-4 p-4 text-sm">
                  <div className="min-w-0">
                    <p className="truncate">{entry.description}</p>
                    <p className="text-xs text-textMain-secondary">
                      {entry.transactionType.replace(/_/g, ' ').toLowerCase()} · {formatDateTime(entry.createdAt)}
                    </p>
                  </div>
                  <span className={`tabular font-semibold ${entry.amount > 0 ? 'text-success' : ''}`}>
                    {entry.amount > 0 ? '+' : '−'}
                    {Math.abs(entry.amount).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Pager page={credits.page} totalPages={credits.data?.totalPages ?? 0} onChange={credits.setPage} />
        </>
      )}

      {tab === 'listings' && (
        <>
          <ListState loading={listings.loading} error={listings.error} empty={!listings.data?.content.length} emptyText="No listings." />
          {!listings.loading && listings.data && listings.data.content.length > 0 && (
            <ul className="panel divide-y divide-border">
              {listings.data.content.map((l) => (
                <li key={l.id} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
                  <Link to={`/product/${l.id}`} className="font-medium hover:text-primary">{l.title}</Link>
                  <span className="flex items-center gap-3">
                    <Credits value={l.creditValue} size={12} /> <Status value={l.status} />
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Pager page={listings.page} totalPages={listings.data?.totalPages ?? 0} onChange={listings.setPage} />
        </>
      )}

      {tab === 'exchanges' && (
        <>
          <ListState loading={exchanges.loading} error={exchanges.error} empty={!exchanges.data?.content.length} emptyText="No exchanges." />
          {!exchanges.loading && exchanges.data && exchanges.data.content.length > 0 && <ExchangeList rows={exchanges.data.content} onChanged={exchanges.reload} />}
          <Pager page={exchanges.page} totalPages={exchanges.data?.totalPages ?? 0} onChange={exchanges.setPage} />
        </>
      )}

      {action === 'suspend' && (
        <ActionModal
          title={`Suspend ${member.name}?`}
          description="They are logged out straight away, can't log back in, and their listings disappear from the market until reactivated. Open exchanges are not cancelled."
          confirmLabel="Suspend member"
          danger
          onConfirm={async (reason) => {
            setMember(await admin.suspend(member.id, reason));
            toast('Member suspended');
          }}
          onClose={() => setAction(null)}
        />
      )}
      {action === 'reactivate' && (
        <ActionModal
          title={`Reactivate ${member.name}?`}
          description="They can log in again and their listings return to the market."
          confirmLabel="Reactivate member"
          onConfirm={async (reason) => {
            setMember(await admin.reactivate(member.id, reason));
            toast('Member reactivated');
          }}
          onClose={() => setAction(null)}
        />
      )}
      {action === 'credits' && (
        <ActionModal
          title="Adjust credits"
          description={`Current balance: ${member.creditBalance.toLocaleString()}. Use a minus sign to take credits away. The member sees the reason in their wallet.`}
          confirmLabel="Apply adjustment"
          onConfirm={async (reason) => {
            const value = Number(amount);
            if (!Number.isInteger(value) || value === 0) throw new Error('Enter a whole number other than zero');
            setMember(await admin.adjustCredits(member.id, value, reason));
            setAmount('');
            toast('Credits adjusted');
          }}
          onClose={() => setAction(null)}
        >
          <Field label="Amount" htmlFor="adjust-amount">
            <input id="adjust-amount" type="number" required step={1} value={amount} onChange={(e) => setAmount(e.target.value)} className="field" placeholder="e.g. 100 or -50" />
          </Field>
        </ActionModal>
      )}
      {action === 'role' && (
        <ActionModal
          title="Change role"
          description="Team members handle reports, listings and suspensions. Owners can also move credits, change roles and read the audit log."
          confirmLabel="Save role"
          onConfirm={async (reason) => {
            setMember(await admin.changeRole(member.id, role, reason));
            toast('Role updated');
          }}
          onClose={() => setAction(null)}
        >
          <Field label="Role" htmlFor="member-role">
            <select id="member-role" value={role} onChange={(e) => setRole(e.target.value as Role)} className="field">
              <option value="USER">Member</option>
              <option value="MODERATOR">Team</option>
              <option value="ADMIN">Owner</option>
            </select>
          </Field>
        </ActionModal>
      )}
    </>
  );
};

/* ── Exchanges ────────────────────────────────────────────────────────────── */

const ExchangeList: React.FC<{ rows: ExchangeRow[]; onChanged: () => void }> = ({ rows, onChanged }) => {
  const isOwner = useIsOwner();
  const toast = useToast();
  const [cancelling, setCancelling] = useState<ExchangeRow | null>(null);
  const open = (status: string) => status === 'INITIATED' || status === 'WAITING_CONFIRMATION';

  return (
    <>
      <ul className="panel divide-y divide-border">
        {rows.map((tx) => (
          <li key={tx.id} className="p-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <span className="text-textMain-secondary">#{tx.id}</span>
                <Link to={`/product/${tx.productId}`} className="truncate font-medium hover:text-primary">{tx.productTitle}</Link>
                <Status value={tx.status} />
              </div>
              <Credits value={tx.creditsUsed} size={13} />
            </div>
            <p className="mt-1.5 text-textMain-secondary">
              Buyer <Link to={`/admin/members/${tx.buyerId}`} className="text-textMain hover:text-primary">{tx.buyerName}</Link> ({tx.buyerPhone})
              {tx.buyerConfirmed ? ' ✓ confirmed' : ''} · Seller{' '}
              <Link to={`/admin/members/${tx.sellerId}`} className="text-textMain hover:text-primary">{tx.sellerName}</Link> ({tx.sellerPhone})
              {tx.sellerConfirmed ? ' ✓ scanned' : ''}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-textMain-secondary">
                Started {formatDateTime(tx.createdAt)}
                {open(tx.status) && ` · ends ${formatDateTime(tx.expiresAt)}`}
                {tx.completedAt && ` · completed ${formatDateTime(tx.completedAt)}`}
                {tx.cancelledAt && ` · closed ${formatDateTime(tx.cancelledAt)}`}
              </p>
              {open(tx.status) && isOwner && (
                <Button size="sm" variant="secondary" className="text-danger" onClick={() => setCancelling(tx)}>
                  Cancel and refund
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
      {cancelling && (
        <ActionModal
          title="Cancel this exchange?"
          description={`${cancelling.buyerName} gets ${cancelling.creditsUsed.toLocaleString()} credits back, even if someone already confirmed. Use this to settle disputes.`}
          confirmLabel="Cancel and refund"
          danger
          onConfirm={async (reason) => {
            await admin.cancelExchange(cancelling.id, reason);
            toast('Exchange cancelled and buyer refunded');
            onChanged();
          }}
          onClose={() => setCancelling(null)}
        />
      )}
    </>
  );
};

export const AdminExchanges: React.FC = () => {
  const [status, setStatus] = useQueryParam('status');
  const list = usePaged((page) => admin.exchanges({ status, page }), [status]);

  return (
    <>
      <AdminHeader title="Exchanges" description="Every reservation, with both people's contact details for disputes." />
      <div className="mb-5 flex">
        <Select label="Statuses" value={status} onChange={setStatus} options={['INITIATED', 'WAITING_CONFIRMATION', 'COMPLETED', 'CANCELLED', 'EXPIRED']} />
      </div>
      <ListState loading={list.loading} error={list.error} empty={!list.data?.content.length} emptyText="No exchanges match." />
      {!list.loading && !list.error && list.data && list.data.content.length > 0 && <ExchangeList rows={list.data.content} onChanged={list.reload} />}
      <Pager page={list.page} totalPages={list.data?.totalPages ?? 0} onChange={list.setPage} />
    </>
  );
};

/* ── Audit log (owner only) ───────────────────────────────────────────────── */

const TARGET_LINK: Record<string, (id: number) => string> = {
  USER: (id) => `/admin/members/${id}`,
  LISTING: (id) => `/product/${id}`,
  EXCHANGE: () => '/admin/exchanges',
  REPORT: () => '/admin/reports?status=CLOSED',
};

export const AdminAudit: React.FC = () => {
  const isOwner = useIsOwner();
  const list = usePaged((page) => admin.audit({ page }), []);

  if (!isOwner) return <Alert>Only owners can read the audit log.</Alert>;

  return (
    <>
      <AdminHeader title="Audit log" description="Every staff action, who took it, and why. Entries can't be edited or deleted." />
      <ListState loading={list.loading} error={list.error} empty={!list.data?.content.length} emptyText="No staff actions yet." />
      {!list.loading && !list.error && list.data && list.data.content.length > 0 && (
        <ul className="panel divide-y divide-border">
          {list.data.content.map((entry) => (
            <li key={entry.id} className="p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p>
                  <Link to={`/admin/members/${entry.actorId}`} className="font-medium hover:text-primary">{entry.actorName}</Link>{' '}
                  <span className="text-textMain-secondary">{entry.action.replace(/_/g, ' ').toLowerCase()}</span>{' '}
                  <Link to={TARGET_LINK[entry.targetType](entry.targetId)} className="font-medium hover:text-primary">
                    {entry.targetType.toLowerCase()} #{entry.targetId}
                  </Link>
                </p>
                <span className="text-xs text-textMain-secondary">{formatDateTime(entry.createdAt)}</span>
              </div>
              <p className="mt-1 text-textMain-secondary">{entry.details}</p>
            </li>
          ))}
        </ul>
      )}
      <Pager page={list.page} totalPages={list.data?.totalPages ?? 0} onChange={list.setPage} />
    </>
  );
};
