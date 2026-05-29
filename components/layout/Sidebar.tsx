'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { href: '/', icon: 'dashboard', label: 'Dashboard' },
  { href: '/subjects', icon: 'menu_book', label: 'Subjects' },
  { href: '/ai-chatbot', icon: 'forum', label: 'AI Chatbot' },
  // { href: '/question-generator', icon: 'quiz', label: 'Question Generator' },
  // { href: '/students', icon: 'groups', label: 'Students' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const isAdmin = user?.roles?.some((r) => r.toUpperCase() === 'ADMIN') ?? false;

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-[#ECEEF0] flex flex-col p-4 z-40 select-none">
      {/* Logo */}
      <div className="px-4 py-6 mb-2">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg signature-gradient flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-white text-base" style={{ fontSize: '16px' }}>
              auto_awesome
            </span>
          </div>
          <h1 className="text-base font-black tracking-tight text-[#00658D]">
            The Curator
          </h1>
        </div>
        <p className="text-[10px] font-semibold text-[#6F7880] uppercase tracking-widest pl-9">
          AI Assistant
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 text-sm font-medium',
                active
                  ? 'bg-white text-[#00658D] shadow-ambient font-semibold'
                  : 'text-[#44474E] hover:bg-white/60 hover:text-[#00658D]'
              )}
            >
              <span
                className={clsx('material-symbols-outlined text-xl', active ? 'text-[#00658D]' : 'text-[#44474E]')}
                style={{ fontSize: '20px' }}
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}

        {/* Admin section */}
        {isAdmin && (
          <>
            <div className="pt-3 pb-1 px-4">
              <p className="text-[10px] font-semibold text-[#6F7880] uppercase tracking-widest">Admin</p>
            </div>
            {(() => {
              const active = isActive('/users');
              return (
                <Link
                  href="/users"
                  className={clsx(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 text-sm font-medium',
                    active
                      ? 'bg-white text-[#00658D] shadow-ambient font-semibold'
                      : 'text-[#44474E] hover:bg-white/60 hover:text-[#00658D]'
                  )}
                >
                  <span
                    className={clsx('material-symbols-outlined', active ? 'text-[#00658D]' : 'text-[#44474E]')}
                    style={{ fontSize: '20px' }}
                  >
                    manage_accounts
                  </span>
                  Users
                </Link>
              );
            })()}
          </>
        )}
      </nav>


    </aside>
  );
}
