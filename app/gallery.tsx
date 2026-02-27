/**
 * 相册页：默认列表，点击进全屏大图（左右滑动），长按/批量保存到系统相册与删除
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import type { GalleryAsset } from '@/features/gallery';
import {
  GalleryDetailView,
  GalleryThumbnailList,
  requestGalleryPermission,
  savePhotoToLibrary,
  useGallery,
  useMediaList,
} from '@/features/gallery';

const ICON_COLOR = '#fff';
const ICON_SIZE = 24;

export default function GalleryScreen() {
  const router = useRouter();
  const { assets, isLoading, deleteFromAppLibrary } = useGallery();
  useMediaList();
  const [viewMode, setViewMode] = useState<'detail' | 'list'>('list');
  const [detailInitialIndex, setDetailInitialIndex] = useState(0);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchSaveProgress, setBatchSaveProgress] = useState<{ current: number; total: number } | null>(null);

  const handleSelectAsset = useCallback((asset: GalleryAsset, index: number) => {
    setDetailInitialIndex(index);
    setViewMode('detail');
  }, []);

  const handleDeleteFromDetail = useCallback(
    async (asset: GalleryAsset, index: number) => {
      await deleteFromAppLibrary([asset.id]);
      const remaining = assets.filter((a) => a.id !== asset.id);
      if (remaining.length === 0) {
        setViewMode('list');
        return;
      }
      if (index >= remaining.length) {
        setViewMode('list');
        return;
      }
      setDetailInitialIndex(index);
    },
    [assets, deleteFromAppLibrary]
  );

  const toggleSelect = useCallback((asset: GalleryAsset) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(asset.id)) next.delete(asset.id);
      else next.add(asset.id);
      return next;
    });
  }, []);

  const handleBatchSave = useCallback(async () => {
    const granted = await requestGalleryPermission();
    if (!granted) {
      Alert.alert('提示', '需要相册权限才能保存到系统相册');
      return;
    }
    const selected = assets.filter((a) => selectedIds.has(a.id));
    const total = selected.length;
    setBatchSaveProgress({ current: 0, total });
    let done = 0;
    for (let i = 0; i < selected.length; i += 1) {
      await savePhotoToLibrary(selected[i].uri);
      done += 1;
      setBatchSaveProgress({ current: i + 1, total });
    }
    setBatchSaveProgress(null);
    Alert.alert('提示', `已保存 ${done} 张到系统相册`);
    setSelectionMode(false);
    setSelectedIds(new Set());
  }, [assets, selectedIds]);

  const handleBatchDelete = useCallback(() => {
    const n = selectedIds.size;
    Alert.alert(
      '删除照片',
      `删除选中的 ${n} 张？删除后仅从本应用移除，无法恢复。`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            await deleteFromAppLibrary(Array.from(selectedIds));
            setSelectionMode(false);
            setSelectedIds(new Set());
          },
        },
      ]
    );
  }, [selectedIds, deleteFromAppLibrary]);

  if (isLoading && assets.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (viewMode === 'list') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Pressable
              onPress={() => {
                if (selectionMode) {
                  setSelectionMode(false);
                  setSelectedIds(new Set());
                } else {
                  router.back();
                }
              }}
              style={styles.headerIconBtn}
              hitSlop={8}>
              <Ionicons name="chevron-back" size={ICON_SIZE} color={ICON_COLOR} />
            </Pressable>
            {/* {!selectionMode && (
              <Text style={styles.headerBtnText}>相机</Text>
            )} */}
          </View>
          <Text style={styles.headerTitle}>
            {selectionMode ? `已选 ${selectedIds.size} 张` : '相册'}
          </Text>
          <View style={styles.headerRight}>
            {!selectionMode ? (
              <Pressable onPress={() => setSelectionMode(true)} style={styles.headerIconBtn} hitSlop={8}>
                <Text style={styles.headerBtnText}>选择</Text>
              </Pressable>
            ) : batchSaveProgress != null ? (
              <View style={styles.headerProgress}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.headerProgressText}>
                  {batchSaveProgress.current}/{batchSaveProgress.total}
                </Text>
              </View>
            ) : selectedIds.size > 0 ? (
              <>
                <Pressable onPress={handleBatchSave} style={styles.headerIconBtn} hitSlop={8}>
                  <Ionicons name="download-outline" size={ICON_SIZE} color={ICON_COLOR} />
                </Pressable>
                <Pressable onPress={handleBatchDelete} style={styles.headerIconBtn} hitSlop={8}>
                  <Ionicons name="trash-outline" size={ICON_SIZE} color={ICON_COLOR} />
                </Pressable>
              </>
            ) : (
              <View style={styles.headerIconBtn} />
            )}
          </View>
        </View>
        <GalleryThumbnailList
          assets={assets}
          onSelectAsset={handleSelectAsset}
          onSaveToSystem={() => {}}
          onDelete={(asset) => deleteFromAppLibrary([asset.id])}
          selectionMode={selectionMode}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
        />
      </View>
    );
  }

  return (
    <GalleryDetailView
      key={`${detailInitialIndex}-${assets.length}`}
      assets={assets}
      initialIndex={detailInitialIndex}
      onBack={() => setViewMode('list')}
      onDelete={handleDeleteFromDetail}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 56,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 48,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minWidth: 48,
  },
  headerIconBtn: {
    padding: 8,
  },
  headerBtnText: {
    color: '#fff',
    fontSize: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  headerProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerProgressText: {
    color: '#fff',
    fontSize: 14,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
