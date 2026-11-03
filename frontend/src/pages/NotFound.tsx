import React from 'react';
import { Link } from 'react-router-dom';
import { PageShell } from '../components/Layout';
import { EmptyState, buttonClasses } from '../components/ui';

const NotFound: React.FC = () => (
  <PageShell width="max-w-2xl">
    <EmptyState
      title="This page has moved on"
      description="The link may be old, or the page may never have existed."
      action={
        <Link to="/" className={buttonClasses('primary')}>
          Go home
        </Link>
      }
    />
  </PageShell>
);

export default NotFound;
