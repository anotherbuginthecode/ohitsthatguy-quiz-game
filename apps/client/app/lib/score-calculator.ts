interface ScoreConfig {
  base: number;
  totalTime: number;
}

function getMultiplier(streak: number): number {
  if (streak >= 5) return 2;
  if (streak >= 4) return 1.5;
  if (streak >= 3) return 1.25;
  return 1;
}

export function calculatePoints(
  isCorrect: boolean,
  remainingGlobalTime: number,
  config: ScoreConfig,
  currentStreak: number
): { points: number; streak: number } {
  if (!isCorrect) return { points: 0, streak: 0 };

  const timeBonus = Math.floor((remainingGlobalTime / config.totalTime) * 100);

  const streak = currentStreak + 1;
  const multiplier = getMultiplier(streak);

  const points = Math.floor((config.base + timeBonus) * multiplier);

  return { points, streak };
}
