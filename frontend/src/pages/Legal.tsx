import React from 'react';
import { PageHeader, PageShell } from '../components/Layout';

/* Plain-language summaries. Have these reviewed before a public launch. */
const CONTENT = {
  terms: {
    title: 'Terms of use',
    sections: [
      ['Your account', 'You must be at least 13, give accurate details, and keep your password private.'],
      ['Listings', 'Only list things you own and may give away. Describe them honestly. We may remove any listing.'],
      ['Credits', 'Credits have no cash value, cannot be sold or transferred outside an exchange, and are lost if you delete your account.'],
      ['Exchanges', 'Exchanges happen in person between members. Give & Take is not a party to them and does not inspect items.'],
    ],
  },
  privacy: {
    title: 'Privacy',
    sections: [
      ['What we store', 'Your name, email, phone number, date of birth, address, listings, exchanges and credit history.'],
      ['Who sees it', 'Your name and city appear on listings. Your phone number and pickup address are shared only with the other person in an open exchange.'],
      ['Deleting your data', 'Deleting your account removes your contact details and live listings. Exchange and credit records stay, without your name attached.'],
    ],
  },
};

const Legal: React.FC<{ page: keyof typeof CONTENT }> = ({ page }) => {
  const { title, sections } = CONTENT[page];
  return (
    <PageShell width="max-w-3xl">
      <PageHeader title={title} />
      <div className="space-y-6">
        {sections.map(([heading, body]) => (
          <section key={heading}>
            <h2 className="display text-xl">{heading}</h2>
            <p className="mt-1.5 leading-relaxed text-textMain-secondary">{body}</p>
          </section>
        ))}
      </div>
    </PageShell>
  );
};

export default Legal;
