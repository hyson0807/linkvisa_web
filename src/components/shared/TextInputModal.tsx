'use client';

import { useState } from 'react';

export const INPUT_CLASS =
  'w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-[15px] text-black/80 placeholder:text-black/25 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors';

function TextInputModal({
  title,
  placeholder,
  submitLabel,
  initialValue = '',
  onSubmit,
  onClose,
}: {
  title: string;
  placeholder: string;
  submitLabel: string;
  initialValue?: string;
  onSubmit: (value: string) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState(initialValue);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-black/85 mb-4">{title}</h3>
        <input
          autoFocus
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && value.trim()) onSubmit(value.trim());
          }}
          placeholder={placeholder}
          className={INPUT_CLASS}
        />
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-black/40 hover:bg-black/5 transition-colors">
            취소
          </button>
          <button
            onClick={() => value.trim() && onSubmit(value.trim())}
            disabled={!value.trim()}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-40 hover:bg-primary-dark transition-colors"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TextInputModal;
