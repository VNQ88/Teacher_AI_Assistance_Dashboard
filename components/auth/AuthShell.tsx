import { ReactNode } from 'react';

const FEATURES = [
  { icon: 'chat', label: 'RAG-powered AI Chatbot' },
  { icon: 'quiz', label: 'Auto Question Generation' },
  { icon: 'menu_book', label: 'Smart Document Management' },
];

interface AuthShellProps {
  children: ReactNode;
  heroTitle?: ReactNode;
  heroSubtitle?: string;
}

export default function AuthShell({
  children,
  heroTitle = (
    <>Empower your<br />teaching with AI</>
  ),
  heroSubtitle = 'Manage your curriculum, chat with AI about your documents, and generate assessment questions automatically.',
}: AuthShellProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left Hero Column */}
      <div className="hidden lg:flex lg:w-1/2 signature-gradient flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-32 right-10 w-96 h-96 rounded-full bg-white blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <span className="material-symbols-outlined text-white" style={{ fontSize: '22px' }}>auto_awesome</span>
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">The Curator</h1>
              <p className="text-white/60 text-xs font-medium uppercase tracking-widest">AI Assistant</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">{heroTitle}</h2>
            <p className="text-white/75 text-lg leading-relaxed">{heroSubtitle}</p>
          </div>
          <div className="flex flex-col gap-3">
            {FEATURES.map((feature) => (
              <div key={feature.label} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                <span className="material-symbols-outlined text-white/90" style={{ fontSize: '18px' }}>{feature.icon}</span>
                <span className="text-white/90 text-sm font-medium">{feature.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-white/40 text-xs">© 2024 Teacher AI Assistance Platform</p>
        </div>
      </div>

      {/* Right Content Column */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#F7F9FB]">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl signature-gradient flex items-center justify-center">
              <span className="material-symbols-outlined text-white" style={{ fontSize: '16px' }}>auto_awesome</span>
            </div>
            <span className="text-base font-black text-[#00658D]">The Curator</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
