# Masyarakat Baru

An interactive concept prototype of the "Malaka Interactive Suite" for [Malaka Project](https://www.youtube.com/@MalakaProjectid): a Bahasa Bayi policy calculator, a daily logical-fallacy quiz and cheat sheet, and a social-issues impact simulator.

> Independent concept prototype. Not affiliated with or endorsed by Malaka Project.

See [`BUILD_PLAN.md`](./BUILD_PLAN.md) for scope, design and roadmap.

## Development

Requires Node 22+.

```bash
npm install
npm run dev          # http://localhost:3000
```

| Command                                                       | What it does                                                       |
| ------------------------------------------------------------- | ------------------------------------------------------------------ |
| `npm run build`                                               | Static export to `out/`                                            |
| `npm run preview`                                             | Serve `out/` locally on port 3000                                  |
| `npm run lint` / `npm run typecheck` / `npm run format:check` | Static checks                                                      |
| `npm test`                                                    | Unit tests (Vitest)                                                |
| `npm run test:e2e`                                            | Smoke tests (Playwright) against `out/`; run `npm run build` first |
| `npm run check`                                               | Everything CI runs, except E2E                                     |
