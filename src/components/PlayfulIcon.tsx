import React from 'react';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';

export type PlayfulIconName =
  | 'sparkle'
  | 'smile'
  | 'heart'
  | 'rocket'
  | 'cloud'
  | 'sun'
  | 'coffee'
  | 'bulb'
  | 'folder'
  | 'plane'
  | 'ghost'
  | 'shelf';

type Props = {
  name: PlayfulIconName;
  size?: number;
  color?: string;
  secondaryColor?: string;
  strokeWidth?: number;
};

/**
 * Hand-tuned playful vector icons with friendly rounded contours,
 * soft geometry, and optional two-tone accent details.
 * Drawn on a 24x24 coordinate canvas.
 */
export function PlayfulIcon({
  name,
  size = 24,
  color = '#26251e',
  secondaryColor,
  strokeWidth = 2,
}: Props) {
  const accent = secondaryColor ?? color;

  switch (name) {
    case 'sparkle':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          {/* Main 4-point organic sparkle */}
          <Path
            d="M12 3C12 7.5 15.5 11 20 11C15.5 11 12 14.5 12 19C12 14.5 8.5 11 4 11C8.5 11 12 7.5 12 3Z"
            fill={accent}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Playful mini accent dots */}
          <Circle cx="19" cy="5" r="1.5" fill={color} />
          <Circle cx="5" cy="18" r="1.2" fill={color} />
        </Svg>
      );

    case 'smile':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          {/* Round face */}
          <Circle
            cx="12"
            cy="12"
            r="9"
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Happy closed curve eyes */}
          <Path
            d="M8.5 9.5C8.8 8.5 9.7 8 10.5 8.5"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          <Path
            d="M13.5 8.5C14.3 8 15.2 8.5 15.5 9.5"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Wide playful grin */}
          <Path
            d="M8.5 13.5C9.5 15.8 14.5 15.8 15.5 13.5"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Rosy cheeks */}
          <Circle cx="7" cy="13" r="1" fill={accent} opacity={0.6} />
          <Circle cx="17" cy="13" r="1" fill={accent} opacity={0.6} />
        </Svg>
      );

    case 'heart':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          {/* Chubby bouncy heart */}
          <Path
            d="M12 20S4 14.5 4 8.5C4 5.5 6.5 3.5 9.5 3.5C11.2 3.5 12 4.5 12 4.5C12 4.5 12.8 3.5 14.5 3.5C17.5 3.5 20 5.5 20 8.5C20 14.5 12 20 12 20Z"
            fill={accent}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Little shine arc */}
          <Path
            d="M6.8 7.5C6.8 6.5 7.6 5.5 8.8 5.3"
            stroke="#ffffff"
            strokeWidth={1.8}
            strokeLinecap="round"
          />
        </Svg>
      );

    case 'rocket':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          {/* Rocket body */}
          <Path
            d="M14.5 3.5C14.5 3.5 19.5 5.5 20.5 10.5C20.5 13.5 18 16 16.5 17L12 12.5L14.5 3.5Z"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M12 12.5L7.5 17C6.5 15.5 4 13 4 10C5 5 10 3.5 10 3.5L12 12.5Z"
            fill={accent}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Porthole */}
          <Circle cx="12" cy="7.5" r="1.8" fill="#ffffff" stroke={color} strokeWidth={1.5} />
          {/* Flame puffs */}
          <Path
            d="M10 18.5C10.5 21 12 21.5 12 21.5C12 21.5 13.5 21 14 18.5"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        </Svg>
      );

    case 'cloud':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          {/* Pillowy rounded cloud */}
          <Path
            d="M6.5 18H17.5C19.4 18 21 16.4 21 14.5C21 12.7 19.6 11.2 17.8 11C17.4 7.6 14.5 5 11 5C8 5 5.5 7 4.8 9.8C3.2 10.4 2 11.9 2 13.7C2 16.1 4 18 6.5 18Z"
            fill={accent}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Cute rain droplet */}
          <Circle cx="10" cy="20.5" r="1" fill={color} />
          <Circle cx="15" cy="20.5" r="1" fill={color} />
        </Svg>
      );

    case 'sun':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          {/* Center happy disc */}
          <Circle
            cx="12"
            cy="12"
            r="5"
            fill={accent}
            stroke={color}
            strokeWidth={strokeWidth}
          />
          {/* Rounded friendly rays */}
          <Path
            d="M12 2.5V4M12 20V21.5M2.5 12H4M20 12H21.5M5.3 5.3L6.4 6.4M17.6 17.6L18.7 18.7M5.3 18.7L6.4 17.6M17.6 6.4L18.7 5.3"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        </Svg>
      );

    case 'coffee':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          {/* Chubby cup body */}
          <Path
            d="M4 8H17V14C17 17.3 14.3 20 11 20H10C6.7 20 4 17.3 4 14V8Z"
            fill={accent}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Big round loop handle */}
          <Path
            d="M17 10H18.5C19.9 10 21 11.1 21 12.5C21 13.9 19.9 15 18.5 15H17"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Playful steam curls */}
          <Path
            d="M8 3.5C8 4.5 9 5 9 5.8M13 3.5C13 4.5 14 5 14 5.8"
            stroke={color}
            strokeWidth={1.8}
            strokeLinecap="round"
          />
        </Svg>
      );

    case 'bulb':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          {/* Bulb bulbous shape */}
          <Path
            d="M9 17H15M10 20H14M12 3C7.6 3 4 6.6 4 11C4 13.8 5.5 16.2 7.7 17.4C8.5 17.9 9 18.7 9 19.5V19.8H15V19.5C15 18.7 15.5 17.9 16.3 17.4C18.5 16.2 20 13.8 20 11C20 6.6 16.4 3 12 3Z"
            fill={accent}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Spark rays */}
          <Path d="M12 6.5V8.5" stroke="#ffffff" strokeWidth={1.8} strokeLinecap="round" />
        </Svg>
      );

    case 'folder':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          {/* Rounded folder tab & body */}
          <Path
            d="M3 7C3 5.9 3.9 5 5 5H9.2C9.8 5 10.3 5.2 10.7 5.6L12.4 7.4C12.8 7.8 13.3 8 13.8 8H19C20.1 8 21 8.9 21 10V17C21 18.1 20.1 19 19 19H5C3.9 19 3 18.1 3 17V7Z"
            fill={accent}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Pill clasp */}
          <Rect x="10" y="12" width="4" height="2" rx="1" fill="#ffffff" />
        </Svg>
      );

    case 'plane':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          {/* Paper airplane */}
          <Path
            d="M21 3L3 10.5L10 13.5L13 20.5L21 3Z"
            fill={accent}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M10 13.5L21 3"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Playful looping breeze trail */}
          <Path
            d="M3 18C4 18 5 19 5 20C5 21 4 21.5 3 21"
            stroke={color}
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        </Svg>
      );

    case 'ghost':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          {/* Friendly floating sheet */}
          <Path
            d="M4 11C4 6.6 7.6 3 12 3C16.4 3 20 6.6 20 11V19C20 20 18.8 20.5 18 19.8L16 18.2L14 19.8C13.2 20.4 12 20 12 19L10 19.8C9.2 20.4 8 20 8 19L6 19.8C5.2 20.5 4 20 4 19V11Z"
            fill={accent}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Joyful rounded eyes */}
          <Circle cx="9.5" cy="10" r="1.3" fill={color} />
          <Circle cx="14.5" cy="10" r="1.3" fill={color} />
          {/* Open mouth */}
          <Circle cx="12" cy="13.5" r="1" fill={color} />
        </Svg>
      );

    case 'shelf':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          {/* Playful bookshelf with leaning books */}
          <Rect
            x="3"
            y="17"
            width="18"
            height="2.5"
            rx="1.2"
            fill={color}
          />
          {/* Book 1 (straight) */}
          <Rect x="5" y="8" width="3.5" height="9" rx="0.8" fill={accent} stroke={color} strokeWidth={1.5} />
          {/* Book 2 (tall straight) */}
          <Rect x="9" y="6" width="3.5" height="11" rx="0.8" fill="#ffffff" stroke={color} strokeWidth={1.5} />
          {/* Book 3 (leaning playfully) */}
          <Path
            d="M13 17L16 8L18.5 9L15.5 17H13Z"
            fill={accent}
            stroke={color}
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
        </Svg>
      );
  }
}
