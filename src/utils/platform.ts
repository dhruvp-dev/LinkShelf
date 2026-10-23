import type { Brand } from '@/components/BrandIcon';

export type PlatformInfo = { brand: Brand; label: string };

/** Which brand mark a link gets, based on its domain. Anything unrecognised gets the globe. */
export function platformFor(domain: string): PlatformInfo {
  if (domain === 'youtube.com' || domain === 'm.youtube.com' || domain === 'youtu.be') {
    return { brand: 'youtube', label: 'YouTube' };
  }
  if (domain === 'instagram.com' || domain.endsWith('.instagram.com')) {
    return { brand: 'instagram', label: 'Instagram' };
  }
  if (domain === 'google.com' || domain.endsWith('.google.com')) {
    return { brand: 'google', label: 'Google' };
  }
  return { brand: 'web', label: domain };
}
