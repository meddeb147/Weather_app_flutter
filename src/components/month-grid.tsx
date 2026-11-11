import { Pressable, StyleSheet, Text, View } from 'react-native';

import { addDays, toISO, type ISODate } from '@/lib/dates';

import { colors, space } from './theme';

export interface DayLook {
  fill?: string;
  ring?: string;
  textColor?: string;
}

interface Props {
  year: number;
  /** 0 = January. */
  month: number;
  locale: string;
  look?: (date: ISODate) => DayLook;
  onPress: (date: ISODate) => void;
  selected?: ISODate | null;
  today: ISODate;
  /** Days after this are greyed out and cannot be tapped. */
  maxDate?: ISODate;
}

/** One month, weeks starting on Monday. */
export function MonthGrid({ year, month, locale, look, onPress, selected, today, maxDate }: Props) {
  const first = toISO(new Date(year, month, 1));
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leading = (new Date(year, month, 1).getDay() + 6) % 7;
  const cells: (ISODate | null)[] = [
    ...Array<null>(leading).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => addDays(first, i)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const weekday = new Intl.DateTimeFormat(locale, { weekday: 'narrow' });
  const dayNumber = new Intl.NumberFormat(locale);
  // 2024-01-01 was a Monday.
  const labels = Array.from({ length: 7 }, (_, i) => weekday.format(new Date(2024, 0, 1 + i, 12)));

  return (
    <View style={styles.grid}>
      <View style={styles.row}>
        {labels.map((l, i) => (
          <Text key={i} style={styles.weekday}>
            {l}
          </Text>
        ))}
      </View>
      {Array.from({ length: cells.length / 7 }, (_, w) => (
        <View key={w} style={styles.row}>
          {cells.slice(w * 7, w * 7 + 7).map((date, i) => {
            if (!date) return <View key={i} style={styles.cell} />;
            const l = look?.(date) ?? {};
            const disabled = maxDate !== undefined && date > maxDate;
            const isSelected = selected === date;
            return (
              <Pressable
                key={i}
                style={styles.cell}
                disabled={disabled}
                onPress={() => onPress(date)}
                accessibilityRole="button"
                accessibilityLabel={date}
                accessibilityState={{ selected: isSelected, disabled }}>
                <View
                  style={[
                    styles.day,
                    l.fill !== undefined && { backgroundColor: l.fill },
                    l.ring !== undefined && { borderWidth: 2, borderColor: l.ring, borderStyle: 'dashed' },
                    date === today && l.ring === undefined && styles.today,
                    isSelected && styles.selected,
                  ]}>
                  <Text style={[styles.dayLabel, l.textColor !== undefined && { color: l.textColor }, isSelected && styles.selectedLabel, disabled && styles.disabled]}>
                    {dayNumber.format(Number(date.slice(8)))}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { gap: space.xs },
  row: { flexDirection: 'row' },
  weekday: { flex: 1, textAlign: 'center', color: colors.textSoft, fontSize: 13, fontWeight: '600', paddingBottom: space.xs },
  cell: { flex: 1, height: 46, alignItems: 'center', justifyContent: 'center' },
  day: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  dayLabel: { fontSize: 15, color: colors.text, fontWeight: '500' },
  today: { borderWidth: 2, borderColor: colors.text },
  selected: { backgroundColor: colors.brand },
  selectedLabel: { color: colors.white, fontWeight: '700' },
  disabled: { color: '#CDBDB6' },
});
