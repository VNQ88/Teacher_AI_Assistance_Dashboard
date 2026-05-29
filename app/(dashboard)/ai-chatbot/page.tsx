'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { chatApi } from '@/lib/api/chatbot';
import type { ChatMessageResponse } from '@/lib/api/chatbot';
import { subjectsApi } from '@/lib/api/subjects';
import type { ChatSessionResponse, SubjectResponse, ChatMessage, RagSourceResponse } from '@/lib/types';
import clsx from 'clsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function AiChatbotContent() {
  const searchParams = useSearchParams();
  const initialSubjectId = searchParams.get('subjectId');
  const bottomRef = useRef<HTMLDivElement>(null);

  const [subjects, setSubjects] = useState<SubjectResponse[]>([]);
  const [sessions, setSessions] = useState<ChatSessionResponse[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSessionResponse | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(
    initialSubjectId ? Number(initialSubjectId) : null
  );
  const [showNewSessionDialog, setShowNewSessionDialog] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [subjectsData, sessionsData] = await Promise.all([
          subjectsApi.getAll(),
          chatApi.getSessions(),
        ]);
        setSubjects(subjectsData || []);
        setSessions(sessionsData || []);
        if (initialSubjectId && subjectsData.length > 0) {
          setShowNewSessionDialog(true);
        }
      } catch {}
    };
    loadInitialData();
  }, [initialSubjectId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const loadSessionMessages = async (session: ChatSessionResponse) => {
    setActiveSession(session);
    setMessages([]);
    try {
      const history: ChatMessageResponse[] = await chatApi.getHistory(session.id);
      const mapped: ChatMessage[] = history.map((m: ChatMessageResponse) => ({
        id: m.id,
        role: (m.role === 'USER' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: m.content,
        confidenceScore: m.confidenceScore,
        confidenceLevel: m.confidenceLevel,
        createdAt: m.createdAt,
      }));
      setMessages(mapped);
    } catch {
      setMessages([]);
    }
  };

  const createNewSession = async () => {
    if (!selectedSubjectId) { toast.error('Please select a subject'); return; }
    setIsCreatingSession(true);
    try {
      const subject = subjects.find((s: SubjectResponse) => s.id === selectedSubjectId);
      const session = await chatApi.createSession({
        subjectId: selectedSubjectId,
        title: `Chat — ${subject?.name || 'Unknown'}`,
      });
      setSessions((prev: ChatSessionResponse[]) => [session, ...prev]);
      setMessages([]);
      setActiveSession(session);
      setShowNewSessionDialog(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create session');
    } finally {
      setIsCreatingSession(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !activeSession || isTyping) return;
    const userMsg: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content: input.trim(),
      createdAt: new Date().toISOString(),
    };
    setMessages((prev: ChatMessage[]) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response: ChatMessageResponse = await chatApi.sendMessage(activeSession.id, {
        question: userMsg.content,
        includeSources: true,
      });
      const aiMsg: ChatMessage = {
        id: response.id,
        role: 'assistant',
        content: response.content,
        confidenceScore: response.confidenceScore,
        confidenceLevel: response.confidenceLevel,
        createdAt: response.createdAt,
      };
      setMessages((prev: ChatMessage[]) => [...prev, aiMsg]);
    } catch {
      toast.error('Failed to get AI response');
      setMessages((prev: ChatMessage[]) => prev.slice(0, -1));
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const deleteSession = async (session: ChatSessionResponse) => {
    try {
      await chatApi.deleteSession(session.id);
      setSessions((prev: ChatSessionResponse[]) => prev.filter((s: ChatSessionResponse) => s.id !== session.id));
      if (activeSession?.id === session.id) {
        setActiveSession(null);
        setMessages([]);
      }
      toast.success('Session deleted');
    } catch {
      toast.error('Failed to delete session');
    }
  };

  return (
    <div className="flex h-[calc(100vh-57px)]">
      {/* Session Sidebar */}
      <div className="w-72 bg-[#ECEEF0] flex flex-col border-r border-[#BEC8D0]/20 flex-shrink-0">
        <div className="p-4 border-b border-[#BEC8D0]/20">
          <button
            onClick={() => setShowNewSessionDialog(true)}
            className="w-full flex items-center gap-2 signature-gradient text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-all"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add_comment</span>
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {sessions.length === 0 ? (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-3xl text-[#BEC8D0] block mb-2">forum</span>
              <p className="text-xs text-[#6F7880]">No chat sessions yet</p>
            </div>
          ) : (
            sessions.map((session: ChatSessionResponse) => (
              <div
                key={session.id}
                onClick={() => loadSessionMessages(session)}
                className={clsx(
                  'group flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all',
                  activeSession?.id === session.id
                    ? 'bg-white shadow-ambient'
                    : 'hover:bg-white/50'
                )}
              >
                <div className="w-8 h-8 rounded-lg bg-[#DEE0FF]/50 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[#4858AB]" style={{ fontSize: '16px' }}>forum</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#191C1E] truncate">{session.title}</p>
                  <p className="text-xs text-[#6F7880] truncate">{session.subjectName}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteSession(session); }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-[#FFDAD6]/50 transition-all"
                >
                  <span className="material-symbols-outlined text-[#BA1A1A]" style={{ fontSize: '14px' }}>delete</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {!activeSession ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
            <div className="w-20 h-20 rounded-3xl signature-gradient flex items-center justify-center shadow-ambient-md mb-5">
              <span className="material-symbols-outlined text-white text-4xl">forum</span>
            </div>
            <h2 className="text-2xl font-extrabold text-[#191C1E] mb-2">AI Teaching Assistant</h2>
            <p className="text-[#6F7880] max-w-sm mb-6 leading-relaxed">
              Ask questions about your course documents. The AI will answer based on your uploaded materials.
            </p>
            <button
              onClick={() => setShowNewSessionDialog(true)}
              className="flex items-center gap-2 signature-gradient text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all shadow-ambient-md"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_comment</span>
              Start New Chat
            </button>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="px-6 py-4 bg-white/80 backdrop-blur-md border-b border-[#BEC8D0]/20 flex items-center gap-4">
              <div className="w-9 h-9 rounded-xl signature-gradient flex items-center justify-center">
                <span className="material-symbols-outlined text-white" style={{ fontSize: '18px' }}>forum</span>
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#191C1E]">{activeSession.title}</h2>
                <p className="text-xs text-[#6F7880]">{activeSession.subjectName}</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#84F5E8]/30 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-[#006A62] animate-pulse" />
                  <span className="text-xs font-semibold text-[#006A62]">RAG Active</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-3xl text-[#BEC8D0] block mb-2">chat</span>
                  <p className="text-[#6F7880] text-sm">Start by asking something about {activeSession.subjectName}</p>
                  <div className="flex flex-wrap gap-2 justify-center mt-4">
                    {[
                      'Summarize the key concepts',
                      'What are the main topics?',
                      'Create a study guide',
                    ].map((prompt: string) => (
                      <button
                        key={prompt}
                        onClick={() => setInput(prompt)}
                        className="px-3 py-1.5 bg-white rounded-xl text-xs font-medium text-[#44474E] border border-[#BEC8D0]/40 hover:border-[#00658D]/40 hover:text-[#00658D] transition-all shadow-ambient"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg: ChatMessage) => (
                <div
                  key={msg.id}
                  className={clsx('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start', 'fade-in')}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-xl signature-gradient flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="material-symbols-outlined text-white" style={{ fontSize: '16px' }}>auto_awesome</span>
                    </div>
                  )}
                  <div className={clsx('max-w-xl', msg.role === 'user' ? 'order-first' : '')}>
                    <div
                      className={clsx(
                        'px-4 py-3 rounded-2xl text-sm leading-relaxed',
                        msg.role === 'user'
                          ? 'signature-gradient text-white rounded-br-sm'
                          : 'bg-white text-[#191C1E] shadow-ambient rounded-bl-sm'
                      )}
                    >
                      {msg.role === 'user' ? (
                        msg.content
                      ) : (
                        <div className="space-y-3 [&>p]:leading-relaxed [&>ul]:list-disc [&>ul]:pl-5 [&>ul>li]:mb-1.5 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol>li]:mb-1.5 [&>strong]:font-semibold [&>h1]:text-lg [&>h1]:font-bold [&>h2]:text-base [&>h2]:font-bold [&>h3]:text-sm [&>h3]:font-bold">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>

                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-[#6F7880] font-medium flex items-center gap-1">
                          <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>link</span>
                          Sources
                        </p>
                        {Array.from(new Set(msg.sources.map((src: RagSourceResponse) => src.documentTitle))).map((title) => (
                          <div key={title} className="px-3 py-2 bg-[#C6E7FF]/20 rounded-xl text-xs text-[#004C6B]">
                            <span className="font-semibold">{title}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {msg.confidenceLevel && (
                      <div className={clsx(
                        'mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                        msg.confidenceLevel === 'HIGH' ? 'bg-[#84F5E8]/30 text-[#003934]' :
                        msg.confidenceLevel === 'MEDIUM' ? 'bg-[#C6E7FF]/30 text-[#004C6B]' :
                        'bg-[#FFDAD6]/30 text-[#93000A]'
                      )}>
                        <span className="material-symbols-outlined" style={{ fontSize: '10px' }}>
                          {msg.confidenceLevel === 'HIGH' ? 'check_circle' : msg.confidenceLevel === 'MEDIUM' ? 'info' : 'warning'}
                        </span>
                        {msg.confidenceLevel} confidence
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3 fade-in">
                  <div className="w-8 h-8 rounded-xl signature-gradient flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-white" style={{ fontSize: '16px' }}>auto_awesome</span>
                  </div>
                  <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3.5 shadow-ambient flex items-center gap-1.5">
                    <span className="typing-dot w-2 h-2 rounded-full bg-[#6F7880]" />
                    <span className="typing-dot w-2 h-2 rounded-full bg-[#6F7880]" />
                    <span className="typing-dot w-2 h-2 rounded-full bg-[#6F7880]" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white/80 backdrop-blur-md border-t border-[#BEC8D0]/20">
              <div className="flex gap-3 items-end max-w-4xl mx-auto">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your teaching materials..."
                  rows={1}
                  className="flex-1 bg-[#F7F9FB] px-4 py-3 rounded-2xl text-sm text-[#191C1E] placeholder-[#BEC8D0] border-0 focus:outline-none focus:ring-2 focus:ring-[#00658D]/30 resize-none max-h-32 transition-all"
                  style={{ minHeight: '48px' }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isTyping}
                  className="w-12 h-12 rounded-2xl signature-gradient text-white flex items-center justify-center hover:opacity-90 active:scale-[0.95] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>send</span>
                </button>
              </div>
              <p className="text-center text-xs text-[#BEC8D0] mt-2">Press Enter to send · Shift+Enter for new line</p>
            </div>
          </>
        )}
      </div>

      {/* New Session Dialog */}
      {showNewSessionDialog && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 fade-in">
          <div className="bg-white rounded-3xl shadow-ambient-md w-full max-w-sm p-8">
            <h2 className="text-xl font-bold text-[#191C1E] mb-1">New Chat Session</h2>
            <p className="text-sm text-[#6F7880] mb-5">Select a subject to chat about</p>
            <div className="space-y-2 max-h-60 overflow-y-auto mb-5">
              {subjects.map((subject: SubjectResponse) => (
                <button
                  key={subject.id}
                  onClick={() => setSelectedSubjectId(subject.id)}
                  className={clsx(
                    'w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all',
                    selectedSubjectId === subject.id
                      ? 'bg-[#C6E7FF]/30 ring-2 ring-[#00658D]/40'
                      : 'bg-[#F7F9FB] hover:bg-[#F2F4F6]'
                  )}
                >
                  <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center', selectedSubjectId === subject.id ? 'signature-gradient' : 'bg-[#ECEEF0]')}>
                    <span className={clsx('material-symbols-outlined', selectedSubjectId === subject.id ? 'text-white' : 'text-[#6F7880]')} style={{ fontSize: '16px' }}>menu_book</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#191C1E]">{subject.name}</p>
                    <p className="text-xs text-[#6F7880]">{subject.code}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowNewSessionDialog(false)} className="flex-1 py-3 bg-[#F2F4F6] text-[#44474E] font-semibold rounded-xl hover:bg-[#ECEEF0] transition-colors">Cancel</button>
              <button onClick={createNewSession} disabled={!selectedSubjectId || isCreatingSession} className="flex-1 py-3 signature-gradient text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                {isCreatingSession ? <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Creating...</> : 'Start Chat'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AiChatbotPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[calc(100vh-57px)] items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00658D] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <AiChatbotContent />
    </Suspense>
  );
}
