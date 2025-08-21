import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  Calendar,
  Lightbulb,
  FolderOpen,
  BarChart3,
  Home,
  PenTool,
  Menu,
  X,
  Shield
} from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user } = useAuth();

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/calendar', icon: Calendar, label: 'Calendar' },
    { path: '/ideation', icon: Lightbulb, label: 'Ideas' },
    { path: '/library', icon: FolderOpen, label: 'Library' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  // Add security dashboard for admin users only
  const isAdmin = user?.email === 'admin@demo.com';
  if (isAdmin) {
    navItems.push({ path: '/security', icon: Shield, label: 'Security' });
  }


  return (
    <nav className="bg-white border-b border-neutral-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-sage rounded-lg flex items-center justify-center">
              <PenTool className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-neutral-800 hidden sm:block">ContentFlow</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <button className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location === item.path 
                    ? 'text-sage bg-sage/10' 
                    : 'text-neutral-600 hover:text-sage hover:bg-neutral-100'
                }`}>
                  <item.icon className="w-4 h-4" />
                  <span className="hidden lg:inline">{item.label}</span>
                </button>
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-neutral-600 hover:text-sage hover:bg-neutral-100"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 bg-white">
            <div className="py-2">
              {navItems.map(({ path, icon: Icon, label }) => (
                <Link
                  key={path}
                  href={path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 text-sm font-medium ${
                    location === path
                      ? 'bg-sage text-white'
                      : 'text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;