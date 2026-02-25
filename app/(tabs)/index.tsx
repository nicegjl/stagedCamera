/**
 * 相机页（入口页）：常规拍摄 + 模版模式切换
 * 仅做布局与 Provider 消费，具体取景/控件由 features 内组件实现
 */

import { StyleSheet } from 'react-native';

import { CameraControls } from '@/features/camera';
import { TemplateOverlay } from '@/features/templates';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function CameraScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.preview}>
        <TemplateOverlay />
        <ThemedText type="subtitle">取景区域（待接入相机预览）</ThemedText>
      </ThemedView>
      <ThemedView style={styles.controls}>
        <CameraControls />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  preview: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  controls: { padding: 16 },
});
