import React from 'react';
import { Logo } from './ui';

export const AuthLayout: React.FC<{
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, subtitle, children }) => (
  <div className="grid min-h-screen lg:grid-cols-2">
    <aside className="hidden flex-col justify-between bg-primary p-12 text-onPrimary lg:flex">
      <p className="display text-xl">Give &amp; Take</p>
      <div>
        <p className="display text-5xl leading-[1.1]">Every object has more than one owner in it.</p>
        <p className="mt-5 max-w-sm opacity-80">
          Join a community that passes good things on. New members start with 350 credits.
        </p>
      </div>
      <p className="text-sm opacity-60">No cash. No couriers. Just a fair swap.</p>
    </aside>

    <main className="flex items-center justify-center px-4 py-10 sm:px-6">
      <div className="animate-rise w-full max-w-md">
        <Logo className="mb-10 lg:hidden" />
        <h1 className="display text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 text-textMain-secondary">{subtitle}</p>}
        <div className="mt-8">{children}</div>
      </div>
    </main>
  </div>
);
