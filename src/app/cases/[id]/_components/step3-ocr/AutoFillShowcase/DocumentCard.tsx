'use client';

import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { TIMING, AI_CONTENT, CHUNK_SIZE } from './constants';
import type { DocumentDef } from './types';
import AnimatedField from './AnimatedField';
import AiTypingContent from './AiTypingContent';
import AiPreparing from './AiPreparing';

interface DocumentCardProps {
  doc: DocumentDef;
  isActive: boolean;
  startDelay: number;
  onComplete: () => void;
  cardIndex: number;
}

export default memo(function DocumentCard({
  doc,
  isActive,
  startDelay,
  onComplete,
  cardIndex,
}: DocumentCardProps) {
  const [completedFields, setCompletedFields] = useState(0);
  const [activeChunkIndex, setActiveChunkIndex] = useState(0);
  const [isChunkTransitioning, setIsChunkTransitioning] = useState(false);
  const [aiStarted, setAiStarted] = useState(false);
  const [aiDone, setAiDone] = useState(false);
  const hasCalledCompleteRef = useRef(false);

  const totalFields = doc.fields.length;
  const isAiDoc = doc.icon === 'ai';
  const progress = totalFields > 0 ? (completedFields / totalFields) * 100 : 0;
  const isDone = isAiDoc ? aiDone : (totalFields > 0 && completedFields >= totalFields);

  const chunks = useMemo(() => {
    const result: typeof doc.fields[] = [];
    for (let i = 0; i < doc.fields.length; i += CHUNK_SIZE) {
      result.push(doc.fields.slice(i, i + CHUNK_SIZE));
    }
    return result;
  }, [doc]);

  useEffect(() => {
    if (isActive && isAiDoc && !aiStarted) {
      const timer = setTimeout(() => setAiStarted(true), startDelay + TIMING.AI_START_DELAY);
      return () => clearTimeout(timer);
    }
  }, [isActive, isAiDoc, startDelay, aiStarted]);

  const handleChunkFieldComplete = useCallback((chunkIdx: number) => {
    setCompletedFields(prev => {
      const next = prev + 1;
      const fieldsBeforeChunk = chunkIdx * CHUNK_SIZE;
      const completedInChunk = next - fieldsBeforeChunk;

      if (
        chunks[chunkIdx] &&
        completedInChunk >= chunks[chunkIdx].length &&
        chunkIdx + 1 < chunks.length
      ) {
        setIsChunkTransitioning(true);
        setTimeout(() => {
          setActiveChunkIndex(chunkIdx + 1);
          setIsChunkTransitioning(false);
        }, TIMING.CHUNK_TRANSITION);
      }

      if (next >= totalFields && !hasCalledCompleteRef.current) {
        hasCalledCompleteRef.current = true;
        setTimeout(onComplete, TIMING.COMPLETE_DELAY);
      }
      return next;
    });
  }, [totalFields, onComplete, chunks]);

  const handleAiComplete = useCallback(() => {
    setAiDone(true);
    if (!hasCalledCompleteRef.current) {
      hasCalledCompleteRef.current = true;
      onComplete();
    }
  }, [onComplete]);

  return (
    <div
      className="flex-1 rounded-2xl border bg-white overflow-hidden transition-all duration-700 document-card-enter"
      style={{
        borderColor: isActive ? 'rgba(36, 99, 235, 0.3)' : 'rgba(0,0,0,0.05)',
        boxShadow: isActive
          ? '0 25px 50px -12px rgba(36, 99, 235, 0.2), 0 0 0 1px rgba(36, 99, 235, 0.1)'
          : '0 1px 3px rgba(0,0,0,0.05)',
        opacity: isActive ? 1 : 0.4,
        animationDelay: `${cardIndex * 200}ms`,
      }}
    >
      {/* 헤더 */}
      <div className="relative bg-gradient-to-b from-slate-50/80 to-white px-6 pt-5 pb-4 border-b border-black/5">
        {isActive && !isDone && (
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full" />
        )}

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CardIcon isAi={isAiDoc} />
            <div>
              <h3 className="text-lg font-bold text-black/85">{doc.title}</h3>
              <p className="text-sm text-black/40">{doc.subtitle}</p>
            </div>
          </div>

          <CardStatus isDone={isDone} isActive={isActive} />
        </div>

        {!isAiDoc && totalFields > 0 && (
          <div className="mt-4 h-2 rounded-full bg-black/5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isDone
                  ? 'bg-primary'
                  : 'bg-gradient-to-r from-blue-500 to-primary progress-glow'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* 본문 */}
      <div className="p-5">
        {isAiDoc ? (
          <div className="min-h-[260px]">
            {aiStarted && doc.id in AI_CONTENT ? (
              <AiTypingContent text={AI_CONTENT[doc.id]} onComplete={handleAiComplete} />
            ) : (
              <AiPreparing />
            )}
          </div>
        ) : (
          <>
            <div
              className={`space-y-2.5 transition-opacity duration-300 ${
                isChunkTransitioning ? 'opacity-0' : 'opacity-100 animate-chunk-fade-in'
              }`}
              key={activeChunkIndex}
            >
              {chunks[activeChunkIndex]?.map((field, localIdx) => (
                <AnimatedField
                  key={`${activeChunkIndex}-${field.label}`}
                  field={field}
                  delay={
                    activeChunkIndex === 0
                      ? startDelay + TIMING.FIELD_START_DELAY + localIdx * TIMING.FIELD_DELAY
                      : 300 + localIdx * TIMING.FIELD_DELAY
                  }
                  onComplete={() => handleChunkFieldComplete(activeChunkIndex)}
                />
              ))}
            </div>

            {chunks.length > 1 && (
              <div className="flex justify-center gap-1.5 mt-3">
                {chunks.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === activeChunkIndex
                        ? 'w-6 bg-primary'
                        : idx < activeChunkIndex
                          ? 'w-1.5 bg-primary/60'
                          : 'w-1.5 bg-black/10'
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
});

function CardIcon({ isAi }: { isAi: boolean }) {
  const bgClass = isAi
    ? 'bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-purple-500/25'
    : 'bg-gradient-to-br from-blue-500 to-primary shadow-lg shadow-primary/25';

  const iconPath = isAi
    ? 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z'
    : 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z';

  return (
    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${bgClass}`}>
      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
      </svg>
    </div>
  );
}

function CardStatus({ isDone, isActive }: { isDone: boolean; isActive: boolean }) {
  if (isDone) {
    return (
      <div className="flex items-center rounded-full bg-primary/10 border border-primary/20 p-2 check-success">
        <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    );
  }

  if (isActive) {
    return (
      <div className="flex items-center bg-primary/5 rounded-full p-2">
        <div className="relative h-5 w-5">
          <div className="absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        </div>
      </div>
    );
  }

  return null;
}
