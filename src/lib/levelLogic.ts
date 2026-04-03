export const calculateLevelFromXp = (totalXp: number): number => {
  // Formula based on XP = 50 * (level * (level - 1))
  // Resolves to: level = (1 + sqrt(1 + 8 * xp / 100)) / 2
  return Math.floor((1 + Math.sqrt(1 + 8 * totalXp / 100)) / 2);
};

export const getXpForLevel = (level: number): number => {
  return 50 * (level * (level - 1));
};

export const getLevelProgress = (totalXp: number) => {
  const currentLevel = calculateLevelFromXp(totalXp);
  const currentLevelBaseXp = getXpForLevel(currentLevel);
  const nextLevelBaseXp = getXpForLevel(currentLevel + 1);
  
  const xpIntoCurrentLevel = totalXp - currentLevelBaseXp;
  const xpNeededForNextLevel = nextLevelBaseXp - currentLevelBaseXp;
  
  const progressPercentage = (xpIntoCurrentLevel / xpNeededForNextLevel) * 100;
  
  return {
    currentLevel,
    currentLevelBaseXp,
    nextLevelBaseXp,
    xpIntoCurrentLevel,
    xpNeededForNextLevel,
    progressPercentage
  };
};
