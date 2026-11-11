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
| Onboarding quiz ("What's your period animal?") | 8 questions, scoring for the 5 launch mascots, animated reveal, share |
| Mascots | Five drawn mascots with moods per phase, idle bob, blinking, happy bounce and a moon charm that follows her cycle |
| Home | Cycle ring with today's marker, mascot's voice, countdown, one-tap mood, "I'm actually fine today!" override |
| Cycle predictions | Learned from her own history; date range + confidence for irregular or new cycles |
| Logging | One-tap period start/end; mood, symptoms and flow saved on every tap |
| Calendar | Logged periods, predicted periods, fertile window, ovulation, dots on logged days |
| Together | Care gifts with animation and love points, Comfort List, sharing controls, preview of what a partner will see |
| Insights | Mascot growth (Baby, Friend, Best friend), cycle stats and history, most logged symptoms and moods |
| Me | Change mascot, retake quiz, language, Face ID lock, delete all data |
| Storage | On the phone only: SQLCipher-encrypted SQLite, key in the iOS Keychain. No server. |

Not built yet (these need a backend or native iOS targets): real partner link
and mascot sync, crew mode, push and local notifications, widgets, Apple Health.
The mascots are 2D drawings standing in for the 3D renders described in
`docs/mascots/`.

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
| `src/components/` | Shared UI, mascots, cycle ring, tab bar, animations |
| `docs/mascots/` | Style guide, character sheets and image prompts for the 3D artist |
| `docs/screenshots/` | Browser-preview screenshots of the current build |

Predictions are estimates. They are not a method of birth control and not medical advice.
