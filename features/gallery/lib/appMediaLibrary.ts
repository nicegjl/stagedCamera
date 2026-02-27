/**
 * 应用内媒体库：文档目录 + 元数据 JSON，不依赖系统相册
 */

import * as FileSystem from 'expo-file-system/legacy';

const MEDIA_DIR_NAME = 'media';
const METADATA_FILE = 'metadata.json';

export interface AppMediaItem {
  id: string;
  filename: string;
  uri: string;
  createdAt: number;
}

let mediaDir: string | null = null;

function getMediaDir(): string {
  if (mediaDir) return mediaDir;
  const dir = `${FileSystem.documentDirectory}${MEDIA_DIR_NAME}/`;
  mediaDir = dir;
  return dir;
}

function getMetadataPath(): string {
  return `${getMediaDir()}${METADATA_FILE}`;
}

async function ensureMediaDir(): Promise<void> {
  const dir = getMediaDir();
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
}

async function loadMetadata(): Promise<AppMediaItem[]> {
  const path = getMetadataPath();
  const info = await FileSystem.getInfoAsync(path);
  if (!info.exists) return [];
  try {
    const raw = await FileSystem.readAsStringAsync(path);
    const list = JSON.parse(raw) as AppMediaItem[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

async function saveMetadata(items: AppMediaItem[]): Promise<void> {
  await ensureMediaDir();
  const path = getMetadataPath();
  await FileSystem.writeAsStringAsync(path, JSON.stringify(items));
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * 将本地照片保存到应用媒体库（复制到 media 目录并写入元数据）
 */
export async function addToAppLibrary(localUri: string): Promise<AppMediaItem | null> {
  try {
    await ensureMediaDir();
    const ext = localUri.split('.').pop()?.toLowerCase() || 'jpg';
    const id = generateId();
    const filename = `${id}.${ext}`;
    const destUri = `${getMediaDir()}${filename}`;

    await FileSystem.copyAsync({ from: localUri, to: destUri });
    const item: AppMediaItem = {
      id,
      filename,
      uri: destUri,
      createdAt: Date.now(),
    };
    const list = await loadMetadata();
    list.unshift(item);
    await saveMetadata(list);
    return item;
  } catch {
    return null;
  }
}

/**
 * 按创建时间倒序返回应用媒体库列表
 */
export async function getAppAssets(): Promise<AppMediaItem[]> {
  const list = await loadMetadata();
  return [...list].sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * 从应用媒体库删除指定 id 的资源（删文件并更新元数据）
 */
export async function deleteFromAppLibrary(ids: string[]): Promise<void> {
  const set = new Set(ids);
  const list = await loadMetadata();
  const remaining: AppMediaItem[] = [];
  for (const item of list) {
    if (set.has(item.id)) {
      try {
        await FileSystem.deleteAsync(item.uri, { idempotent: true });
      } catch {
        // 忽略单文件删除失败
      }
    } else {
      remaining.push(item);
    }
  }
  await saveMetadata(remaining);
}

/**
 * 最新一张的 URI（用于缩略图）
 */
export async function getLatestAppAssetUri(): Promise<string | null> {
  const list = await getAppAssets();
  return list[0]?.uri ?? null;
}
