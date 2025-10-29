'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import AcmeLogo from '@/app/components/ui/acme-logo';
import Link from 'next/link';
import { User as UserIcon, LogOut } from 'lucide-react';

export default function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  
  //mobile opn state in the future

  const toggleDropdown = () => setDropdownOpen((s) => !s);
  const closeDropdown = () => setDropdownOpen(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, []);

  const userInitials = session?.user?.name
    ? session.user.name
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'U';

    // structure better?
  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/explore', label: 'Explore'},
    {href: '/about', label:'About'},
    { href: '/resources', label: 'Resources' /*For people to learn how to debate, evaluate sources perhaps?*/}

  ];

  const NavLink = ({ href, label }: { href: string; label: string }) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        className={[
          'px-3 py-2 rounded-xl text-sm font-medium transition-colors',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500',
          isActive
            ? 'text-white bg-violet-600/90 hover:bg-violet-600'
            : 'text-slate-200 hover:text-white hover:bg-white/10',
        ].join(' ')}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-gradient-to-r from-zinc-800/95 via-zinc-800/95 to-zinc-800/95 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/70 shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Brand */}
          <div className="flex items-center gap-3">
            <AcmeLogo />
          </div>

          {/* Center: Nav  */}
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((n) => (
              <NavLink key={n.href} href={n.href} label={n.label} />
            ))}
          </nav>

          {/* Right: Auth / User */}
          <div className="flex items-center gap-3">
            {session ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-lg shadow-blue-600/30 ring-1 ring-white/10 hover:brightness-105 transition"
                  aria-haspopup="menu"
                  aria-expanded={dropdownOpen}
                >
                  {userInitials}
                </button>

                {/* Dropdown panel */}
                {dropdownOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl border border-white/10 bg-slate-800/95 text-slate-100 shadow-xl backdrop-blur p-1"
                  >
                    <div className="px-3 py-2 text-xs text-slate-300/90">
                      Signed in as
                      <div className="truncate font-medium text-slate-100">
                        {session.user?.email || session.user?.name}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        closeDropdown();
                        router.push('/profile');
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left hover:bg-white/10"
                    >
                      <UserIcon size={16} /> Profile
                    </button>
                    <button
                      onClick={() => signOut({ callbackUrl: '/signin' })}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-rose-300 hover:bg-rose-500/10"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => router.push('/signin')}
                  className="rounded-xl bg-violet-600 px-3 py-2 text-sm font-medium text-white shadow shadow-blue-600/30 hover:bg-violet-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                >
                  Sign In
                </button>
                <button
                  onClick={() => router.push('/signup')}
                  className="rounded-xl bg-slate-100/10 px-3 py-2 text-sm font-medium text-slate-100 ring-1 ring-white/10 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
