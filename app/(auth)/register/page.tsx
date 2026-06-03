'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/api/auth';
import AuthShell from '@/components/auth/AuthShell';
import Spinner from '@/components/auth/Spinner';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      const res = await authApi.register({ email: data.email, password: data.password, fullName: data.fullName });
      const expiresInSeconds = res.data?.expiresInSeconds ?? 120;
      toast.success(
        res.data?.resent
          ? 'Account already exists but not activated. A new code has been sent.'
          : 'Account created! Please check your email for verification.'
      );
      router.push(`/verify-otp?email=${encodeURIComponent(data.email)}&type=activate&expires=${expiresInSeconds}`);
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      heroTitle={<>Start your AI-powered<br />teaching journey</>}
      heroSubtitle="Join thousands of educators using AI to create better learning experiences."
    >
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-[#191C1E] tracking-tight mb-2">Create account</h2>
        <p className="text-[#6F7880] text-sm">Get started with your teaching workspace</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-[#3F484F] mb-2">Full Name</label>
              <input
                type="text"
                placeholder="Prof. Nguyen Van A"
                className={`w-full bg-white px-4 py-3 rounded-xl text-sm border-0 focus:outline-none focus:ring-2 focus:ring-[#00658D]/40 shadow-ambient transition-all ${errors.fullName ? 'ring-2 ring-[#BA1A1A]/50' : ''}`}
                {...register('fullName')}
              />
              {errors.fullName && <p className="text-[#BA1A1A] text-xs mt-1">{errors.fullName.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-[#3F484F] mb-2">Email</label>
              <input
                type="email"
                placeholder="you@university.edu"
                className={`w-full bg-white px-4 py-3 rounded-xl text-sm border-0 focus:outline-none focus:ring-2 focus:ring-[#00658D]/40 shadow-ambient transition-all ${errors.email ? 'ring-2 ring-[#BA1A1A]/50' : ''}`}
                {...register('email')}
              />
              {errors.email && <p className="text-[#BA1A1A] text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-[#3F484F] mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 8 characters"
                  className={`w-full bg-white px-4 py-3 pr-11 rounded-xl text-sm border-0 focus:outline-none focus:ring-2 focus:ring-[#00658D]/40 shadow-ambient transition-all ${errors.password ? 'ring-2 ring-[#BA1A1A]/50' : ''}`}
                  {...register('password')}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6F7880]">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              {errors.password && <p className="text-[#BA1A1A] text-xs mt-1">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-[#3F484F] mb-2">Confirm Password</label>
              <input
                type="password"
                placeholder="Re-enter your password"
                className={`w-full bg-white px-4 py-3 rounded-xl text-sm border-0 focus:outline-none focus:ring-2 focus:ring-[#00658D]/40 shadow-ambient transition-all ${errors.confirmPassword ? 'ring-2 ring-[#BA1A1A]/50' : ''}`}
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && <p className="text-[#BA1A1A] text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full signature-gradient text-white font-bold py-3.5 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-ambient-md disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <><Spinner />Creating account...</>
              ) : (
                <><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person_add</span>Create Account</>
              )}
            </button>

            {/* Google (placeholder) */}
            <div className="flex items-center gap-3"><div className="flex-1 h-px bg-[#BEC8D0]/50" /><span className="text-xs text-[#6F7880]">or</span><div className="flex-1 h-px bg-[#BEC8D0]/50" /></div>
            <button type="button" disabled className="w-full bg-white text-[#44474E] font-semibold py-3.5 rounded-xl shadow-ambient flex items-center justify-center gap-3 opacity-60 cursor-not-allowed">
              <svg viewBox="0 0 24 24" className="w-4 h-4"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google <span className="text-xs text-[#BEC8D0]">(coming soon)</span>
            </button>
          </form>

      <p className="text-center text-sm text-[#6F7880] mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-[#00658D] font-semibold hover:text-[#004C6B] transition-colors">Sign in</Link>
      </p>
    </AuthShell>
  );
}
