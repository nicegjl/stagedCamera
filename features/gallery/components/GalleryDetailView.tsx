/**
 * 全屏大图：横向 FlatList 左右滑动，每页双指缩放、长按保存到系统相册/删除
 */

import React, { useCallback, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

import type { GalleryAsset } from '../lib/mediaLibrary';
import { requestGalleryPermission, savePhotoToLibrary } from '../lib/mediaLibrary';

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface GalleryDetailViewProps {
  assets: GalleryAsset[];
  initialIndex: number;
  onBack: () => void;
  onDelete?: (asset: GalleryAsset, index: number) => void;
}

function DetailPage({
  asset,
  onLongPressSave,
  onLongPressDelete,
}: {
  asset: GalleryAsset;
  onLongPressSave: () => void;
  onLongPressDelete?: () => void;
}) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      'worklet';
      const next = savedScale.value * e.scale;
      scale.value = Math.min(MAX_SCALE, Math.max(MIN_SCALE, next));
    })
    .onEnd(() => {
      'worklet';
      savedScale.value = scale.value;
    });
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View style={styles.page}>
      <GestureDetector gesture={pinchGesture}>
        <Animated.View style={[styles.imageWrap, animatedStyle]}>
          <Image
            source={{ uri: asset.uri }}
            style={styles.image}
            resizeMode="contain"
            onLongPress={() => {
              const buttons: { text: string; onPress?: () => void; style?: 'cancel' | 'destructive' }[] = [
                { text: '取消', style: 'cancel' },
                { text: '保存到系统相册', onPress: onLongPressSave },
              ];
              if (onLongPressDelete) {
                buttons.push({
                  text: '删除',
                  style: 'destructive',
                  onPress: () => {
                    Alert.alert(
                      '删除照片',
                      '删除后仅从本应用移除，无法恢复。确定删除？',
                      [
                        { text: '取消', style: 'cancel' },
                        { text: '删除', style: 'destructive', onPress: onLongPressDelete },
                      ]
                    );
                  },
                });
              }
              Alert.alert('选择操作', undefined, buttons);
            }}
          />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

export function GalleryDetailView({
  assets,
  initialIndex,
  onBack,
  onDelete,
}: GalleryDetailViewProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const onMomentumScrollEnd = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentIndex(Math.min(i, assets.length - 1));
  }, [assets.length]);

  const handleSave = useCallback(
    (asset: GalleryAsset) => async () => {
      const granted = await requestGalleryPermission();
      if (!granted) {
        Alert.alert('提示', '需要相册权限才能保存到系统相册');
        return;
      }
      const result = await savePhotoToLibrary(asset.uri);
      Alert.alert('提示', result ? '已保存到系统相册' : '保存失败');
    },
    []
  );

  const handleDelete = useCallback(
    (asset: GalleryAsset, index: number) => {
      onDelete?.(asset, index);
    },
    [onDelete]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: GalleryAsset; index: number }) => (
      <DetailPage
        asset={item}
        onLongPressSave={handleSave(item)}
        onLongPressDelete={onDelete ? () => handleDelete(item, index) : undefined}
      />
    ),
    [handleSave, handleDelete, onDelete]
  );

  if (assets.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.headerBtn}>
          <Text style={styles.headerBtnText}>返回</Text>
        </Pressable>
        <Text style={styles.headerTitle}>相册</Text>
        <View style={styles.headerBtn} />
      </View>
      <FlatList
        data={assets}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        initialScrollIndex={Math.min(initialIndex, assets.length - 1)}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        onMomentumScrollEnd={onMomentumScrollEnd}
        renderItem={renderItem}
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        windowSize={3}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 56,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  headerBtn: {
    padding: 8,
    minWidth: 48,
  },
  headerBtnText: {
    color: '#fff',
    fontSize: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  page: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrap: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
