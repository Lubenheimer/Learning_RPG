import React, { createContext, useContext, useState, useEffect } from 'react';
import type { HeroState, Topic, Quest, HeroClass, TimelineEvent } from '../types';
import { loadState, saveState, createId } from '../lib/storage';

interface HeroContextType {
  state: HeroState;
  addTopic: (title: string, description: string) => void;
  addFullTopic: (topic: Partial<Topic>) => void;
  deleteTopic: (id: string) => void;
  toggleArchiveTopic: (id: string) => void;
  resetProgress: () => void;
  addQuest: (topicId: string, title: string, description: string, xpValue: number, isBoss?: boolean) => void;
  completeQuest: (topicId: string, questId: string) => void;
  importState: (newState: HeroState) => void;
  changeClass: (newClass: HeroClass) => void;
}

const HeroContext = createContext<HeroContextType | undefined>(undefined);

export const HeroProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<HeroState>(loadState());

  // Save state whenever it changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  const addTopic = (title: string, description: string) => {
    const newTopic: Topic = {
      id: createId(),
      title,
      description,
      quests: [],
      createdAt: Date.now()
    };
    
    const timeEvent: TimelineEvent = {
        id: createId(),
        message: `Neues Skill-Thema gestartet: ${title}`,
        timestamp: Date.now(),
        type: 'achievement'
    };

    setState(prev => ({
      ...prev,
      topics: [...prev.topics, newTopic],
      timeline: [timeEvent, ...prev.timeline].slice(0, 50)
    }));
  };

  const addFullTopic = (topicData: Partial<Topic>) => {
    const newTopic: Topic = {
      id: createId(),
      title: topicData.title || 'Untitled Topic',
      description: topicData.description || '',
      createdAt: Date.now(),
      quests: (topicData.quests || []).map(q => ({
        ...q,
        id: createId(),
        completed: false,
        createdAt: Date.now()
      }))
    };
    
    setState(prev => ({
      ...prev,
      topics: [...prev.topics, newTopic]
    }));
  };

  const deleteTopic = (id: string) => {
    setState(prev => ({
      ...prev,
      topics: prev.topics.filter(t => t.id !== id)
    }));
  };

  const toggleArchiveTopic = (id: string) => {
    setState(prev => ({
      ...prev,
      topics: prev.topics.map(t => 
        t.id === id ? { ...t, archived: !t.archived } : t
      )
    }));
  };

  const resetProgress = () => {
    // We only reset Level, XP and Quests completion but keep Topics!
    setState(prev => ({
      ...prev,
      level: 1,
      totalXp: 0,
      dailyXpPushed: 0,
      topics: prev.topics.map(t => ({
        ...t,
        quests: t.quests.map(q => ({ ...q, completed: false }))
      }))
    }));
  };

  const addQuest = (topicId: string, title: string, description: string, xpValue: number, isBoss: boolean = false) => {
    const newQuest: Quest = {
      id: createId(),
      title,
      description,
      xpValue,
      completed: false,
      createdAt: Date.now(),
      isBoss
    };

    setState(prev => ({
      ...prev,
      topics: prev.topics.map(topic => 
        topic.id === topicId 
          ? { ...topic, quests: [...topic.quests, newQuest] }
          : topic
      )
    }));
  };

  const completeQuest = (topicId: string, questId: string) => {
    setState(prev => {
      let questXp = 0;
      let questName = '';
      let wasBoss = false;
      
      const newTopics = prev.topics.map(topic => {
        if (topic.id === topicId) {
          const newQuests = topic.quests.map(quest => {
            if (quest.id === questId && !quest.completed) {
              questXp = quest.xpValue;
              questName = quest.title;
              wasBoss = !!quest.isBoss;
              return { ...quest, completed: true, completedAt: Date.now() };
            }
            return quest;
          });
          return { ...topic, quests: newQuests };
        }
        return topic;
      });

      if (questXp === 0) return prev; // Already completed

      const newTotalXp = prev.totalXp + questXp;
      const newDailyXp = prev.dailyXpPushed + questXp;
      const newLevel = Math.floor((1 + Math.sqrt(1 + 8 * newTotalXp / 100)) / 2);
      
      const newTimelineEvent: TimelineEvent = {
        id: createId(),
        message: wasBoss ? `BOSS BESIEGT: ${questName}` : `Quest erfüllt: ${questName}`,
        timestamp: Date.now(),
        type: wasBoss ? 'boss' : 'quest',
        xpGain: questXp
      };

      let newTimeline = [newTimelineEvent, ...prev.timeline];

      if (newLevel > prev.level) {
        newTimeline = [{
            id: createId(),
            message: `LEVEL UP! Du bist jetzt Level ${newLevel}!`,
            timestamp: Date.now(),
            type: 'level'
        }, ...newTimeline];
      }

      // Achievement Checks
      const newAchievements = [...prev.achievements];
      if (newLevel >= 5 && !newAchievements.includes('Gelehrter')) newAchievements.push('Gelehrter');
      if (newTotalXp > 0 && !newAchievements.includes('Erstes Blut')) newAchievements.push('Erstes Blut');
      // check 100% complete of a topic with >= 5 quests
      const masterTopic = newTopics.find(t => t.quests.length >= 5 && t.quests.every(q => q.completed));
      if (masterTopic && !newAchievements.includes('Fokus-Meister')) newAchievements.push('Fokus-Meister');

      return {
        ...prev,
        totalXp: newTotalXp,
        dailyXpPushed: newDailyXp,
        level: newLevel,
        topics: newTopics,
        timeline: newTimeline.slice(0, 50),
        achievements: newAchievements
      };
    });
  };

  const importState = (newState: HeroState) => {
    setState(newState);
  };

  const changeClass = (newClass: HeroClass) => {
    setState(prev => ({ ...prev, heroClass: newClass }));
  };

  return (
    <HeroContext.Provider value={{ 
      state, addTopic, addFullTopic, deleteTopic, toggleArchiveTopic, resetProgress, addQuest, completeQuest, importState, changeClass 
    }}>
      {children}
    </HeroContext.Provider>
  );
};

export const useHero = () => {
  const context = useContext(HeroContext);
  if (context === undefined) {
    throw new Error('useHero must be used within a HeroProvider');
  }
  return context;
};
