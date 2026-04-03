import type { HeroState } from '../types';
import { calculateLevelFromXp } from './levelLogic';

const STORAGE_KEY = 'learning_rpg_state';

const defaultState: HeroState = {
  level: 1,
  totalXp: 0,
  topics: [],
  achievements: [],
  timeline: [],
  heroClass: 'None',
  lastLoginDate: new Date().toISOString().split('T')[0],
  streakCount: 0,
  dailyXpPushed: 0
};

export const loadState = (): HeroState => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (serializedState === null) {
      return defaultState;
    }
    const state = JSON.parse(serializedState) as HeroState;
    
    // Backwards compatibility layer
    const mergedState: HeroState = {
      ...defaultState,
      ...state,
      achievements: state.achievements || [],
      timeline: state.timeline || [],
      heroClass: state.heroClass || 'None',
      lastLoginDate: state.lastLoginDate || new Date().toISOString().split('T')[0],
      streakCount: state.streakCount || 0,
      dailyXpPushed: state.dailyXpPushed || 0
    };

    // Daily streak logic evaluation
    const today = new Date().toISOString().split('T')[0];
    if (mergedState.lastLoginDate !== today) {
      const lastDate = new Date(mergedState.lastLoginDate);
      const currentDate = new Date(today);
      const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        // Did they meet yesterday's goal? If yesterday dailyXpPushed >= 50, streak continues.
        if (mergedState.dailyXpPushed >= 50) {
          mergedState.streakCount += 1;
        } else {
          mergedState.streakCount = 0; // Broke streak
        }
      } else if (diffDays > 1) {
        mergedState.streakCount = 0; // Missed days
      }

      mergedState.dailyXpPushed = 0; // Reset daily xp
      mergedState.lastLoginDate = today;
    }

    // Recalculate level just to be sure it's in sync with XP
    mergedState.level = calculateLevelFromXp(mergedState.totalXp);
    return mergedState;
  } catch (err) {
    console.error('Could not load state', err);
    return defaultState;
  }
};

export const saveState = (state: HeroState) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serializedState);
  } catch (err) {
    console.error('Could not save state', err);
  }
};

export const createId = () => {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9);
};

export const getApiKey = (): string => {
  return localStorage.getItem('rpg_gemini_api_key') || '';
};

export const saveApiKey = (key: string) => {
  localStorage.setItem('rpg_gemini_api_key', key);
};
