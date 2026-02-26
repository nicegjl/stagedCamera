import { useGallery } from '../context/GalleryContext';

import { useDisplayableUri } from './useDisplayableUri';

/**
 * 返回最新一张资源的可显示 URI（已处理 iOS ph://），用于底部栏相册入口缩略图
 */
export function useLatestAsset() {
  const { assets } = useGallery();
  return assets[0] ?? null;
}

/**
 * 返回最新一张资源的可显示 URI，用于底部栏相册入口缩略图；无资源或加载中为 null
 */
export function useLatestMediaUri(): string | null {
  const asset = useLatestAsset();
  const { uri } = useDisplayableUri(asset);
  return uri;
}
