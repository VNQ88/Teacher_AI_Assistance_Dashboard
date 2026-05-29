'use client';

import { useEffect, useState } from 'react';
import { subjectsApi } from '@/lib/api/subjects';
import { questionBanksApi } from '@/lib/api/questions';
import type { SubjectResponse, QuestionBankResponse, DifficultyLevel, QuestionType } from '@/lib/types';
import clsx from 'clsx';
import toast from 'react-hot-toast';

interface AnswerOption {
  id: number;
  content: string;
  isCorrect: boolean;
  orderIndex: number;
}

interface MockQuestion {
  id: number;
  content: string;
  questionType: QuestionType;
  difficultyLevel: DifficultyLevel;
  explanation: string;
  answerOptions: AnswerOption[];
}


// Mock generated questions for demonstration
const MOCK_QUESTIONS = [
  {
    id: 1,
    content: 'Which of the following best describes the process of photosynthesis?',
    questionType: 'MULTIPLE_CHOICE' as QuestionType,
    difficultyLevel: 'MEDIUM' as DifficultyLevel,
    explanation: 'Photosynthesis is the process by which green plants convert light energy into chemical energy stored as glucose.',
    answerOptions: [
      { id: 1, content: 'The conversion of glucose to ATP in mitochondria', isCorrect: false, orderIndex: 0 },
      { id: 2, content: 'The conversion of light energy to chemical energy in chloroplasts', isCorrect: true, orderIndex: 1 },
      { id: 3, content: 'The breakdown of proteins into amino acids', isCorrect: false, orderIndex: 2 },
      { id: 4, content: 'The transport of nutrients through the circulatory system', isCorrect: false, orderIndex: 3 },
    ],
  },
  {
    id: 2,
    content: 'The cell membrane is described as "selectively permeable." What does this mean?',
    questionType: 'SHORT_ANSWER' as QuestionType,
    difficultyLevel: 'EASY' as DifficultyLevel,
    explanation: 'Selectively permeable means the membrane allows some substances to pass through while blocking others.',
    answerOptions: [],
  },
  {
    id: 3,
    content: 'True or False: DNA replication occurs during the S phase of the cell cycle.',
    questionType: 'TRUE_FALSE' as QuestionType,
    difficultyLevel: 'EASY' as DifficultyLevel,
    explanation: 'DNA synthesis (replication) indeed occurs during the Synthesis (S) phase of interphase.',
    answerOptions: [
      { id: 5, content: 'True', isCorrect: true, orderIndex: 0 },
      { id: 6, content: 'False', isCorrect: false, orderIndex: 1 },
    ],
  },
  {
    id: 4,
    content: 'Select ALL molecules that are considered macromolecules in biological systems.',
    questionType: 'MULTI_SELECT' as QuestionType,
    difficultyLevel: 'HARD' as DifficultyLevel,
    explanation: 'Macromolecules include proteins, nucleic acids, carbohydrates, and lipids.',
    answerOptions: [
      { id: 7, content: 'Proteins', isCorrect: true, orderIndex: 0 },
      { id: 8, content: 'Nucleic acids', isCorrect: true, orderIndex: 1 },
      { id: 9, content: 'Water', isCorrect: false, orderIndex: 2 },
      { id: 10, content: 'Polysaccharides', isCorrect: true, orderIndex: 3 },
    ],
  },
];

const DIFFICULTY_CONFIG = {
  EASY: { label: 'Easy', color: 'bg-[#84F5E8]/30 text-[#003934]' },
  MEDIUM: { label: 'Medium', color: 'bg-[#C6E7FF]/30 text-[#004C6B]' },
  HARD: { label: 'Hard', color: 'bg-[#FFDAD6]/30 text-[#93000A]' },
};

const TYPE_CONFIG: Record<string, { label: string; icon: string }> = {
  MULTIPLE_CHOICE: { label: 'Multiple Choice', icon: 'radio_button_checked' },
  MULTI_SELECT: { label: 'Multi Select', icon: 'check_box' },
  TRUE_FALSE: { label: 'True / False', icon: 'swap_horiz' },
  SHORT_ANSWER: { label: 'Short Answer', icon: 'short_text' },
  ESSAY: { label: 'Essay', icon: 'article' },
  FILL_IN_BLANK: { label: 'Fill in Blank', icon: 'text_fields' },
};

export default function QuestionGeneratorPage() {
  const [subjects, setSubjects] = useState<SubjectResponse[]>([]);
  const [questionBanks, setQuestionBanks] = useState<QuestionBankResponse[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | ''>('');
  const [selectedBankId, setSelectedBankId] = useState<number | ''>('');
  const [quantity, setQuantity] = useState(5);
  const [difficulty, setDifficulty] = useState<DifficultyLevel | 'ALL'>('MEDIUM');
  const [questionType, setQuestionType] = useState<QuestionType | 'ALL'>('MULTIPLE_CHOICE');
  const [generatedQuestions, setGeneratedQuestions] = useState<MockQuestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<number>>(new Set());

  useEffect(() => {
    subjectsApi.getAll().then((data: SubjectResponse[]) => setSubjects(data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedSubjectId) { setQuestionBanks([]); return; }
    questionBanksApi.getAll({ subjectId: Number(selectedSubjectId) })
      .then((data) => setQuestionBanks(data?.items || []))
      .catch(() => {});
  }, [selectedSubjectId]);

  const handleGenerate = async () => {
    if (!selectedSubjectId) { toast.error('Please select a subject'); return; }
    setIsGenerating(true);
    setGeneratedQuestions([]);
    setSelectedQuestions(new Set());
    // Simulate AI generation with mock data
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setGeneratedQuestions(MOCK_QUESTIONS.slice(0, Math.min(quantity, 4)));
    setIsGenerating(false);
    toast.success(`Generated ${Math.min(quantity, 4)} questions!`);
  };

  const toggleQuestion = (id: number) => {
    setSelectedQuestions((prev: Set<number>) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const handleSaveSelected = async () => {
    if (!selectedBankId) { toast.error('Please select a Question Bank to save to'); return; }
    if (selectedQuestions.size === 0) { toast.error('Please select at least one question'); return; }
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast.success(`${selectedQuestions.size} questions saved to question bank! (Mock)`);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-[#191C1E] mb-1">Question Generator</h1>
        <p className="text-[#6F7880] font-medium">Generate AI-powered questions from your course materials.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Config Panel */}
        <div className="lg:col-span-1 space-y-5">
          <div className="bg-white rounded-2xl shadow-ambient p-6 space-y-5">
            <h2 className="text-base font-bold text-[#191C1E] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4858AB]" style={{ fontSize: '18px' }}>tune</span>
              Configuration
            </h2>

            {/* Subject */}
            <div>
              <label className="block text-sm font-semibold text-[#3F484F] mb-2">Subject</label>
              <select
                value={selectedSubjectId}
                onChange={(e) => { setSelectedSubjectId(Number(e.target.value) || ''); setSelectedBankId(''); }}
                className="w-full bg-[#F7F9FB] px-3.5 py-3 rounded-xl text-sm text-[#191C1E] border-0 focus:outline-none focus:ring-2 focus:ring-[#00658D]/40 appearance-none cursor-pointer"
              >
                <option value="">Select subject...</option>
                {subjects.map((s: SubjectResponse) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            {/* Question Bank */}
            <div>
              <label className="block text-sm font-semibold text-[#3F484F] mb-2">Target Question Bank</label>
              <select
                value={selectedBankId}
                onChange={(e) => setSelectedBankId(Number(e.target.value) || '')}
                disabled={!selectedSubjectId}
                className="w-full bg-[#F7F9FB] px-3.5 py-3 rounded-xl text-sm text-[#191C1E] border-0 focus:outline-none focus:ring-2 focus:ring-[#00658D]/40 disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer"
              >
                <option value="">Select question bank...</option>
                {questionBanks.map((qb: QuestionBankResponse) => <option key={qb.id} value={qb.id}>{qb.name}</option>)}
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-semibold text-[#3F484F] mb-2">
                Number of Questions: <span className="text-[#00658D] font-bold">{quantity}</span>
              </label>
              <input
                type="range"
                min={1}
                max={20}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full accent-[#00658D]"
              />
              <div className="flex justify-between text-xs text-[#6F7880] mt-1">
                <span>1</span><span>10</span><span>20</span>
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-semibold text-[#3F484F] mb-2">Difficulty</label>
              <div className="grid grid-cols-2 gap-2">
                {(['ALL', 'EASY', 'MEDIUM', 'HARD'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={clsx(
                      'py-2 px-3 rounded-xl text-xs font-bold transition-all',
                      difficulty === d
                        ? 'signature-gradient text-white shadow-ambient'
                        : 'bg-[#F2F4F6] text-[#44474E] hover:bg-[#ECEEF0]'
                    )}
                  >
                    {d === 'ALL' ? 'Any' : DIFFICULTY_CONFIG[d].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Type */}
            <div>
              <label className="block text-sm font-semibold text-[#3F484F] mb-2">Question Type</label>
              <select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value as any)}
                className="w-full bg-[#F7F9FB] px-3.5 py-3 rounded-xl text-sm text-[#191C1E] border-0 focus:outline-none focus:ring-2 focus:ring-[#00658D]/40 appearance-none cursor-pointer"
              >
                <option value="ALL">All Types</option>
                {Object.entries(TYPE_CONFIG).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !selectedSubjectId}
              className="w-full signature-gradient text-white font-bold py-3.5 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-ambient-md disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>AI is generating...</>
              ) : (
                <><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>auto_fix_high</span>Generate with AI</>
              )}
            </button>

            {/* Mock data notice */}
            <div className="p-3 bg-[#FFF8DC]/60 rounded-xl">
              <p className="text-xs text-[#856400] flex items-start gap-1.5">
                <span className="material-symbols-outlined flex-shrink-0" style={{ fontSize: '14px' }}>info</span>
                Currently using mock data. AI generation will be integrated in the next phase.
              </p>
            </div>
          </div>
        </div>

        {/* Generated Questions Panel */}
        <div className="lg:col-span-2">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl shadow-ambient">
              <div className="w-16 h-16 rounded-2xl signature-gradient flex items-center justify-center mb-4 shadow-ambient-md">
                <span className="material-symbols-outlined text-white text-3xl ai-pulse">auto_awesome</span>
              </div>
              <p className="text-base font-bold text-[#191C1E] mb-1">AI is generating questions...</p>
              <p className="text-sm text-[#6F7880]">Analyzing your course documents</p>
            </div>
          ) : generatedQuestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl shadow-ambient text-center p-8">
              <span className="material-symbols-outlined text-5xl text-[#BEC8D0] mb-3">quiz</span>
              <h3 className="text-lg font-bold text-[#191C1E] mb-1">No Questions Yet</h3>
              <p className="text-[#6F7880] text-sm">Configure your settings and click "Generate with AI" to create questions.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Actions Bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-[#191C1E]">{generatedQuestions.length} questions generated</span>
                  <button
                    onClick={() => setSelectedQuestions(new Set(generatedQuestions.map((q: MockQuestion) => q.id)))}
                    className="text-xs text-[#00658D] font-semibold hover:underline"
                  >
                    Select all
                  </button>
                </div>
                <button
                  onClick={handleSaveSelected}
                  disabled={selectedQuestions.size === 0 || isSaving}
                  className="flex items-center gap-2 signature-gradient text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-all shadow-ambient"
                >
                  {isSaving ? <><svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Saving...</> : <><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>save</span>Save Selected ({selectedQuestions.size})</>}
                </button>
              </div>

              {/* Question Cards */}
              {generatedQuestions.map((q: MockQuestion, index: number) => {
                const isSelected = selectedQuestions.has(q.id);
                const typeConfig = TYPE_CONFIG[q.questionType] || { label: q.questionType, icon: 'quiz' };
                const diffConfig = DIFFICULTY_CONFIG[q.difficultyLevel as keyof typeof DIFFICULTY_CONFIG];
                return (
                  <div
                    key={q.id}
                    className={clsx(
                      'bg-white rounded-2xl p-5 shadow-ambient transition-all duration-150 cursor-pointer',
                      isSelected ? 'ring-2 ring-[#00658D]/50' : 'hover:shadow-ambient-md'
                    )}
                    onClick={() => toggleQuestion(q.id)}
                  >
                    {/* Card Header */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className={clsx('w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 transition-all', isSelected ? 'signature-gradient' : 'border-2 border-[#BEC8D0]')}>
                        {isSelected && <span className="material-symbols-outlined text-white" style={{ fontSize: '12px' }}>check</span>}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap gap-2 mb-2">
                          <span className="text-xs font-semibold text-[#6F7880]">Q{index + 1}</span>
                          <span className={clsx('px-2 py-0.5 rounded-full text-xs font-semibold', diffConfig.color)}>
                            {diffConfig.label}
                          </span>
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[#ECEEF0] text-[#44474E]">
                            <span className="material-symbols-outlined" style={{ fontSize: '10px' }}>{typeConfig.icon}</span>
                            {typeConfig.label}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-[#191C1E] leading-relaxed">{q.content}</p>
                      </div>
                    </div>

                    {/* Options */}
                    {q.answerOptions.length > 0 && (
                      <div className="space-y-2 ml-8">
                        {q.answerOptions.map((opt: AnswerOption) => (
                          <div
                            key={opt.id}
                            className={clsx(
                              'flex items-center gap-2 px-3 py-2 rounded-xl text-sm',
                              opt.isCorrect ? 'bg-[#84F5E8]/20 text-[#003934] font-semibold' : 'bg-[#F7F9FB] text-[#44474E]'
                            )}
                          >
                            {opt.isCorrect && <span className="material-symbols-outlined text-[#006A62]" style={{ fontSize: '14px' }}>check_circle</span>}
                            {opt.content}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="mt-3 ml-8 px-3 py-2 bg-[#C6E7FF]/20 rounded-xl">
                        <p className="text-xs text-[#6F7880] flex items-start gap-1.5">
                          <span className="material-symbols-outlined flex-shrink-0 text-[#00658D]" style={{ fontSize: '12px' }}>lightbulb</span>
                          {q.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
