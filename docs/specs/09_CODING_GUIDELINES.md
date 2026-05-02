# Coding Guidelines — PromptFlow STT

**Date:** 2026-04-22
**Status:** Approved
**Branch:** bootstrap/initial-setup

---

## 1. Rust Style

- Run `cargo fmt` before every commit. CI enforces it — PRs fail if `cargo fmt -- --check` reports a diff.
- Run `cargo clippy -- -D warnings` before every PR. Zero warnings policy: the CI job fails on any warning.
- **No `unwrap()` or `expect()` in command handlers.** Return `Result<T, AppError>` and propagate errors. `unwrap()` is permitted only inside `#[cfg(test)]` blocks.
- Prefer `thiserror` for defining error types. **Never use `anyhow` in library code** (`enhancement/`, `providers/`, `stt/`, `storage/`, `audio/`). `anyhow` may be used only in `main.rs` for top-level setup errors.
- All public functions (`pub fn`, `pub async fn`) and public traits must have a doc comment (`///`) if non-trivial. Trivial getters are exempt.
- Test modules: place `#[cfg(test)] mod tests { ... }` at the bottom of each source file. Test names: `test_<function>_<scenario>` (e.g., `test_build_prompt_fix_grammar`).
- Use `#[async_trait]` for traits with async methods (`STTEngine`, `AIProvider`).
- Narrow Tokio features: use `features = ["rt-multi-thread", "sync", "time", "macros"]` — not `"full"`.

---

## 2. TypeScript / React Style

- `strict: true` in `tsconfig.json`. **No `any` types.** Use `unknown` with a runtime guard when the type is genuinely unknown at compile time.
- Functional components only — no class components, no `React.Component`.
- Hook prefix: `use` (e.g., `useEnhancement`, `useHotkeys`). Queries live in `src/queries/`. Side effects live in hooks, not in component bodies.
- **No raw `invoke()` calls in components or hooks.** All Tauri IPC calls go through `src/lib/tauri.ts` typed wrappers.
- Props interfaces: use `interface`, not `type` (e.g., `interface ButtonProps { label: string }`).
- **Named exports only** from utility files, stores, and hooks. No `export default` from `lib/`, `stores/`, `hooks/`, or `queries/` — only from component files where the framework requires it (e.g., lazy-loaded routes).
- Selectors in Zustand: access `store.field` directly, never select the entire store object (`useSettingsStore(s => s.provider)` not `useSettingsStore()`). This prevents unnecessary re-renders.

---

## 3. Testing Requirements

**Rust:**
- Unit tests for all pure functions: `enhancement::build_prompt`, VAD energy calculation, cost estimation math.
- Integration tests for command handlers using mock `AIProvider` and `STTEngine` implementations (not hitting real APIs in CI).
- Coverage target: **80%** for business logic modules: `enhancement/`, `providers/`, `cost/`, `storage/`.
- Run with: `cargo test` (unit) and `cargo test --test integration` (integration).

**TypeScript:**
- Unit tests for store actions (Zustand store behavior) and hook logic using `@testing-library/react-hooks`.
- No tests required for pure UI render — covered by manual QA.
- Run with: `npm test`.

---

## 4. Commit Conventions (Conventional Commits)

| Prefix | When to use |
|---|---|
| `feat(scope)` | New feature |
| `fix(scope)` | Bug fix |
| `docs(scope)` | Documentation only |
| `chore(scope)` | Build, config, dependencies |
| `refactor(scope)` | Code change with no feature or fix |
| `test(scope)` | Test additions or changes only |

**Scope:** use the module name (`overlay`, `stt`, `providers`, `storage`, `hotkeys`, `clipboard`, `settings`, etc.).

**Body:** required for non-trivial commits. Explain **why** the change was made, not what was changed (the diff shows what). Example:

```
feat(stt): add Deepgram streaming engine

Deepgram is the only cloud STT engine that supports streaming WebSocket
transcription, giving us sub-200ms partial transcripts. The previous
batch-only approach caused visible UI lag during long dictation sessions.
```

---

## 5. PR Rules

- No PRs merged to `main` without CI passing (all jobs green).
- Every PR description must include:
  1. What changed (1–3 bullets)
  2. How to test manually (step-by-step)
  3. Link to the relevant spec section (e.g., `docs/specs/04_FEATURES.md §1.3`) for feature PRs
- **Squash merge to `main`** — no merge commits. Rebase or squash before merging.
- Branch naming: `feat/<scope>`, `fix/<scope>`, `docs/<scope>`, `chore/<scope>`.
- Delete the branch after merging.
- `main` must always be in a releasable state — no WIP commits.
