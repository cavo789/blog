// ESLint flat config — enforces the React conventions documented in AGENTS.md:
// functional components + Hooks only, no TypeScript (except the documented
// BrowserWindow exception), PropTypes required.
import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

export default [
  {
    ignores: [
      // "**/" prefixes make these depth-independent: they must also match
      // nested copies of the repo, e.g. git worktrees under .claude/worktrees/.
      "**/build/**",
      "**/.docusaurus/**",
      "**/node_modules/**",
      "**/*.eli5.json",
      // Blog post snippets are illustrative code samples embedded via <Snippet>,
      // not application source — they aren't held to the site's own lint rules.
      "**/blog/**",
      "**/.unpublished/**",
      "**/.claude/**",
    ],
  },
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx,mjs,cjs}"],
    plugins: {
      react,
      "react-hooks": reactHooks,
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      // React 19 + the classic JSX runtime used by Docusaurus don't require
      // React in scope for JSX.
      "react/react-in-jsx-scope": "off",
      // "warn" here: src/pages and src/theme still carry pre-existing gaps.
      // src/components is stricter below — AGENTS.md mandates PropTypes there
      // specifically, and .todos/040-inconsistent-proptypes-coverage.md closed
      // that gap.
      "react/prop-types": "warn",
      "no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", ignoreRestSiblings: true },
      ],
      "no-empty": ["error", { allowEmptyCatch: true }],
      // New/opinionated rule in eslint-plugin-react-hooks v7, prone to false
      // positives on intentional SSR-hydration patterns already documented in
      // this codebase (see src/components/Reaction/index.js) — kept visible,
      // not blocking.
      "react-hooks/set-state-in-effect": "warn",
      "react/no-unescaped-entities": "warn",
    },
  },
  {
    files: ["src/components/**/*.{js,jsx}"],
    rules: {
      "react/prop-types": "error",
    },
  },
];
