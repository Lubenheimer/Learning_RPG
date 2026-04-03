import React from 'react';
import { useHero } from '../context/HeroContext';
import { getLevelProgress } from '../lib/levelLogic';
import { Shield, Star, Award, RotateCcw, Flame, Trophy } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { state, resetProgress } = useHero();
  const progress = getLevelProgress(state.totalXp);
  
  const handleReset = () => {
    if (window.confirm("Bist du sicher, dass du ALLES zurücksetzen möchtest? Dein Level und deine XP werden auf 0 gesetzt. Die Themen bleiben erhalten, aber die Quests werden als unvollständig markiert.")) {
      resetProgress();
    }
  };

  return (
    <div className="glass-panel animate-slide-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            background: 'var(--primary-glow)', 
            padding: '1rem', 
            borderRadius: '50%',
            boxShadow: '0 0 20px var(--primary-glow)'
          }}>
            <Shield size={40} color="var(--primary-color)" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Level {progress.currentLevel}
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              {state.heroClass !== 'None' ? `Klasse: ${state.heroClass}` : 'Learning Hero'}
            </p>
          </div>
        </div>
        <button 
          onClick={handleReset}
          style={{ color: 'var(--text-muted)', padding: '0.5rem' }}
          title="Fortschritt zurücksetzen"
        >
          <RotateCcw size={20} />
        </button>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>XP Progression</span>
          <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>
            {state.totalXp} / {progress.nextLevelBaseXp} XP
          </span>
        </div>
        <div className="xp-bar-container">
          <div 
            className="xp-bar-fill" 
            style={{ width: `${Math.min(100, Math.max(0, progress.progressPercentage))}%` }}
          />
        </div>
      </div>

      {/* Dailies & Streaks */}
      <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f97316', marginBottom: '0.25rem' }}>
             <Flame size={18} />
             <span style={{ fontWeight: 'bold' }}>Daily Streak: {state.streakCount} Tage</span>
           </div>
           <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
             Heute: {state.dailyXpPushed} / 50 XP gesammelt
           </div>
        </div>
        <div>
          {state.dailyXpPushed >= 50 && (
            <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>Geschafft!</span>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-color)', marginBottom: '0.5rem' }}>
            <Award size={20} />
            <span style={{ fontWeight: '500' }}>Active Topics</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            {state.topics.filter(t => !t.archived).length}
          </div>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success-color)', marginBottom: '0.5rem' }}>
            <Star size={20} />
            <span style={{ fontWeight: '500' }}>Competed</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            {state.topics.reduce((acc, topic) => acc + topic.quests.filter(q => q.completed).length, 0)}
          </div>
        </div>
      </div>

      {/* Badges / Achievements */}
      {state.achievements && state.achievements.length > 0 && (
         <div>
            <h4 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Trophy size={16} color="#eab308" /> Errungenschaften
            </h4>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {state.achievements.map(ach => (
                <span key={ach} style={{
                  background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(202, 138, 4, 0.1))',
                  border: '1px solid rgba(234, 179, 8, 0.5)',
                  color: '#fef08a',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  fontWeight: '500',
                  boxShadow: '0 0 10px rgba(234, 179, 8, 0.1)'
                }}>
                  {ach}
                </span>
              ))}
            </div>
         </div>
      )}
    </div>
  );
};
