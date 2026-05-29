'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { subjectsApi, documentsApi } from '@/lib/api/subjects';
import type { SubjectResponse, DocumentResponse } from '@/lib/types';
import clsx from 'clsx';

const SUBJECT_GRADIENTS = [
  'from-[#00658D] to-[#42A3D7]',
  'from-[#4858AB] to-[#96A5FF]',
  'from-[#006A62] to-[#2EAB9F]',
  'from-[#673AB7] to-[#9575CD]',
  'from-[#FF6B35] to-[#FF9800]',
  'from-[#C2185B] to-[#E91E8C]',
];

const DOC_STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  UPLOADED:  { label: 'Uploaded',  color: 'bg-[#BEC8D0]/30 text-[#44474E]',  icon: 'upload' },
  PARSING:   { label: 'Parsing',   color: 'bg-[#C6E7FF]/50 text-[#004C6B]',  icon: 'sync' },
  CHUNKING:  { label: 'Chunking',  color: 'bg-[#C6E7FF]/50 text-[#004C6B]',  icon: 'sync' },
  EMBEDDING: { label: 'Embedding', color: 'bg-[#DEE0FF]/50 text-[#2F3F92]',  icon: 'sync' },
  SUMMARISING: { label: 'Summarising', color: 'bg-[#DEE0FF]/50 text-[#2F3F92]', icon: 'sync' },
  READY:     { label: 'Ready',     color: 'bg-[#84F5E8]/30 text-[#003934]',   icon: 'check_circle' },
  FAILED:    { label: 'Failed',    color: 'bg-[#FFDAD6]/50 text-[#93000A]',   icon: 'error' },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const isTeacher = user?.roles?.some((r) => r.toUpperCase() === 'TEACHER') ?? false;
  const isAdmin   = user?.roles?.some((r) => r.toUpperCase() === 'ADMIN')   ?? false;
  const canEdit   = isTeacher || isAdmin;
  const [subjects, setSubjects] = useState<SubjectResponse[]>([]);
  const [recentDocs, setRecentDocs] = useState<DocumentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subjectsData, docsData] = await Promise.all([
          subjectsApi.getAll(),
          documentsApi.getAll({ pageSize: 5 }),
        ]);
        setSubjects(subjectsData || []);
        setRecentDocs(docsData?.items || docsData || []);
      } catch {
        // Use empty state if API not available
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const stats = [
    { label: 'Total Subjects', value: subjects.length, icon: 'menu_book', color: 'text-[#00658D]', bg: 'bg-[#C6E7FF]/30' },
    { label: 'Documents', value: recentDocs.length, icon: 'description', color: 'text-[#4858AB]', bg: 'bg-[#DEE0FF]/30' },
    { label: 'AI Sessions', value: 0, icon: 'forum', color: 'text-[#006A62]', bg: 'bg-[#84F5E8]/30' },
    { label: 'Questions', value: 0, icon: 'quiz', color: 'text-[#673AB7]', bg: 'bg-[#E8D5FF]/30' },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">

      {/* Hero Banner */}
      <div className="signature-gradient rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-0 left-1/3 w-60 h-60 rounded-full bg-white blur-3xl" />
        </div>
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <p className="text-white/70 text-sm font-medium uppercase tracking-widest mb-1">Welcome back</p>
            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
              {greeting}, {user?.fullName?.split(' ').slice(-1)[0] || 'Professor'} 👋
            </h1>
            <p className="text-white/80 text-base max-w-md">
              You have{' '}
              <span className="font-bold text-white">{subjects.length} subjects</span> and{' '}
              <span className="font-bold text-white">{recentDocs.length} documents</span> in your workspace.
            </p>
            <div className="flex gap-3 mt-5">
              <Link
                href="/ai-chatbot"
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>forum</span>
                Start AI Chat
              </Link>
              <Link
                href="/subjects"
                className="flex items-center gap-2 bg-white text-[#00658D] px-4 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-ambient"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>menu_book</span>
                View Subjects
              </Link>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-5xl">auto_awesome</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-ambient hover:shadow-ambient-md transition-all fade-in">
            <div className="flex items-center justify-between mb-3">
              <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center', stat.bg)}>
                <span className={clsx('material-symbols-outlined', stat.color)} style={{ fontSize: '20px' }}>
                  {stat.icon}
                </span>
              </div>
            </div>
            <p className="text-2xl font-extrabold text-[#191C1E]">
              {isLoading ? <span className="w-8 h-6 bg-[#ECEEF0] rounded animate-pulse inline-block" /> : stat.value}
            </p>
            <p className="text-xs text-[#6F7880] font-medium mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Subjects */}
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-ambient overflow-hidden">
          <div className="p-6 flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#191C1E]">Your Subjects</h2>
            <Link href="/subjects" className="text-sm font-semibold text-[#00658D] hover:text-[#004C6B] transition-colors flex items-center gap-1">
              View all
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_right</span>
            </Link>
          </div>
          {isLoading ? (
            <div className="px-6 pb-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-[#F2F4F6] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : subjects.length === 0 ? (
            <div className="px-6 pb-8 text-center">
              <span className="material-symbols-outlined text-4xl text-[#BEC8D0] block mb-2">menu_book</span>
              <p className="text-[#6F7880] text-sm">No subjects yet</p>
              <Link href="/subjects" className="text-[#00658D] text-sm font-semibold mt-1 inline-block">Add your first subject →</Link>
            </div>
          ) : (
            <div className="px-4 pb-4 grid grid-cols-1 gap-2">
              {subjects.slice(0, 4).map((subject: SubjectResponse, index: number) => (
                <Link
                  key={subject.id}
                  href={`/subjects/${subject.id}`}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-[#F2F4F6] transition-all group"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${SUBJECT_GRADIENTS[index % SUBJECT_GRADIENTS.length]} flex items-center justify-center text-white shadow-sm flex-shrink-0`}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>menu_book</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#191C1E] truncate">{subject.name}</p>
                    <p className="text-xs text-[#6F7880]">{subject.code}</p>
                  </div>
                  <span className="material-symbols-outlined text-[#BEC8D0] group-hover:text-[#00658D] transition-colors" style={{ fontSize: '16px' }}>chevron_right</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl shadow-ambient p-6">
            <h2 className="text-lg font-bold text-[#191C1E] mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { href: '/ai-chatbot', icon: 'forum', label: 'Ask AI about your docs', color: 'text-[#00658D]', bg: 'bg-[#C6E7FF]/30' },
                { href: '/question-generator', icon: 'quiz', label: 'Generate questions', color: 'text-[#4858AB]', bg: 'bg-[#DEE0FF]/30' },
                ...(canEdit ? [{ href: '/subjects', icon: 'add_circle', label: 'Add new subject', color: 'text-[#006A62]', bg: 'bg-[#84F5E8]/30' }] : []),
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F2F4F6] transition-all group"
                >
                  <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center', action.bg)}>
                    <span className={clsx('material-symbols-outlined', action.color)} style={{ fontSize: '18px' }}>{action.icon}</span>
                  </div>
                  <span className="text-sm font-medium text-[#44474E] group-hover:text-[#191C1E] transition-colors">{action.label}</span>
                  <span className="ml-auto material-symbols-outlined text-[#BEC8D0] group-hover:text-[#6F7880] transition-colors" style={{ fontSize: '16px' }}>chevron_right</span>
                </Link>
              ))}
            </div>
          </div>

          {/* AI Insight Card */}
          <div className="bg-gradient-to-br from-[#DEE0FF]/40 to-[#C6E7FF]/30 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-[#4858AB]" style={{ fontSize: '18px' }}>auto_fix_high</span>
              <span className="text-sm font-bold text-[#4858AB]">AI Insight</span>
            </div>
            <p className="text-sm text-[#27378A] leading-relaxed">
              Upload documents to your subjects to enable AI-powered Q&A and automatic question generation.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Documents */}
      <div className="bg-white rounded-2xl shadow-ambient overflow-hidden">
        <div className="p-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#191C1E]">Recent Documents</h2>
        </div>
        {isLoading ? (
          <div className="px-6 pb-6 space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-[#F2F4F6] rounded-xl animate-pulse" />)}
          </div>
        ) : recentDocs.length === 0 ? (
          <div className="px-6 pb-8 text-center">
            <span className="material-symbols-outlined text-4xl text-[#BEC8D0] block mb-2">description</span>
            <p className="text-[#6F7880] text-sm">No documents uploaded yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F7F9FB]">
                  <th className="text-left text-xs font-semibold text-[#6F7880] uppercase tracking-wider px-6 py-3">Document</th>
                  <th className="text-left text-xs font-semibold text-[#6F7880] uppercase tracking-wider px-4 py-3">Subject</th>
                  <th className="text-left text-xs font-semibold text-[#6F7880] uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-[#6F7880] uppercase tracking-wider px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentDocs.map((doc: DocumentResponse) => {
                  const status = DOC_STATUS_CONFIG[doc.status] || DOC_STATUS_CONFIG.UPLOADED;
                  return (
                    <tr key={doc.id} className="border-t border-[#F2F4F6] hover:bg-[#F7F9FB] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#DEE0FF]/30 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[#4858AB]" style={{ fontSize: '16px' }}>description</span>
                          </div>
                          <span className="text-sm font-medium text-[#191C1E] truncate max-w-xs">{doc.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-[#6F7880]">{doc.subjectName}</td>
                      <td className="px-4 py-4">
                        <span className={clsx('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold', status.color)}>
                          <span className={clsx('material-symbols-outlined', doc.status !== 'READY' && doc.status !== 'FAILED' && doc.status !== 'UPLOADED' ? 'animate-spin' : '')} style={{ fontSize: '12px' }}>{status.icon}</span>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-[#6F7880]">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
