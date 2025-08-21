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
  X
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
          <div className="hidden md:flex space-x-1">
            {navItems.map(({ path, icon: Icon, label }) => {
              const isActive = location === path;
              return (
                <Link
                  key={path}
                  href={path}
                  className={`flex items-center space-x-2 px-3 lg:px-4 py-2 rounded-xl text-sm font-medium transition-all duration-250 ${
                    isActive
                      ? 'bg-sage text-white shadow-sm'
                      : 'text-neutral-600 hover:text-sage hover:bg-sage/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden lg:inline">{label}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-neutral-600 hover:text-sage hover:bg-sage/5 transition-all duration-250"
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
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map(({ path, icon: Icon, label }) => {
                const isActive = location === path;
                return (
                  <Link
                    key={path}
                    href={path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-3 rounded-xl text-base font-medium transition-all duration-250 ${
                      isActive
                        ? 'bg-sage text-white shadow-sm'
                        : 'text-neutral-600 hover:text-sage hover:bg-sage/5'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;