import { useCallback, useEffect, useRef, useState, type JSX } from "react";
import clsx from "clsx";
import scaredImg from "@site/static/img/meerkat/suricate_scared.webp";
import styles from "./styles.module.css";

// "Jerk" (rate of change of acceleration) threshold that counts as a shake.
// History: 28 (initial) fired from a mere tilt; 60 (first field fix) still
// fired too easily across a full day of real-world phone use. Raise further
// if it still fires too easily, lower it if a real shake stops triggering it.
const SHAKE_JERK_THRESHOLD = 100;

// Ignore devicemotion samples firing faster than this: some devices report
// at 60Hz+, which would otherwise make every tiny jitter look like a spike.
const MIN_SAMPLE_INTERVAL_MS = 100;

// Minimum time between two triggers, so one shake gesture doesn't retrigger
// itself while the overlay is still showing.
const COOLDOWN_MS = 4000;

// How long the overlay stays fully visible before it starts fading out.
const VISIBLE_DURATION_MS = 2200;

// Fade-out duration; kept in sync with the `overlay-out` keyframes below.
const EXIT_DURATION_MS = 250;

type Phase = "hidden" | "visible" | "leaving";

export default function ShakeEasterEgg(): JSX.Element | null {
  const [phase, setPhase] = useState<Phase>("hidden");
  const lastAcceleration = useRef<{ x: number; y: number; z: number } | null>(null);
  const lastSampleTime = useRef(0);
  const lastTriggerTime = useRef(0);
  const leaveTimeoutRef = useRef<number | undefined>(undefined);
  const hideTimeoutRef = useRef<number | undefined>(undefined);

  const clearTimers = useCallback(() => {
    window.clearTimeout(leaveTimeoutRef.current);
    window.clearTimeout(hideTimeoutRef.current);
  }, []);

  const dismiss = useCallback(() => {
    clearTimers();
    setPhase("leaving");
    hideTimeoutRef.current = window.setTimeout(
      () => setPhase("hidden"),
      EXIT_DURATION_MS,
    );
  }, [clearTimers]);

  const trigger = useCallback(() => {
    clearTimers();
    setPhase("visible");
    // Best-effort haptic feedback. Browsers that require a user gesture for
    // navigator.vibrate() (devicemotion isn't one) will just ignore this.
    navigator.vibrate?.([40, 30, 40]);
    leaveTimeoutRef.current = window.setTimeout(() => {
      setPhase("leaving");
      hideTimeoutRef.current = window.setTimeout(
        () => setPhase("hidden"),
        EXIT_DURATION_MS,
      );
    }, VISIBLE_DURATION_MS);
  }, [clearTimers]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.DeviceMotionEvent) {
      return undefined;
    }

    const handleMotion = (event: DeviceMotionEvent) => {
      const acceleration = event.accelerationIncludingGravity;
      // All three axes must be present: DeviceMotionEventAcceleration types each
      // as `number | null`, and the jerk maths below reads x, y and z.
      if (
        !acceleration ||
        acceleration.x === null ||
        acceleration.y === null ||
        acceleration.z === null
      )
        return;

      const now = Date.now();
      const deltaTime = now - lastSampleTime.current;
      if (deltaTime < MIN_SAMPLE_INTERVAL_MS) return;

      const { x, y, z } = acceleration;
      const previous = lastAcceleration.current;

      if (previous) {
        const jerk =
          ((Math.abs(x - previous.x) +
            Math.abs(y - previous.y) +
            Math.abs(z - previous.z)) /
            deltaTime) *
          1000;

        if (jerk > SHAKE_JERK_THRESHOLD && now - lastTriggerTime.current > COOLDOWN_MS) {
          lastTriggerTime.current = now;
          trigger();
        }
      }

      lastAcceleration.current = { x, y, z };
      lastSampleTime.current = now;
    };

    window.addEventListener("devicemotion", handleMotion);
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, [trigger]);

  useEffect(() => clearTimers, [clearTimers]);

  if (phase === "hidden") {
    return null;
  }

  return (
    <button
      type="button"
      className={clsx(styles.overlay, phase === "leaving" && styles.leaving)}
      onClick={dismiss}
      aria-label="Dismiss"
    >
      <img
        src={scaredImg}
        alt="A startled meerkat, arms flailing, as if the ground just shook"
        className={styles.meerkat}
      />
    </button>
  );
}
