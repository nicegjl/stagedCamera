/**
 * 单张资源大图：双指缩放（最小比例 1）、长按保存到系统相册
 */

import * as MediaLibrary from 'expo-media-library';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

import { useDisplayableUri } from '../hooks/useDisplayableUri';
import type { GalleryAsset } from '../lib/mediaLibrary';
import { requestGalleryPermission, savePhotoToLibrary } from '../lib/mediaLibrary';

const MIN_SCALE = 1;
const MAX_SCALE = 4;

export interface GalleryImageViewProps {
  asset: GalleryAsset;
  onLongPressBack?: () => void;
}

export function GalleryImageView({ asset, onLongPressBack }: GalleryImageViewProps) {
  const { uri: displayUri } = useDisplayableUri(asset);
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const [showSaveResult, setShowSaveResult] = useState<string | null>(null);

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

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleLongPress = useCallback(
    (e: GestureResponderEvent) => {
      e?.preventDefault?.();
      Alert.alert(
        '保存到系统相册',
        '将此照片保存到手机相册？',
        [
          { text: '取消', style: 'cancel' },
          {
            text: '保存',
            onPress: async () => {
              const granted = await requestGalleryPermission();
              if (!granted) {
                setShowSaveResult('需要相册权限');
                return;
              }
              const ok = await savePhotoToLibrary(asset.uri);
              setShowSaveResult(ok ? '已保存' : '保存失败');
            },
          },
        ]
      );
    },
    [asset.uri]
  );

  return (
    <View style={styles.container}>
      <GestureDetector gesture={pinchGesture}>
        <Animated.View style={[styles.imageWrap, animatedStyle]}>
          {displayUri ? (
            <Image
              source={{ uri: displayUri }}
              style={styles.image}
              resizeMode="contain"
              onLongPress={handleLongPress}
            />
          ) : (
            <View style={[styles.image, styles.placeholder]} />
          )}
        </Animated.View>
      </GestureDetector>
      {showSaveResult && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{showSaveResult}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
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
  placeholder: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  toast: {
    position: 'absolute',
    bottom: 48,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 8,
  },
  toastText: {
    color: '#fff',
    fontSize: 14,
  },
});
