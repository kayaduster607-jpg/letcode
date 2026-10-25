'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { isValidProblemId, normalizeProgress, touchStudyDay } from '@/lib/progress';

export function useNotes(problemId: number) {
  const { user, loading: authLoading } = useAuth();
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<{ problemId: number; value: string } | null>(null);

  const saveToServer = useCallback(async (pid: number, value: string) => {
    if (!user || !isValidProblemId(pid)) return;

    try {
      const res = await fetch('/api/progress', { cache: 'no-store' });
      if (!res.ok) throw new Error('progress request failed');
      const data = await res.json();
      const progress = normalizeProgress(data.progress);
      if (value.trim()) {
        progress.notes[pid] = value;
        touchStudyDay(progress, pid);
      } else {
        delete progress.notes[pid];
      }

      await fetch('/api/progress', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress }),
      });
    } catch {
      // 不写入公共 localStorage，避免不同用户共用浏览器时串数据。
    }
  }, [user]);

  const flushPending = useCallback((updateUi = true) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (pendingRef.current) {
      saveToServer(pendingRef.current.problemId, pendingRef.current.value);
      pendingRef.current = null;
    }

    if (updateUi) {
      setIsSaving(false);
    }
  }, [saveToServer]);

  useEffect(() => {
    let cancelled = false;

    async function loadNote() {
      if (authLoading || !user || !isValidProblemId(problemId)) {
        setNote('');
        setIsSaving(false);
        pendingRef.current = null;
        return;
      }

      try {
        const res = await fetch('/api/progress', { cache: 'no-store' });
        if (!res.ok) throw new Error('progress request failed');
        const data = await res.json();
        const progress = normalizeProgress(data.progress);
        if (!cancelled) setNote(progress.notes[problemId] || '');
      } catch {
        if (!cancelled) setNote('');
      } finally {
        if (!cancelled) setIsSaving(false);
      }
    }

    loadNote();
    pendingRef.current = null;

    return () => {
      cancelled = true;
      flushPending(false);
    };
  }, [problemId, flushPending, user?.id, user, authLoading]);

  const updateNote = useCallback(
    (value: string) => {
      if (!user) return;
      setNote(value);
      setIsSaving(true);
      pendingRef.current = { problemId, value };

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        flushPending(true);
      }, 500);
    },
    [problemId, flushPending, user]
  );

  const saveNow = useCallback(() => {
    flushPending(true);
  }, [flushPending]);

  return { note, updateNote, saveNow, isSaving };
}
