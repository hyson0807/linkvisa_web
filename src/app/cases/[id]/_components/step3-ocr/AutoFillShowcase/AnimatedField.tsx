'use client';

import { useState, useEffect, useRef, memo } from 'react';
import { TIMING } from './constants';
import type { FormField } from './types';
import TypeCursor from './TypeCursor';

interface AnimatedFieldProps {
  field: FormField;
  delay: number;
  onComplete?: () => void;
}

type FieldPhase = 'waiting' | 'typing' | 'done';

export default memo(function AnimatedField({ field, delay, onComplete }: AnimatedFieldProps) {
  const [phase, setPhase] = useState<FieldPhase>('waiting');
  const [displayedValue, setDisplayedValue] = useState('');
  const [glowIntensity, setGlowIntensity] = useState(0);
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    let typeInterval: NodeJS.Timeout;

    const startTimer = setTimeout(() => {
      setPhase('typing');
      let index = 0;

      typeInterval = setInterval(() => {
        if (index < field.value.length) {
          setDisplayedValue(field.value.slice(0, index + 1));
          setGlowIntensity(Math.sin((index / field.value.length) * Math.PI) * 100);
          index++;
        } else {
          clearInterval(typeInterval);
          setPhase('done');
          setGlowIntensity(0);
          if (!hasCompletedRef.current) {
            hasCompletedRef.current = true;
            setTimeout(() => onComplete?.(), 200);
          }
        }
      }, TIMING.CHAR_SPEED + Math.random() * TIMING.CHAR_SPEED_VARIANCE);
    }, delay);

    return () => {
      clearTimeout(startTimer);
      clearInterval(typeInterval);
    };
  }, [field.value, delay, onComplete]);

  const bgClass =
    phase === 'typing'
      ? 'bg-primary/[0.08] ring-2 ring-primary/40'
      : phase === 'done'
        ? 'bg-green-50/80'
        : 'bg-black/[0.02]';

  const labelClass =
    phase === 'typing'
      ? 'text-primary'
      : phase === 'done'
        ? 'text-green-700'
        : 'text-black/50';

  const boxShadow =
    phase === 'typing'
      ? `0 0 ${glowIntensity / 4}px ${glowIntensity / 8}px rgba(36, 99, 235, ${glowIntensity / 350})`
      : 'none';

  return (
    <div
      className={`relative flex items-center justify-between py-3.5 px-4 rounded-xl transition-all duration-500 ${bgClass}`}
      style={{ boxShadow }}
    >
      <span className={`text-sm font-medium transition-colors duration-300 ${labelClass}`}>
        {field.label}
      </span>

      <div className="flex items-center min-w-[160px] justify-end">
        {phase === 'waiting' && (
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-black/10 animate-pulse" />
            <span className="h-3.5 w-20 rounded bg-black/10 animate-pulse" />
          </div>
        )}
        {phase === 'typing' && (
          <div className="flex items-center">
            <span className="text-sm font-bold text-primary tracking-wide">
              {displayedValue}
            </span>
            <TypeCursor />
          </div>
        )}
        {phase === 'done' && (
          <div className="flex items-center gap-2.5 field-complete">
            <span className="text-sm font-bold text-black/80">{displayedValue}</span>
            <div className="flex items-center justify-center h-5 w-5 rounded-full bg-green-500 check-success">
              <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
