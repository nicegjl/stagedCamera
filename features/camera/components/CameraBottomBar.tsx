/**
 * 相机页底部栏：左侧相册入口、中央拍摄按钮、右侧模版入口
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLatestMediaUri } from '@/features/gallery';

export interface CameraBottomBarProps {
  cameraReady?: boolean;
  onShutterPress?: () => void;
  onGalleryPress?: () => void;
}

export function CameraBottomBar({
  cameraReady = false,
  onShutterPress,
  onGalleryPress,
}: CameraBottomBarProps) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const latestUri = useLatestMediaUri();
  const tint = Colors[colorScheme ?? 'light'].tint;
  const iconColor = '#fff';

  const handleGalleryPress = () => {
    if (onGalleryPress) {
      onGalleryPress();
    } else {
      router.push('/gallery');
    }
  };

  const handleTemplatePress = () => {
    router.push('/(tabs)/templates');
  };

  return (
    <View style={[styles.wrapper]}>
      <View style={styles.bar}>
        <Pressable
          onPress={handleGalleryPress}
          style={styles.sideBtn}
          accessibilityLabel="相册">
          {latestUri ? (
            <Image source={{ uri: latestUri }} style={styles.thumbnail} />
          ) : (
            <Ionicons name="images-outline" size={28} color={iconColor} />
          )}
        </Pressable>

        <View style={styles.center}>
          <Pressable
            style={[styles.shutter, { borderColor: tint }]}
            onPress={onShutterPress}
            disabled={!cameraReady}
            accessibilityLabel="拍照">
            <View style={[styles.shutterInner, cameraReady && { borderColor: tint }]} />
          </Pressable>
        </View>

        <Pressable
          onPress={handleTemplatePress}
          style={styles.sideBtn}
          accessibilityLabel="模版">
          <Ionicons name="person" size={26} color={iconColor} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'rgba(0,0,0,1)',
  },
  sideBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 6,
  },
  thumbnail: {
    width: 40,
    height: 40,
    borderRadius: 4,
  },
  center: {
    alignItems: 'center',
  },
  shutter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },
});
