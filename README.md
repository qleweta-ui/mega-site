# Bureau of Anomalies (Vite + PixiJS)

A premium, paper-grain inspired HTML game about classifying strange files in a midnight bureau. Built with **Vite**, **TypeScript**, **PixiJS**, **Matter.js**, **GSAP**, and **Howler.js**.

## Quick start

```bash
npm i
npm run dev
npm run build
npm run preview
```

## GitHub Pages

- `vite.config.ts` is pre-set with `base: "/mega-site/"` for this repository name.
- Deploy with a GitHub Action (see `.github/workflows/deploy.yml`).
- For another repo name, update the `base` option.

## Controls & loop

- Hold **Space** to enable the UV lamp (M6). Hidden watermarks and false fields appear only then.
- Drag the **stamp** to approve/quarantine/destroy (M2 magnet behavior). Use action buttons to finalize the verdict.
- Scratch the **signature** area by dragging the cursor while holding a button (M3).
- Hover over **text** to see it drift and obscure words (M1).
- Watch the **photo stain** spread on hover; pin it with the **paperclip** (M4).
- Some fields **flip after a decision** if you skipped UV (M5).
- Inbox (left), archive and shredder (right) are represented on the desk; process 5–7 cases within ~12 minutes to reach an ending.

## Game states

`Boot → Desk → CaseReview → Result → Ending`. Tutorial auto-starts (60s hands-on) and can be restarted from the overlay.

## Performance

Toggle **Performance mode** in the UI to disable heavier flourishes if needed while preserving 60 FPS target.

## Saving

Progress (cases completed, trust/anomaly gauges, best ending) is stored in `localStorage`.

## Adding a case

1. Open `src/cases/data.ts` and append a `CaseFile` entry.
2. Provide at least one anomaly tag (`M1`–`M6`), `pages`, `photoNote`, `signatureHint`, and whether it `needsUV`.
3. If the file should trick the user when UV is skipped, add a `misdirection` string.
4. Set `requiresClip` to enforce the paperclip fix.

## Adding a new anomaly (M7+)

1. Create a small module under `src/fx/` with the interaction logic.
2. Bind it in `src/core/game.ts` when rendering a case based on a new tag.
3. Document the mechanic and a sample case in `src/cases/data.ts`.

## Art direction (unified)

- **Palette:** paper base `#f4f0e4`, ink `#1e1c1a`, shadow `#0f0d0b`, accent amber `#e3a63b`, accent crimson `#b03a48`, accent azure `#4a7ad3`, accent mint `#68c6a3`, UV glow `#9b7bf0`.
- **Fonts:** titles use `Spectral SC`, body uses `Inter` (both loaded via Google Fonts).
- **Animation rules:** short UI responses 0.2–0.35s with `sine.inOut`, physical snaps use `back.out(2)`, elastic reveals use `elastic.out(1,0.3)`. Keep motions minimalistic to match the desk aesthetic.
- **Surface feel:** paper grain, soft vignette, low-contrast shadows; desk is deep charcoal with faint film noise.

## Audio layer

- Paper rustle on document interactions.
- Paperclip click when pinning stains.
- Dull stamp hit when committing a decision.
- UV lamp hum while active; low ominous tone when anomaly rises.

## Adding or tweaking sounds

Sounds are procedurally generated waveforms defined in `src/audio/sounds.ts`; swap `tone()` parameters or replace with external samples if desired.

## Files & modules

- `src/core` — state machine and session orchestration.
- `src/render` — Pixi scene and desk.
- `src/physics` — Matter.js world for stamp/paper feel.
- `src/cases` — JSON-like cases with anomalies and hints.
- `src/ui` — DOM overlay for metrics and actions.
- `src/fx` — interactive anomaly helpers (M1–M6 implemented).
- `src/audio` — generated sound layer.
- `src/utils` — persistence helpers.

