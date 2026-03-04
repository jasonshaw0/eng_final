# Renewable Grid Presentation

Interactive class presentation built with React + Vite.

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## AI Narration Workflow (Static / GitHub Pages Friendly)

This app ships pre-rendered narration so viewers never regenerate TTS at runtime.

1. Update canonical narration text in `public/narration/manifest.json` (`slides[].scriptText`).
2. Optional but recommended: verify alignment prerequisites (ffmpeg + Python packages):

```bash
npm run alignment:setup
```

3. Generate or refresh narrated WAV files + timing metadata:

```bash
GEMINI_API_KEY=your_key_here npm run narration:build
```

Voice behavior:
- Requested voice defaults to `Alnilam`.
- If that voice is rejected by Gemini, the builder falls back to `Charon` and records it in manifest metadata.

4. Verify narration consistency:

```bash
npm run narration:verify
```

5. Build the app:

```bash
npm run build
```

`npm run build` now runs `narration:verify` first and fails if narration assets are stale or mismatched.

6. Narration build writes/updates:
- `public/narration/slide-XX-<hash>.wav`
- `public/narration/manifest.json` (`scriptText`, `segments[]`, `words[]`, per-slide hashes/metadata, manifest-level TTS metadata)
- a validation summary in terminal (forced/fallback alignment + text/timing checks)

If forced alignment dependencies are missing, the builder still works and marks fallback timing mode.

7. Manual visual sync keyframes live in:
- `public/narration/keyframes.json`

Runtime source of truth:
- Subtitles and autoplay timing read from `public/narration/manifest.json`.
- Print narration script also reads from the same manifest so captions/script/audio stay in lockstep.
