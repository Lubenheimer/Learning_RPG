export type Quest = {
  id: string;
  title: string;
  description: string;
  xpValue: number;
  completed: boolean;
  createdAt: number;
  completedAt?: number;
  isBoss?: boolean;
};

export type Topic = {
  id: string;
  title: string;
  description: string;
  quests: Quest[];
  createdAt: number;
  archived?: boolean;
};

export type TimelineEvent = {
  id: string;
  message: string;
  timestamp: number;
  type: 'quest' | 'level' | 'boss' | 'achievement';
  xpGain?: number;
};

export type HeroClass = 'None' | 'Mage' | 'Warrior' | 'Bard';

export type HeroState = {
  level: number;
  totalXp: number;
  topics: Topic[];
  achievements: string[];
  timeline: TimelineEvent[];
  heroClass: HeroClass;
  lastLoginDate: string; // ISO date string YYYY-MM-DD
  streakCount: number;
  dailyXpPushed: number; // XP gained today
};
