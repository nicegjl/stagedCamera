/**
 * 真实相机预览（expo-camera CameraView）
 * 消费 CameraContext 的 facing、flash、mode、zoom，通过 ref 暴露拍照能力给父组件
 */

import { CameraView } from 'expo-camera';
import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useCamera } from '../context/CameraContext';

/** 逻辑变焦范围（双指捏合、刻度条、数值展示共用，保证三者联动） */
export const DEFAULT_MIN_ZOOM = 0.5;
export const DEFAULT_MAX_ZOOM = 5;

/** 将我们的 zoom 倍数 (minZoom..maxZoom) 映射为 expo 的 0–1 */
export function zoomToExpoZoom(
  zoom: number,
  minZoom: number = DEFAULT_MIN_ZOOM,
  maxZoom: number = DEFAULT_MAX_ZOOM
): number {
  if (zoom <= minZoom) return 0;
  return Math.min(1, (zoom - minZoom) / (maxZoom - minZoom));
}

export interface CameraPreviewProps {
  /** 父组件传入的 ref，用于调用 takePicture / takePictureAsync */
  cameraRef: React.RefObject<React.ComponentRef<typeof CameraView> | null>;
  /** 相机就绪后回调（可用于启用快门按钮） */
  onCameraReady?: () => void;
  /** 取景区域样式 */
  style?: object;
}

export function CameraPreview({ cameraRef, onCameraReady, style }: CameraPreviewProps) {
  const { facing, flash, zoom } = useCamera();
  const [ready, setReady] = useState(false);

  const handleReady = useCallback(() => {
    setReady(true);
    onCameraReady?.();
  }, [onCameraReady]);

  const expoMode = 'picture';
  const expoZoom = zoomToExpoZoom(zoom, DEFAULT_MIN_ZOOM, DEFAULT_MAX_ZOOM);

  return (
    <View style={[styles.wrapper, style]}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        flash={flash}
        mode={expoMode}
        zoom={expoZoom}
        onCameraReady={handleReady}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    overflow: 'hidden',
  },
});
