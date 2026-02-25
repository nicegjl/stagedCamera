/**
 * 真实相机预览（expo-camera CameraView）
 * 消费 CameraContext 的 facing、flash、mode、zoom，通过 ref 暴露拍照能力给父组件
 */

import { CameraView } from 'expo-camera';
import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useCamera } from '../context/CameraContext';

/** 将我们的 zoom 倍数 (1, 1.5, 2...) 映射为 expo 的 0–1 */
function zoomToExpoZoom(zoom: number): number {
  if (zoom <= 1) return 0;
  const maxZoom = 3;
  return Math.min(1, (zoom - 1) / (maxZoom - 1));
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
  const { facing, flash, mode, zoom } = useCamera();
  const [ready, setReady] = useState(false);

  const handleReady = useCallback(() => {
    setReady(true);
    onCameraReady?.();
  }, [onCameraReady]);

  const expoMode = mode === 'photo' ? 'picture' : 'video';
  const expoZoom = zoomToExpoZoom(zoom);

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
