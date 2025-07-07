'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChefHat, Menu, X, User, LogIn, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { logout } from '@/lib/firebase';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

const navItems = [
  { label: 'Recepten', href: '/recepten' },
  { label: 'Weekmenu', href: '/weekmenu' },
  { label: 'Boodschappenlijst', href: '/boodschappenlijst' },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const pathname = usePathname();
  const { user, loading } = useAuth();

  // Fallback initialen
  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase();
    }
    return email ? email.slice(0, 2).toUpperCase() : 'U';
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">Familie Recepten</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map(item => (
              <Link
                key={item.label}
                href={item.href}
                className={`text-muted-foreground hover:text-primary transition-colors duration-200 font-medium ${
                  pathname === item.href ? 'text-primary font-semibold' : ''
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-3">
            {!loading && !user && (
              <>
                <Button variant="outline" size="sm" className="text-muted-foreground" asChild>
                  <Link href="/login">
                    <LogIn className="w-4 h-4 mr-2" />
                    Inloggen
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="gradient"
                  className="bg-gradient-primary text-white hover:opacity-90 transition-opacity"
                  asChild
                >
                  <Link href="/register">
                    <User className="w-4 h-4 mr-2" />
                    Registreren
                  </Link>
                </Button>
              </>
            )}
            {!loading && user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center space-x-2 bg-gradient-primary rounded-xl px-4 py-1 shadow text-white cursor-pointer select-none">
                    <Avatar className="w-8 h-8 border border-white">
                      <AvatarImage
                        src={user.photoURL ?? undefined}
                        alt={user.displayName ?? undefined}
                      />
                      <AvatarFallback>
                        {getInitials(user.displayName ?? undefined, user.email ?? undefined)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.displayName ?? user.email ?? ''}</span>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="flex flex-col gap-0.5">
                    <span className="font-semibold">{user.displayName ?? user.email ?? ''}</span>
                    <span className="text-xs text-muted-foreground">{user.email ?? ''}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profiel">
                      <User className="w-4 h-4 mr-2" />
                      Profiel
                    </Link>
                  </DropdownMenuItem>
                  {/* Hier kun je in de toekomst meer menu items toevoegen, zoals "Groepen beheren", "Instellingen", etc */}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Uitloggen
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-primary transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toon menu"
            type="button"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-3 border-t border-border animate-in fade-in-0 slide-in-from-top-2">
            {navItems.map(item => (
              <Link
                key={item.label}
                href={item.href}
                className="block py-2 text-muted-foreground hover:text-primary transition-colors duration-200 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-3 space-y-2 border-t border-border">
              {!loading && !user && (
                <>
                  <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                      <LogIn className="w-4 h-4 mr-2" />
                      Inloggen
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="gradient"
                    className="w-full bg-gradient-primary text-white hover:opacity-90"
                    asChild
                  >
                    <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                      <User className="w-4 h-4 mr-2" />
                      Registreren
                    </Link>
                  </Button>
                </>
              )}
              {!loading && user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center space-x-2 bg-gradient-primary rounded-xl px-8 py-1 shadow text-white mt-2 cursor-pointer select-none">
                      <Avatar className="w-8 h-8 border border-white">
                        <AvatarImage
                          src={user.photoURL ?? undefined}
                          alt={user.displayName ?? undefined}
                        />
                        <AvatarFallback>
                          {getInitials(user.displayName ?? undefined, user.email ?? undefined)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.displayName ?? user.email ?? ''}</span>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="flex flex-col gap-0.5">
                      <span className="font-semibold">{user.displayName ?? user.email ?? ''}</span>
                      <span className="text-xs text-muted-foreground">{user.email ?? ''}</span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profiel" onClick={() => setIsMenuOpen(false)}>
                        <User className="w-4 h-4 mr-2" />
                        Profiel
                      </Link>
                    </DropdownMenuItem>
                    {/* Meer items hier toevoegen indien nodig */}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        setIsMenuOpen(false);
                        logout();
                      }}
                      className="text-destructive focus:text-destructive"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Uitloggen
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
