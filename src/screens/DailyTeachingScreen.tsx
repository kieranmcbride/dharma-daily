import React, { useEffect, useRef, useState } from 'react';
import { Enso } from '../components/Enso';
import { fetchTeaching } from '../services/claudeService';
import { getCurrentQuote, getLastFetchDate, getToday, saveTeaching } from '../storage/teachingStorage';
import type { Teaching } from '../types';

type AppState = 'unrevealed' | 'loading' | 'revealed' | 'error';

export function DailyTeachingScreen() {
  const [appState, setAppState] = useState<AppState>('unrevealed');
  const [teaching, setTeaching] = useState<Teaching | null>(null);

  const ensoOpacity = useRef(1);
  const quoteOpacity = useRef(0);
  const quoteY = useRef(12);
  const attributionOpacity = useRef(0);

  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const lastFetch = getLastFetchDate();
    const today = getToday();

    if (lastFetch === today) {
      const saved = getCurrentQuote();
      if (saved) {
        setTeaching(saved);
        ensoOpacity.current = 0;
        quoteOpacity.current = 1;
        quoteY.current = 0;
        attributionOpacity.current = 1;
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
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;

      // Enso fade out over 600ms
      ensoOpacity.current = Math.max(0, 1 - elapsed / 600);

      // Quote fade in + drift up over 1200ms, delay 400ms
      if (elapsed > 400) {
        const t = Math.min(1, (elapsed - 400) / 1200);
        quoteOpacity.current = t;
        quoteY.current = 12 * (1 - t);
      }

      // Attribution fade in over 800ms, delay 900ms
      if (elapsed > 900) {
        const t = Math.min(1, (elapsed - 900) / 800);
        attributionOpacity.current = t;
      }

      forceUpdate(n => n + 1);

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
      {(appState === 'unrevealed' || appState === 'loading') && (
        <div style={styles.unrevealedContent}>
          <Enso opacity={ensoOpacity.current} size={160} />
          <p style={styles.tapPrompt}>
            {appState === 'loading' ? '' : 'tap to receive'}
          </p>
        </div>
      )}

      {appState === 'error' && (
        <div style={styles.unrevealedContent}>
          <Enso opacity={1} size={160} />
          <p style={styles.tapPrompt}>something interrupted the silence</p>
        </div>
      )}

      {(appState === 'revealed' || appState === 'loading') && teaching && (
        <div style={styles.revealedContent}>
          <div style={{ ...styles.ensoSmall, opacity: ensoOpacity.current }}>
            <Enso size={40} />
          </div>
          <p style={{
            ...styles.quote,
            opacity: quoteOpacity.current,
            transform: `translateY(${quoteY.current}px)`,
          }}>
            {teaching.quote}
          </p>
          <div style={{ opacity: attributionOpacity.current }}>
            <p style={styles.teacher}>{teaching.teacher}</p>
            {teaching.source && (
              <p style={styles.source}>{teaching.source}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#FAFAF8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  unrevealedContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '24px',
  },
  tapPrompt: {
    fontSize: '11px',
    color: '#8A8A85',
    letterSpacing: '0.08em',
    margin: 0,
    fontFamily: 'Georgia, serif',
  },
  revealedContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '0 11%',
    gap: '24px',
    maxWidth: '78%',
  },
  ensoSmall: {
    marginBottom: '8px',
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
