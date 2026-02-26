/**
 * 相机页：取景 + 顶部工具栏 + 底部栏（快门/相册/模版）+ 倒计时/九宫格
 */

import { useRouter, type Href } from 'expo-router';
import { useRef, useState, useCallback, useEffect } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCameraPermissions, CameraView } from 'expo-camera';

import {
  CameraBottomBar,
  CameraPreview,
  CameraTopBar,
  GridOverlay,
  useCamera,
} from '@/features/camera';
import { useGallery } from '@/features/gallery';
import { TemplateOverlay } from '@/features/templates';
import { ThemedView } from '@/components/themed-view';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const cameraRef = useRef<React.ComponentRef<typeof CameraView>>(null);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { timer } = useCamera();
  const { savePhoto } = useGallery();

  const runCountdownThenCapture = useCallback(() => {
    const ref = cameraRef.current;
    if (!ref || !cameraReady) return;
    if (timer === 0) {
      ref
        .takePictureAsync({})
        .then((result) => {
          if (result?.uri) savePhoto(result.uri);
        })
        .catch(() => {});
      return;
    }
    setCountdown(timer);
  }, [cameraReady, timer, savePhoto]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => {
      if (countdown === 1) {
        cameraRef.current
          ?.takePictureAsync({})
          .then((result) => {
            if (result?.uri) savePhoto(result.uri);
          })
          .catch(() => {});
        setCountdown(0);
      } else {
        setCountdown((c) => c - 1);
      }
    }, 1000);
    return () => clearTimeout(t);
  }, [countdown, savePhoto]);

  const handleShutterPress = useCallback(() => {
    const ref = cameraRef.current;
    if (!ref || !cameraReady) return;
    runCountdownThenCapture();
  }, [cameraReady, runCountdownThenCapture]);

  const handleGalleryPress = useCallback(() => {
    router.push('/gallery' as Href);
  }, [router]);

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
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.preview}>
        <CameraPreview
          cameraRef={cameraRef}
          onCameraReady={() => setCameraReady(true)}
          style={StyleSheet.absoluteFill}
        />
        <TemplateOverlay />
        <GridOverlay />
        {countdown > 0 && (
          <View style={styles.countdownWrap}>
            <Text style={styles.countdownText}>{countdown}</Text>
          </View>
        )}
      </View>
      <CameraTopBar />
      <CameraBottomBar
        cameraReady={cameraReady && countdown === 0}
        onShutterPress={handleShutterPress}
        onGalleryPress={handleGalleryPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  preview: {
    flex: 1,
    position: 'relative',
  },
  countdownWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  countdownText: {
    fontSize: 80,
    fontWeight: 'bold',
    color: '#fff',
  },
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
