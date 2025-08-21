import React from 'react';
import Navigation from './Navigation';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-cream">
      <Navigation />
      <main className="transition-all duration-300 ease-in-out">
        {children}
      </main>
    </div>
  );
};

export default Layout;