'use client';

function Toast({ message, subMessage, onClose }: { message: string; subMessage?: string; onClose: () => void }) {
  return (
    <div
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-[fadeInUp_0.3s_ease-out] rounded-xl bg-black/85 px-5 py-3 shadow-lg"
      onClick={onClose}
    >
      <div className="flex items-center gap-2">
        <span className="text-[14px]">📋</span>
        <span className="text-[14px] font-medium text-white">{message}</span>
      </div>
      {subMessage && (
        <p className="mt-1 text-[12px] text-white/60 pl-6">{subMessage}</p>
      )}
    </div>
  );
}

export default Toast;
