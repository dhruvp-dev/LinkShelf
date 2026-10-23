import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { shade } from '@/utils/color';
import { raisedShadow } from '@/theme/neumorphism';

/** Miniature dimensional folder: a darker back tab, a raised front body and a soft top highlight. */
export function FolderIcon({ color, size = 44 }: { color: string; size?: number }) {
  const { scheme } = useTheme();
  const tabW = size * 0.46;
  const tabH = size * 0.24;
  const bodyTop = size * 0.16;
  const bodyH = size * 0.66;
  return (
    <View style={{ width: size, height: size }}>
      <View style={[styles.tab, { width: tabW, height: tabH, backgroundColor: shade(color, 0.12), borderRadius: size * 0.1 }]} />
      <View
        style={[
          styles.body,
          raisedShadow,
          {
            top: bodyTop,
            height: bodyH,
            backgroundColor: color,
            borderRadius: size * 0.16,
            borderTopWidth: 1,
            borderTopColor: scheme === 'dark' ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.85)',
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tab: { position: 'absolute', top: 0, left: 0 },
  body: { position: 'absolute', left: 0, right: 0 },
});
