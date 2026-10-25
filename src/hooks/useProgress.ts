'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserProgress } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { cloneProgress, isValidProblemId, normalizeProgress, touchStudyDay } from '@/lib/progress';

export function useProgress() {
  const { user, loading: authLoading } = useAuth();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadProgress() {
      if (authLoading) {
        setLoading(true);
        setProgress(null);
        return;
      }

      if (!user) {
        setProgress(null);
        setLoading(false);
        setError('请先登录后再学习');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const res = await fetch('/api/progress', { cache: 'no-store' });
        if (!res.ok) throw new Error('progress request failed');
        const data = await res.json();
        if (!cancelled) {
          setProgress(normalizeProgress(data.progress));
        }
      } catch {
        if (!cancelled) {
          setProgress(null);
          setError('进度加载失败，请刷新页面或重新登录');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProgress();

    return () => {
      cancelled = true;
    };
  }, [user?.id, user, authLoading]);

  const syncProgress = useCallback(async (updated: UserProgress) => {
    if (!user) {
      setError('请先登录后再保存学习数据');
      return;
    }

    const normalized = normalizeProgress(updated);
    setProgress(normalized);
    setError('');

    try {
      const res = await fetch('/api/progress', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress: normalized }),
      });
      if (!res.ok) throw new Error('progress save failed');
    } catch {
      setError('保存失败：当前学习数据没有写入账号，请检查服务是否还在运行');
    }
  }, [user]);

  const toggleComplete = useCallback((problemId: number) => {
    if (!progress || !isValidProblemId(problemId)) return;
    const updated = cloneProgress(progress);
    const completed = new Set(updated.completedProblemIds);
    if (completed.has(problemId)) {
      completed.delete(problemId);
    } else {
      completed.add(problemId);
      touchStudyDay(updated, problemId);
    }
    updated.completedProblemIds = Array.from(completed);
    syncProgress(updated);
  }, [progress, syncProgress]);

  const toggleWrongBook = useCallback((problemId: number, reason: string = '') => {
    if (!progress || !isValidProblemId(problemId)) return;
    const updated = cloneProgress(progress);
    const wrongIds = new Set(updated.wrongProblemIds);
    if (!wrongIds.has(problemId)) {
      wrongIds.add(problemId);
      const exists = updated.wrongBook.some((entry) => entry.problemId === problemId);
      if (!exists) {
        updated.wrongBook.push({
          problemId,
          reason,
          addedAt: new Date().toISOString(),
          lastReviewAt: null,
          mastered: false,
        });
      }
      touchStudyDay(updated, problemId);
    } else {
      wrongIds.delete(problemId);
      updated.wrongBook = updated.wrongBook.filter((entry) => entry.problemId !== problemId);
    }
    updated.wrongProblemIds = Array.from(wrongIds);
    syncProgress(updated);
  }, [progress, syncProgress]);

  const markMastered = useCallback((problemId: number) => {
    if (!progress || !isValidProblemId(problemId)) return;
    const updated = cloneProgress(progress);
    updated.wrongBook = updated.wrongBook.map((entry) =>
      entry.problemId === problemId
        ? { ...entry, mastered: !entry.mastered, lastReviewAt: new Date().toISOString() }
        : entry
    );
    updated.wrongProblemIds = updated.wrongBook.filter((entry) => !entry.mastered).map((entry) => entry.problemId);
    touchStudyDay(updated, problemId);
    syncProgress(updated);
  }, [progress, syncProgress]);

  const updateWrongBookReason = useCallback((problemId: number, reason: string) => {
    if (!progress || !isValidProblemId(problemId)) return;
    const updated = cloneProgress(progress);
    updated.wrongBook = updated.wrongBook.map((entry) =>
      entry.problemId === problemId ? { ...entry, reason } : entry
    );
    syncProgress(updated);
  }, [progress, syncProgress]);

  const updatePostSolveCheck = useCallback((problemId: number, index: number, checked: boolean) => {
    if (!progress || !isValidProblemId(problemId) || !Number.isInteger(index)) return;
    const updated = cloneProgress(progress);
    if (!updated.postSolveChecks[problemId]) {
      updated.postSolveChecks[problemId] = {};
    }
    if (checked) {
      updated.postSolveChecks[problemId][index] = true;
      touchStudyDay(updated, problemId);
    } else {
      delete updated.postSolveChecks[problemId][index];
      if (Object.keys(updated.postSolveChecks[problemId]).length === 0) {
        delete updated.postSolveChecks[problemId];
      }
    }
    syncProgress(updated);
  }, [progress, syncProgress]);

  const isCompleted = useCallback((problemId: number) => {
    return progress?.completedProblemIds.includes(problemId) ?? false;
  }, [progress]);

  const isInWrongBook = useCallback((problemId: number) => {
    return progress?.wrongProblemIds.includes(problemId) ?? false;
  }, [progress]);

  return {
    progress,
    loading,
    error,
    syncProgress,
    toggleComplete,
    toggleWrongBook,
    markMastered,
    updateWrongBookReason,
    updatePostSolveCheck,
    isCompleted,
    isInWrongBook,
  };
}
