import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { colors } from '../theme';

// Stroke ikone (lucide-stil).

type Prim =
  | { p: string }
  | { c: [number, number, number] }
  | { r: [number, number, number, number, number] };

const ICONS: Record<string, Prim[]> = {
  chat: [
    { p: 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z' },
  ],
  message: [
    { p: 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z' },
  ],
  documents: [
    { p: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' },
    { p: 'M14 2v6h6' },
    { p: 'M9 13h6M9 17h4' },
  ],
  'file-text': [
    { p: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' },
    { p: 'M14 2v6h6' },
    { p: 'M16 13H8M16 17H8M10 9H8' },
  ],
  map: [
    { p: 'M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z' },
    { p: 'M9 3v15M15 6v15' },
  ],
  'map-pin': [
    { p: 'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z' },
    { c: [12, 10, 3] },
  ],
  bell: [
    { p: 'M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9' },
    { p: 'M13.7 21a2 2 0 0 1-3.4 0' },
  ],
  user: [
    { p: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' },
    { c: [12, 7, 4] },
  ],
  'arrow-left': [{ p: 'm12 19-7-7 7-7' }, { p: 'M19 12H5' }],
  'chevron-right': [{ p: 'm9 18 6-6-6-6' }],
  'chevron-down': [{ p: 'm6 9 6 6 6-6' }],
  send: [{ p: 'm22 2-7 20-4-9-9-4Z' }, { p: 'M22 2 11 13' }],
  check: [{ p: 'M20 6 9 17l-5-5' }],
  plus: [{ p: 'M5 12h14M12 5v14' }],
  search: [{ c: [11, 11, 8] }, { p: 'm21 21-4.3-4.3' }],
  x: [{ p: 'M18 6 6 18M6 6l12 12' }],
  edit: [{ p: 'M12 20h9' }, { p: 'M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z' }],
  trash: [
    { p: 'M3 6h18' },
    { p: 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6' },
    { p: 'M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' },
  ],
  phone: [
    { p: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.81.36 1.6.7 2.34a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.74.34 1.53.57 2.34.7A2 2 0 0 1 22 16.92z' },
  ],
  navigation: [{ p: 'M3 11 22 2l-9 19-2-8-8-2z' }],
  globe: [
    { c: [12, 12, 10] },
    { p: 'M2 12h20' },
    { p: 'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z' },
  ],
  clock: [{ c: [12, 12, 10] }, { p: 'M12 6v6l4 2' }],
  lock: [
    { r: [3, 11, 18, 11, 2] },
    { p: 'M7 11V7a5 5 0 0 1 10 0v4' },
  ],
  info: [{ c: [12, 12, 10] }, { p: 'M12 16v-4M12 8h.01' }],
  shield: [{ p: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' }],
  'log-out': [
    { p: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' },
    { p: 'm16 17 5-5-5-5' },
    { p: 'M21 12H9' },
  ],
  sparkles: [
    { p: 'M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3z' },
  ],
  compass: [
    { c: [12, 12, 10] },
    { p: 'm16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z' },
  ],
  calendar: [
    { r: [3, 4, 18, 18, 2] },
    { p: 'M16 2v4M8 2v4M3 10h18' },
  ],
  building: [
    { p: 'M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z' },
    { p: 'M9 9h.01M9 13h.01M9 17h.01M15 9h.01M15 13h.01M15 17h.01' },
  ],
  briefcase: [
    { r: [2, 7, 20, 14, 2] },
    { p: 'M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16' },
  ],
  car: [
    { p: 'M5 17a2 2 0 1 0 0 .01M19 17a2 2 0 1 0 0 .01' },
    { p: 'M5 17H3v-5l2-5h11l3 5h1a1 1 0 0 1 1 1v4h-2M7 17h10' },
  ],
  'graduation-cap': [
    { p: 'M22 10 12 5 2 10l10 5 10-5z' },
    { p: 'M6 12v5c0 1 2 3 6 3s6-2 6-3v-5' },
  ],
  home: [
    { p: 'm3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
    { p: 'M9 22V12h6v10' },
  ],
  droplet: [
    { p: 'M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z' },
  ],
  landmark: [
    { p: 'M3 22h18' },
    { p: 'M6 18v-7M10 18v-7M14 18v-7M18 18v-7' },
    { p: 'M12 2 3 8h18Z' },
  ],
  'credit-card': [
    { r: [2, 5, 20, 14, 2] },
    { p: 'M2 10h20' },
  ],
};

export type IconName = keyof typeof ICONS;

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function Icon({ name, size = 22, color = colors.ink, strokeWidth = 1.8 }: IconProps) {
  const prims = ICONS[name] ?? ICONS.info;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {prims.map((prim, i) => {
        if ('p' in prim) {
          return (
            <Path
              key={i}
              d={prim.p}
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        }
        if ('c' in prim) {
          return (
            <Circle key={i} cx={prim.c[0]} cy={prim.c[1]} r={prim.c[2]} stroke={color} strokeWidth={strokeWidth} />
          );
        }
        return (
          <Rect key={i} x={prim.r[0]} y={prim.r[1]} width={prim.r[2]} height={prim.r[3]} rx={prim.r[4]} stroke={color} strokeWidth={strokeWidth} />
        );
      })}
    </Svg>
  );
}
