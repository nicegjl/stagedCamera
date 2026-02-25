/**
 * 模版库页：浏览与选择人物拍照模版
 * 选择后跳转相机页并进入模版叠加模式
 */

import { StyleSheet } from 'react-native';

import { getTemplates } from '@/features/templates';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function TemplatesScreen() {
  const list = getTemplates();
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">人物模版</ThemedText>
      <ThemedText>共 {list.length} 个模版（列表 UI 待实现）</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
});
