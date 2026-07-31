import { useEffect } from 'react';
import { useChessStore } from '../store/useChessStore';

/**
 * Manages the per-second chess clock tick.
 * Extracted from HeaderUI so the UI layer has zero business logic.
 * Attach this hook once at the App root level.
 */
export function useChessClock(): void {
  const isTimerRunning = useChessStore((s) => s.isTimerRunning);
  const updateClocks   = useChessStore((s) => s.updateClocks);

  useEffect(() => {
    if (!isTimerRunning) return;
    const id = setInterval(updateClocks, 1000);
    return () => clearInterval(id);
  }, [isTimerRunning, updateClocks]);
}
