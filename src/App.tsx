import React, { useEffect, useState, useRef } from 'react';
import { Dashboard } from './components/Dashboard';
import { TopicsList } from './components/TopicsList';
import { Timeline } from './components/Timeline';
import { useHero } from './context/HeroContext';

import { Download, Upload, Sword, Wand2, Music } from 'lucide-react';

const App: React.FC = () => {
  const { state, importState, changeClass } = useHero();
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [prevLevel, setPrevLevel] = useState(state.level);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Level up detection
  useEffect(() => {
    if (state.level > prevLevel) {
      setShowLevelUp(true);
      setPrevLevel(state.level);
      
      const timer = setTimeout(() => {
        setShowLevelUp(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [state.level, prevLevel]);

  // Apply Theme
  useEffect(() => {
    document.body.className = '';
    if (state.heroClass !== 'None') {
      document.body.classList.add(`theme-${state.heroClass.toLowerCase()}`);
    }
  }, [state.heroClass]);

  // Export / Import Logic
  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `rpg_savegame_lvl${state.level}.json`);
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json && json.topics) { // simple validation
          importState(json);
          alert('Spielstand erfolgreich geladen!');
        } else {
          alert('Ungültige Savegame-Datei.');
        }
      } catch (err) {
        alert('Fehler beim Lesen der Datei.');
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="container">
      {/* Header */}
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ 
            color: 'var(--primary-color)', 
            fontSize: '2.5rem', 
            textShadow: '0 0 20px var(--primary-glow)',
            marginBottom: '0.2rem'
          }}>
            Learning RPG
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Level up in real life by learning new skills!</p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={handleExport} className="btn-secondary" style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Download size={18} /> Speichern
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="btn-secondary" style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Upload size={18} /> Laden
          </button>
          <input type="file" accept=".json" style={{ display: 'none' }} ref={fileInputRef} onChange={handleImport} />
        </div>
      </header>

      {/* Class Selection UI for Level 10+ */}
      {state.level >= 10 && state.heroClass === 'None' && (
        <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '2rem', borderRadius: '16px', marginBottom: '2rem', textAlign: 'center', border: '1px solid var(--primary-color)', boxShadow: '0 0 20px var(--primary-glow)' }}>
          <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>Wähle deine Klasse!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Du hast Level 10 erreicht. Es ist Zeit, deinen Pfad zu wählen.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn-secondary" onClick={() => changeClass('Warrior')} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', padding: '1rem', width: '120px' }}>
               <Sword color="#ef4444" size={32} />
               <span>Krieger</span>
            </button>
            <button className="btn-secondary" onClick={() => changeClass('Mage')} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', padding: '1rem', width: '120px' }}>
               <Wand2 color="#3b82f6" size={32} />
               <span>Magier</span>
            </button>
            <button className="btn-secondary" onClick={() => changeClass('Bard')} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', padding: '1rem', width: '120px' }}>
               <Music color="#10b981" size={32} />
               <span>Barde</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid-layout">
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Dashboard />
          <Timeline />
        </aside>
        
        <main>
          <TopicsList />
        </main>
      </div>

      {/* Level Up Overlay */}
      {showLevelUp && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 100,
          animation: 'slideIn 0.3s ease-out'
        }}>
          <div style={{
            background: 'var(--surface-color)',
            border: '2px solid var(--primary-color)',
            borderRadius: '16px',
            padding: '3rem',
            textAlign: 'center',
            boxShadow: '0 0 50px var(--primary-glow)',
            transform: 'scale(1.1)'
          }}>
            <h2 style={{ fontSize: '3rem', color: 'var(--primary-color)', marginBottom: '1rem', textShadow: '0 0 10px var(--primary-glow)' }}>
              LEVEL UP!
            </h2>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>
              Du bist jetzt Level {state.level}!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
