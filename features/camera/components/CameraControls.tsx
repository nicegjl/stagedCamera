/**
 * 相机控制栏：快门、前后摄切换、闪光、拍照/录像切换
 * 仅消费 useCamera()，拍照由父组件通过 onShutterPress 触发
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { useCamera } from '../context/CameraContext';

export interface CameraControlsProps {
  /** 相机是否就绪（未就绪时禁用快门） */
  cameraReady?: boolean;
  /** 按下快门拍照 */
  onShutterPress?: () => void;
}

const FLASH_ORDER: Array<'off' | 'on' | 'auto'> = ['off', 'on', 'auto'];

export function CameraControls({
  cameraReady = false,
  onShutterPress,
}: CameraControlsProps) {
  const colorScheme = useColorScheme();
  const { facing, setFacing, flash, setFlash } = useCamera();
  const tint = Colors[colorScheme ?? 'light'].tint;
  const iconColor = Colors[colorScheme ?? 'light'].icon;

  const cycleFlash = () => {
    const i = FLASH_ORDER.indexOf(flash);
    setFlash(FLASH_ORDER[(i + 1) % 3]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Pressable
          style={styles.sideButton}
          onPress={cycleFlash}
          accessibilityLabel="闪光灯">
          <Ionicons name={flash === 'off' ? 'flash-off' : flash === 'on' ? 'flash' : 'flash-outline'} size={24} color={iconColor} />
        </Pressable>

        <Pressable
          style={[styles.shutter, { borderColor: tint }]}
          onPress={onShutterPress}
          disabled={!cameraReady}
          accessibilityLabel="拍照">
          <View style={[styles.shutterInner, cameraReady && { borderColor: tint }]} />
        </Pressable>

        <Pressable
          style={styles.sideButton}
          onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
          accessibilityLabel="切换前后摄像头">
          <Ionicons name="camera-reverse" size={28} color={iconColor} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sideButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
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
