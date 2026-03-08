import React, { useState } from 'react';
import styles from './DesignLab.module.css';

interface VibeOption {
  id: string;
  label: string;
  render: () => React.ReactNode;
}

const DesignLab: React.FC = () => {
  const [activeVibe, setActiveVibe] = useState<string>('grid-basic');
  const [notes, setNotes] = useState<string>('');

  // Example options we'll populate later
  const vibeOptions: VibeOption[] = [
    {
      id: 'grid-basic',
      label: 'Basic Grid (Simple)',
      render: () => (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 32px)', gap: '1px', background: '#333' }}>
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} style={{ width: '32px', height: '32px', background: '#222' }} />
          ))}
        </div>
      ),
    },
    {
      id: 'grid-pixel',
      label: 'Pixelated Grid (Detailed)',
      render: () => (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 32px)', gap: '4px', background: '#1a1a1a' }}>
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} style={{ width: '32px', height: '32px', border: '1px solid #444', background: '#252525' }} />
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h3>🧪 Design Lab</h3>
        <p>Establishing game aesthetics and mechanics</p>
      </header>

      <div className={styles.main}>
        <aside className={styles.sidebar}>
          <h4>A/B Vibe Selector</h4>
          {vibeOptions.map((opt) => (
            <button
              key={opt.id}
              className={activeVibe === opt.id ? styles.active : ''}
              onClick={() => setActiveVibe(opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </aside>

        <section className={styles.viewer}>
          <div className={styles.renderArea}>
            {vibeOptions.find((o) => o.id === activeVibe)?.render()}
          </div>
          
          <div className={styles.feedback}>
            <h4>Feedback & Notes</h4>
            <textarea
              placeholder="e.g., 'I like the gap in Option B, but the tiles are too bright...'"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <button onClick={() => console.log('Saved notes:', notes)}>Save Preference</button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DesignLab;
