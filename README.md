# Carousel Studio — Shekhar

Single-text-box Instagram carousel generator. Phone-accessible. Free hosting.

## How it works

1. Open the app on your phone
2. Pick a style (Dark / Cream / Live Vitae / Tweet)
3. Type what you want — a hook, the slides, the CTA
4. Tap Generate → preview appears in seconds
5. Tap Download ZIP → 8 PNGs land in your phone

## Stack

- **Next.js 15** on Vercel (free tier)
- **Gemini 2.0 Flash** via Google AI Studio (free, 1,500 req/day)
- **html2canvas + jszip** for client-side PNG export
- **PWA manifest** — installable to phone home screen

## Setup (one time)

### 1. Get a free Gemini API key
- Visit https://aistudio.google.com/app/apikey
- Sign in with Google, create a key, copy it.

### 2. Deploy to Vercel
- Push this repo (already done if you're reading this on GitHub).
- Go to https://vercel.com/new and import this repo.
- During import, add an env var:
  - Name: `GOOGLE_API_KEY`
  - Value: paste your Gemini key
- Click Deploy. Done.

### 3. Install on your phone
- Open the deploy URL on your phone (looks like `carousel-xxx.vercel.app`)
- Safari: Share → "Add to Home Screen"
- Chrome (Android): three-dot menu → "Install app"

Icon appears on home screen. Tapping it opens the app like a native app.

## Local dev

```bash
echo "GOOGLE_API_KEY=your_key_here" > .env.local
npm install
npm run dev
```

Open http://localhost:3000

## Files

- `app/page.tsx` — single-page UI (style picker + text box + preview + download)
- `app/api/generate/route.ts` — API route that calls Gemini
- `lib/skills.ts` — 4 carousel style system prompts (design DNA + voice rules)
- `public/photos/` — Shekhar's photo library (cover backgrounds, inside frames)

## Adding a new style

Edit `lib/skills.ts`:
1. Add to the `Style` union
2. Write the design DNA as a system prompt
3. Add it to the `SKILLS` and `STYLE_LABELS` maps
4. Add a button in `app/page.tsx` `STYLES` array
