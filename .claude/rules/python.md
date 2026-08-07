---
paths:
  - "**/*.py"
---

# Python — always apply

Full rationale and more patterns: `python-best-practices` skill. Verify: `ruff check` / `mypy`.

- ✅ DO: type every parameter and return (`-> None` included). ❌ DON'T: `**kwargs: Any` or an
  untyped signature.
- ✅ DO: `if TYPE_CHECKING:` + `from __future__ import annotations` for type-only imports (avoids
  circular imports).
- ✅ DO: frozen value objects — `ConfigDict(frozen=True)` (pydantic) or `@dataclass(frozen=True)`.
  Update via `.model_copy(update={...})`, never in-place mutation.
- ✅ DO: `raise NewError(...) from exc` (or `from None` when deliberate) — never a bare `raise
  NewError(...)` that drops the original cause.
- ✅ DO: early return — `if bad: return; ...rest` — not a nested `if/else` tree.
- ✅ DO: 6+ parameters → a frozen dataclass/model (`run(opts: RunOpts)`), not a long positional
  signature.
- ✅ DO: zero hardcoded strings/numbers/URLs/paths inline — an `Enum` (finite choices) or a config
  constant.
- ❌ DON'T: module-level mutable globals — a module-level frozen config instance instead.
- ❌ DON'T: third-party async runtimes or bare `create_task()` for fire-and-forget — pure
  `asyncio`, `TaskGroup` for structured concurrency, await or store every task handle.
