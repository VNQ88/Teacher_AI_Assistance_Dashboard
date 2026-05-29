'use client';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: 'danger' | 'warning';
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  variant = 'danger',
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 fade-in">
      <div className="bg-white rounded-3xl shadow-ambient-md w-full max-w-sm p-7">
        <div className="flex items-start gap-4 mb-5">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
              variant === 'danger' ? 'bg-[#FFDAD6]' : 'bg-[#FFE0B2]'
            }`}
          >
            <span
              className={`material-symbols-outlined text-xl ${
                variant === 'danger' ? 'text-[#BA1A1A]' : 'text-[#E65100]'
              }`}
              style={{ fontSize: '20px' }}
            >
              {variant === 'danger' ? 'delete_forever' : 'warning'}
            </span>
          </div>
          <div>
            <h3 className="text-base font-bold text-[#191C1E] mb-1">{title}</h3>
            <p className="text-sm text-[#6F7880]">{message}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-2.5 bg-[#F2F4F6] text-[#44474E] font-semibold rounded-xl hover:bg-[#ECEEF0] transition-colors disabled:opacity-60 text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 py-2.5 font-bold rounded-xl transition-all disabled:opacity-60 text-sm flex items-center justify-center gap-2 ${
              variant === 'danger'
                ? 'bg-[#BA1A1A] text-white hover:bg-[#93000A]'
                : 'bg-[#E65100] text-white hover:bg-[#BF360C]'
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing...
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
