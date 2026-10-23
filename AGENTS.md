This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

## Kevin's 10 Rules for Polished UI (Design System Invariants)

All agents collaborating on this codebase must strictly adhere to these rules:

1. **Easing is everything — default ease is banned**:
   - Never use platform/browser default `ease` or `ease-in-out`.
   - Use our house curves in `@/theme/motion`:
     - `easings.smooth` (`cubic-bezier(0.22, 1, 0.36, 1)`) — default for almost everything.
     - `easings.entrance` (`cubic-bezier(0.17, 1, 0.32, 1)`) — decorative entrances.
     - `easings.pop` (`cubic-bezier(0.35, 1.55, 0.65, 1)`) — badges, pops, overshoot.
     - `easings.inOut` (`cubic-bezier(0.66, 0, 0.34, 1)`) — symmetric moves.
2. **Define tokens first — no one-off values**:
   - Durations: `durations.fast` (150ms), `durations.normal` (200ms), `durations.slow` (280ms).
   - Use tokens from `@/theme/tokens` and `@/theme/motion`. No rogue timings or random radii.
3. **Draggable elements use real physics**:
   - Velocity tracking, release momentum, friction, and soft boundaries (rubber-band). Settle with springs, not fixed durations.
4. **Magnetic snap points & tactile feedback**:
   - Two-zone snap: tighter pull-in zone, larger release zone. Provide haptic tick (`Haptics.selectionAsync()`) when caught.
5. **Entrances lift in — never just fade**:
   - Fade + 6px rise (`translateY: 6 -> 0`) over ~280ms on `easings.smooth`.
6. **Real depth is layered light**:
   - Replace 1px borders with hairline rings (`StyleSheet.hairlineWidth`, tiny opacity 2%–8%).
   - Stack faint ambient and contact shadows, never a single harsh dark blur.
7. **Make everything tactile — press should be felt**:
   - On active/press, scale down to `0.98` (firm press, not a collapse). Fast duration (150ms) or interactive spring.
8. **Reveal height smoothly**:
   - Layout transitions with Reanimated (`Layout.springify()` / `LinearTransition`) instead of abrupt height jumps.
9. **Performance & accessibility first**:
   - Honor reduced motion preferences.
   - Favor GPU transforms (`scale`, `translateY`, `opacity`) over heavy layout churn on lists.
10. **State-driven design is the actual job**:
    - Design components as systems of states: idle, pressed (`scale: 0.98`), loading/working, empty, error, disabled.
