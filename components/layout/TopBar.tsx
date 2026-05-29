'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import clsx from 'clsx';

interface TopBarProps {
  title?: string;
}

export default function TopBar({ title }: TopBarProps) {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AI';

  return (
    <header className="w-full sticky top-0 z-30 bg-[#F7F9FB]/90 backdrop-blur-md flex justify-between items-center px-8 py-3 border-b border-[#BEC8D0]/20">
      {/* Search */}
      <div className="flex items-center flex-1 max-w-md">
        <div className="relative w-full">
          <span
            className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6F7880]"
            style={{ fontSize: '18px' }}
          >
            search
          </span>
          <input
            type="text"
            placeholder="Search subjects, documents..."
            className="w-full pl-10 pr-4 py-2 bg-[#ECEEF0] rounded-xl text-sm text-[#191C1E] placeholder-[#6F7880] border-0 focus:outline-none focus:ring-2 focus:ring-[#00658D]/30 transition-all"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#ECEEF0] transition-colors relative">
          <span className="material-symbols-outlined text-[#44474E]" style={{ fontSize: '20px' }}>
            notifications
          </span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#00658D] rounded-full border-2 border-[#F7F9FB]" />
        </button>

        {/* Help */}
        <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#ECEEF0] transition-colors">
          <span className="material-symbols-outlined text-[#44474E]" style={{ fontSize: '20px' }}>
            help_outline
          </span>
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-[#BEC8D0]/40" />

        {/* User Avatar + Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-[#191C1E] leading-tight">
                {user?.fullName || 'Loading...'}
              </p>
              <p className="text-xs text-[#6F7880]">{user?.roles?.[0] || 'Teacher'}</p>
            </div>
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.fullName}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-sm"
              />
            ) : (
              <div className="w-9 h-9 rounded-full signature-gradient flex items-center justify-center text-white text-sm font-bold shadow-sm">
                {initials}
              </div>
            )}
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 top-12 w-52 bg-white rounded-2xl shadow-ambient-md border border-[#BEC8D0]/20 py-1.5 z-50 fade-in">
              <button
                onClick={() => { setDropdownOpen(false); router.push('/profile'); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#44474E] hover:bg-[#F2F4F6] transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person</span>
                Profile
              </button>
              <hr className="my-1 border-[#BEC8D0]/20" />
              <button
                onClick={() => { setDropdownOpen(false); logout(); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#BA1A1A] hover:bg-[#FFDAD6]/30 transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
