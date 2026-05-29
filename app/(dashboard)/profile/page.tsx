'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { userApi } from '@/lib/api/questions';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
});

const passwordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

function getInitials(fullName: string): string {
  return fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: user?.fullName ?? '', email: user?.email ?? '' },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  // Sync form default values once user loads
  useEffect(() => {
    if (user) resetProfile({ fullName: user.fullName, email: user.email });
  }, [user, resetProfile]);

  const onUpdateProfile = async (data: ProfileForm) => {
    if (!user?.id) return;
    setIsUpdatingProfile(true);
    try {
      const updated = await userApi.updateProfile(user.id, data);
      setUser(updated);
      toast.success('Profile updated successfully');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to update profile';
      toast.error(message);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onChangePassword = async (data: PasswordForm) => {
    setIsChangingPassword(true);
    try {
      await userApi.changePassword(data);
      resetPassword();
      toast.success('Password changed successfully');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to change password';
      toast.error(message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#191C1E]">My Profile</h1>
        <p className="text-sm text-[#6F7880] mt-1">Manage your account information and security</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-ambient p-6 flex flex-col items-center text-center">
            {/* Avatar */}
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.fullName}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-white shadow-md mb-4"
              />
            ) : (
              <div className="w-24 h-24 rounded-full signature-gradient flex items-center justify-center text-white text-2xl font-bold shadow-md mb-4">
                {user ? getInitials(user.fullName) : 'AI'}
              </div>
            )}

            {/* Name & Email */}
            <h2 className="text-lg font-bold text-[#191C1E]">{user?.fullName || '—'}</h2>
            <p className="text-sm text-[#6F7880] mt-0.5">{user?.email || '—'}</p>

            {/* Role Badges */}
            {user?.roles && user.roles.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {user.roles.map((role, i) => (
                  <span
                    key={role}
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      i === 0
                        ? 'bg-[#00658D]/10 text-[#00658D]'
                        : 'bg-[#4858AB]/10 text-[#4858AB]'
                    }`}
                  >
                    {role}
                  </span>
                ))}
              </div>
            )}

            {/* Account status */}
            <div className="mt-5 pt-5 border-t border-[#BEC8D0]/20 w-full">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#6F7880]">Account status</span>
                <span
                  className={`flex items-center gap-1.5 font-semibold ${
                    user?.enabled ? 'text-[#006A62]' : 'text-[#BA1A1A]'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      user?.enabled ? 'bg-[#006A62]' : 'bg-[#BA1A1A]'
                    }`}
                  />
                  {user?.enabled ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Forms */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Edit Info Form */}
          <div className="bg-white rounded-2xl shadow-ambient p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-[#00658D]/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#00658D]" style={{ fontSize: '20px' }}>
                  edit
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-[#191C1E]">Personal Information</h3>
                <p className="text-xs text-[#6F7880]">Update your display name</p>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-[#3F484F] mb-2">Email</label>
                <input
                  type="email"
                  placeholder="you@university.edu"
                  className={`w-full bg-[#F7F9FB] px-4 py-3 rounded-xl text-sm text-[#191C1E] placeholder-[#BEC8D0] border-0 focus:outline-none focus:ring-2 focus:ring-[#00658D]/40 shadow-ambient transition-all ${
                    profileErrors.email ? 'ring-2 ring-[#BA1A1A]/50' : ''
                  }`}
                  {...registerProfile('email')}
                />
                {profileErrors.email && (
                  <p className="text-[#BA1A1A] text-xs mt-1.5">{profileErrors.email.message}</p>
                )}
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-[#3F484F] mb-2">Full Name</label>
                <input
                  type="text"
                  placeholder="Your full name"
                  className={`w-full bg-[#F7F9FB] px-4 py-3 rounded-xl text-sm text-[#191C1E] placeholder-[#BEC8D0] border-0 focus:outline-none focus:ring-2 focus:ring-[#00658D]/40 shadow-ambient transition-all ${
                    profileErrors.fullName ? 'ring-2 ring-[#BA1A1A]/50' : ''
                  }`}
                  {...registerProfile('fullName')}
                />
                {profileErrors.fullName && (
                  <p className="text-[#BA1A1A] text-xs mt-1.5">{profileErrors.fullName.message}</p>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="signature-gradient text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center gap-2"
                >
                  {isUpdatingProfile ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-white rounded-2xl shadow-ambient p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-[#4858AB]/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#4858AB]" style={{ fontSize: '20px' }}>
                  lock
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-[#191C1E]">Change Password</h3>
                <p className="text-xs text-[#6F7880]">Keep your account secure</p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit(onChangePassword)} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#3F484F] mb-2">Current Password</label>
                <input
                  type="password"
                  placeholder="Enter current password"
                  className={`w-full bg-[#F7F9FB] px-4 py-3 rounded-xl text-sm text-[#191C1E] placeholder-[#BEC8D0] border-0 focus:outline-none focus:ring-2 focus:ring-[#00658D]/40 shadow-ambient transition-all ${
                    passwordErrors.oldPassword ? 'ring-2 ring-[#BA1A1A]/50' : ''
                  }`}
                  {...registerPassword('oldPassword')}
                />
                {passwordErrors.oldPassword && (
                  <p className="text-[#BA1A1A] text-xs mt-1.5">{passwordErrors.oldPassword.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#3F484F] mb-2">New Password</label>
                <input
                  type="password"
                  placeholder="At least 8 characters"
                  className={`w-full bg-[#F7F9FB] px-4 py-3 rounded-xl text-sm text-[#191C1E] placeholder-[#BEC8D0] border-0 focus:outline-none focus:ring-2 focus:ring-[#00658D]/40 shadow-ambient transition-all ${
                    passwordErrors.newPassword ? 'ring-2 ring-[#BA1A1A]/50' : ''
                  }`}
                  {...registerPassword('newPassword')}
                />
                {passwordErrors.newPassword && (
                  <p className="text-[#BA1A1A] text-xs mt-1.5">{passwordErrors.newPassword.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#3F484F] mb-2">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Re-enter new password"
                  className={`w-full bg-[#F7F9FB] px-4 py-3 rounded-xl text-sm text-[#191C1E] placeholder-[#BEC8D0] border-0 focus:outline-none focus:ring-2 focus:ring-[#00658D]/40 shadow-ambient transition-all ${
                    passwordErrors.confirmPassword ? 'ring-2 ring-[#BA1A1A]/50' : ''
                  }`}
                  {...registerPassword('confirmPassword')}
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-[#BA1A1A] text-xs mt-1.5">{passwordErrors.confirmPassword.message}</p>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="bg-[#4858AB] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center gap-2"
                >
                  {isChangingPassword ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Updating...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
