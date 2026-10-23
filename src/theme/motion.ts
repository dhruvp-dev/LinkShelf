import { Easing, type WithSpringConfig } from 'react-native-reanimated';

/**
 * Kevin's House Easings & Apple WWDC Fluid Spring Physics.
 * Specificity is the whole game: no generic browser or platform defaults.
 */
export const easings = {
  /** Default for almost everything: smooth deceleration into rest */
  smooth: Easing.bezier(0.22, 1, 0.36, 1),
  /** Decorative entrances and reveals */
  entrance: Easing.bezier(0.17, 1, 0.32, 1),
  /** Badges, pops, and micro-overshoots */
  pop: Easing.bezier(0.35, 1.55, 0.65, 1),
  /** Symmetric two-way transitions */
  inOut: Easing.bezier(0.66, 0, 0.34, 1),
} as const;

export const durations = {
  fast: 150,
  normal: 200,
  slow: 280,
} as const;

export const springs = {
  /** Critically damped, no overshoot. Instant direct touch feedback (buttons, cards, press states). */
  interactive: {
    damping: 20,
    stiffness: 300,
    mass: 0.8,
  } satisfies WithSpringConfig,

  /** Under-damped with subtle bounce (0.15 bounce). For rare/delightful micro-interactions (star toggles). */
  pop: {
    damping: 13,
    stiffness: 280,
    mass: 0.7,
  } satisfies WithSpringConfig,

  /** Apple drawer/sheet momentum. Smooth entrance and exit for sheets and modals. */
  sheet: {
    damping: 26,
    stiffness: 240,
    mass: 0.9,
  } satisfies WithSpringConfig,

  /** Segmented control sliding pill indicator transition. */
  pill: {
    damping: 22,
    stiffness: 230,
    mass: 0.8,
  } satisfies WithSpringConfig,
} as const;

export const motionDurations = {
  press: durations.fast,
  toast: durations.normal,
  sheet: durations.slow,
} as const;
