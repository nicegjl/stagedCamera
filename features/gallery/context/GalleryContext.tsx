/**
 * 相册状态：应用媒体库列表、刷新、保存新照片、删除
 */

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
  addToAppLibrary,
  deleteFromAppLibrary as deleteFromAppLibraryApi,
  getAppAssets,
  requestGalleryPermission,
} from '../lib/mediaLibrary';
import type { GalleryAsset } from '../lib/mediaLibrary';

export interface GalleryContextValue {
  assets: GalleryAsset[];
  isLoading: boolean;
  permissionGranted: boolean | null;
  refresh: () => Promise<void>;
  savePhoto: (localUri: string) => Promise<boolean>;
  deleteFromAppLibrary: (ids: string[]) => Promise<void>;
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
      const list = await getAppAssets();
      setAssets(list);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const savePhoto = useCallback(async (localUri: string): Promise<boolean> => {
    const item = await addToAppLibrary(localUri);
    if (item) {
      setAssets((prev) => [item, ...prev]);
      return true;
    }
    return false;
  }, []);

  const deleteFromAppLibrary = useCallback(async (ids: string[]) => {
    await deleteFromAppLibraryApi(ids);
    setAssets((prev) => prev.filter((a) => !ids.includes(a.id)));
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
      deleteFromAppLibrary,
      requestPermission,
    }),
    [assets, isLoading, permissionGranted, refresh, savePhoto, deleteFromAppLibrary, requestPermission]
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
