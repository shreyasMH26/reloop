import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  hideFooter?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, hideFooter = false }) => {
  return (
    <div className="min-h-screen flex flex-col bg-cream-50 text-charcoal-900 selection:bg-sage-200 selection:text-sage-900">
      <Navbar />
      <main className="flex-1 w-full">
        {children}
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
};
