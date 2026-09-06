<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Quietcare project rules

- Read `docs/CODEX_CONTEXT.md` before product work.
- Read `docs/DESIGN_SYSTEM.md` before changing the UI.
- Treat `final design.pdf` as the screen reference and `design library.pdf` as the visual-system reference.
- Reuse tokens and shared components; do not add arbitrary colours, type sizes, spacing, or radii.
- Use TypeScript, build mobile-first, and keep the central mock dataset internally consistent.
- Preserve semantic HTML, keyboard access, visible focus states, and reduced-motion behavior.
- Never invent prescription details, use identifiable patient data, or make autonomous medical decisions.
- Never commit credentials or environment files.
- Do not add or upgrade packages without approval.
- Run lint and a production build after implementation.
- Never commit or push unless requested.
