import React from 'react';
import { useHero } from '../context/HeroContext';
import { Swords, Trophy, ChevronUp, ScrollText } from 'lucide-react';

export const Timeline: React.FC = () => {
  const { state } = useHero();

  if (state.timeline.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'boss': return <Swords size={16} color="#ef4444" />;
      case 'level': return <ChevronUp size={16} color="var(--primary-color)" />;
      case 'achievement': return <Trophy size={16} color="#eab308" />;
      default: return <ScrollText size={16} color="var(--accent-color)" />;
    }
  };

  return (
    <div className="glass-panel animate-slide-in" style={{ animationDelay: '0.1s' }}>
      <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>
        Aktivitäts-Logbuch
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
        {state.timeline.map((event) => {
          const date = new Date(event.timestamp);
          const timeString = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
          
          return (
            <div key={event.id} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.9rem', marginBottom: '0.5rem', background: 'rgba(0,0,0,0.15)', padding: '0.5rem', borderRadius: '8px' }}>
              <div style={{ color: 'var(--text-muted)', minWidth: '40px' }}>{timeString}</div>
              <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                <div style={{ marginTop: '2px' }}>{getIcon(event.type)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: event.type === 'boss' ? '#ef4444' : 'var(--text-main)', fontWeight: event.type === 'level' ? 'bold' : 'normal' }}>
                    {event.message}
                  </div>
                  {event.xpGain && (
                    <div style={{ color: 'var(--primary-color)', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      +{event.xpGain} XP
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
