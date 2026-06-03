'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/api/auth';
import AuthShell from '@/components/auth/AuthShell';
import OtpInput from '@/components/auth/OtpInput';
import Spinner from '@/components/auth/Spinner';

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const initialExpires = Number(searchParams.get('expires')) || 60;
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(initialExpires);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => (t <= 1 ? 0 : t - 1)), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleResend = async () => {
    if (timeLeft > 0 || isResending || !email) return;
    setIsResending(true);
    try {
      const res = await authApi.resendActivationCode(email);
      setTimeLeft(res.data?.expiresInSeconds ?? 60);
      toast.success('A new code has been sent to your email.');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to resend code.');
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) { toast.error('Please enter all 6 digits'); return; }
    setIsLoading(true);
    try {
      await authApi.activateAccount(code);
      toast.success('Account activated! You can now sign in.');
      router.push('/login');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Invalid code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      heroTitle={<>Almost<br />there</>}
      heroSubtitle="Confirm your email to unlock your AI-powered teaching workspace."
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl signature-gradient mx-auto mb-4 flex items-center justify-center shadow-ambient-md">
          <span className="material-symbols-outlined text-white text-3xl">mark_email_read</span>
        </div>
        <h2 className="text-2xl font-extrabold text-[#191C1E] mb-2">Verify your email</h2>
        <p className="text-[#6F7880] text-sm">
          We sent a 6-digit code to<br />
          <span className="font-semibold text-[#3F484F]">{email || 'your email'}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <OtpInput value={code} onChange={setCode} autoFocus />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full signature-gradient text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition-all shadow-ambient-md disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <><Spinner />Verifying...</>
          ) : (
            <><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>verified</span>Verify Email</>
          )}
        </button>
      </form>

      <div className="text-center text-sm text-[#6F7880] mt-6">
        {timeLeft > 0 ? (
          <span>Resend code in <span className="font-semibold text-[#3F484F]">{timeLeft}s</span></span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="text-[#00658D] font-semibold hover:text-[#004C6B] transition-colors disabled:opacity-60"
          >
            {isResending ? 'Sending...' : 'Resend code'}
          </button>
        )}
      </div>

      <p className="text-center text-sm text-[#6F7880] mt-4">
        <Link href="/login" className="text-[#00658D] font-semibold">← Back to sign in</Link>
      </p>
    </AuthShell>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9FB]">
        <div className="w-8 h-8 border-2 border-[#00658D] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <VerifyOtpContent />
    </Suspense>
  );
}
