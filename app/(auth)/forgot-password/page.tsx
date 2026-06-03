'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/api/auth';
import AuthShell from '@/components/auth/AuthShell';
import OtpInput from '@/components/auth/OtpInput';
import Spinner from '@/components/auth/Spinner';

const emailSchema = z.object({ email: z.string().email('Invalid email') });
type EmailForm = z.infer<typeof emailSchema>;

const MIN_PASSWORD = 8;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'code' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (step === 'email' || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => (t <= 1 ? 0 : t - 1)), 1000);
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const { register, handleSubmit, formState: { errors } } = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
  });

  const onSendEmail = async (data: EmailForm) => {
    setIsLoading(true);
    try {
      const res = await authApi.forgotPassword(data.email);
      setEmail(data.email);
      setTimeLeft(res.data?.expiresInSeconds ?? 60);
      toast.success('Reset code sent to your email!');
      setStep('code');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to send reset code');
    } finally {
      setIsLoading(false);
    }
  };

  const onResendCode = async () => {
    if (timeLeft > 0 || isResending || !email) return;
    setIsResending(true);
    try {
      const res = await authApi.resendResetCode(email);
      setTimeLeft(res.data?.expiresInSeconds ?? 60);
      toast.success('A new reset code has been sent to your email.');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to resend code');
    } finally {
      setIsResending(false);
    }
  };

  const onVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) { toast.error('Please enter all 6 digits'); return; }
    setIsLoading(true);
    try {
      // verify-reset-code does not consume the code; it is sent again at reset-password.
      await authApi.verifyCode({ email, code });
      setStep('password');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Code is invalid or has expired');
    } finally {
      setIsLoading(false);
    }
  };

  const onResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < MIN_PASSWORD) {
      toast.error(`Password must be at least ${MIN_PASSWORD} characters`);
      return;
    }
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

  const heading =
    step === 'email' ? 'Forgot Password?' : step === 'code' ? 'Enter Reset Code' : 'Set New Password';
  const subheading =
    step === 'email'
      ? "Enter your email and we'll send you a reset code."
      : step === 'code'
        ? `Enter the 6-digit code sent to ${email}.`
        : 'Choose a new password for your account.';

  return (
    <AuthShell
      heroTitle={<>Reset your<br />password</>}
      heroSubtitle="Recover access to your teaching workspace in a few quick steps."
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-[#C6E7FF] mx-auto mb-4 flex items-center justify-center shadow-ambient">
          <span className="material-symbols-outlined text-[#00658D] text-3xl">lock_reset</span>
        </div>
        <h2 className="text-2xl font-extrabold text-[#191C1E] mb-2">{heading}</h2>
        <p className="text-[#6F7880] text-sm">{subheading}</p>
      </div>

      {step === 'email' && (
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
            {isLoading ? <><Spinner />Sending...</> : <><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>send</span>Send Reset Code</>}
          </button>
        </form>
      )}

      {step === 'code' && (
        <form onSubmit={onVerifyCode} className="space-y-6">
          <OtpInput value={code} onChange={setCode} autoFocus />
          <button type="submit" disabled={isLoading} className="w-full signature-gradient text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition-all shadow-ambient-md disabled:opacity-60 flex items-center justify-center gap-2">
            {isLoading ? <><Spinner />Verifying...</> : <><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>verified</span>Verify Code</>}
          </button>
          <div className="text-center text-sm text-[#6F7880]">
            {timeLeft > 0 ? (
              <span>Resend code in <span className="font-semibold text-[#3F484F]">{timeLeft}s</span></span>
            ) : (
              <button type="button" onClick={onResendCode} disabled={isResending} className="text-[#00658D] font-semibold hover:text-[#004C6B] transition-colors disabled:opacity-60">
                {isResending ? 'Sending...' : 'Resend code'}
              </button>
            )}
          </div>
        </form>
      )}

      {step === 'password' && (
        <form onSubmit={onResetPassword} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#3F484F] mb-2">New Password</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} placeholder={`Minimum ${MIN_PASSWORD} characters`} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-white px-4 py-3 pr-11 rounded-xl text-sm border-0 focus:outline-none focus:ring-2 focus:ring-[#00658D]/40 shadow-ambient" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6F7880]"><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{showPassword ? 'visibility_off' : 'visibility'}</span></button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#3F484F] mb-2">Confirm Password</label>
            <input type="password" placeholder="Re-enter new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-white px-4 py-3 rounded-xl text-sm border-0 focus:outline-none focus:ring-2 focus:ring-[#00658D]/40 shadow-ambient" />
          </div>
          <button type="submit" disabled={isLoading} className="w-full signature-gradient text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition-all shadow-ambient-md disabled:opacity-60 flex items-center justify-center gap-2">
            {isLoading ? <><Spinner />Resetting...</> : <><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>lock_reset</span>Reset Password</>}
          </button>
        </form>
      )}

      <p className="text-center text-sm text-[#6F7880] mt-6">
        <Link href="/login" className="text-[#00658D] font-semibold">← Back to sign in</Link>
      </p>
    </AuthShell>
  );
}
