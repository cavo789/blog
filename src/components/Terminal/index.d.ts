// Terminal itself is still JS (see .todos/0106-migration-composants-js-vers-typescript.md,
// niveau 4) — this hand-written declaration file only exists so TSX components that render
// <Terminal> get its real (mostly-optional) prop contract instead of TypeScript inferring one
// from the destructuring in index.js, where an argument without a default (title,
// typewriterSpeed, typewriterLineDelay) looks required even though it isn't. Delete this file
// once Terminal itself moves to .tsx and can declare its own Props inline.
import type { JSX, ReactNode } from "react";

export interface TerminalProps {
  children: ReactNode;
  title?: string;
  wrap?: boolean;
  /** Enables typewriter animation. Command lines ($/#) typed char-by-char; output lines appear whole. Click to skip. */
  typewriter?: boolean;
  /** ms per character on command lines. Omit to auto-scale based on line count. */
  typewriterSpeed?: number;
  /** ms before each output line appears. Omit to auto-scale based on line count. */
  typewriterLineDelay?: number;
}

declare function Terminal(props: TerminalProps): JSX.Element;

export default Terminal;
