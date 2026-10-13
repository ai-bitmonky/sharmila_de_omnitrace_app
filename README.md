# OmniTrace

Privacy-first "paper trail & decision memory engine" — web app built with Next.js (App Router, TypeScript).

- `npm install && npm run dev` → http://localhost:3000
- One URL, two experiences: screens **≥ 900px** get the desktop site; screens **< 900px** get the native-style mobile app. The switch is live (resize to see it).
- Everything is usable without login. No OTP or email is required.
- Mobile deep links: `/#ask`, `/#trail/graph`, `/#register/031`, `/#alerts/1`, `/#vault`. Add `?frame=1` to draw a status bar for screenshots.
- No runtime dependencies beyond Next and React. Fonts load from Google Fonts.
- Deploy: import the repo in Vercel (framework preset: Next.js, no env vars needed).
