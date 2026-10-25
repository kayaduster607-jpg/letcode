'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { isValidProblemId, normalizeProgress, touchStudyDay } from '@/lib/progress';

export function useHints(problemId: number) {
  const { user, loading: authLoading } = useAuth();
  const [unlockedLevel, setUnlockedLevel] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadHintLevel() {
      if (authLoading || !user || !isValidProblemId(problemId)) {
        setUnlockedLevel(0);
        return;
      }

      try {
        const res = await fetch('/api/progress', { cache: 'no-store' });
        if (!res.ok) throw new Error('progress request failed');
        const data = await res.json();
        const progress = normalizeProgress(data.progress);
        if (!cancelled) {
          setUnlockedLevel(progress.unlockedHints[problemId] || 0);
        }
      } catch {
        if (!cancelled) setUnlockedLevel(0);
      }
    }

    loadHintLevel();

    return () => {
      cancelled = true;
    };
  }, [problemId, user?.id, user, authLoading]);

  const unlockTo = useCallback(async (targetLevel: number) => {
    if (!user || !isValidProblemId(problemId)) return;
    const level = Math.min(Math.max(Math.floor(targetLevel), 0), 6);
    if (level <= unlockedLevel) return;

    setUnlockedLevel(level);

    try {
      const res = await fetch('/api/progress', { cache: 'no-store' });
      if (!res.ok) throw new Error('progress request failed');
      const data = await res.json();
      const progress = normalizeProgress(data.progress);
      const current = progress.unlockedHints[problemId] || 0;
      progress.unlockedHints[problemId] = Math.max(current, level);
      touchStudyDay(progress, problemId);

      const saveRes = await fetch('/api/progress', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress }),
      });
      if (!saveRes.ok) throw new Error('progress save failed');
    } catch {
      // 保存失败时只影响当前点击，刷新后会以账号数据为准，避免写入任何公共本地缓存。
    }
  }, [problemId, unlockedLevel, user]);

  const unlockNext = useCallback(async () => {
    await unlockTo(unlockedLevel + 1);
  }, [unlockTo, unlockedLevel]);

  const isLevelUnlocked = useCallback(
    (level: number) => level <= unlockedLevel,
    [unlockedLevel]
  );

  return { unlockedLevel, unlockNext, unlockTo, isLevelUnlocked };
}
