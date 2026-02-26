import { useEffect, useState } from 'react';

import type { GalleryAsset } from '../lib/mediaLibrary';
import { getDisplayableUri } from '../lib/mediaLibrary';

/**
 * 返回可用于 <Image> 的 URI；对 ph:// 会异步解析为 localUri，带缓存
 */
export function useDisplayableUri(asset: GalleryAsset | null): {
  uri: string | null;
  isLoading: boolean;
} {
  const [uri, setUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(!!asset);

  useEffect(() => {
    if (!asset) {
      setUri(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    getDisplayableUri(asset)
      .then((u) => {
        if (!cancelled) {
          setUri(u);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUri(asset.uri);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [asset?.id]);

  return { uri, isLoading };
}
