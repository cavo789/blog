# C1 — Animated terminal (typewriter)

| C1 | **Animated terminal** — replace static bash code blocks with a typewriter-effect "terminal" that replays the commands | Makes CLI tutorials come alive |

```
  ┌─ terminal ──────────────────────────────────┐
  │ $ docker compose up -d▋                     │  ← cursor types live
  │                                              │
  │ [+] Running 3/3                              │
  │  ✔ Network myapp_default   Created          │
  │  ✔ Container myapp-db-1    Started          │
  └──────────────────────────────────────────────┘
```

Current state: `Terminal` component is static (renders instantly).
Delta: add a `typewriter` prop that replays lines with configurable delay.
