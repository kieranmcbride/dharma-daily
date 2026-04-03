import React, { useEffect, useState } from 'react';
import { Enso } from '../components/Enso';
import { fetchTeaching } from '../services/claudeService';
import { getCurrentQuote, getLastFetchDate, getToday, saveTeaching } from '../storage/teachingStorage';
import type { Teaching } from '../types';

type AppState = 'unrevealed' | 'loading' | 'revealing' | 'revealed' | 'error';

export function DailyTeachingScreen() {
  const [appState, setAppState] = useState<AppState>('unrevealed');
  const [teaching, setTeaching] = useState<Teaching | null>(null);

  const [ensoOpacity, setEnsoOpacity] = useState(1);
  const [quoteOpacity, setQuoteOpacity] = useState(0);
  const [quoteY, setQuoteY] = useState(12);
  const [attributionOpacity, setAttributionOpacity] = useState(0);

  useEffect(() => {
    const lastFetch = getLastFetchDate();
    const today = getToday();

    if (lastFetch === today) {
      const saved = getCurrentQuote();
      if (saved) {
        setTeaching(saved);
        setEnsoOpacity(0);
        setQuoteOpacity(1);
        setQuoteY(0);
        setAttributionOpacity(1);
        setAppState('revealed');
      }
    }
  }, []);

  async function handleTap() {
    if (appState !== 'unrevealed') return;
    setAppState('loading');

    try {
      const result = await fetchTeaching();
      saveTeaching(result);
      setTeaching(result);
      animateReveal();
    } catch {
      setAppState('error');
    }
  }

  function animateReveal() {
    setAppState('revealing');
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;

      setEnsoOpacity(Math.max(0, 1 - elapsed / 600));

      if (elapsed > 400) {
        const t = Math.min(1, (elapsed - 400) / 1200);
        setQuoteOpacity(t);
        setQuoteY(12 * (1 - t));
      }

      if (elapsed > 900) {
        const t = Math.min(1, (elapsed - 900) / 800);
        setAttributionOpacity(t);
      }

      if (elapsed < 1800) {
        requestAnimationFrame(tick);
      } else {
        setAppState('revealed');
      }
    }

    requestAnimationFrame(tick);
  }

  return (
    <div onClick={handleTap} style={styles.container}>

      {/* Ensō layer — fades out on reveal */}
      {appState !== 'revealed' && appState !== 'error' && (
        <div style={{ ...styles.layer, opacity: ensoOpacity }}>
          <Enso size={160} pulsing={appState === 'loading' || appState === 'revealing'} />
          {appState === 'unrevealed' && (
            <p style={styles.tapPrompt}>tap to receive</p>
          )}
        </div>
      )}

      {/* Teaching layer — fades in on reveal */}
      {teaching && appState !== 'unrevealed' && appState !== 'error' && (
        <div style={{ ...styles.layer, opacity: quoteOpacity }}>
          <p style={{ ...styles.quote, transform: `translateY(${quoteY}px)` }}>
            {teaching.quote}
          </p>
          <div style={{ opacity: attributionOpacity, textAlign: 'center' }}>
            <p style={styles.teacher}>{teaching.teacher}</p>
            {teaching.source && (
              <p style={styles.source}>{teaching.source}</p>
            )}
          </div>
        </div>
      )}

      {/* Error state */}
      {appState === 'error' && (
        <div style={styles.layer}>
          <Enso size={160} />
          <p style={styles.tapPrompt}>something interrupted the silence</p>
        </div>
      )}

    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'relative',
    minHeight: '100vh',
    backgroundColor: '#FAFAF8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    overflow: 'hidden',
  },
  layer: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '24px',
    padding: '0 11%',
    width: '100%',
  },
  tapPrompt: {
    fontSize: '11px',
    color: '#4A4A48',
    letterSpacing: '0.08em',
    margin: 0,
    fontFamily: 'Georgia, serif',
  },
  quote: {
    fontSize: '21px',
    lineHeight: 1.7,
    color: '#1A1A18',
    textAlign: 'center',
    margin: 0,
    fontFamily: 'Georgia, serif',
  },
  teacher: {
    fontSize: '12px',
    color: '#1A1A18',
    textAlign: 'center',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    margin: 0,
    fontFamily: 'Georgia, serif',
  },
  source: {
    fontSize: '11px',
    color: '#8A8A85',
    textAlign: 'center',
    fontStyle: 'italic',
    margin: '6px 0 0 0',
    fontFamily: 'Georgia, serif',
  },
};
