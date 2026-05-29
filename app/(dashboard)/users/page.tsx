'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { adminApi } from '@/lib/api/admin';
import type {
  UserResponse,
  AdminCreateUserRequest,
  AdminUpdateUserRequest,
} from '@/lib/types';
import UserTable from '@/components/admin/UserTable';
import UserFormModal from '@/components/admin/UserFormModal';
import ConfirmDialog from '@/components/admin/ConfirmDialog';

const PAGE_SIZE = 20;

export default function UsersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // ── Data state ──────────────────────────────────────────────────────────────
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // ── Modal state ─────────────────────────────────────────────────────────────
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Confirm dialog state ────────────────────────────────────────────────────
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    isLoading: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    isLoading: false,
    onConfirm: () => {},
  });

  // ── Admin guard ─────────────────────────────────────────────────────────────
  const isAdmin = user?.roles?.some((r) => r.toUpperCase() === 'ADMIN') ?? false;

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.replace('/');
    }
  }, [authLoading, isAdmin, router]);

  // ── Fetch users ─────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async (page: number) => {
    setIsLoading(true);
    try {
      const data = await adminApi.getUsers({ pageNo: page, pageSize: PAGE_SIZE });
      setUsers(data.items ?? []);
      setTotalPages(data.totalPage ?? 0);
      setCurrentPage(data.pageNo ?? page);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) fetchUsers(0);
  }, [isAdmin, fetchUsers]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handlePageChange = (page: number) => {
    fetchUsers(page);
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setModalMode('create');
  };

  const openEditModal = (u: UserResponse) => {
    setEditingUser(u);
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingUser(null);
  };

  const handleFormSubmit = async (data: AdminCreateUserRequest | AdminUpdateUserRequest) => {
    setIsSubmitting(true);
    try {
      if (modalMode === 'create') {
        const created = await adminApi.createUser(data as AdminCreateUserRequest);
        setUsers((prev) => [created, ...prev]);
        toast.success('User created successfully');
      } else if (modalMode === 'edit' && editingUser) {
        const updated = await adminApi.updateUser(editingUser.id, data as AdminUpdateUserRequest);
        setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
        toast.success('User updated successfully');
      }
      closeModal();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (u: UserResponse) => {
    setConfirmState({
      isOpen: true,
      title: 'Delete User',
      message: `Are you sure you want to delete "${u.fullName}"? This action cannot be undone.`,
      confirmLabel: 'Delete',
      isLoading: false,
      onConfirm: async () => {
        setConfirmState((prev) => ({ ...prev, isLoading: true }));
        try {
          await adminApi.deleteUser(u.id);
          setUsers((prev) => prev.filter((x) => x.id !== u.id));
          toast.success('User deleted');
          setConfirmState((prev) => ({ ...prev, isOpen: false }));
        } catch (err: any) {
          toast.error(err?.response?.data?.message || 'Failed to delete user');
          setConfirmState((prev) => ({ ...prev, isLoading: false }));
        }
      },
    });
  };

  const handleBecomeTeacher = (u: UserResponse) => {
    setConfirmState({
      isOpen: true,
      title: 'Promote to Teacher',
      message: `Promote "${u.fullName}" to Teacher role?`,
      confirmLabel: 'Promote',
      isLoading: false,
      onConfirm: async () => {
        setConfirmState((prev) => ({ ...prev, isLoading: true }));
        try {
          const updated = await adminApi.becomeTeacher(u.id);
          setUsers((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
          toast.success(`${u.fullName} is now a Teacher`);
          setConfirmState((prev) => ({ ...prev, isOpen: false }));
        } catch (err: any) {
          toast.error(err?.response?.data?.message || 'Failed to promote user');
          setConfirmState((prev) => ({ ...prev, isLoading: false }));
        }
      },
    });
  };

  // ── Guard: not yet authenticated ────────────────────────────────────────────
  if (authLoading) return null;
  if (!isAdmin) return null;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-[#191C1E] mb-1">
            User Management
          </h1>
          <p className="text-[#6F7880] font-medium">
            Manage accounts, roles, and access for all system users.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 signature-gradient text-white px-5 py-3 rounded-xl font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-ambient-md"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            person_add
          </span>
          Add User
        </button>
      </div>

      {/* Table */}
      <UserTable
        users={users}
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onEdit={openEditModal}
        onDelete={handleDelete}
        onBecomeTeacher={handleBecomeTeacher}
      />

      {/* Create / Edit Modal */}
      <UserFormModal
        mode={modalMode ?? 'create'}
        user={editingUser ?? undefined}
        isOpen={modalMode !== null}
        isSubmitting={isSubmitting}
        onClose={closeModal}
        onSubmit={handleFormSubmit}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmLabel={confirmState.confirmLabel}
        isLoading={confirmState.isLoading}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
