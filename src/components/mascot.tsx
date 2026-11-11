import { useEffect, useState } from 'react';
import Animated, { Easing, interpolate, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import Svg, { Circle, ClipPath, Defs, Ellipse, G, Path } from 'react-native-svg';

import type { Phase } from '@/lib/cycle/engine';
import { MASCOTS, type MascotId } from '@/lib/mascots';

/**
 * 2D stand-ins for the mascots, drawn from the character sheets in
 * docs/mascots. They will be swapped for the Rive animations made from the
 * 3D models; the props (mascot, phase, mood) are meant to stay the same.
 */

export type MascotMood = 'neutral' | 'happy' | 'sleepy' | 'sad' | 'grumpy' | 'love';

const INK = '#2B1D1A';
const BLUSH = '#FF9FA8';

/** How each mascot feels in each phase, from her character sheet. */
const PHASE_MOOD: Record<MascotId, Record<Phase, MascotMood>> = {
  momo: { menstrual: 'sad', follicular: 'neutral', ovulation: 'love', luteal: 'sad' },
  cat: { menstrual: 'sleepy', follicular: 'neutral', ovulation: 'happy', luteal: 'grumpy' },
  duck: { menstrual: 'neutral', follicular: 'happy', ovulation: 'happy', luteal: 'neutral' },
  koala: { menstrual: 'sleepy', follicular: 'neutral', ovulation: 'happy', luteal: 'sleepy' },
  pufferfish: { menstrual: 'sleepy', follicular: 'happy', ovulation: 'happy', luteal: 'grumpy' },
};

export function moodFor(mascot: MascotId, phase: Phase | null | undefined): MascotMood {
  return phase ? PHASE_MOOD[mascot][phase] : 'happy';
}

function Eye({ x, y, mood, blink, side }: { x: number; y: number; mood: MascotMood; blink: boolean; side: -1 | 1 }) {
  if (mood === 'happy' || mood === 'love') {
    return <Path d={`M${x - 8} ${y + 3} q8 -11 16 0`} stroke={INK} strokeWidth={4} strokeLinecap="round" fill="none" />;
  }
  if (blink || mood === 'sleepy') {
    return <Path d={`M${x - 8} ${y} q8 7 16 0`} stroke={INK} strokeWidth={4} strokeLinecap="round" fill="none" />;
  }
  return (
    <G>
      <Ellipse cx={x} cy={y} rx={7.5} ry={9.5} fill={INK} />
      <Circle cx={x - 2.5} cy={y - 3.5} r={3} fill="#FFFFFF" />
      <Circle cx={x + 3} cy={y + 3.5} r={1.4} fill="#FFFFFF" />
      {mood === 'grumpy' && <Path d={`M${x - 11 * side} ${y - 5} L${x + 10 * side} ${y - 12}`} stroke={INK} strokeWidth={4} strokeLinecap="round" />}
      {mood === 'sad' && <Path d={`M${x - 10 * side} ${y - 18} L${x + 8 * side} ${y - 14}`} stroke={INK} strokeWidth={3} strokeLinecap="round" />}
    </G>
  );
}

function Mouth({ x, y, mood, color = INK }: { x: number; y: number; mood: MascotMood; color?: string }) {
  if (mood === 'happy' || mood === 'love') return <Path d={`M${x - 8} ${y} h16 a8 8 0 0 1 -16 0z`} fill="#B0483A" />;
  if (mood === 'sad' || mood === 'grumpy') return <Path d={`M${x - 6} ${y + 5} q6 -7 12 0`} stroke={color} strokeWidth={3.5} strokeLinecap="round" fill="none" />;
  if (mood === 'sleepy') return <Ellipse cx={x} cy={y + 3} rx={3.5} ry={3} fill={color} />;
  return <Path d={`M${x - 6} ${y} q6 7 12 0`} stroke={color} strokeWidth={3.5} strokeLinecap="round" fill="none" />;
}

function Face({ x, y, spread = 24, mood, blink, mouth = true, mouthDy = 20 }: { x: number; y: number; spread?: number; mood: MascotMood; blink: boolean; mouth?: boolean; mouthDy?: number }) {
  const blush = mood === 'love' ? 0.95 : mood === 'happy' ? 0.8 : 0.6;
  return (
    <G>
      <Ellipse cx={x - spread - 12} cy={y + 15} rx={10} ry={6.5} fill={BLUSH} opacity={blush} />
      <Ellipse cx={x + spread + 12} cy={y + 15} rx={10} ry={6.5} fill={BLUSH} opacity={blush} />
      <Eye x={x - spread} y={y} mood={mood} blink={blink} side={-1} />
      <Eye x={x + spread} y={y} mood={mood} blink={blink} side={1} />
      {mouth && <Mouth x={x} y={y + mouthDy} mood={mood} />}
      {mood === 'sad' && <Path d={`M${x + spread + 8} ${y + 8} q-5 9 0 12 q5 -3 0 -12z`} fill="#9AD8F5" />}
      {mood === 'love' && <Path d={`M${x + spread + 30} ${y - 34} c-5 -7 -15 0 0 11 c15 -11 5 -18 0 -11z`} fill="#F28CA5" />}
    </G>
  );
}

/** Moon charm: dim crescent, growing moon, full glowing moon, waning moon. */
function Moon({ x, y, r, phase }: { x: number; y: number; r: number; phase: Phase }) {
  const top = `M${x} ${y - r}`;
  const shapes: Record<Phase, { d: string | null; fill: string }> = {
    menstrual: { d: `${top} A${r} ${r} 0 0 1 ${x} ${y + r} A${r * 1.35} ${r * 1.35} 0 0 0 ${x} ${y - r}Z`, fill: '#E6C2CB' },
    follicular: { d: `${top} A${r} ${r} 0 0 1 ${x} ${y + r}Z`, fill: '#F6DFA0' },
    ovulation: { d: null, fill: '#FFD86B' },
    luteal: { d: `${top} A${r} ${r} 0 0 0 ${x} ${y + r} A${r * 2.2} ${r * 2.2} 0 0 1 ${x} ${y - r}Z`, fill: '#C9C3E6' },
  };
  const s = shapes[phase];
  return (
    <G>
      {phase === 'ovulation' && <Circle cx={x} cy={y} r={r * 1.7} fill="#FFD86B" opacity={0.3} />}
      <Circle cx={x} cy={y} r={r + 2.5} fill="#FFFFFF" />
      <Circle cx={x} cy={y} r={r} fill={s.d ? '#5B4A6B' : s.fill} opacity={s.d ? 0.22 : 1} />
      {s.d && <Path d={s.d} fill={s.fill} />}
    </G>
  );
}

function Art({ mascot, mood, blink, phase }: { mascot: MascotId; mood: MascotMood; blink: boolean; phase?: Phase | null }) {
  const c = MASCOTS[mascot];
  const charm = (x: number, y: number) => (phase ? <Moon x={x} y={y} r={9} phase={phase} /> : null);

  switch (mascot) {
    case 'momo':
      return (
        <G>
          {/* comma tail with two cream bands */}
          <Path d="M146 168 q34 4 34 -24 q0 -20 -18 -18 q-12 2 -10 14 q8 -2 8 6 q0 8 -14 6z" fill={c.main} />
          <Path d="M172 128 q8 6 8 16" stroke={c.secondary} strokeWidth={7} strokeLinecap="round" fill="none" />
          <Path d="M158 164 q12 0 18 -8" stroke={c.secondary} strokeWidth={7} strokeLinecap="round" fill="none" />
          <Ellipse cx={100} cy={160} rx={44} ry={32} fill={c.main} />
          {/* heart belly patch */}
          <Path d="M100 180 c-22 -14 -24 -30 -11 -32 c7 -1 11 5 11 8 c0 -3 4 -9 11 -8 c13 2 11 18 -11 32z" fill={c.secondary} />
          <Ellipse cx={62} cy={168} rx={11} ry={9} fill={c.accent} />
          <Ellipse cx={138} cy={168} rx={11} ry={9} fill={c.accent} />
          <Circle cx={50} cy={46} r={21} fill={c.main} />
          <Circle cx={150} cy={46} r={21} fill={c.main} />
          <Circle cx={50} cy={46} r={11} fill="#FFC9A8" />
          <Circle cx={150} cy={46} r={11} fill="#FFC9A8" />
          <Circle cx={100} cy={88} r={62} fill={c.main} />
          <Ellipse cx={100} cy={108} rx={48} ry={36} fill={c.secondary} />
          <Circle cx={72} cy={58} r={5.5} fill={c.secondary} />
          <Circle cx={128} cy={58} r={5.5} fill={c.secondary} />
          <Face x={100} y={92} mood={mood} blink={blink} />
          <Path d="M72 140 q28 14 56 0" stroke={c.secondary} strokeWidth={2.5} fill="none" />
          {charm(100, 150)}
        </G>
      );
    case 'cat':
      return (
        <G>
          <Path d="M140 172 q44 6 40 -34 q-2 -16 -12 -14" stroke={c.main} strokeWidth={15} strokeLinecap="round" fill="none" />
          <Path d="M176 132 q-2 -8 -8 -8" stroke={c.secondary} strokeWidth={15} strokeLinecap="round" fill="none" />
          <Ellipse cx={100} cy={162} rx={42} ry={30} fill={c.main} stroke="#EADFD3" strokeWidth={1.5} />
          <Path d="M42 62 L50 14 L88 40z" fill={c.secondary} stroke={c.secondary} strokeWidth={10} strokeLinejoin="round" />
          <Path d="M158 62 L150 14 L112 40z" fill={c.secondary} stroke={c.secondary} strokeWidth={10} strokeLinejoin="round" />
          <Path d="M54 48 L56 28 L72 40z" fill="#FFD3DC" />
          <Path d="M146 48 L144 28 L128 40z" fill="#FFD3DC" />
          <Defs>
            <ClipPath id="catHead">
              <Circle cx={100} cy={92} r={60} />
            </ClipPath>
          </Defs>
          <Circle cx={100} cy={92} r={60} fill={c.main} stroke="#EADFD3" strokeWidth={1.5} />
          <G clipPath="url(#catHead)">
            <Ellipse cx={100} cy={30} rx={70} ry={32} fill={c.secondary} />
          </G>
          <Face x={100} y={96} mood={mood} blink={blink} />
          <Path d="M52 104 h-14 M52 112 h-12 M148 104 h14 M148 112 h12" stroke="#CDBFB3" strokeWidth={2.5} strokeLinecap="round" />
          {charm(50, 22)}
        </G>
      );
    case 'duck':
      return (
        <G>
          <Ellipse cx={72} cy={186} rx={13} ry={6} fill={c.secondary} />
          <Ellipse cx={128} cy={186} rx={13} ry={6} fill={c.secondary} />
          <Path d="M50 160 q0 -34 50 -34 q62 0 66 22 q-4 34 -62 34 q-54 0 -54 -22z" fill={c.main} />
          <Ellipse cx={132} cy={156} rx={20} ry={13} fill="#F7D06A" />
          <Path d="M98 30 q-6 -18 8 -18 q10 0 6 10" stroke={c.main} strokeWidth={8} strokeLinecap="round" fill="none" />
          <Circle cx={100} cy={86} r={58} fill={c.main} />
          <Face x={100} y={82} spread={26} mood={mood} blink={blink} mouth={false} />
          <Ellipse cx={100} cy={106} rx={19} ry={10} fill={c.secondary} />
          <Path d="M84 106 q16 6 32 0" stroke="#E08A45" strokeWidth={2.5} strokeLinecap="round" fill="none" />
          {/* daisy holding the charm */}
          {[0, 72, 144, 216, 288].map((a) => (
            <Ellipse key={a} cx={138} cy={24} rx={6} ry={10} fill="#FFFDF5" stroke="#F0E6C8" strokeWidth={1} transform={`rotate(${a} 138 36)`} />
          ))}
          {phase ? charm(138, 36) : <Circle cx={138} cy={36} r={7} fill="#FFD86B" />}
        </G>
      );
    case 'koala':
      return (
        <G>
          <Ellipse cx={100} cy={164} rx={46} ry={30} fill={c.main} />
          <Ellipse cx={100} cy={168} rx={28} ry={20} fill={c.secondary} />
          <Circle cx={36} cy={62} r={32} fill={c.main} />
          <Circle cx={164} cy={62} r={32} fill={c.main} />
          <Circle cx={36} cy={62} r={18} fill="#FFD9E0" />
          <Circle cx={164} cy={62} r={18} fill="#FFD9E0" />
          <Circle cx={100} cy={92} r={60} fill={c.main} />
          <Face x={100} y={90} spread={28} mood={mood} blink={blink} mouth={false} />
          <Ellipse cx={100} cy={102} rx={11} ry={14} fill="#6E6878" />
          <Ellipse cx={97} cy={96} rx={3} ry={4} fill="#FFFFFF" opacity={0.5} />
          <Mouth x={100} y={122} mood={mood === 'neutral' ? 'neutral' : mood} color="#6E6878" />
          {/* nightcap */}
          <Path d="M56 50 q44 -40 88 0 q-44 -12 -88 0z" fill="#B5C7E8" />
          <Path d="M104 22 q40 -8 52 26" stroke="#B5C7E8" strokeWidth={12} strokeLinecap="round" fill="none" />
          {phase ? charm(158, 52) : <Circle cx={158} cy={52} r={8} fill="#FFFFFF" />}
        </G>
      );
    case 'pufferfish': {
      const puffed = mood === 'grumpy';
      const r = puffed ? 70 : 60;
      return (
        <G>
          <Circle cx={100} cy={102} r={94} fill="#FFFFFF" opacity={0.35} />
          <Circle cx={100} cy={102} r={94} fill="none" stroke="#FFFFFF" strokeWidth={3} opacity={0.9} />
          <Path d="M60 44 q8 -10 20 -12" stroke="#FFFFFF" strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.9} />
          <Path d={`M${100 + r - 6} 104 l26 -16 q6 16 0 32z`} fill={c.accent} />
          <Path d="M88 40 q12 -20 24 0z" fill={c.accent} />
          {puffed &&
            [20, 65, 110, 160, 200, 250, 290, 335].map((a) => (
              <Circle key={a} cx={100 + (r + 2) * Math.cos((a * Math.PI) / 180)} cy={104 + (r + 2) * Math.sin((a * Math.PI) / 180)} r={7} fill={c.accent} />
            ))}
          <Circle cx={100} cy={104} r={r} fill={c.main} />
          <Ellipse cx={100} cy={104 + r * 0.42} rx={r * 0.72} ry={r * 0.5} fill={c.secondary} />
          {[
            [70, 62],
            [88, 54],
            [112, 54],
            [130, 62],
          ].map(([x, y]) => (
            <Circle key={x} cx={x} cy={y - (puffed ? 6 : 0)} r={4} fill="#6FC3BC" />
          ))}
          <Ellipse cx={100 - r + 2} cy={112} rx={9} ry={13} fill={c.accent} opacity={0.85} />
          <Face x={100} y={96} spread={puffed ? 28 : 24} mood={mood} blink={blink} />
          {charm(100, 30)}
        </G>
      );
    }
  }
}

interface Props {
  mascot: MascotId;
  phase?: Phase | null;
  /** Overrides the mood her phase would give. */
  mood?: MascotMood;
  size?: number;
  /** Change this value to make the mascot do a happy bounce. */
  bounceKey?: number;
  still?: boolean;
}

export function Mascot({ mascot, phase, mood, size = 180, bounceKey = 0, still = false }: Props) {
  const [blink, setBlink] = useState(false);
  const idle = useSharedValue(0);
  const bounce = useSharedValue(1);

  useEffect(() => {
    if (still) return;
    idle.value = withRepeat(withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.sin) }), -1, true);
    let open: ReturnType<typeof setTimeout>;
    const timer = setInterval(() => {
      setBlink(true);
      open = setTimeout(() => setBlink(false), 150);
    }, 3600);
    return () => {
      clearInterval(timer);
      clearTimeout(open);
    };
  }, [idle, still]);

  useEffect(() => {
    if (bounceKey > 0) bounce.value = withSequence(withSpring(1.14, { damping: 6, stiffness: 260 }), withSpring(1, { damping: 8, stiffness: 180 }));
  }, [bounceKey, bounce]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(idle.value, [0, 1], [size * 0.012, -size * 0.022]) },
      { scale: bounce.value * interpolate(idle.value, [0, 1], [1, 1.025]) },
    ],
  }));

  return (
    <Animated.View style={[{ width: size, height: size }, style]} accessible accessibilityRole="image" accessibilityLabel={mascot}>
      <Svg width={size} height={size} viewBox="0 0 200 200">
        <Art mascot={mascot} mood={mood ?? moodFor(mascot, phase)} blink={blink} phase={phase} />
      </Svg>
    </Animated.View>
  );
}
