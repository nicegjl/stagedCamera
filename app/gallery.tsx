/**
 * 相册页：默认最新一张大图，可切换到缩略图列表，列表可点进大图
 */

import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  GalleryImageView,
  GalleryThumbnailList,
  useMediaList,
} from '@/features/gallery';
import type { GalleryAsset } from '@/features/gallery';

export default function GalleryScreen() {
  const router = useRouter();
  const { assets, isLoading } = useMediaList();
  const [viewMode, setViewMode] = useState<'detail' | 'list'>('detail');
  const [selectedAsset, setSelectedAsset] = useState<GalleryAsset | null>(null);

  const latestAsset = useMemo(() => assets[0] ?? null, [assets]);
  const displayAsset = selectedAsset ?? latestAsset;

  if (isLoading && assets.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (viewMode === 'list') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable
            onPress={() => {
              setViewMode('detail');
              setSelectedAsset(null);
            }}
            style={styles.headerBtn}>
            <Text style={styles.headerBtnText}>大图</Text>
          </Pressable>
          <Text style={styles.headerTitle}>相册</Text>
        </View>
        <GalleryThumbnailList
          assets={assets}
          onSelectAsset={(asset) => {
            setSelectedAsset(asset);
            setViewMode('detail');
          }}
        />
      </View>
    );
  }

  if (!displayAsset) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.headerBtn}>
            <Text style={styles.headerBtnText}>返回</Text>
          </Pressable>
          <Text style={styles.headerTitle}>相册</Text>
        </View>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>暂无照片</Text>
          <Text style={styles.emptyHint}>拍摄的照片会显示在这里</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerBtn}>
          <Text style={styles.headerBtnText}>返回</Text>
        </Pressable>
        <Pressable onPress={() => setViewMode('list')} style={styles.headerBtn}>
          <Text style={styles.headerBtnText}>列表</Text>
        </Pressable>
      </View>
      <GalleryImageView
        asset={displayAsset}
        onLongPressBack={() => setViewMode('list')}
      />
    </View>
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
  headerBtn: {
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
});
