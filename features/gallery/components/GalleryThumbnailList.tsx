/**
 * 相册缩略图网格列表：FlatList 懒加载、渐现、长按菜单（保存到系统相册 / 删除）
 */

import React, { useCallback } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import type { GalleryAsset } from '../lib/mediaLibrary';
import { requestGalleryPermission, savePhotoToLibrary } from '../lib/mediaLibrary';

const COLS = 3;
const GAP = 4;

const INITIAL_NUM_TO_RENDER = 12;
const MAX_TO_RENDER_PER_BATCH = 8;
const WINDOW_SIZE = 5;

function ThumbnailCell({
  asset,
  size,
  onPress,
  onLongPress,
  selectionMode,
  isSelected,
  onToggleSelect,
}: {
  asset: GalleryAsset;
  size: number;
  onPress: () => void;
  onLongPress: () => void;
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}) {
  const opacity = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  const handleLoad = useCallback(() => {
    opacity.value = withTiming(1, { duration: 200 });
  }, [opacity]);

  const handlePress = useCallback(() => {
    if (selectionMode && onToggleSelect) {
      onToggleSelect();
    } else {
      onPress();
    }
  }, [selectionMode, onToggleSelect, onPress]);

  return (
    <Pressable
      style={[styles.cell, { width: size, height: size }]}
      onPress={handlePress}
      onLongPress={onLongPress}>
      <Animated.View style={[styles.thumbWrap, animatedStyle]}>
        <Image
          source={{ uri: asset.uri }}
          style={styles.thumb}
          onLoad={handleLoad}
        />
      </Animated.View>
      {selectionMode && (
        <View style={[styles.checkWrap, isSelected && styles.checkWrapSelected]}>
          {isSelected ? (
            <Text style={styles.checkText}>✓</Text>
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

export interface GalleryThumbnailListProps {
  assets: GalleryAsset[];
  onSelectAsset: (asset: GalleryAsset, index: number) => void;
  onSaveToSystem?: (asset: GalleryAsset) => void;
  onDelete?: (asset: GalleryAsset) => void;
  /** 批量选择模式：选中项 id 集合、切换选中回调 */
  selectionMode?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (asset: GalleryAsset) => void;
}

export function GalleryThumbnailList({
  assets,
  onSelectAsset,
  onSaveToSystem,
  onDelete,
  selectionMode = false,
  selectedIds,
  onToggleSelect,
}: GalleryThumbnailListProps) {
  const { width } = Dimensions.get('window');
  const size = (width - GAP * (COLS + 1)) / COLS;

  const handleLongPress = useCallback(
    (asset: GalleryAsset) => {
      const saveAction = onSaveToSystem
        ? {
            text: '保存到系统相册',
            onPress: async () => {
              const granted = await requestGalleryPermission();
              if (!granted) {
                Alert.alert('提示', '需要相册权限才能保存到系统相册');
                return;
              }
              const result = await savePhotoToLibrary(asset.uri);
              Alert.alert('提示', result ? '已保存到系统相册' : '保存失败');
            },
          }
        : null;
      const deleteAction = onDelete
        ? {
            text: '删除',
            style: 'destructive' as const,
            onPress: () => {
              Alert.alert(
                '删除照片',
                '删除后仅从本应用移除，无法恢复。确定删除？',
                [
                  { text: '取消', style: 'cancel' },
                  { text: '删除', style: 'destructive', onPress: () => onDelete(asset) },
                ]
              );
            },
          }
        : null;
      const actions = [saveAction, deleteAction].filter(Boolean);
      if (actions.length === 0) return;
      Alert.alert('选择操作', undefined, [
        { text: '取消', style: 'cancel' as const },
        ...actions,
      ]);
    },
    [onSaveToSystem, onDelete]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: GalleryAsset; index: number }) => (
      <View style={{ width: size, height: size }}>
        <ThumbnailCell
          asset={item}
          size={size}
          onPress={() => onSelectAsset(item, index)}
          onLongPress={() => handleLongPress(item)}
          selectionMode={selectionMode}
          isSelected={selectedIds?.has(item.id)}
          onToggleSelect={onToggleSelect ? () => onToggleSelect(item) : undefined}
        />
      </View>
    ),
    [size, onSelectAsset, handleLongPress, selectionMode, selectedIds, onToggleSelect]
  );

  if (assets.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>暂无照片</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={assets}
      keyExtractor={(item) => item.id}
      numColumns={COLS}
      renderItem={renderItem}
      initialNumToRender={INITIAL_NUM_TO_RENDER}
      maxToRenderPerBatch={MAX_TO_RENDER_PER_BATCH}
      windowSize={WINDOW_SIZE}
      contentContainerStyle={styles.listContent}
      columnWrapperStyle={styles.columnWrapper}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: GAP,
    paddingBottom: 24,
  },
  columnWrapper: {
    gap: GAP,
    marginBottom: GAP,
  },
  cell: {
    flex: 1,
    borderRadius: 4,
    overflow: 'hidden',
    minWidth: 0,
  },
  thumbWrap: {
    width: '100%',
    height: '100%',
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
  },
  checkWrap: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkWrapSelected: {
    backgroundColor: '#0a7ea4',
    borderColor: '#0a7ea4',
  },
  checkText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
