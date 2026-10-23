import { useState } from 'react';
import { Image } from 'expo-image';
import { BrandIcon } from './BrandIcon';
import { platformFor } from '@/utils/platform';

/**
 * The site's own icon for a link, fetched from Google's favicon service for its domain. If the
 * image fails to load, the Tabler brand mark is shown instead.
 */
export function PlatformBadge({ domain, size = 14 }: { domain: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const { brand } = platformFor(domain);
  if (failed) return <BrandIcon brand={brand} size={size} />;
  return (
    <Image
      source={{ uri: `https://www.google.com/s2/favicons?domain=${domain}&sz=64` }}
      style={{ width: size, height: size, borderRadius: 3 }}
      contentFit="contain"
      cachePolicy="memory-disk"
      onError={() => setFailed(true)}
    />
  );
}
