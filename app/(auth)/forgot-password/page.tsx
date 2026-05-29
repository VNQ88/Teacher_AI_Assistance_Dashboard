'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/api/auth';

const emailSchema = z.object({ email: z.string().email('Invalid email') });
type EmailForm = z.infer<typeof emailSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
  });

  const onSendEmail = async (data: EmailForm) => {
    setIsLoading(true);
    try {
      await authApi.forgotPassword(data.email);
      setEmail(data.email);
      toast.success('Reset code sent to your email!');
      setStep('reset');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to send reset code');
    } finally {
      setIsLoading(false);
    }
  };

  const onResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { toast.error("Passwords don't match"); return; }
    setIsLoading(true);
    try {
      await authApi.setNewPassword({ email, code, newPassword, confirmPassword });
      toast.success('Password reset successfully!');
      router.push('/login');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F9FB] p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#C6E7FF] mx-auto mb-4 flex items-center justify-center shadow-ambient">
            <span className="material-symbols-outlined text-[#00658D] text-3xl">lock_reset</span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#191C1E] mb-2">
            {step === 'email' ? 'Forgot Password?' : 'Set New Password'}
          </h2>
          <p className="text-[#6F7880] text-sm">
            {step === 'email'
              ? "Enter your email and we'll send you a reset code."
              : `Enter the code sent to ${email} and your new password.`}
          </p>
        </div>

        {step === 'email' ? (
          <form onSubmit={handleSubmit(onSendEmail)} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#3F484F] mb-2">Email</label>
              <input
                type="email"
                placeholder="you@university.edu"
                className={`w-full bg-white px-4 py-3 rounded-xl text-sm border-0 focus:outline-none focus:ring-2 focus:ring-[#00658D]/40 shadow-ambient ${errors.email ? 'ring-2 ring-[#BA1A1A]/50' : ''}`}
                {...register('email')}
              />
              {errors.email && <p className="text-[#BA1A1A] text-xs mt-1">{errors.email.message}</p>}
            </div>
            <button type="submit" disabled={isLoading} className="w-full signature-gradient text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition-all shadow-ambient-md disabled:opacity-60 flex items-center justify-center gap-2">
              {isLoading ? <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Sending...</> : <><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>send</span>Send Reset Code</>}
            </button>
          </form>
        ) : (
          <form onSubmit={onResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#3F484F] mb-2">Verification Code</label>
              <input type="text" placeholder="Enter 6-digit code" value={code} onChange={(e) => setCode(e.target.value)} className="w-full bg-white px-4 py-3 rounded-xl text-sm border-0 focus:outline-none focus:ring-2 focus:ring-[#00658D]/40 shadow-ambient tracking-widest font-bold text-center text-lg" maxLength={6} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#3F484F] mb-2">New Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} placeholder="Minimum 5 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-white px-4 py-3 pr-11 rounded-xl text-sm border-0 focus:outline-none focus:ring-2 focus:ring-[#00658D]/40 shadow-ambient" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6F7880]"><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{showPassword ? 'visibility_off' : 'visibility'}</span></button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#3F484F] mb-2">Confirm Password</label>
              <input type="password" placeholder="Re-enter new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-white px-4 py-3 rounded-xl text-sm border-0 focus:outline-none focus:ring-2 focus:ring-[#00658D]/40 shadow-ambient" />
            </div>
            <button type="submit" disabled={isLoading} className="w-full signature-gradient text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition-all shadow-ambient-md disabled:opacity-60 flex items-center justify-center gap-2">
              {isLoading ? <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Resetting...</> : <><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>lock_reset</span>Reset Password</>}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-[#6F7880] mt-6">
          <Link href="/login" className="text-[#00658D] font-semibold">← Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
