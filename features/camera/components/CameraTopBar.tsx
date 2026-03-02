/**
 * 相机页顶部辅助工具栏：闪光、翻转、倒计时、画幅、九宫格（变焦由底部刻度条与双指捏合控制）
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { AspectRatio, TimerOption } from '@/types';

import { useCamera } from '../context/CameraContext';

const FLASH_ORDER: Array<'off' | 'on' | 'auto'> = ['off', 'on', 'auto'];
const TIMER_OPTIONS: TimerOption[] = [0, 3, 10];
const ASPECT_OPTIONS: AspectRatio[] = ['4:3', '16:9', '1:1'];

export function CameraTopBar() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const {
    flash,
    setFlash,
    facing,
    setFacing,
    timer,
    setTimer,
    aspectRatio,
    setAspectRatio,
    gridEnabled,
    setGridEnabled,
  } = useCamera();

  const iconColor = '#fff';
  const tint = Colors[colorScheme ?? 'light'].tint;

  const cycleFlash = () => {
    const i = FLASH_ORDER.indexOf(flash);
    setFlash(FLASH_ORDER[(i + 1) % 3]);
  };

  const cycleTimer = () => {
    const i = TIMER_OPTIONS.indexOf(timer);
    setTimer(TIMER_OPTIONS[(i + 1) % TIMER_OPTIONS.length]);
  };

  const cycleAspect = () => {
    const i = ASPECT_OPTIONS.indexOf(aspectRatio);
    setAspectRatio(ASPECT_OPTIONS[(i + 1) % ASPECT_OPTIONS.length]);
  };

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top }]}>
      <View style={styles.bar}>
        <Pressable onPress={cycleFlash} style={styles.iconBtn} accessibilityLabel="闪光灯">
          <Ionicons
            name={flash === 'off' ? 'flash-off' : flash === 'on' ? 'flash' : 'flash-outline'}
            size={22}
            color={iconColor}
          />
        </Pressable>

        <Pressable
          onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
          style={styles.iconBtn}
          accessibilityLabel="切换前后摄像头">
          <Ionicons name="camera-reverse" size={24} color={iconColor} />
        </Pressable>

        <Pressable onPress={cycleTimer} style={styles.iconBtn} accessibilityLabel="倒计时">
          <Ionicons name="timer-outline" size={22} color={iconColor} />
          <Text style={styles.smallLabel}>{timer === 0 ? '关' : `${timer}s`}</Text>
        </Pressable>

        <Pressable onPress={cycleAspect} style={styles.iconBtn} accessibilityLabel="画幅">
          <Text style={styles.aspectLabel}>{aspectRatio}</Text>
        </Pressable>

        <Pressable
          onPress={() => setGridEnabled(!gridEnabled)}
          style={styles.iconBtn}
          accessibilityLabel="九宫格">
          <Ionicons
            name="grid-outline"
            size={22}
            color={gridEnabled ? tint : iconColor}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(0,0,0,1)',
  },
  iconBtn: {
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  smallLabel: {
    fontSize: 10,
    color: '#fff',
    marginTop: 2,
  },
  aspectLabel: {
    fontSize: 11,
    color: '#fff',
  },
});
