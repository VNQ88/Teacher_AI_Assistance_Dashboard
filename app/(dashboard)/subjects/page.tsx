'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { subjectsApi } from '@/lib/api/subjects';
import type { SubjectResponse } from '@/lib/types';
import clsx from 'clsx';

const SUBJECT_GRADIENTS = [
  'from-[#00658D] to-[#42A3D7]',
  'from-[#4858AB] to-[#96A5FF]',
  'from-[#006A62] to-[#2EAB9F]',
  'from-[#673AB7] to-[#9575CD]',
  'from-[#FF6B35] to-[#FF9800]',
  'from-[#C2185B] to-[#E91E8C]',
];

const SUBJECT_ICONS = ['menu_book', 'science', 'public', 'blur_on', 'insights', 'architecture', 'calculate'];

const subjectSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  code: z.string().min(1, 'Subject code is required'),
  description: z.string().optional(),
});
type SubjectForm = z.infer<typeof subjectSchema>;

export default function SubjectsPage() {
  const { user } = useAuth();
  const isTeacher = user?.roles?.some((r) => r.toUpperCase() === 'TEACHER') ?? false;
  const isAdmin   = user?.roles?.some((r) => r.toUpperCase() === 'ADMIN')   ?? false;
  const canEdit   = isTeacher || isAdmin;
  const [subjects, setSubjects] = useState<SubjectResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SubjectForm>({
    resolver: zodResolver(subjectSchema),
  });

  const fetchSubjects = async () => {
    try {
      const data = await subjectsApi.getAll();
      setSubjects(data || []);
    } catch {
      toast.error('Failed to load subjects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchSubjects(); }, []);

  const openModal = (subject?: SubjectResponse) => {
    setEditingSubject(subject || null);
    reset(subject ? { name: subject.name, code: subject.code, description: subject.description } : {});
    setIsModalOpen(true);
  };

  const onSubmit = async (data: SubjectForm) => {
    setIsSubmitting(true);
    try {
      if (editingSubject) {
        const updated = await subjectsApi.update(editingSubject.id, data);
        setSubjects((prev: SubjectResponse[]) => prev.map((s: SubjectResponse) => (s.id === updated.id ? updated : s)));
        toast.success('Subject updated!');
      } else {
        const created = await subjectsApi.create(data);
        setSubjects((prev: SubjectResponse[]) => [created, ...prev]);
        toast.success('Subject created!');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (subject: SubjectResponse) => {
    if (!confirm(`Delete "${subject.name}"? This cannot be undone.`)) return;
    try {
      await subjectsApi.delete(subject.id);
      setSubjects((prev: SubjectResponse[]) => prev.filter((s: SubjectResponse) => s.id !== subject.id));
      toast.success('Subject deleted');
    } catch {
      toast.error('Failed to delete subject');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-[#191C1E] mb-1">Subjects</h1>
          <p className="text-[#6F7880] font-medium">Manage your academic curriculum and AI-powered resources.</p>
        </div>
        {canEdit && (
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 signature-gradient text-white px-5 py-3 rounded-xl font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-ambient-md"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
            New Subject
          </button>
        )}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-3xl h-64 animate-pulse shadow-ambient" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {subjects.map((subject: SubjectResponse, index: number) => (
            <div
              key={subject.id}
              className="group bg-white rounded-3xl overflow-hidden shadow-ambient hover:shadow-ambient-md transition-all duration-300 hover:-translate-y-1 flex flex-col"
            >
              {/* Subject Card Header */}
              <div className={`h-28 bg-gradient-to-br ${SUBJECT_GRADIENTS[index % SUBJECT_GRADIENTS.length]} relative p-5`}>
                {canEdit && (
                  <div className="absolute top-3 right-3">
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.preventDefault(); openModal(subject); }}
                        className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                      >
                        <span className="material-symbols-outlined text-white" style={{ fontSize: '14px' }}>edit</span>
                      </button>
                      <button
                        onClick={(e) => { e.preventDefault(); handleDelete(subject); }}
                        className="p-1.5 rounded-lg bg-white/20 hover:bg-red-400/40 transition-colors"
                      >
                        <span className="material-symbols-outlined text-white" style={{ fontSize: '14px' }}>delete</span>
                      </button>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-3 left-3 bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider">
                  {subject.code}
                </div>
                <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-white">
                  <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                    {SUBJECT_ICONS[index % SUBJECT_ICONS.length]}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-[#191C1E] mb-1 truncate">{subject.name}</h3>
                <p className="text-[#6F7880] text-sm line-clamp-2 mb-4 flex-1">
                  {subject.description || 'No description provided.'}
                </p>
                <div className="flex gap-2 mt-auto">
                  <Link
                    href={`/subjects/${subject.id}`}
                    className="flex-1 py-2.5 bg-[#F2F4F6] hover:bg-[#ECEEF0] text-[#191C1E] font-bold text-sm rounded-xl text-center transition-colors"
                  >
                    View Details
                  </Link>
                  <Link
                    href={`/ai-chatbot?subjectId=${subject.id}`}
                    className="py-2.5 px-4 bg-[#DEE0FF]/60 hover:bg-[#DEE0FF] text-[#27378A] font-bold text-sm rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chat</span>
                    Chat AI
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {/* Add Ghost Card */}
          {canEdit && (
            <button
              onClick={() => openModal()}
              className="group border-2 border-dashed border-[#BEC8D0]/40 hover:border-[#00658D]/50 rounded-3xl p-10 text-center transition-all duration-300 flex flex-col items-center justify-center bg-[#F7F9FB] hover:bg-[#F2F4F6]"
            >
              <div className="w-14 h-14 rounded-full bg-[#ECEEF0] group-hover:bg-[#C6E7FF]/40 flex items-center justify-center mb-3 transition-all">
                <span className="material-symbols-outlined text-[#6F7880] group-hover:text-[#00658D] transition-colors text-3xl">add</span>
              </div>
              <h3 className="text-base font-bold text-[#191C1E]">Add New Subject</h3>
              <p className="text-[#6F7880] text-sm mt-1">Initialize an AI-powered academic track</p>
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 fade-in">
          <div className="bg-white rounded-3xl shadow-ambient-md w-full max-w-md p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#191C1E]">
                {editingSubject ? 'Edit Subject' : 'Create New Subject'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full hover:bg-[#F2F4F6] flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-[#6F7880]" style={{ fontSize: '18px' }}>close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#3F484F] mb-2">Subject Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Advanced Biochemistry"
                  className={`w-full bg-[#F7F9FB] px-4 py-3 rounded-xl text-sm border-0 focus:outline-none focus:ring-2 focus:ring-[#00658D]/40 transition-all ${errors.name ? 'ring-2 ring-[#BA1A1A]/50' : ''}`}
                  {...register('name')}
                />
                {errors.name && <p className="text-[#BA1A1A] text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#3F484F] mb-2">Subject Code *</label>
                <input
                  type="text"
                  placeholder="e.g. BIO401"
                  className={`w-full bg-[#F7F9FB] px-4 py-3 rounded-xl text-sm border-0 focus:outline-none focus:ring-2 focus:ring-[#00658D]/40 transition-all ${errors.code ? 'ring-2 ring-[#BA1A1A]/50' : ''}`}
                  {...register('code')}
                />
                {errors.code && <p className="text-[#BA1A1A] text-xs mt-1">{errors.code.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#3F484F] mb-2">Description</label>
                <textarea
                  rows={3}
                  placeholder="Brief overview of the subject..."
                  className="w-full bg-[#F7F9FB] px-4 py-3 rounded-xl text-sm border-0 focus:outline-none focus:ring-2 focus:ring-[#00658D]/40 transition-all resize-none"
                  {...register('description')}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-[#F2F4F6] text-[#44474E] font-semibold rounded-xl hover:bg-[#ECEEF0] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 signature-gradient text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Saving...</> : editingSubject ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
