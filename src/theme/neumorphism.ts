import { Platform, type ViewStyle } from 'react-native';

/** Small elevation for cards and popovers. Flat enough for a B2B product; no raised or inset effects. */
export const raisedShadow: ViewStyle = Platform.select<ViewStyle>({
  ios: { shadowColor: '#0f172a', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3 },
  android: { elevation: 1, shadowColor: '#0f172a' },
  default: {},
}) as ViewStyle;

export const recessedBorder: ViewStyle = { borderWidth: 1, borderColor: '#cbd5e1' };

/** Alias kept for components that want the lightest elevation. */
export const subtleShadow = raisedShadow;
