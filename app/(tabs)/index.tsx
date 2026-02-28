/**
 * 相机页：取景 + 顶部工具栏 + 底部栏（快门/相册/模版）+ 倒计时/九宫格
 */

import { useRouter, type Href } from 'expo-router';
import { useRef, useState, useCallback, useEffect } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCameraPermissions, CameraView } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import type { AspectRatio } from '@/types';

function getImageSize(uri: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    Image.getSize(uri, (width, height) => resolve({ width, height }), reject);
  });
}

/** 竖屏下有效比例：4:3→3:4，16:9→9:16，1:1→1 */
function getAspectRatioNumber(ar: AspectRatio): number {
  if (ar === '4:3') return 3 / 4;
  if (ar === '16:9') return 9 / 16;
  return 1; // 1:1
}

async function cropToAspectRatio(uri: string, aspectRatio: AspectRatio): Promise<string> {
  const ratio = getAspectRatioNumber(aspectRatio);
  const { width: w, height: h } = await getImageSize(uri);
  let originX: number, originY: number, width: number, height: number;
  if (w / h > ratio) {
    width = Math.round(h * ratio);
    height = h;
    originX = Math.round((w - width) / 2);
    originY = 0;
  } else {
    width = w;
    height = Math.round(w / ratio);
    originX = 0;
    originY = Math.round((h - height) / 2);
  }
  const ctx = ImageManipulator.ImageManipulator.manipulate(uri);
  ctx.crop({ originX, originY, width, height });
  const rendered = await ctx.renderAsync();
  const result = await rendered.saveAsync({
    format: ImageManipulator.SaveFormat.JPEG,
  });
  return result.uri;
}

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
  const { timer, aspectRatio } = useCamera();
  const { savePhoto } = useGallery();
  const windowSize = Dimensions.get('window');
  const [previewLayout, setPreviewLayout] = useState<{ width: number; height: number }>({
    width: windowSize.width,
    height: windowSize.height,
  });

  const previewFrameStyle = (() => {
    const { width: w, height: h } = previewLayout;
    const ratio = getAspectRatioNumber(aspectRatio);
    let fw: number, fh: number;
    if (w / h > ratio) {
      fh = h;
      fw = h * ratio;
    } else {
      fw = w;
      fh = w / ratio;
    }
    return {
      position: 'absolute' as const,
      left: (w - fw) / 2,
      top: (h - fh) / 2,
      width: fw,
      height: fh,
    };
  })();

  const runCountdownThenCapture = useCallback(() => {
    const ref = cameraRef.current;
    if (!ref || !cameraReady) return;
    if (timer === 0) {
      ref
        .takePictureAsync({})
        .then(async (result) => {
          if (!result?.uri) return;
          try {
            const finalUri = await cropToAspectRatio(result.uri, aspectRatio);
            savePhoto(finalUri);
          } catch {
            savePhoto(result.uri);
          }
        })
        .catch(() => {});
      return;
    }
    setCountdown(timer);
  }, [cameraReady, timer, aspectRatio, savePhoto]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => {
      if (countdown === 1) {
        cameraRef.current
          ?.takePictureAsync({})
          .then(async (result) => {
            if (!result?.uri) return;
            try {
              const finalUri = await cropToAspectRatio(result.uri, aspectRatio);
              savePhoto(finalUri);
            } catch {
              savePhoto(result.uri);
            }
          })
          .catch(() => {});
        setCountdown(0);
      } else {
        setCountdown((c) => c - 1);
      }
    }, 1000);
    return () => clearTimeout(t);
  }, [countdown, aspectRatio, savePhoto]);

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
      <View
        style={styles.preview}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          setPreviewLayout((prev) =>
            prev.width === width && prev.height === height ? prev : { width, height }
          );
        }}>
        <View style={[styles.previewFrame, previewFrameStyle]}>
            <CameraPreview
              cameraRef={cameraRef}
              onCameraReady={() => setCameraReady(true)}
              style={StyleSheet.absoluteFill}
            />
            <TemplateOverlay />
            <GridOverlay />
          </View>
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
  previewFrame: {
    overflow: 'hidden',
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
