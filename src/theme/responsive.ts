import { Dimensions, PixelRatio } from 'react-native';

const BASE_WIDTH = 390;

/**
 * Scales a font size with the screen width, anchored to a 390px phone. Clamped so text never
 * gets too small on narrow phones or too large on tablets.
 */
export function fs(size: number): number {
  const width = Dimensions.get('window').width;
  const factor = Math.min(1.15, Math.max(0.88, width / BASE_WIDTH));
  return Math.round(PixelRatio.roundToNearestPixel(size * factor));
}
