'use client';

import { useState, useMemo } from 'react';
import type { UserResponse } from '@/lib/types';
import clsx from 'clsx';

// ── Role badge ────────────────────────────────────────────────────────────────

const ROLE_STYLES: Record<string, string> = {
  ADMIN: 'bg-[#FFE0B2] text-[#E65100]',
  TEACHER: 'bg-[#C6E7FF] text-[#00658D]',
  STUDENT: 'bg-[#DEE0FF] text-[#27378A]',
};

function RoleBadge({ role }: { role: string }) {
  const upper = role.toUpperCase();
  const style = ROLE_STYLES[upper] ?? 'bg-[#ECEEF0] text-[#44474E]';
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${style}`}>
      {upper}
    </span>
  );
}

// ── Avatar ────────────────────────────────────────────────────────────────────

function UserAvatar({ user }: { user: UserResponse }) {
  const initials = user.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (user.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.fullName}
        className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-sm flex-shrink-0"
      />
    );
  }
  return (
    <div className="w-9 h-9 rounded-full signature-gradient flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0">
      {initials}
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface UserTableProps {
  users: UserResponse[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit: (user: UserResponse) => void;
  onDelete: (user: UserResponse) => void;
  onBecomeTeacher: (user: UserResponse) => void;
}

// Returns page indices (0-based) to display, null = ellipsis
function getPageNumbers(current: number, total: number): (number | null)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);

  const left = Math.max(1, current - 1);
  const right = Math.min(total - 2, current + 1);
  const pages: (number | null)[] = [0];

  if (left > 1) pages.push(null);
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < total - 2) pages.push(null);
  pages.push(total - 1);

  return pages;
}

const ROLE_FILTER_OPTIONS = [
  { label: 'All Roles', value: '' },
  { label: 'Admin', value: 'ADMIN' },
  { label: 'Teacher', value: 'TEACHER' },
  { label: 'Student', value: 'STUDENT' },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function UserTable({
  users,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
  onEdit,
  onDelete,
  onBecomeTeacher,
}: UserTableProps) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return users.filter((u) => {
      const matchSearch =
        !q || u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchRole =
        !roleFilter || u.roles.some((r) => r.toUpperCase() === roleFilter);
      return matchSearch && matchRole;
    });
  }, [users, search, roleFilter]);

  const canBecomeTeacher = (user: UserResponse) =>
    !user.roles.some((r) => r.toUpperCase() === 'TEACHER' || r.toUpperCase() === 'ADMIN');

  return (
    <div className="bg-white rounded-3xl shadow-ambient overflow-hidden">
      {/* Filters */}
      <div className="flex items-center gap-3 p-5 border-b border-[#BEC8D0]/20">
        <div className="relative flex-1 max-w-sm">
          <span
            className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6F7880]"
            style={{ fontSize: '18px' }}
          >
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#F7F9FB] rounded-xl text-sm text-[#191C1E] placeholder-[#6F7880] border-0 focus:outline-none focus:ring-2 focus:ring-[#00658D]/30 transition-all"
          />
        </div>

        <div className="flex gap-2">
          {ROLE_FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRoleFilter(opt.value)}
              className={clsx(
                'px-3 py-2 rounded-xl text-xs font-semibold transition-all',
                roleFilter === opt.value
                  ? 'bg-[#00658D] text-white'
                  : 'bg-[#F2F4F6] text-[#44474E] hover:bg-[#ECEEF0]'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#BEC8D0]/20">
              <th className="text-left text-xs font-semibold text-[#6F7880] uppercase tracking-wider px-6 py-3.5">User</th>
              <th className="text-left text-xs font-semibold text-[#6F7880] uppercase tracking-wider px-4 py-3.5">Roles</th>
              <th className="text-left text-xs font-semibold text-[#6F7880] uppercase tracking-wider px-4 py-3.5">Status</th>
              <th className="text-right text-xs font-semibold text-[#6F7880] uppercase tracking-wider px-6 py-3.5">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#BEC8D0]/10">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#ECEEF0] animate-pulse" />
                      <div className="space-y-1.5">
                        <div className="h-3.5 w-32 bg-[#ECEEF0] rounded animate-pulse" />
                        <div className="h-3 w-44 bg-[#ECEEF0] rounded animate-pulse" />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4"><div className="h-5 w-16 bg-[#ECEEF0] rounded-full animate-pulse" /></td>
                  <td className="px-4 py-4"><div className="h-5 w-14 bg-[#ECEEF0] rounded-full animate-pulse" /></td>
                  <td className="px-6 py-4"><div className="h-8 w-20 bg-[#ECEEF0] rounded-xl ml-auto animate-pulse" /></td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-16 text-[#6F7880]">
                  <span className="material-symbols-outlined text-4xl mb-3 block text-[#BEC8D0]">
                    person_search
                  </span>
                  <p className="text-sm font-medium">No users found</p>
                  {(search || roleFilter) && (
                    <p className="text-xs mt-1">Try adjusting your search or filter</p>
                  )}
                </td>
              </tr>
            ) : (
              filtered.map((user) => (
                <tr key={user.id} className="hover:bg-[#F7F9FB] transition-colors">
                  {/* User */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar user={user} />
                      <div>
                        <p className="text-sm font-semibold text-[#191C1E]">{user.fullName}</p>
                        <p className="text-xs text-[#6F7880]">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Roles */}
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role) => (
                        <RoleBadge key={role} role={role} />
                      ))}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4">
                    <span
                      className={clsx(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
                        user.enabled
                          ? 'bg-[#D0F0C0] text-[#1B5E20]'
                          : 'bg-[#FFDAD6] text-[#BA1A1A]'
                      )}
                    >
                      <span
                        className={clsx(
                          'w-1.5 h-1.5 rounded-full',
                          user.enabled ? 'bg-[#2E7D32]' : 'bg-[#BA1A1A]'
                        )}
                      />
                      {user.enabled ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      {canBecomeTeacher(user) && (
                        <button
                          onClick={() => onBecomeTeacher(user)}
                          title="Promote to Teacher"
                          className="p-2 rounded-xl hover:bg-[#C6E7FF]/40 text-[#00658D] transition-colors"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                            school
                          </span>
                        </button>
                      )}
                      <button
                        onClick={() => onEdit(user)}
                        title="Edit user"
                        className="p-2 rounded-xl hover:bg-[#F2F4F6] text-[#44474E] transition-colors"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                          edit
                        </span>
                      </button>
                      <button
                        onClick={() => onDelete(user)}
                        title="Delete user"
                        className="p-2 rounded-xl hover:bg-[#FFDAD6]/40 text-[#BA1A1A] transition-colors"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                          delete
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#BEC8D0]/20">
          <p className="text-sm text-[#6F7880]">
            Page <span className="font-semibold text-[#191C1E]">{currentPage + 1}</span> of{' '}
            <span className="font-semibold text-[#191C1E]">{totalPages}</span>
          </p>

          <div className="flex items-center gap-1">
            {/* Prev */}
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#F2F4F6] text-[#44474E] hover:bg-[#ECEEF0] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_left</span>
            </button>

            {/* Page numbers */}
            {getPageNumbers(currentPage, totalPages).map((page, idx) =>
              page === null ? (
                <span key={`ellipsis-${idx}`} className="w-9 h-9 flex items-center justify-center text-sm text-[#6F7880]">
                  …
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={clsx(
                    'w-9 h-9 flex items-center justify-center rounded-xl text-sm font-medium transition-all',
                    page === currentPage
                      ? 'bg-[#00658D] text-white font-bold shadow-sm'
                      : 'bg-[#F2F4F6] text-[#44474E] hover:bg-[#ECEEF0]'
                  )}
                >
                  {page + 1}
                </button>
              )
            )}

            {/* Next */}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#F2F4F6] text-[#44474E] hover:bg-[#ECEEF0] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
