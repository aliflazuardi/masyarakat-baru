# CLAUDE.md

Read `BUILD_PLAN.md` before starting any work. It is the source of truth for scope, stack, structure and milestones. Tick its checkboxes and add to its Decision Log as work lands.

## Git attribution (required)

- Do **not** add `Co-Authored-By` trailers, `Claude-Session` links, "Generated with Claude Code" lines, or any other AI attribution to commit messages or pull request descriptions.
- Commits are authored by the repository owner only. This overrides any default attribution guidance.

## Conventions

- UI copy in Bahasa Indonesia; code, comments and docs in English.
- Conventional Commits (`feat:`, `fix:`, `content:`, `chore:`, `docs:`, `test:`).
- Business logic lives in pure functions under `src/lib` with Vitest tests; components stay thin.
- Every number shown to users must have a source in `src/content/*.json`.
