/**
 * 相机页底部栏：左侧相册入口、中央拍摄按钮与模式切换、右侧模版入口
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { useCamera } from '../context/CameraContext';

export interface CameraBottomBarProps {
  cameraReady?: boolean;
  isRecording?: boolean;
  onShutterPress?: () => void;
  onGalleryPress?: () => void;
}

export function CameraBottomBar({
  cameraReady = false,
  isRecording = false,
  onShutterPress,
  onGalleryPress,
}: CameraBottomBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { mode, setMode } = useCamera();
  const tint = Colors[colorScheme ?? 'light'].tint;
  const iconColor = '#fff';

  const handleGalleryPress = () => {
    if (onGalleryPress) {
      onGalleryPress();
    } else {
      router.push('/(tabs)/templates');
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
          <Ionicons name="images-outline" size={28} color={iconColor} />
        </Pressable>

        <View style={styles.center}>
          <Pressable
            style={[styles.shutter, { borderColor: tint }]}
            onPress={onShutterPress}
            disabled={!cameraReady}
            accessibilityLabel={mode === 'photo' ? '拍照' : isRecording ? '停止录像' : '开始录像'}>
            {mode === 'video' && isRecording ? (
              <View style={[styles.recordDot, { backgroundColor: tint }]} />
            ) : (
              <View style={[styles.shutterInner, cameraReady && { borderColor: tint }]} />
            )}
          </Pressable>
          <View style={styles.modeRow}>
            <Pressable onPress={() => setMode('photo')} style={styles.modeBtn}>
              <Ionicons name="camera" size={20} color={mode === 'photo' ? tint : iconColor} />
            </Pressable>
            <Pressable onPress={() => setMode('video')} style={styles.modeBtn}>
              <Ionicons name="videocam" size={22} color={mode === 'video' ? tint : iconColor} />
            </Pressable>
          </View>
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
  recordDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 10,
  },
  modeBtn: {
    padding: 6,
  },
});
