---
name: python-best-practices
description: Generic Python code conventions and patterns — typing, immutability, pure asyncio, control flow, constants — with worked examples. Project-agnostic; a project rule adds its own size limits, library bans, and paths.
disable-model-invocation: false
---

# Python Best Practices

Generic and reusable across Python projects (the language-level sibling of `bash-best-practices`). A
project's own rule binds the specifics this skill can't know — per-file size limits, banned or
allowed libraries, template and config paths, the logger contract. This skill supplies the
conventions and the patterns that satisfy them.

## Code rules

**DRY + SOLID**

- No duplicated logic across functions — extract to helpers.
- One class = one responsibility.
- Value objects are immutable: a frozen pydantic v2 model, or a frozen dataclass when no validation
  is needed.

**Language**

- Code, comments, docstrings, log messages: American English only. No transliteration or mixed
  languages.

**Types**

- No `**kwargs: Any` — type every parameter explicitly. No untyped signatures; `-> None` when a
  function returns nothing.
- Type-only imports go behind `if TYPE_CHECKING:` with `from __future__ import annotations` at the
  top of the file (breaks import cycles, keeps runtime imports lean).
- `except A, B:` without parens (PEP 758, Python 3.14) in new code.
- Always chain or suppress explicitly: `raise NewError(...) from exc`, or `from None`.

**Async (pure asyncio)**

- Prefer the standard library: `asyncio`, no third-party async runtime.
- `asyncio.TaskGroup` for structured concurrency; `create_subprocess_exec()` for shell commands.
- Never `create_task()` for fire-and-forget — await the handle or store it for later cancellation.

**Global state**

- No module-level globals — use a module-level frozen config instance instead.

**Constants**

- Zero hardcoded strings / numbers / URLs / paths inline. Place them in an `Enum` (finite choices), a
  central config module (project-wide), or a local module constant (module-specific).

**Control flow**

- Prefer early return over `else`: `if bad: return; ...rest`. A simple ternary is fine.
- Use `if` / `elif` chains, not nested `if` / `else` trees.

**Too many parameters (PLR0913)**

- 6+ parameters → extract into a frozen dataclass: `run(opts: RunOpts)`.

**Templates**

- No inline multiline strings / heredocs for generated content — keep them in a templates directory
  and reference by a path constant.

## Log levels

`error` (user-facing failures) · `warning` (non-fatal anomalies) · `info` (major steps) · `debug`
(diagnostic detail).

## Examples

Type-only imports (avoid circular deps):

```python
from __future__ import annotations
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from mymodule import HeavyClass

def process(obj: HeavyClass) -> None:  # string annotation, no runtime import
    ...
```

Frozen model (immutability):

```python
class Config(BaseModel):
    model_config = ConfigDict(frozen=True)
    ecosystem: str
    strict: bool = False

cfg = Config(ecosystem="python", strict=True)        # create: explicit params
cfg = Config.model_validate(json.loads(user_input))  # untrusted data: model_validate
new_cfg = cfg.model_copy(update={"strict": False})   # update: never mutate, always copy
```

Early return:

```python
# Bad: nested else
def validate(x):
    if x > 0:
        return process(x)
    else:
        return None

# Good: early return
def validate(x):
    if x <= 0:
        return None
    return process(x)
```

Too many parameters (PLR0913):

```python
# Bad: 7 positional parameters
def run(tool, stage, ecosystem, strict, timeout, retry, parallel): ...

# Good: one frozen options object
class RunOpts(BaseModel):
    model_config = ConfigDict(frozen=True)
    tool: str
    stage: str
    ecosystem: str
    strict: bool
    timeout: int
    retry: int
    parallel: bool

def run(opts: RunOpts): ...
```

Magic number → named constant:

```python
# Bad
if count > 50: ...

# Good
class Thresholds(IntEnum):
    COLLECTION_WARN = 50

if count > Thresholds.COLLECTION_WARN: ...
```

Async (structured concurrency + subprocess):

```python
async def main():
    async with asyncio.TaskGroup() as tg:
        tg.create_task(foo())
        tg.create_task(bar())
    # both completed or one raised; no silent failures

proc = await asyncio.create_subprocess_exec(
    "command", "arg1",
    stdout=asyncio.subprocess.PIPE,
    stderr=asyncio.subprocess.PIPE,
)
stdout, stderr = await proc.communicate()
```
