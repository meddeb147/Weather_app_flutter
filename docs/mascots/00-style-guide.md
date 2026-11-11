# Momo & Friends: Mascot Style Guide

For the 3D artist. Read this before any individual character sheet. Everything
here applies to all 10 mascots: one family, one artist, one style.

## 1. The look in one line

Japanese kawaii, soft 3D "clay / plush toy": something you want to squeeze.

## 2. Shared rules

| Area | Rule |
| --- | --- |
| Proportions | Chibi, about 2 heads tall. Head is 50% of total height. Body is a soft bean or egg shape. |
| Limbs | Tiny and stubby, no elbows or knees, no fingers or toes (mitten shapes; at most 2–3 soft toe dents). |
| Silhouette | Every mascot must be recognisable as a solid black silhouette at 48 px. Each sheet names the one feature that carries it. |
| Eyes | Large glossy ovals, set low on the face and wide apart. Dark pupil (never pure black: use `#2B1D1A`), one large highlight top-left, one small highlight bottom-right. Same eye construction for all 10. |
| Cheeks | Soft pink blush ovals under the eyes (`#FF9FA8`, 60% opacity). Blush intensity is an animation channel: it grows when she is happy or loved. |
| Mouth | Small, simple, centred close under the eyes. No teeth, no tongue detail except in a yawn or eating pose. |
| Nose | Tiny or absent. Never a realistic animal nose. |
| Surface | Matte clay with a faint plush micro-fuzz on fur areas. No realistic fur strands, no scales, no feathers drawn individually. |
| Edges | Everything rounded. Minimum bevel radius should read as "soft" even at close-up. |
| Lighting | Soft three-point studio light, warm key from top-left, gentle rim light, soft contact shadow. Subsurface scattering on ears, cheeks and bellies. |
| Palette | Pastel. Each mascot has 1 main colour, 1 secondary, 1 accent. Saturation stays under about 65% except the brand red-orange. |
| Brand colour | Momo's warm red-orange `#F26B4E`. Only Momo uses it as a main body colour. |

## 3. Originality rules

- All characters are 100% original. Do not reference, trace or "homage" any
  existing character, plush line, emoji set or game mascot.
- Momo must not resemble Mei from Pixar's *Turning Red*. Specific guardrails are
  in Momo's sheet.
- Before final approval, each design gets a similarity check against well-known
  characters of the same species.

## 4. The moon charm

Every mascot wears one small moon charm. Its shape shows her cycle phase, so it
must stay readable in every pose and at widget size.

| Phase | Charm shape | Glow | Charm colour |
| --- | --- | --- | --- |
| Menstrual | Thin dim crescent | None | Soft rose-silver `#D9B8C0` |
| Follicular | Growing moon (about half) | Faint | Pale gold `#F6DFA0` |
| Ovulation | Full moon | Strong soft halo, slow pulse | Warm gold `#FFD86B` |
| Luteal (PMS) | Waning moon (about one third, mirrored) | Fading | Lavender-silver `#C9C3E6` |

Build rules:

- One shared charm model for the whole family; only the mount changes
  (necklace, ear clip, flower, hat tip, pin).
- The charm is its own object and its own render layer, so the app can swap the
  phase without re-rendering the mascot.
- Size: about 12% of head width. It never covers the eyes or mouth.
- It always faces the camera, even when the mascot turns.

## 5. Phase poses (4 per mascot)

Each sheet gives the mascot's own version. The shared emotional target:

| Phase | Shared feeling | Shared visual cues |
| --- | --- | --- |
| Menstrual | Low energy, needs comfort | Lower posture, half-lidded eyes, cosy prop (blanket, hot water bottle, tea) |
| Follicular | Fresh, light, curious | Upright, bright eyes, small bounce in idle loop |
| Ovulation | Glowing, confident, social | Biggest smile, sparkle highlights, strongest blush |
| Luteal (PMS) | Sensitive, tired, easily overwhelmed | Slightly rounder body, small frown or pout, comfort snack nearby |

Tone rule for every pose: the mascot is never ugly, never a monster, never the
joke. PMS and period poses are relatable and lovable. We laugh *with* her.

## 6. Reaction animations (5 per mascot)

| Reaction | Trigger in app | Length | Notes |
| --- | --- | --- | --- |
| Receiving a gift | Partner or crew sends hug, tea, flowers, chocolate | 2–3 s | Surprise, then hugging the gift. Gift is a separate swappable object. |
| Happy | Log saved, mission confirmed | 1.5 s | Small hop, blush up |
| Sad | Low mood logged, SOS sent | Loop | Gentle, never distressing. No streaming tears except Momo's single big tear. |
| Sleepy | Night time, fatigue logged | Loop | Slow blink, yawn, nod |
| Celebrating | Cycle completed, level up | 3 s | Confetti in the mascot's accent colours |

Each mascot also needs a neutral idle loop (breathing, blink every 3–5 s) per phase.

## 7. Growth stages

The mascot levels up with each completed cycle. Model three stages:

1. **Baby** (cycles 0–2): head slightly larger, simpler markings.
2. **Friend** (cycles 3–8): the default design in the character sheets.
3. **Best friend** (cycle 9+): same size, adds one small signature detail
   named in each sheet. Never an "adult" redesign: she stays chibi.

## 8. Deliverables per mascot

1. Turnaround: front, three-quarter, side, back (neutral pose, Friend stage).
2. Expression sheet: neutral, happy, sad, sleepy, grumpy or pouty, surprised, loved.
3. 4 phase poses, rendered with transparent background at 2048 × 2048 px.
4. Separated parts for Rive rigging: body, head, each eye (open, half, closed),
   mouth set, ears, tail or fins, limbs, charm, props. Consistent pivot points
   across the family.
5. 5 reaction animations plus 4 idle loops, 30 fps, as Rive files (Lottie fallback).
6. Small-size test: each phase pose at 120 px (widget) and 48 px (lock screen),
   with thicker shapes if needed.
7. Sticker variant: 6 px white outline, no shadow.
8. Source `.blend` file with named collections and the shared material library.

## 9. Things to avoid

- Realistic anatomy, claws, teeth, blood, or any medical imagery.
- Sexualised poses or proportions.
- Angry "PMS monster" faces, steam from ears, lightning, skulls.
- Text baked into renders (the app is in English, French and Arabic).
- Left-or-right-only props that break when the layout mirrors for Arabic:
  keep poses roughly symmetrical or supply a mirrored version.
