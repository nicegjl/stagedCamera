/**
 * 封装 expo-media-library：权限、保存照片、按时间读取资源
 * iOS 返回的 ph:// URI 无法直接用于 <Image>，需通过 getAssetInfoAsync 取 localUri
 */

import * as MediaLibrary from 'expo-media-library';

const SORT_CREATION_DESC: [MediaLibrary.SortByKey, boolean][] = [
  [MediaLibrary.SortBy.creationTime, false],
];

/** 内存缓存：asset.id -> 可显示的 file URI，避免重复请求 getAssetInfoAsync */
const displayableUriCache = new Map<string, string>();

export type GalleryAsset = MediaLibrary.Asset;

/**
 * 返回可用于 <Image source={{ uri }} /> 的 URI。
 * iOS 上 asset.uri 为 ph:// 时改用 getAssetInfoAsync 的 localUri，并写入缓存。
 */
export async function getDisplayableUri(asset: GalleryAsset): Promise<string> {
  const cached = displayableUriCache.get(asset.id);
  if (cached) return cached;

  if (asset.uri.startsWith('ph://')) {
    try {
      const info = await MediaLibrary.getAssetInfoAsync(asset);
      const uri = info.localUri ?? asset.uri;
      displayableUriCache.set(asset.id, uri);
      return uri;
    } catch {
      return asset.uri;
    }
  }

  displayableUriCache.set(asset.id, asset.uri);
  return asset.uri;
}

export async function requestGalleryPermission(): Promise<boolean> {
  const { status } = await MediaLibrary.requestPermissionsAsync();
  return status === 'granted';
}

export async function getGalleryPermissionStatus(): Promise<'granted' | 'denied' | 'undetermined'> {
  const { status } = await MediaLibrary.getPermissionsAsync();
  return status;
}

/**
 * 将本地照片 URI 保存到媒体库
 */
export async function savePhotoToLibrary(localUri: string): Promise<MediaLibrary.Asset | null> {
  const granted = await requestGalleryPermission();
  if (!granted) return null;
  try {
    const asset = await MediaLibrary.createAssetAsync(localUri);
    return asset;
  } catch {
    return null;
  }
}

/**
 * 获取最近拍摄的资源（按创建时间倒序）
 */
export async function getRecentAssets(
  first: number = 100
): Promise<{ assets: GalleryAsset[]; hasNextPage: boolean }> {
  const granted = await requestGalleryPermission();
  if (!granted) return { assets: [], hasNextPage: false };
  try {
    const result = await MediaLibrary.getAssetsAsync({
      first,
      sortBy: SORT_CREATION_DESC,
      mediaType: MediaLibrary.MediaType.photo,
    });
    return { assets: result.assets, hasNextPage: result.hasNextPage };
  } catch {
    return { assets: [], hasNextPage: false };
  }
}

/**
 * 获取最新一张资源的 URI（用于缩略图）
 */
export async function getLatestAssetUri(): Promise<string | null> {
  const { assets } = await getRecentAssets(1);
  return assets[0]?.uri ?? null;
}
