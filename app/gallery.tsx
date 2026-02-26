/**
 * 相册入口页（占位）：后续可接 expo-media-library 展示最近拍摄
 */

import { useRouter } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { ThemedView } from '@/components/themed-view';

export default function GalleryScreen() {
  const router = useRouter();
  return (
    <ThemedView style={styles.container}>
      <Text style={styles.title}>相册</Text>
      <Text style={styles.hint}>媒体库接入后可在此展示最近拍摄</Text>
      <Text style={styles.back} onPress={() => router.back()}>
        返回相机
      </Text>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 12,
  },
  hint: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 24,
  },
  back: {
    fontSize: 16,
    color: '#0a7ea4',
  },
});
