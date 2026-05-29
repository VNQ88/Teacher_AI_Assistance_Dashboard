'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { UserResponse, AdminCreateUserRequest, AdminUpdateUserRequest } from '@/lib/types';

// ── Schemas ──────────────────────────────────────────────────────────────────

const createSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  fullName: z.string().min(1, 'Full name is required').max(100),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['ADMIN', 'TEACHER', 'STUDENT']).refine((v) => !!v, { message: 'Role is required' }),
});

const editSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100),
  email: z.string().email('Invalid email format').max(100).optional().or(z.literal('')),
  avatar: z.string().max(255).optional().or(z.literal('')),
});

type CreateForm = z.infer<typeof createSchema>;
type EditForm = z.infer<typeof editSchema>;

// ── Props ─────────────────────────────────────────────────────────────────────

interface UserFormModalProps {
  mode: 'create' | 'edit';
  user?: UserResponse;
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (data: AdminCreateUserRequest | AdminUpdateUserRequest) => Promise<void>;
}

// ── Shared field style ────────────────────────────────────────────────────────

const fieldClass = (hasError?: boolean) =>
  `w-full bg-[#F7F9FB] px-4 py-3 rounded-xl text-sm border-0 focus:outline-none focus:ring-2 transition-all ${
    hasError ? 'ring-2 ring-[#BA1A1A]/50' : 'focus:ring-[#00658D]/40'
  }`;

// ── Component ─────────────────────────────────────────────────────────────────

export default function UserFormModal({
  mode,
  user,
  isOpen,
  isSubmitting,
  onClose,
  onSubmit,
}: UserFormModalProps) {
  const isEdit = mode === 'edit';

  const createForm = useForm<CreateForm>({ resolver: zodResolver(createSchema) });
  const editForm = useForm<EditForm>({ resolver: zodResolver(editSchema) });

  const { register: regCreate, handleSubmit: handleCreate, reset: resetCreate, formState: { errors: errCreate } } = createForm;
  const { register: regEdit, handleSubmit: handleEdit, reset: resetEdit, formState: { errors: errEdit } } = editForm;

  useEffect(() => {
    if (!isOpen) return;
    if (isEdit && user) {
      resetEdit({ fullName: user.fullName, email: user.email ?? '', avatar: user.avatar ?? '' });
    } else {
      resetCreate({ email: '', fullName: '', password: '', role: undefined });
    }
  }, [isOpen, isEdit, user, resetCreate, resetEdit]);

  if (!isOpen) return null;

  const handleCreateSubmit = async (data: CreateForm) => {
    await onSubmit(data as AdminCreateUserRequest);
  };

  const handleEditSubmit = async (data: EditForm) => {
    const payload: AdminUpdateUserRequest = {
      fullName: data.fullName,
      ...(data.email ? { email: data.email } : {}),
      ...(data.avatar ? { avatar: data.avatar } : {}),
    };
    await onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 fade-in">
      <div className="bg-white rounded-3xl shadow-ambient-md w-full max-w-md p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#191C1E]">
              {isEdit ? 'Edit User' : 'Create New User'}
            </h2>
            <p className="text-xs text-[#6F7880] mt-0.5">
              {isEdit ? 'Update profile information' : 'Add a new account to the system'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#F2F4F6] flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[#6F7880]" style={{ fontSize: '18px' }}>close</span>
          </button>
        </div>

        {/* Create Form */}
        {!isEdit && (
          <form onSubmit={handleCreate(handleCreateSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#3F484F] mb-2">Email *</label>
              <input
                type="email"
                placeholder="user@example.com"
                className={fieldClass(!!errCreate.email)}
                {...regCreate('email')}
              />
              {errCreate.email && <p className="text-[#BA1A1A] text-xs mt-1">{errCreate.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#3F484F] mb-2">Full Name *</label>
              <input
                type="text"
                placeholder="Nguyen Van A"
                className={fieldClass(!!errCreate.fullName)}
                {...regCreate('fullName')}
              />
              {errCreate.fullName && <p className="text-[#BA1A1A] text-xs mt-1">{errCreate.fullName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#3F484F] mb-2">Password *</label>
              <input
                type="password"
                placeholder="Min. 8 characters"
                className={fieldClass(!!errCreate.password)}
                {...regCreate('password')}
              />
              {errCreate.password && <p className="text-[#BA1A1A] text-xs mt-1">{errCreate.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#3F484F] mb-2">Role *</label>
              <select
                className={fieldClass(!!errCreate.role)}
                {...regCreate('role')}
              >
                <option value="">Select a role...</option>
                <option value="TEACHER">Teacher</option>
                <option value="STUDENT">Student</option>
                <option value="ADMIN">Admin</option>
              </select>
              {errCreate.role && <p className="text-[#BA1A1A] text-xs mt-1">{errCreate.role.message}</p>}
            </div>

            <FormActions isSubmitting={isSubmitting} onClose={onClose} label="Create User" />
          </form>
        )}

        {/* Edit Form */}
        {isEdit && (
          <form onSubmit={handleEdit(handleEditSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#3F484F] mb-2">Full Name *</label>
              <input
                type="text"
                placeholder="Nguyen Van A"
                className={fieldClass(!!errEdit.fullName)}
                {...regEdit('fullName')}
              />
              {errEdit.fullName && <p className="text-[#BA1A1A] text-xs mt-1">{errEdit.fullName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#3F484F] mb-2">Email</label>
              <input
                type="email"
                placeholder="user@example.com"
                className={fieldClass(!!errEdit.email)}
                {...regEdit('email')}
              />
              {errEdit.email && <p className="text-[#BA1A1A] text-xs mt-1">{errEdit.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#3F484F] mb-2">Avatar URL</label>
              <input
                type="url"
                placeholder="https://..."
                className={fieldClass(!!errEdit.avatar)}
                {...regEdit('avatar')}
              />
              {errEdit.avatar && <p className="text-[#BA1A1A] text-xs mt-1">{errEdit.avatar.message}</p>}
            </div>

            <FormActions isSubmitting={isSubmitting} onClose={onClose} label="Save Changes" />
          </form>
        )}
      </div>
    </div>
  );
}

function FormActions({
  isSubmitting,
  onClose,
  label,
}: {
  isSubmitting: boolean;
  onClose: () => void;
  label: string;
}) {
  return (
    <div className="flex gap-3 pt-2">
      <button
        type="button"
        onClick={onClose}
        disabled={isSubmitting}
        className="flex-1 py-3 bg-[#F2F4F6] text-[#44474E] font-semibold rounded-xl hover:bg-[#ECEEF0] transition-colors disabled:opacity-60 text-sm"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex-1 py-3 signature-gradient text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2 text-sm"
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Saving...
          </>
        ) : (
          label
        )}
      </button>
    </div>
  );
}
