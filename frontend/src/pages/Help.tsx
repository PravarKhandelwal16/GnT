import React from 'react';
import { PageHeader, PageShell } from '../components/Layout';

const QUESTIONS = [
  {
    q: 'How do credits work?',
    a: 'New members start with 350 credits. When you list an item you earn 40% of its value right away, and the other 60% when the exchange completes. On a 1,000-credit item that is 400 now and 600 later.',
  },
  {
    q: 'What happens when I reserve an item?',
    a: "The full value is held from your balance and the seller's pickup address and phone number are shared with you. You then have 48 hours to meet.",
  },
  {
    q: 'How does the handover work?',
    a: 'When you meet, the buyer shows a QR code on their exchange page and the seller scans it, or types the 8-character code. The buyer then confirms they have the item, which completes the exchange.',
  },
  {
    q: 'What if we can\'t meet?',
    a: 'Either of you can cancel before the handover is confirmed. The buyer gets every credit back and the item returns to the market. The same happens automatically if the 48 hours run out with nobody confirming.',
  },
  {
    q: 'What if the time runs out after we met?',
    a: "If either person confirmed the handover, the exchange completes when the reservation ends, so nobody loses out because someone forgot to tap a button.",
  },
  {
    q: 'Can I remove a listing?',
    a: 'Yes, unless it is reserved. The listing reward is taken back when you do, so you need enough credits in your wallet to cover it.',
  },
  {
    q: 'How should I stay safe?',
    a: 'Meet somewhere public where you can, check the item before anyone confirms, and only share your code once you have it. Use the report link on any listing that looks wrong.',
  },
];

const Help: React.FC = () => (
  <PageShell width="max-w-3xl">
    <PageHeader eyebrow="Help" title="How Give & Take works" />
    <div className="divide-y divide-border border-y border-border">
      {QUESTIONS.map(({ q, a }) => (
        <details key={q} className="group py-5">
          <summary className="display cursor-pointer list-none text-xl marker:hidden">{q}</summary>
          <p className="mt-3 leading-relaxed text-textMain-secondary">{a}</p>
        </details>
      ))}
    </div>
  </PageShell>
);

export default Help;
