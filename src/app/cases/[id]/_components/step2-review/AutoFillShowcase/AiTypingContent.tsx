'use client';

import { useState, useEffect, useRef, memo } from 'react';
import { TIMING } from './constants';
import TypeCursor from './TypeCursor';

interface AiTypingContentProps {
  text: string;
  onComplete: () => void;
}

export default memo(function AiTypingContent({ text, onComplete }: AiTypingContentProps) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasCompletedRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let index = 0;

    intervalRef.current = setInterval(() => {
      if (index < text.length) {
        setDisplayed(text.slice(0, index + 1));
        index++;
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      } else {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setDone(true);
        if (!hasCompletedRef.current) {
          hasCompletedRef.current = true;
          setTimeout(onComplete, TIMING.COMPLETE_DELAY);
        }
      }
    }, TIMING.AI_CHAR_SPEED);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text, onComplete]);

  const lines = displayed.split('\n');

  return (
    <div ref={containerRef} className="max-h-[300px] overflow-y-auto pr-2">
      <div className="font-mono text-sm leading-relaxed">
        {lines.map((line, idx) => (
          <div
            key={idx}
            className={`py-0.5 px-2 -mx-2 rounded transition-all duration-300 ${
              idx === lines.length - 1 && !done ? 'bg-primary/5' : ''
            }`}
          >
            <span className="text-black/70">{line}</span>
            {idx === lines.length - 1 && !done && <TypeCursor showSparkle />}
          </div>
        ))}
      </div>
      {done && (
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-black/5">
          <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center check-success">
            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-sm font-medium text-green-600">AI 작성 완료</span>
        </div>
      )}
    </div>
  );
});
