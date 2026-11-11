# Momo & Friends (working title)

**The cycle tracker you raise together.**

A cute, privacy-first period and cycle tracker for iPhone. Every woman gets a 3D
mascot that matches her period personality, and her partner and friends join the
same little world to care for the mascot, and for her, together.

- Platform: iOS first, React Native + Expo SDK 58 (TypeScript, Expo Router)
- Languages: English, French, Arabic (right-to-left)
- Privacy: her health log stays on her iPhone; nothing in this build talks to a server

## What works today

| Area | Status |
| --- | --- |
| Onboarding quiz ("What's your period animal?") | 8 questions, scoring for the 5 launch mascots, reveal screen, share |
| Cycle predictions | Learned from her own history; date range + confidence for irregular or new cycles |
| Four phases | Shown on home, drive the mascot's voice and moon charm |
| Logging | One-tap period start/end; mood, symptoms and flow saved on every tap |
| Calendar | Logged periods, predicted periods, fertile window, ovulation |
| Settings | Change mascot, retake quiz, language, delete all data |
| Storage | SQLCipher-encrypted SQLite, key in the iOS Keychain |

Not built yet: partner link and mascot sync, care gifts, Comfort List, widgets,
notifications, Apple Health, Face ID lock, real mascot art (the mascots are
placeholder shapes until the 3D renders exist).

## Run it

```bash
npm install
```

```bash
npx expo run:ios
```

A development build is required (not Expo Go) because the encrypted database is a native module.

```bash
npm test
```

```bash
npm run typecheck
```

## Layout

| Path | What it is |
| --- | --- |
| `src/app/` | Screens (Expo Router): onboarding quiz and the Home, Calendar, Log, Settings tabs |
| `src/lib/cycle/engine.ts` | Prediction engine, pure TypeScript, unit tested |
| `src/lib/quiz/quiz.ts` | Quiz questions and scoring |
| `src/data/` | On-device storage and app state |
| `src/i18n/` | English, French and Arabic strings |
| `src/components/` | Shared UI, month grid, placeholder mascot |
| `docs/mascots/` | Style guide, character sheets and image prompts for the 3D artist |
| `docs/screenshots/` | Browser-preview screenshots of the current build |

Predictions are estimates. They are not a method of birth control and not medical advice.
