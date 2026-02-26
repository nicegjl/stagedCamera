/**
 * 相册缩略图网格列表，长按保存到系统相册
 * 每张图通过 useDisplayableUri 解析 ph://，保证 iOS 可显示
 */

import React, { useCallback } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useDisplayableUri } from '../hooks/useDisplayableUri';
import type { GalleryAsset } from '../lib/mediaLibrary';
import { requestGalleryPermission, savePhotoToLibrary } from '../lib/mediaLibrary';

const COLS = 3;
const GAP = 4;

function ThumbnailCell({
  asset,
  size,
  onPress,
  onLongPress,
}: {
  asset: GalleryAsset;
  size: number;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const { uri } = useDisplayableUri(asset);
  return (
    <Pressable
      style={[styles.cell, { width: size, height: size }]}
      onPress={onPress}
      onLongPress={onLongPress}>
      {uri ? (
        <Image source={{ uri }} style={styles.thumb} />
      ) : (
        <View style={[styles.thumb, styles.thumbPlaceholder]} />
      )}
    </Pressable>
  );
}

export interface GalleryThumbnailListProps {
  assets: GalleryAsset[];
  onSelectAsset: (asset: GalleryAsset) => void;
}

export function GalleryThumbnailList({ assets, onSelectAsset }: GalleryThumbnailListProps) {
  const handleLongPress = useCallback((asset: GalleryAsset) => {
    Alert.alert(
      '保存到系统相册',
      '将此照片保存到手机相册？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '保存',
          onPress: async () => {
            const granted = await requestGalleryPermission();
            if (!granted) return;
            await savePhotoToLibrary(asset.uri);
          },
        },
      ]
    );
  }, []);

  if (assets.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>暂无照片</Text>
      </View>
    );
  }

  const { width } = Dimensions.get('window');
  const size = (width - GAP * (COLS + 1)) / COLS;

  return (
    <View style={styles.container}>
      {assets.map((asset) => (
        <ThumbnailCell
          key={asset.id}
          asset={asset}
          size={size}
          onPress={() => onSelectAsset(asset)}
          onLongPress={() => handleLongPress(asset)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
    padding: GAP,
  },
  cell: {
    borderRadius: 4,
    overflow: 'hidden',
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  thumbPlaceholder: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});
