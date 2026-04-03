import React, { useState } from 'react';
import { useHero } from '../context/HeroContext';
import { AIGeneratorModal } from './AIGeneratorModal';
import { Plus, BookOpen, CheckCircle, CircleDashed, Sparkles, Trash2, Archive, ArchiveRestore } from 'lucide-react';

export const TopicsList: React.FC = () => {
  const { state, addTopic, addQuest, completeQuest, deleteTopic, toggleArchiveTopic } = useHero();
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicDesc, setNewTopicDesc] = useState('');
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  
  const [questTitle, setQuestTitle] = useState('');
  const [questXp, setQuestXp] = useState(100);
  const [questIsBoss, setQuestIsBoss] = useState(false);

  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim()) return;
    addTopic(newTopicTitle, newTopicDesc);
    setNewTopicTitle('');
    setNewTopicDesc('');
  };

  const handleAddQuest = (e: React.FormEvent, topicId: string) => {
    e.preventDefault();
    if (!questTitle.trim()) return;
    addQuest(topicId, questTitle, "", questXp, questIsBoss);
    setQuestTitle('');
    setQuestXp(100);
    setQuestIsBoss(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Add Topic Form */}
      <div className="glass-panel animate-slide-in" style={{ animationDelay: '0.1s' }}>
        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BookOpen size={20} color="var(--accent-color)" /> Start New Skill
        </h3>
        <form onSubmit={handleAddTopic} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <input 
            className="input-field" 
            placeholder="Topic Title (e.g. Learn JavaScript)" 
            value={newTopicTitle}
            onChange={(e) => setNewTopicTitle(e.target.value)}
            style={{ flex: 1, minWidth: '200px' }}
          />
          <input 
            className="input-field" 
            placeholder="Short description" 
            value={newTopicDesc}
            onChange={(e) => setNewTopicDesc(e.target.value)}
            style={{ flex: 1, minWidth: '200px' }}
          />
          <button type="submit" className="btn-primary">
            <Plus size={18} /> Add Topic
          </button>
          
          <button 
            type="button" 
            onClick={() => setIsAiModalOpen(true)}
            className="btn-primary" 
            style={{ 
              background: 'linear-gradient(135deg, #10b981, #059669)',
              gap: '0.5rem'
            }}
          >
            <Sparkles size={18} /> Plan generieren
          </button>
        </form>
      </div>

      {isAiModalOpen && <AIGeneratorModal onClose={() => setIsAiModalOpen(false)} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ color: 'var(--text-main)', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BookOpen size={24} color="var(--primary-color)" /> Deinen Stack
        </h3>
        <button 
          onClick={() => setShowArchived(!showArchived)} 
          className="btn-secondary"
          style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
        >
          {showArchived ? 'Aktive anzeigen' : 'Archiv anzeigen'}
        </button>
      </div>

      {/* Topics Quests */}
      <div className="grid-layout" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
        {state.topics.filter(t => !!t.archived === showArchived).map(topic => {
          const isExpanded = activeTopicId === topic.id;
          const completedQuests = topic.quests.filter(q => q.completed).length;
          const totalQuests = topic.quests.length;

          return (
            <div key={topic.id} className="glass-panel animate-slide-in" style={{ animationDelay: '0.2s', padding: '1.25rem' }}>
              <div 
                style={{ cursor: 'pointer', marginBottom: '1rem' }} 
                onClick={() => setActiveTopicId(isExpanded ? null : topic.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-main)' }}>{topic.title}</h3>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {completedQuests}/{totalQuests} Quests beendet
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }} onClick={e => e.stopPropagation()}>
                    <button 
                      onClick={() => toggleArchiveTopic(topic.id)}
                      style={{ color: 'var(--text-muted)', padding: '0.25rem' }}
                      title={topic.archived ? "Wiederherstellen" : "Archivieren"}
                    >
                      {topic.archived ? <ArchiveRestore size={18} /> : <Archive size={18} />}
                    </button>
                    <button 
                      onClick={() => {
                        if (window.confirm("Bist du sicher, dass du dieses Thema löschen möchtest?")) {
                          deleteTopic(topic.id);
                        }
                      }}
                      style={{ color: '#ef4444', padding: '0.25rem' }}
                      title="Löschen"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                {topic.description && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                    {topic.description}
                  </p>
                )}
              </div>

              {isExpanded && (
                <div style={{ borderTop: '1px solid var(--surface-border)', paddingTop: '1rem', marginTop: '1rem' }}>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                    {topic.quests.length === 0 ? (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                        No quests yet. Add one below!
                      </div>
                    ) : (
                      topic.quests.map(quest => (
                        <div 
                          key={quest.id} 
                          className={quest.isBoss && !quest.completed ? "quest-boss" : ""}
                          style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'rgba(0,0,0,0.2)',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            opacity: quest.completed ? 0.6 : 1,
                            transition: 'var(--transition-fast)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <button 
                              onClick={() => !quest.completed && completeQuest(topic.id, quest.id)}
                              style={{ 
                                color: quest.completed ? 'var(--success-color)' : 'var(--text-muted)',
                                cursor: quest.completed ? 'default' : 'pointer',
                              }}
                            >
                              {quest.completed ? <CheckCircle size={20} /> : <CircleDashed size={20} />}
                            </button>
                            <span 
                              className={quest.isBoss && !quest.completed ? "quest-boss-text" : ""}
                              style={{ 
                                textDecoration: quest.completed ? 'line-through' : 'none',
                                fontWeight: quest.isBoss ? 'bold' : 'normal'
                              }}
                            >
                              {quest.isBoss && !quest.completed && "💀 "}
                              {quest.title}
                            </span>
                          </div>
                          <span style={{ color: 'var(--primary-color)', fontWeight: 'bold', fontSize: '0.9rem' }}>
                            +{quest.xpValue} XP
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={(e) => handleAddQuest(e, topic.id)} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <input 
                      className="input-field" 
                      placeholder="New Quest..." 
                      value={questTitle}
                      onChange={(e) => setQuestTitle(e.target.value)}
                      style={{ padding: '0.5rem', flex: 1, minWidth: '150px' }}
                    />
                    <input 
                      type="number"
                      className="input-field" 
                      placeholder="XP" 
                      value={questXp}
                      onChange={(e) => setQuestXp(Number(e.target.value))}
                      style={{ width: '80px', padding: '0.5rem' }}
                      min="10"
                      step="10"
                    />
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      <input 
                        type="checkbox" 
                        checked={questIsBoss}
                        onChange={(e) => setQuestIsBoss(e.target.checked)}
                      /> Boss?
                    </label>
                    <button type="submit" className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                      Add
                    </button>
                  </form>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
