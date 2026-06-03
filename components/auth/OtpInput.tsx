'use client';

import { useRef } from 'react';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  autoFocus?: boolean;
}

export default function OtpInput({ value, onChange, length = 6, autoFocus = false }: OtpInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? '');

  const setDigit = (index: number, digit: string) => {
    const next = digits.slice();
    next[index] = digit;
    onChange(next.join('').slice(0, length));
  };

  const handleChange = (index: number, raw: string) => {
    if (!/^\d*$/.test(raw)) return;
    const char = raw.slice(-1);
    setDigit(index, char);
    if (char && index < length - 1) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    onChange(pasted);
    inputsRef.current[Math.min(pasted.length, length - 1)]?.focus();
  };

  return (
    <div className="flex gap-3 justify-center">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => { inputsRef.current[index] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          autoFocus={autoFocus && index === 0}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className="w-12 h-14 text-center text-xl font-bold bg-white rounded-xl shadow-ambient focus:outline-none focus:ring-2 focus:ring-[#00658D]/40 text-[#191C1E] transition-all"
        />
      ))}
    </div>
  );
}
