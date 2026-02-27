/**
 * 相册媒体库：应用媒体库（主数据源）+ 系统相册保存（仅写入）
 * 应用媒体资源为本地文件 URI，可直接用于 <Image>
 */

import * as MediaLibrary from 'expo-media-library';

import {
  addToAppLibrary,
  deleteFromAppLibrary as deleteFromAppLibraryImpl,
  getAppAssets,
  getLatestAppAssetUri,
  type AppMediaItem,
} from './appMediaLibrary';

/** 相册内使用的资源类型（当前即应用媒体库项） */
export type GalleryAsset = AppMediaItem;

/**
 * 返回可用于 <Image source={{ uri }} /> 的 URI。
 * 应用媒体库的 uri 已是本地文件路径，直接返回。
 */
export async function getDisplayableUri(asset: GalleryAsset): Promise<string> {
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
 * 将本地照片保存到系统相册（用于「下载到系统相册」）
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
 * 获取应用媒体库列表（按创建时间倒序）
 */
export async function getRecentAssets(): Promise<{ assets: GalleryAsset[]; hasNextPage: boolean }> {
  const assets = await getAppAssets();
  return { assets, hasNextPage: false };
}

/**
 * 获取最新一张资源的 URI（用于缩略图）
 */
export async function getLatestAssetUri(): Promise<string | null> {
  return getLatestAppAssetUri();
}

/** 保存到应用媒体库 */
export { addToAppLibrary, getAppAssets } from './appMediaLibrary';

/** 从应用媒体库删除 */
export async function deleteFromAppLibrary(ids: string[]): Promise<void> {
  return deleteFromAppLibraryImpl(ids);
}
