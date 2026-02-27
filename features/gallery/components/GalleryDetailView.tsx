/**
 * 全屏大图：横向 FlatList 左右滑动，每页双指缩放、长按保存到系统相册/删除
 */

import { Ionicons } from '@expo/vector-icons';
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
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withDecay,
} from 'react-native-reanimated';

import type { GalleryAsset } from '../lib/mediaLibrary';
import { requestGalleryPermission, savePhotoToLibrary } from '../lib/mediaLibrary';

const MIN_SCALE = 0.5;
const MAX_SCALE = 4;
const RUBBER_BAND = 50;
const PAGE_GAP = 0;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PAGE_WIDTH = SCREEN_WIDTH + PAGE_GAP;

const SPRING_CONFIG = { damping: 20, stiffness: 200 };
const PAN_SPRING_CONFIG = { damping: 22, stiffness: 180 };

export interface GalleryDetailViewProps {
  assets: GalleryAsset[];
  initialIndex: number;
  onBack: () => void;
  onDelete?: (asset: GalleryAsset, index: number) => void;
}

function DetailPage({
  asset,
  pageIndex,
  activeIndexRef,
  isActivePage,
  isZoomed,
  onLongPressSave,
  onLongPressDelete,
  onScaleChange,
  onEdgeBouncedLeft,
  onEdgeBouncedRight,
}: {
  asset: GalleryAsset;
  pageIndex: number;
  activeIndexRef: Animated.SharedValue<number>;
  isActivePage: boolean;
  isZoomed: boolean;
  onLongPressSave: () => void;
  onLongPressDelete?: () => void;
  onScaleChange?: (scale: number) => void;
  onEdgeBouncedLeft?: () => void;
  onEdgeBouncedRight?: () => void;
}) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const startPanX = useSharedValue(0);
  const startPanY = useSharedValue(0);
  const didOverdragLeft = useSharedValue(false);
  const didOverdragRight = useSharedValue(false);

  useAnimatedReaction(
    () => activeIndexRef.value,
    (activeIndex) => {
      const needReset = scale.value > 1 || translateX.value !== 0 || translateY.value !== 0;
      if (activeIndex !== pageIndex && needReset) {
        scale.value = 1;
        savedScale.value = 1;
        translateX.value = 0;
        translateY.value = 0;
        if (onScaleChange) {
          runOnJS(onScaleChange)(1);
        }
      } else if (activeIndex === pageIndex && needReset) {
        scale.value = 1;
        savedScale.value = 1;
        translateX.value = 0;
        translateY.value = 0;
        if (onScaleChange) {
          runOnJS(onScaleChange)(1);
        }
      }
    },
    [pageIndex]
  );

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      'worklet';
      const next = savedScale.value * e.scale;
      const clamped = Math.min(MAX_SCALE, Math.max(MIN_SCALE, next));
      scale.value = clamped;
      if (onScaleChange) {
        runOnJS(onScaleChange)(clamped);
      }
    })
    .onEnd((e) => {
      'worklet';
      if (scale.value < 1) {
        scale.value = withTiming(1, { duration: 250 });
        savedScale.value = 1;
        if (onScaleChange) {
          runOnJS(onScaleChange)(1);
        }
      } else {
        const finalScale = scale.value;
        const velocity = (e as { velocity?: number }).velocity ?? 0;
        scale.value = withSpring(finalScale, { ...SPRING_CONFIG, velocity }, (finished) => {
          'worklet';
          if (finished) {
            savedScale.value = finalScale;
            if (onScaleChange) {
              runOnJS(onScaleChange)(finalScale);
            }
          }
        });
      }
    });

  const panGesture = Gesture.Pan()
    .enabled(isActivePage && isZoomed)
    .activeOffsetX([-15, 15])
    .activeOffsetY([-20, 20])
    .onStart(() => {
      'worklet';
      startPanX.value = translateX.value;
      startPanY.value = translateY.value;
      didOverdragLeft.value = false;
      didOverdragRight.value = false;
    })
    .onUpdate((e) => {
      'worklet';
      const s = scale.value;
      const maxTx = Math.max(0, (SCREEN_WIDTH * (s - 1)) / 2);
      const maxTy = Math.max(0, ((SCREEN_HEIGHT - 80) * (s - 1)) / 2);
      let newTx = startPanX.value + e.translationX;
      let newTy = startPanY.value + e.translationY;
      if (s > 1) {
        const atLeftEdge = translateX.value <= -maxTx + 10 || startPanX.value <= -maxTx + 10;
        const atRightEdge = translateX.value >= maxTx - 10 || startPanX.value >= maxTx - 10;
        if (atLeftEdge && newTx < -maxTx) {
          newTx = Math.max(-maxTx - RUBBER_BAND, newTx);
          didOverdragLeft.value = true;
        } else if (atRightEdge && newTx > maxTx) {
          newTx = Math.min(maxTx + RUBBER_BAND, newTx);
          didOverdragRight.value = true;
        } else {
          newTx = Math.max(-maxTx, Math.min(maxTx, newTx));
        }
      } else {
        newTx = Math.max(-maxTx, Math.min(maxTx, newTx));
      }
      translateX.value = newTx;
      translateY.value = Math.max(-maxTy, Math.min(maxTy, newTy));
    })
    .onEnd((e) => {
      'worklet';
      const s = scale.value;
      const maxTx = Math.max(0, (SCREEN_WIDTH * (s - 1)) / 2);
      const maxTy = Math.max(0, ((SCREEN_HEIGHT - 80) * (s - 1)) / 2);
      if (s <= 1) {
        translateX.value = withSpring(0, PAN_SPRING_CONFIG);
        translateY.value = withSpring(0, PAN_SPRING_CONFIG);
      } else {
        const targetX = Math.max(-maxTx, Math.min(maxTx, translateX.value));
        const targetY = Math.max(-maxTy, Math.min(maxTy, translateY.value));
        const overdrag = didOverdragLeft.value || didOverdragRight.value;
        if (overdrag) {
          translateX.value = withTiming(targetX, { duration: 220 });
          translateY.value = withTiming(targetY, { duration: 220 });
          if (didOverdragLeft.value && onEdgeBouncedLeft) {
            runOnJS(onEdgeBouncedLeft)();
          }
          if (didOverdragRight.value && onEdgeBouncedRight) {
            runOnJS(onEdgeBouncedRight)();
          }
        } else {
          const vx = (e as { velocityX?: number }).velocityX ?? 0;
          const vy = (e as { velocityY?: number }).velocityY ?? 0;
          translateX.value = withDecay(
            { velocity: vx, clamp: [-maxTx, maxTx] },
            (finished) => {
              'worklet';
              if (finished) {
                const cx = Math.max(-maxTx, Math.min(maxTx, translateX.value));
                translateX.value = withTiming(cx, { duration: 120 });
              }
            }
          );
          translateY.value = withDecay(
            { velocity: vy, clamp: [-maxTy, maxTy] },
            (finished) => {
              'worklet';
              if (finished) {
                const cy = Math.max(-maxTy, Math.min(maxTy, translateY.value));
                translateY.value = withTiming(cy, { duration: 120 });
              }
            }
          );
        }
      }
    });

  const composed = Gesture.Simultaneous(pinchGesture, panGesture);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <View style={styles.page}>
      <GestureDetector gesture={composed}>
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
  const [isZoomed, setIsZoomed] = useState(false);
  const [edgeUnlockedLeft, setEdgeUnlockedLeft] = useState(false);
  const [edgeUnlockedRight, setEdgeUnlockedRight] = useState(false);
  const activeIndexRef = useSharedValue(initialIndex);

  const onMomentumScrollEnd = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / PAGE_WIDTH);
    const next = Math.min(i, assets.length - 1);
    setCurrentIndex(next);
    activeIndexRef.value = next;
    setEdgeUnlockedLeft(false);
    setEdgeUnlockedRight(false);
  }, [assets.length, activeIndexRef]);

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

  const handleScaleChange = useCallback((scaleValue: number) => {
    setIsZoomed(scaleValue > 1.01);
    if (scaleValue <= 1.01) {
      setEdgeUnlockedLeft(false);
      setEdgeUnlockedRight(false);
    }
  }, []);

  const handleEdgeBouncedLeft = useCallback(() => {
    setEdgeUnlockedLeft(true);
  }, []);
  const handleEdgeBouncedRight = useCallback(() => {
    setEdgeUnlockedRight(true);
  }, []);

  const showActionMenu = useCallback(() => {
    const asset = assets[currentIndex];
    if (!asset) return;
    const buttons: { text: string; onPress?: () => void; style?: 'cancel' | 'destructive' }[] = [
      { text: '取消', style: 'cancel' },
      { text: '保存到系统相册', onPress: handleSave(asset) },
    ];
    if (onDelete) {
      buttons.push({
        text: '删除',
        style: 'destructive',
        onPress: () => {
          Alert.alert(
            '删除照片',
            '删除后仅从本应用移除，无法恢复。确定删除？',
            [
              { text: '取消', style: 'cancel' },
              { text: '删除', style: 'destructive', onPress: () => handleDelete(asset, currentIndex) },
            ]
          );
        },
      });
    }
    Alert.alert('选择操作', undefined, buttons);
  }, [assets, currentIndex, handleSave, handleDelete, onDelete]);

  const renderItem = useCallback(
    ({ item, index }: { item: GalleryAsset; index: number }) => (
      <DetailPage
        asset={item}
        pageIndex={index}
        activeIndexRef={activeIndexRef}
        isActivePage={currentIndex === index}
        isZoomed={isZoomed}
        onLongPressSave={handleSave(item)}
        onLongPressDelete={onDelete ? () => handleDelete(item, index) : undefined}
        onScaleChange={handleScaleChange}
        onEdgeBouncedLeft={handleEdgeBouncedLeft}
        onEdgeBouncedRight={handleEdgeBouncedRight}
      />
    ),
    [activeIndexRef, currentIndex, isZoomed, handleSave, handleDelete, handleScaleChange, handleEdgeBouncedLeft, handleEdgeBouncedRight, onDelete]
  );

  if (assets.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.headerBtn}>
          <Text style={styles.headerBtnText}>返回</Text>
        </Pressable>
        <Text style={styles.headerTitle}>相册</Text>
        <Pressable onPress={showActionMenu} style={styles.headerBtn} hitSlop={8}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
        </Pressable>
      </View>
      <FlatList
        data={assets}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled={false}
        snapToInterval={PAGE_WIDTH}
        snapToAlignment="start"
        decelerationRate="fast"
        scrollEnabled={!isZoomed || edgeUnlockedLeft || edgeUnlockedRight}
        initialScrollIndex={Math.min(initialIndex, assets.length - 1)}
        getItemLayout={(_, index) => ({
          length: PAGE_WIDTH,
          offset: PAGE_WIDTH * index,
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
    width: PAGE_WIDTH,
    height: SCREEN_HEIGHT - 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrap: {
    width: SCREEN_WIDTH,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
