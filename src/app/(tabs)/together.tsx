import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { LinearTransition, ZoomIn } from 'react-native-reanimated';

import { Burst } from '@/components/burst';
import { Mascot } from '@/components/mascot';
import { colors, font, radius, space } from '@/components/theme';
import { Body, Card, Chip, ChipRow, Heading, Label, Option, Screen, Squish, Title, ToggleRow } from '@/components/ui';
import { useStore } from '@/data/store';
import { COMFORT_CATEGORIES, GIFT_EMOJI, GIFTS, type ComfortCategory, type Gift, type Sharing } from '@/data/types';
import { formatDate } from '@/lib/dates';
import { celebrate } from '@/lib/haptics';
import { PHASE_COLORS } from '@/lib/mascots';

const SHARING: Sharing[] = ['mood', 'moodAndDates', 'paused'];
const CATEGORY_EMOJI: Record<ComfortCategory, string> = { snacks: '🍪', drinks: '🍵', flowers: '🌷', movies: '🎬' };

export default function TogetherScreen() {
  const { profile, prediction: p, settings, updateSettings, comfort, addComfort, removeComfort, fineToday } = useStore();
  const { t, i18n } = useTranslation();
  const [gift, setGift] = useState<{ kind: Gift; n: number }>({ kind: 'hug', n: 0 });
  const [category, setCategory] = useState<ComfortCategory>('snacks');
  const [draft, setDraft] = useState('');
  if (!profile) return null;

  const fmt = (d: string) => formatDate(d, i18n.language);
  const paused = settings.sharing === 'paused';
  const give = (kind: Gift) => {
    celebrate();
    setGift({ kind, n: gift.n + 1 });
    updateSettings({ lovePoints: settings.lovePoints + 1 });
  };
  const add = () => {
    addComfort(category, draft);
    setDraft('');
  };
  const comfortPreview = comfort.slice(0, 4).map((c) => c.text).join(', ');

  return (
    <Screen tint="#FFE3EA">
      <Title>{t('together.title')}</Title>

      <Card index={0} style={styles.soon}>
        <Heading>{t('together.soonTitle')}</Heading>
        <Body>{t('together.soonBody')}</Body>
      </Card>

      <Label>{t('together.giftsTitle')}</Label>
      <Card index={1}>
        <View style={styles.giftStage}>
          <Mascot mascot={profile.mascot} phase={p?.phase} mood={gift.n > 0 ? 'love' : fineToday ? 'happy' : undefined} size={150} bounceKey={gift.n} />
          <Burst emoji={GIFT_EMOJI[gift.kind]} trigger={gift.n} />
        </View>
        <View style={styles.giftRow}>
          {GIFTS.map((g) => (
            <Squish key={g} onPress={() => give(g)} haptic="none" label={t(`together.gift.${g}`)} style={styles.gift}>
              <Text style={styles.giftEmoji}>{GIFT_EMOJI[g]}</Text>
              <Text style={styles.giftLabel}>{t(`together.gift.${g}`)}</Text>
            </Squish>
          ))}
        </View>
        <Body soft style={styles.center}>
          ♥ {t('together.love', { count: settings.lovePoints })} · {t('together.giftsHint')}
        </Body>
      </Card>

      <Label>{t('together.comfortTitle')}</Label>
      <Card index={2}>
        <Body soft>{t('together.comfortHint')}</Body>
        <ChipRow>
          {COMFORT_CATEGORIES.map((c) => (
            <Chip key={c} emoji={CATEGORY_EMOJI[c]} label={t(`together.category.${c}`)} selected={category === c} onPress={() => setCategory(c)} />
          ))}
        </ChipRow>
        <View style={styles.addRow}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={add}
            placeholder={t('together.addPlaceholder')}
            placeholderTextColor={colors.textSoft}
            returnKeyType="done"
            maxLength={40}
            style={styles.input}
            accessibilityLabel={t('together.addPlaceholder')}
          />
          <Squish onPress={add} disabled={draft.trim().length === 0} haptic="tap" label={t('together.add')} style={styles.addButton}>
            <Text style={styles.addLabel}>＋</Text>
          </Squish>
        </View>
        <Animated.View layout={LinearTransition.springify().damping(16)} style={styles.items}>
          {comfort
            .filter((c) => c.category === category)
            .map((c) => (
              <Animated.View key={c.id} entering={ZoomIn.springify().damping(14)} layout={LinearTransition.springify().damping(16)}>
                <Squish onPress={() => removeComfort(c.id)} label={`${c.text} ✕`} style={styles.item}>
                  <Text style={styles.itemText}>{c.text}</Text>
                  <Text style={styles.itemX}>✕</Text>
                </Squish>
              </Animated.View>
            ))}
        </Animated.View>
      </Card>

      <Label>{t('together.sharingTitle')}</Label>
      <Card index={3}>
        {SHARING.map((s) => (
          <Option key={s} label={t(`together.sharing.${s}`)} selected={settings.sharing === s} onPress={() => updateSettings({ sharing: s })} />
        ))}
        <ToggleRow
          label={t('together.fertility')}
          hint={t('together.fertilityHint')}
          value={settings.shareFertility && !paused}
          onChange={(v) => updateSettings({ shareFertility: v })}
        />
      </Card>

      <Label>{t('together.previewTitle')}</Label>
      <Card index={4} style={styles.preview}>
        <View style={styles.previewTop}>
          <Mascot mascot={profile.mascot} phase={paused ? null : p?.phase} mood={paused ? 'sleepy' : fineToday ? 'happy' : undefined} size={96} still />
          <View style={styles.flex}>
            <Heading>{t(`mascot.${profile.mascot}.name`)}</Heading>
            {!paused && p && (
              <View style={[styles.phasePill, { backgroundColor: PHASE_COLORS[p.phase] }]}>
                <Text style={styles.phaseText}>{t(`phase.${p.phase}`)}</Text>
              </View>
            )}
          </View>
        </View>
        {paused || !p ? (
          <Body>{t('together.previewPaused')}</Body>
        ) : (
          <>
            <Body>{t(`guide.${profile.mascot}.${p.phase}`)}</Body>
            {comfortPreview.length > 0 && <Body soft>{t('together.comfortLine', { items: comfortPreview })}</Body>}
            {settings.sharing === 'moodAndDates' && <Body soft>{t('together.previewDates', { date: fmt(p.nextPeriod) })}</Body>}
            {settings.shareFertility && <Body soft>{t('together.previewFertile', { start: fmt(p.fertileWindow.start), end: fmt(p.fertileWindow.end) })}</Body>}
          </>
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: space.sm, alignItems: 'flex-start' },
  center: { textAlign: 'center' },
  soon: { backgroundColor: '#FFF4D6' },
  giftStage: { alignItems: 'center', justifyContent: 'center', height: 170 },
  giftRow: { flexDirection: 'row', justifyContent: 'space-between', gap: space.sm },
  gift: { alignItems: 'center', gap: 2, backgroundColor: colors.background, borderRadius: radius.md + 4, paddingVertical: space.md, width: 72 },
  giftEmoji: { fontSize: 30 },
  giftLabel: { fontFamily: font.semi, fontSize: 12.5, lineHeight: 18, color: colors.text },
  addRow: { flexDirection: 'row', gap: space.sm, alignItems: 'center' },
  addButton: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center' },
  addLabel: { color: colors.white, fontSize: 24, fontFamily: font.bold, lineHeight: 30 },
  input: { flex: 1, minWidth: 0, minHeight: 56, borderRadius: radius.pill, borderWidth: 2, borderColor: colors.border, paddingHorizontal: space.lg, fontFamily: font.medium, fontSize: 16, color: colors.text, backgroundColor: colors.card },
  items: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  item: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.brandSoft, borderRadius: radius.pill, paddingHorizontal: space.lg, minHeight: 44 },
  itemText: { fontFamily: font.semi, fontSize: 15, lineHeight: 22, color: colors.text },
  itemX: { fontSize: 12, color: colors.brandDark },
  preview: { borderWidth: 2, borderColor: colors.brandSoft, borderStyle: 'dashed' },
  previewTop: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  phasePill: { borderRadius: radius.pill, paddingHorizontal: space.md, paddingVertical: 4 },
  phaseText: { fontFamily: font.bold, fontSize: 13.5, lineHeight: 20, color: colors.text },
});
