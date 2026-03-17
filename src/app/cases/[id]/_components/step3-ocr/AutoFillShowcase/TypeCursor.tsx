'use client';

export default function TypeCursor({ showSparkle = false }: { showSparkle?: boolean }) {
  return (
    <span className="inline-flex items-center ml-1">
      <span className="w-0.5 h-5 bg-primary rounded-full animate-pulse" />
      {showSparkle && (
        <svg
          className="h-4 w-4 text-primary ml-1 ai-sparkle"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
          />
        </svg>
      )}
    </span>
  );
}
