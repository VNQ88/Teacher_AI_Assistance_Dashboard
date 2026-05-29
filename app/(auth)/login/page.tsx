'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/api/auth';
import type { Metadata } from 'next';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(5, 'Password must be at least 5 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      await authApi.login(data);
      toast.success('Welcome back!');
      router.push('/');
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Login failed. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Hero Column */}
      <div className="hidden lg:flex lg:w-1/2 signature-gradient flex-col justify-between p-12 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-32 right-10 w-96 h-96 rounded-full bg-white blur-3xl" />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <span className="material-symbols-outlined text-white" style={{ fontSize: '22px' }}>
                auto_awesome
              </span>
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">The Curator</h1>
              <p className="text-white/60 text-xs font-medium uppercase tracking-widest">AI Assistant</p>
            </div>
          </div>
        </div>

        {/* Center content */}
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
              Empower your<br />teaching with AI
            </h2>
            <p className="text-white/75 text-lg leading-relaxed">
              Manage your curriculum, chat with AI about your documents, and generate assessment questions automatically.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-col gap-3">
            {[
              { icon: 'chat', label: 'RAG-powered AI Chatbot' },
              { icon: 'quiz', label: 'Auto Question Generation' },
              { icon: 'menu_book', label: 'Smart Document Management' },
            ].map((feature) => (
              <div
                key={feature.label}
                className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3"
              >
                <span className="material-symbols-outlined text-white/90" style={{ fontSize: '18px' }}>
                  {feature.icon}
                </span>
                <span className="text-white/90 text-sm font-medium">{feature.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom credit */}
        <div className="relative z-10">
          <p className="text-white/40 text-xs">© 2024 Teacher AI Assistance Platform</p>
        </div>
      </div>

      {/* Right Form Column */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#F7F9FB]">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl signature-gradient flex items-center justify-center">
              <span className="material-symbols-outlined text-white" style={{ fontSize: '16px' }}>auto_awesome</span>
            </div>
            <span className="text-base font-black text-[#00658D]">The Curator</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-[#191C1E] tracking-tight mb-2">
              Welcome back
            </h2>
            <p className="text-[#6F7880] text-sm">Sign in to your teaching workspace</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-[#3F484F] mb-2">Email</label>
              <input
                type="email"
                placeholder="you@university.edu"
                className={`w-full bg-white px-4 py-3 rounded-xl text-sm text-[#191C1E] placeholder-[#BEC8D0] border-0 focus:outline-none focus:ring-2 focus:ring-[#00658D]/40 shadow-ambient transition-all ${
                  errors.email ? 'ring-2 ring-[#BA1A1A]/50' : ''
                }`}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-[#BA1A1A] text-xs mt-1.5 flex items-center gap-1">
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>error</span>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-[#3F484F]">Password</label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-[#00658D] hover:text-[#004C6B] font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className={`w-full bg-white px-4 py-3 pr-11 rounded-xl text-sm text-[#191C1E] placeholder-[#BEC8D0] border-0 focus:outline-none focus:ring-2 focus:ring-[#00658D]/40 shadow-ambient transition-all ${
                    errors.password ? 'ring-2 ring-[#BA1A1A]/50' : ''
                  }`}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6F7880] hover:text-[#3F484F] transition-colors"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {errors.password && (
                <p className="text-[#BA1A1A] text-xs mt-1.5 flex items-center gap-1">
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>error</span>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full signature-gradient text-white font-bold py-3.5 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all duration-150 shadow-ambient-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>login</span>
                  Sign In
                </>
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-[#BEC8D0]/50" />
              <span className="text-xs text-[#6F7880] font-medium">or</span>
              <div className="flex-1 h-px bg-[#BEC8D0]/50" />
            </div>

            {/* Google OAuth (placeholder for future) */}
            <button
              type="button"
              disabled
              className="w-full bg-white border-0 text-[#44474E] font-semibold py-3.5 rounded-xl hover:bg-[#F2F4F6] transition-all duration-150 shadow-ambient flex items-center justify-center gap-3 opacity-60 cursor-not-allowed"
              title="Coming soon"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" role="img">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
              <span className="text-xs text-[#BEC8D0] font-normal">(coming soon)</span>
            </button>
          </form>

          {/* Register Link */}
          <p className="text-center text-sm text-[#6F7880] mt-8">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-[#00658D] font-semibold hover:text-[#004C6B] transition-colors">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
