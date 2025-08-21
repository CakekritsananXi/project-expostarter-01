import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  Calendar,
  Lightbulb,
  Target,
  FolderOpen,
  BarChart3,
  Users,
  Home,
  PenTool,
  Menu,
  X,
  DollarSign,
  CreditCard
} from 'lucide-react';

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/calendar', icon: Calendar, label: 'Calendar' },
    { path: '/ideation', icon: Lightbulb, label: 'Ideation' },
    { path: '/strategy', icon: Target, label: 'Strategy' },
    { path: '/library', icon: FolderOpen, label: 'Library' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/collaboration', icon: Users, label: 'Team' },
  ];

  // Dummy auth object for demonstration purposes
  const { user } = { user: { email: 'admin@demo.com' } };

  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-neutral-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-sage rounded-2xl flex items-center justify-center">
              <PenTool className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-semibold text-neutral-800">ContentFlow</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <button className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 min-h-[44px] touch-manipulation ${
                  location === item.path 
                    ? 'text-sage bg-sage/10 shadow-sm' 
                    : 'text-neutral-600 hover:text-sage hover:bg-sage/5'
                }`}>
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="hidden lg:inline">{item.label}</span>
                </button>
              </Link>
            ))}
            {user?.email === 'admin@demo.com' && (
              <Link
                href="/admin"
                className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 min-h-[44px] touch-manipulation ${
                  location === '/admin'
                    ? 'bg-sage text-white shadow-sm'
                    : 'text-neutral-600 hover:text-sage hover:bg-sage/5'
                }`}
              >
                <Users className="w-5 h-5 flex-shrink-0" />
                <span className="hidden lg:inline">Admin</span>
              </Link>
            )}
            <Link
                  href="/pricing"
                  className="flex items-center space-x-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 min-h-[44px] touch-manipulation text-neutral-600 hover:text-sage hover:bg-sage/5"
                >
                  <DollarSign className="w-5 h-5 flex-shrink-0" />
                  <span className="hidden lg:inline">Pricing</span>
                </Link>
            <Link
                  href="/subscription"
                  className="flex items-center space-x-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 min-h-[44px] touch-manipulation text-neutral-600 hover:text-sage hover:bg-sage/5"
                >
                  <CreditCard className="w-5 h-5 flex-shrink-0" />
                  <span className="hidden lg:inline">Subscription</span>
                </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-3 rounded-xl text-neutral-600 hover:text-sage hover:bg-sage/5 transition-all duration-250 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-200/50 bg-white/95 backdrop-blur-sm">
            <div className="px-3 pt-3 pb-4 space-y-2">
              {navItems.map(({ path, icon: Icon, label }, index) => {
                const isActive = location === path;
                return (
                  <Link
                    key={path}
                    href={path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-4 px-4 py-4 rounded-xl text-base font-medium transition-all duration-250 min-h-[56px] touch-target ${
                      isActive
                        ? 'bg-sage text-white shadow-sm'
                        : 'text-neutral-600 hover:text-sage hover:bg-sage/5'
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span>{label}</span>
                  </Link>
                );
              })}
              {user?.email === 'admin@demo.com' && (
                <Link
                  href="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-4 px-4 py-4 rounded-xl text-base font-medium transition-all duration-250 min-h-[56px] touch-target ${
                    location === '/admin'
                      ? 'bg-sage text-white shadow-sm'
                      : 'text-neutral-600 hover:text-sage hover:bg-sage/5'
                  }`}
                >
                  <Users className="w-5 h-5 flex-shrink-0" />
                  <span>Admin</span>
                </Link>
              )}
              <Link
                  href="/pricing"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-4 px-4 py-4 rounded-xl text-base font-medium transition-all duration-250 min-h-[56px] touch-target text-neutral-600 hover:text-sage hover:bg-sage/5"
                >
                  <DollarSign className="w-5 h-5 flex-shrink-0" />
                  <span>Pricing</span>
                </Link>
              <Link
                  href="/subscription"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-4 px-4 py-4 rounded-xl text-base font-medium transition-all duration-250 min-h-[56px] touch-target text-neutral-600 hover:text-sage hover:bg-sage/5"
                >
                  <CreditCard className="w-5 h-5 flex-shrink-0" />
                  <span>Subscription</span>
                </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;