'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { subjectsApi, documentsApi } from '@/lib/api/subjects';
import type { SubjectResponse, DocumentResponse, UpdateDocumentRequest } from '@/lib/types';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const DOC_STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  UPLOADED: { label: 'Uploaded', color: 'bg-[#BEC8D0]/30 text-[#44474E]', icon: 'upload' },
  PARSING: { label: 'Parsing', color: 'bg-[#C6E7FF]/50 text-[#004C6B]', icon: 'sync' },
  CHUNKING: { label: 'Chunking', color: 'bg-[#C6E7FF]/50 text-[#004C6B]', icon: 'sync' },
  EMBEDDING: { label: 'Embedding', color: 'bg-[#DEE0FF]/50 text-[#2F3F92]', icon: 'sync' },
  SUMMARISING: { label: 'Summarising', color: 'bg-[#DEE0FF]/50 text-[#2F3F92]', icon: 'sync' },
  READY: { label: 'Ready', color: 'bg-[#84F5E8]/30 text-[#003934]', icon: 'check_circle' },
  FAILED: { label: 'Failed', color: 'bg-[#FFDAD6]/50 text-[#93000A]', icon: 'error' },
};

export default function SubjectDetailPage() {
  const { user } = useAuth();
  const isTeacher = user?.roles?.some((r) => r.toUpperCase() === 'TEACHER') ?? false;
  const isAdmin   = user?.roles?.some((r) => r.toUpperCase() === 'ADMIN')   ?? false;
  const canEdit   = isTeacher || isAdmin;
  const params = useParams();
  const subjectId = Number(params.id);

  const [subject, setSubject] = useState<SubjectResponse | null>(null);
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Documents');

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    file: null as File | null,
  });

  const [documentUrlToView, setDocumentUrlToView] = useState<string | null>(null);
  const [documentTitleToView, setDocumentTitleToView] = useState<string>('');
  const [viewingDocId, setViewingDocId] = useState<number | null>(null);

  const [docToDelete, setDocToDelete] = useState<DocumentResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [reprocessingDocId, setReprocessingDocId] = useState<number | null>(null);

  const [docToEdit, setDocToEdit] = useState<DocumentResponse | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editForm, setEditForm] = useState<UpdateDocumentRequest>({ title: '', description: '' });

  const openEditModal = (doc: DocumentResponse) => {
    setEditForm({ title: doc.title, description: doc.description ?? '' });
    setDocToEdit(doc);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docToEdit) return;
    if (!editForm.title.trim()) return toast.error('Please enter a title');

    setIsUpdating(true);
    try {
      const updated = await documentsApi.update(docToEdit.id, {
        title: editForm.title.trim(),
        description: editForm.description?.trim() ? editForm.description.trim() : undefined,
      });
      setDocuments(prev => prev.map(d => d.id === updated.id ? updated : d));
      toast.success('Document updated');
      setDocToEdit(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update document');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReprocessDocument = async (doc: DocumentResponse) => {
    setReprocessingDocId(doc.id);
    try {
      const updated = await documentsApi.reprocess(doc.id);
      setDocuments(prev => prev.map(d => d.id === doc.id ? updated : d));
      toast.success('Document reprocessing started');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to reprocess document');
    } finally {
      setReprocessingDocId(null);
    }
  };

  const handleDeleteDocument = async () => {
    if (!docToDelete) return;
    setIsDeleting(true);
    try {
      await documentsApi.delete(docToDelete.id);
      setDocuments(prev => prev.filter(d => d.id !== docToDelete.id));
      toast.success('Document deleted successfully');
      setDocToDelete(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete document');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewDocument = async (doc: DocumentResponse) => {
    console.log("View clicked for doc:", doc);
    setViewingDocId(doc.id);
    try {
      if (!doc.originalObjectKey) {
        toast.error('This document has no original file key');
        return;
      }
      const url = await documentsApi.getPresignedGetUrl(doc.originalObjectKey);
      console.log("Retrieved presigned URL:", url);
      if (!url) throw new Error('Received empty URL from server');

      if (typeof url !== 'string') {
        const fallbackUrl = (url as any)?.url || (url as any)?.link || String(url);
        setDocumentUrlToView(fallbackUrl);
      } else {
        setDocumentUrlToView(url);
      }
      setDocumentTitleToView(doc.title);
    } catch (err: any) {
      console.error("Failed to view document:", err);
      toast.error('Failed to get document link: ' + (err?.message || 'Unknown error'));
    } finally {
      setViewingDocId(null);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.file) return toast.error('Please select a file');
    if (!uploadForm.title.trim()) return toast.error('Please enter a title');

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadForm.file);
      formData.append('subjectId', String(subjectId));
      if (uploadForm.title) formData.append('title', uploadForm.title);
      if (uploadForm.description) formData.append('description', uploadForm.description);

      const newDoc = await documentsApi.upload(formData);
      setDocuments(prev => [newDoc, ...prev]);
      toast.success('Tải lên thành công! Quá trình xử lý tài liệu có thể mất 15–20 phút.', { duration: 6000 });
      setShowUploadModal(false);
      setUploadForm({ title: '', description: '', file: null });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [subData, docsData] = await Promise.all([
          subjectsApi.getById(subjectId),
          documentsApi.getAll({ subjectId }),
        ]);
        setSubject(subData);
        setDocuments(docsData?.items || docsData || []);
      } catch (err) {
        toast.error('Failed to load subject details');
      } finally {
        setIsLoading(false);
      }
    };
    if (subjectId) loadData();
  }, [subjectId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#00658D] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!subject) return <div className="p-8 text-center text-[#6F7880]">Subject not found.</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 fade-in">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-[#6F7880] font-medium">
        <Link href="/subjects" className="hover:text-[#00658D] transition-colors">Subjects</Link>
        <span className="material-symbols-outlined text-xs" style={{ fontSize: '16px' }}>chevron_right</span>
        <span className="text-[#191C1E]">{subject.name}</span>
      </nav>

      {/* Subject Header */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-4xl font-extrabold tracking-tight text-[#191C1E]">{subject.name}</h2>
          <p className="text-[#6F7880] text-lg leading-relaxed max-w-2xl">
            {subject.description || 'No description provided.'}
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <div className="flex items-center gap-2 px-4 py-2 bg-[#F2F4F6] rounded-full">
              <span className="material-symbols-outlined text-[#00658D] text-sm" style={{ fontSize: '18px' }}>description</span>
              <span className="text-sm font-semibold">{documents.length} Documents</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-[#F2F4F6] rounded-full">
              <span className="material-symbols-outlined text-[#4858AB] text-sm" style={{ fontSize: '18px' }}>group</span>
              <span className="text-sm font-semibold">128 Students</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-[#F2F4F6] rounded-full">
              <span className="material-symbols-outlined text-[#006A62] text-sm" style={{ fontSize: '18px' }}>event</span>
              <span className="text-sm font-semibold">{subject.code}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Link
            href={`/ai-chatbot?subjectId=${subject.id}`}
            className="signature-gradient text-white px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-ambient-md hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>smart_toy</span>
            Chat with Course AI
          </Link>
          <div className="bg-[#96A5FF]/10 p-4 rounded-xl border border-[#96A5FF]/20">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[#4858AB]" style={{ fontSize: '18px' }}>insights</span>
              <span className="text-sm font-bold text-[#27378A]">AI Insight</span>
            </div>
            <p className="text-xs text-[#27378A] leading-relaxed">
              Upload course materials such as PDF and DOCX to begin AI processing and auto-generate question banks.
            </p>
          </div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-8 border-b border-[#BEC8D0]/30 overflow-x-auto hide-scrollbar">
        {['Documents', 'Students'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              'pb-4 text-sm font-bold transition-all whitespace-nowrap',
              activeTab === tab
                ? 'text-[#00658D] border-b-2 border-[#00658D]'
                : 'text-[#6F7880] hover:text-[#191C1E] border-b-2 border-transparent'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Documents Section */}
      {activeTab === 'Documents' && (
        <section className="space-y-6 fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-[#191C1E]">Subject Resources</h3>
            {canEdit && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="text-[#00658D] text-sm font-bold flex items-center gap-1 hover:opacity-80 transition-opacity"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>upload</span>
                Upload New Document
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl overflow-hidden shadow-ambient border border-[#BEC8D0]/20">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F7F9FB]">
                  <th className="px-6 py-4 text-xs font-bold text-[#6F7880] uppercase tracking-wider">File Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#6F7880] uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#6F7880] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#6F7880] uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECEEF0]">
                {documents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <span className="material-symbols-outlined text-4xl text-[#BEC8D0] block mb-2">description</span>
                      <p className="text-[#6F7880] text-sm font-medium">No documents uploaded yet.</p>
                      {canEdit && (
                        <button
                          onClick={() => setShowUploadModal(true)}
                          className="mt-4 px-4 py-2 border border-[#BEC8D0]/30 rounded-lg text-sm font-medium text-[#44474E] hover:bg-[#F2F4F6] transition-colors"
                        >
                          Click &quot;Upload New Document&quot; to add materials
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  documents.map((doc: DocumentResponse) => {
                    const status = DOC_STATUS_CONFIG[doc.status] || DOC_STATUS_CONFIG.UPLOADED;
                    const isPdf = doc.title.toLowerCase().endsWith('.pdf');
                    return (
                      <tr key={doc.id} className="hover:bg-[#F7F9FB] transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center', isPdf ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500')}>
                              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                                {isPdf ? 'picture_as_pdf' : 'description'}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#191C1E]">{doc.title}</p>
                              <p className="text-[11px] text-[#6F7880]">Uploaded Document</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-[#ECEEF0] rounded text-[10px] font-bold text-[#44474E] uppercase">
                            {isPdf ? 'PDF' : 'DOCX'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={clsx('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide', status.color)}>
                            <span className={clsx('material-symbols-outlined', doc.status !== 'READY' && doc.status !== 'FAILED' && doc.status !== 'UPLOADED' ? 'animate-spin' : '')} style={{ fontSize: '12px' }}>{status.icon}</span>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {doc.status === 'FAILED' && (
                              <button
                                onClick={() => handleReprocessDocument(doc)}
                                disabled={reprocessingDocId === doc.id}
                                className="p-2 hover:bg-[#DEE0FF]/50 rounded-lg transition-all text-[#4858AB] disabled:opacity-50"
                                title="Reprocess"
                              >
                                <span className={clsx('material-symbols-outlined', reprocessingDocId === doc.id ? 'animate-spin' : '')} style={{ fontSize: '18px' }}>refresh</span>
                              </button>
                            )}
                            {canEdit && (
                              <button
                                onClick={() => openEditModal(doc)}
                                className="p-2 hover:bg-[#ECEEF0] rounded-lg transition-all text-[#6F7880]"
                                title="Edit"
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                              </button>
                            )}
                            <button
                              onClick={() => handleViewDocument(doc)}
                              disabled={viewingDocId === doc.id}
                              className="p-2 hover:bg-[#ECEEF0] rounded-lg transition-all text-[#6F7880] disabled:opacity-50"
                              title="View"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                                {viewingDocId === doc.id ? 'hourglass_empty' : 'visibility'}
                              </span>
                            </button>
                            <button className="p-2 hover:bg-[#ECEEF0] rounded-lg transition-all text-[#6F7880]" title="Download">
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
                            </button>
                            <button
                              onClick={() => setDocToDelete(doc)}
                              className="p-2 hover:bg-[#FFDAD6]/50 rounded-lg transition-all text-[#BA1A1A]"
                              title="Delete"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Placeholder for other tabs */}
      {activeTab !== 'Documents' && (
        <section className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl shadow-ambient border border-[#BEC8D0]/20 fade-in">
          <span className="material-symbols-outlined text-4xl text-[#BEC8D0] block mb-2">construction</span>
          <p className="text-[#6F7880] text-sm font-medium">This section is currently under construction.</p>
        </section>
      )}
      {/* Delete Confirmation Modal */}
      {docToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm fade-in">
          <div className="bg-white rounded-3xl shadow-ambient-md w-full max-w-md p-8">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-[#FFDAD6] flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[#BA1A1A]" style={{ fontSize: '24px' }}>delete_forever</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#191C1E]">Delete Document</h3>
                <p className="text-sm text-[#6F7880]">This action cannot be undone</p>
              </div>
            </div>

            <div className="bg-[#FFF8F7] border border-[#FFDAD6] rounded-2xl p-4 mb-6">
              <p className="text-sm text-[#44474E] leading-relaxed">
                Are you sure you want to delete{' '}
                <span className="font-bold text-[#191C1E]">&ldquo;{docToDelete.title}&rdquo;</span>?
                This will also delete all related AI chunks and embeddings.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDocToDelete(null)}
                disabled={isDeleting}
                className="flex-1 py-3 bg-[#F2F4F6] text-[#44474E] font-bold rounded-xl hover:bg-[#ECEEF0] transition-colors disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteDocument}
                disabled={isDeleting}
                className="flex-1 py-3 bg-[#BA1A1A] text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Deleting...</>
                ) : (
                  <><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>Delete Document</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Document Modal */}
      {docToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm fade-in">
          <div className="bg-white rounded-3xl shadow-ambient-md w-full max-w-lg p-8">
            <h3 className="text-xl font-bold text-[#191C1E] mb-2">Edit Document</h3>
            <p className="text-sm text-[#6F7880] mb-6">Update the title and description. The file and processing status are unchanged.</p>

            <form onSubmit={handleUpdateSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[#191C1E] mb-1.5">Title <span className="text-[#BA1A1A]">*</span></label>
                <input
                  type="text"
                  required
                  maxLength={255}
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder="Enter document title"
                  className="w-full px-4 py-3 bg-[#F7F9FB] border border-[#BEC8D0]/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00658D]/30 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#191C1E] mb-1.5">Description <span className="text-[#6F7880] font-normal">(Optional)</span></label>
                <textarea
                  maxLength={1000}
                  value={editForm.description ?? ''}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Enter a brief description"
                  rows={3}
                  className="w-full px-4 py-3 bg-[#F7F9FB] border border-[#BEC8D0]/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00658D]/30 transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDocToEdit(null)}
                  disabled={isUpdating}
                  className="flex-1 py-3 bg-[#F2F4F6] text-[#44474E] font-bold rounded-xl hover:bg-[#ECEEF0] transition-colors disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating || !editForm.title.trim()}
                  className="flex-1 py-3 signature-gradient text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isUpdating ? (
                    <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Saving...</>
                  ) : (
                    <><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>save</span>Save Changes</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm fade-in">
          <div className="bg-white rounded-3xl shadow-ambient-md w-full max-w-lg p-8">
            <h3 className="text-xl font-bold text-[#191C1E] mb-2">Upload New Document</h3>
            <p className="text-sm text-[#6F7880] mb-6">Upload a PDF, DOCX or TXT file to use with AI Course features.</p>

            <form onSubmit={handleUploadSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[#191C1E] mb-1.5">File <span className="text-[#BA1A1A]">*</span></label>
                <div className="relative border-2 border-dashed border-[#BEC8D0] rounded-2xl p-6 text-center hover:border-[#00658D] hover:bg-[#F7F9FB] transition-all cursor-pointer">
                  <input
                    type="file"
                    required
                    accept=".pdf,.docx,.doc,.txt"
                    onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files?.[0] || null })}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {uploadForm.file ? (
                    <div className="flex flex-col items-center gap-2">
                      <span className="material-symbols-outlined text-4xl text-[#00658D]">task</span>
                      <span className="text-sm font-semibold text-[#191C1E]">{uploadForm.file.name}</span>
                      <span className="text-xs text-[#6F7880]">{(uploadForm.file.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-[#E5F5FA] flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#00658D] text-2xl">upload_file</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#00658D]">Click to upload or drag and drop</p>
                        <p className="text-xs text-[#6F7880] mt-1">PDF, DOC, DOCX, TXT up to 50MB</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#191C1E] mb-1.5">Title <span className="text-[#BA1A1A]">*</span></label>
                <input
                  type="text"
                  required
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  placeholder="Enter document title"
                  className="w-full px-4 py-3 bg-[#F7F9FB] border border-[#BEC8D0]/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00658D]/30 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#191C1E] mb-1.5">Description <span className="text-[#6F7880] font-normal">(Optional)</span></label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  placeholder="Enter a brief description"
                  rows={3}
                  className="w-full px-4 py-3 bg-[#F7F9FB] border border-[#BEC8D0]/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00658D]/30 transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 py-3 bg-[#F2F4F6] text-[#44474E] font-bold rounded-xl hover:bg-[#ECEEF0] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!uploadForm.file || isUploading}
                  className="flex-1 py-3 signature-gradient text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Uploading...</>
                  ) : (
                    'Upload Document'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Document Modal */}
      {documentUrlToView && (
        <div className="fixed inset-0 z-[100] flex bg-white fade-in">
          <div className="w-full h-full flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#BEC8D0]/30 shadow-sm bg-white z-10 flex-shrink-0">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#00658D]" style={{ fontSize: '24px' }}>description</span>
                <h3 className="text-xl font-bold text-[#191C1E] pr-4 truncate">{documentTitleToView}</h3>
              </div>
              <button
                onClick={() => {
                  setDocumentUrlToView(null);
                  setDocumentTitleToView('');
                }}
                className="w-10 h-10 rounded-full bg-[#F2F4F6] text-[#44474E] flex items-center justify-center hover:bg-[#FFDAD6] hover:text-[#BA1A1A] transition-colors flex-shrink-0"
                title="Close fullscreen"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
              </button>
            </div>
            <div className="flex-1 overflow-hidden bg-[#ECEEF0]">
              <iframe
                src={documentUrlToView}
                className="w-full h-full border-0 bg-white"
                title={documentTitleToView}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
