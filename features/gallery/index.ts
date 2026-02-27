/**
 * Gallery 功能模块：媒体库接入、相册列表/大图、保存到系统相册
 */

export { GalleryProvider, useGallery, useGalleryOptional } from './context/GalleryContext';
export type { GalleryContextValue } from './context/GalleryContext';
export { useMediaList } from './hooks/useMediaList';
export { useLatestAsset, useLatestMediaUri } from './hooks/useLatestMediaUri';
export { useDisplayableUri } from './hooks/useDisplayableUri';
export type { GalleryAsset } from './lib/mediaLibrary';
export {
  getDisplayableUri,
  getLatestAssetUri,
  getRecentAssets,
  requestGalleryPermission,
  savePhotoToLibrary,
} from './lib/mediaLibrary';
/** @deprecated 遗留，推荐使用 GalleryDetailView */
export { GalleryImageView } from './components/GalleryImageView';
export type { GalleryImageViewProps } from './components/GalleryImageView';
export { GalleryDetailView } from './components/GalleryDetailView';
export type { GalleryDetailViewProps } from './components/GalleryDetailView';
export { GalleryThumbnailList } from './components/GalleryThumbnailList';
export type { GalleryThumbnailListProps } from './components/GalleryThumbnailList';
