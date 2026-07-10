import React, { useEffect, useState, useRef, useCallback } from 'react';
import runningImg from '@site/static/img/meerkat/suricate_running.webp';
import styles from './styles.module.css';

const KONAMI_CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
];

const ARROW_KEYS = new Set([
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
]);

// event.code reflects the physical key position on a QWERTY reference
// layout, so on an AZERTY keyboard the key printed "A" reports 'KeyQ'.
// event.key reflects the actual character produced, which matches what
// players see printed on their own keycaps regardless of layout.
const normalizeKey = (key) => (key.length === 1 ? key.toLowerCase() : key);

const RUN_DURATION_MS = 3000;

export default function KonamiEasterEgg() {
  const [isRunning, setIsRunning] = useState(false);
  const progressRef = useRef(0);

  const triggerRun = useCallback(() => {
    setIsRunning(true);
    console.log(
      '%c\u{1F9AB} Konami code accepted! Run, meerkat, run!',
      'font-size:14px;font-weight:bold;color:#e8871e;',
    );
    window.setTimeout(() => setIsRunning(false), RUN_DURATION_MS);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ignore auto-repeated keydowns fired while a key is held down: a
      // slightly-too-long "ArrowUp" press would otherwise inject extra
      // events and break a sequence that has two of the same key in a row.
      if (event.repeat) return;

      const key = normalizeKey(event.key);
      const expectedKey = KONAMI_CODE[progressRef.current];
      if (key === expectedKey) {
        if (ARROW_KEYS.has(key)) {
          // Stop the arrow keys from scrolling the page mid-sequence.
          event.preventDefault();
        }
        progressRef.current += 1;
        if (progressRef.current === KONAMI_CODE.length) {
          progressRef.current = 0;
          triggerRun();
        }
      } else {
        progressRef.current = key === KONAMI_CODE[0] ? 1 : 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerRun]);

  if (!isRunning) {
    return null;
  }

  return (
    <img
      src={runningImg}
      alt="A meerkat sprinting across the screen"
      className={styles.runner}
    />
  );
}
