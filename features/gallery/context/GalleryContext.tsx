/**
 * 相册状态：媒体列表、刷新、保存新照片
 */

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import type { GalleryAsset } from '../lib/mediaLibrary';
import {
  getRecentAssets,
  requestGalleryPermission,
  savePhotoToLibrary,
} from '../lib/mediaLibrary';

export interface GalleryContextValue {
  assets: GalleryAsset[];
  isLoading: boolean;
  permissionGranted: boolean | null;
  refresh: () => Promise<void>;
  savePhoto: (localUri: string) => Promise<boolean>;
  requestPermission: () => Promise<boolean>;
}

const GalleryContext = createContext<GalleryContextValue | null>(null);

export function GalleryProvider({ children }: { children: React.ReactNode }) {
  const [assets, setAssets] = useState<GalleryAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const granted = await requestGalleryPermission();
      setPermissionGranted(granted);
      const { assets: list } = await getRecentAssets();
      setAssets(list);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const savePhoto = useCallback(async (localUri: string): Promise<boolean> => {
    const asset = await savePhotoToLibrary(localUri);
    if (asset) {
      setAssets((prev) => [asset, ...prev]);
      return true;
    }
    return false;
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    const granted = await requestGalleryPermission();
    setPermissionGranted(granted);
    return granted;
  }, []);

    useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo<GalleryContextValue>(
    () => ({
      assets,
      isLoading,
      permissionGranted,
      refresh,
      savePhoto,
      requestPermission,
    }),
    [assets, isLoading, permissionGranted, refresh, savePhoto, requestPermission]
  );

  return <GalleryContext.Provider value={value}>{children}</GalleryContext.Provider>;
}

export function useGallery(): GalleryContextValue {
  const ctx = useContext(GalleryContext);
  if (!ctx) throw new Error('useGallery must be used within GalleryProvider');
  return ctx;
}

export function useGalleryOptional(): GalleryContextValue | null {
  return useContext(GalleryContext);
}
