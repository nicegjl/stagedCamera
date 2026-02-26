import { useEffect } from 'react';

import { useGallery } from '../context/GalleryContext';

/**
 * 返回相册媒体列表，并在挂载时刷新
 */
export function useMediaList() {
  const { assets, isLoading, refresh } = useGallery();

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { assets, isLoading, refresh };
}
