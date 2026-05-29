'use client';

import { useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/api/auth';

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const isActivation = searchParams.get('type') === 'activate';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    pasted.split('').forEach((char, i) => { newOtp[i] = char; });
    setOtp(newOtp);
    const nextIndex = Math.min(pasted.length, 5);
    inputsRef.current[nextIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) { toast.error('Please enter all 6 digits'); return; }
    setIsLoading(true);
    try {
      if (isActivation) {
        await authApi.activateAccount(code);
      } else {
        await authApi.verifyCode({ email, code });
      }
      toast.success('Email verified! You can now sign in.');
      router.push('/login');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Invalid code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F9FB] p-6">
      <div className="w-full max-w-sm">
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
          <div className="flex gap-3 justify-center">
            {otp.map((digit: string, index: number) => (
              <input
                key={index}
                ref={(el) => { inputsRef.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-14 text-center text-xl font-bold bg-white rounded-xl shadow-ambient focus:outline-none focus:ring-2 focus:ring-[#00658D]/40 text-[#191C1E] transition-all"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full signature-gradient text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition-all shadow-ambient-md disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Verifying...</>
            ) : (
              <><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>verified</span>Verify Email</>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-[#6F7880] mt-6">
          <Link href="/login" className="text-[#00658D] font-semibold">← Back to sign in</Link>
        </p>
      </div>
    </div>
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
