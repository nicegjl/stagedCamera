/**
 * 相机页（入口页）：真实取景 + 模版叠加 + 控件
 */

import { useCameraPermissions } from 'expo-camera';
import { useRef, useState, useCallback } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  CameraControls,
  CameraPreview,
  useCamera,
} from '@/features/camera';
import { TemplateOverlay } from '@/features/templates';
import { CameraView } from 'expo-camera';
import { ThemedView } from '@/components/themed-view';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const cameraRef = useRef<React.ComponentRef<typeof CameraView>>(null);
  const { mode } = useCamera();

  const handleShutterPress = useCallback(async () => {
    const ref = cameraRef.current;
    if (!ref || !cameraReady) return;
    try {
      if (mode === 'photo') {
        const result = await ref.takePictureAsync({});
        if (result?.uri) {
          // 可选：调用 mediaService.savePhoto(result.uri) 写入相册
        }
      }
      // 录像模式后续可接 ref.record() / ref.stopRecording()
    } catch (e) {
      // 静默或提示
    }
  }, [cameraReady, mode]);

  if (permission == null) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (!permission.granted) {
    return (
      <ThemedView style={styles.centered}>
        <Text style={styles.message}>需要相机权限以进行拍照与模版取景</Text>
        <Pressable onPress={requestPermission}>
          <Text style={styles.button}>授予权限</Text>
        </Pressable>
        <Pressable onPress={() => Linking.openSettings()}>
          <Text style={styles.link}>前往设置</Text>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.preview}>
        <CameraPreview
          cameraRef={cameraRef}
          onCameraReady={() => setCameraReady(true)}
          style={StyleSheet.absoluteFill}
        />
        <TemplateOverlay />
      </View>
      <CameraControls
        cameraReady={cameraReady}
        onShutterPress={handleShutterPress}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  preview: { flex: 1, position: 'relative' },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  message: {
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    fontSize: 16,
    color: '#0a7ea4',
    marginBottom: 8,
  },
  link: {
    fontSize: 14,
    color: '#687076',
  },
});
