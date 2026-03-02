/**
 * 变焦刻度条：横向条状，展示当前 zoom，支持滑动改变 zoom（与双指捏合共用同一状态）
 */

import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

export interface ZoomScaleBarProps {
  zoom: number;
  minZoom: number;
  maxZoom: number;
  onZoomChange: (zoom: number) => void;
}

const THUMB_WIDTH = 24;
const TRACK_HEIGHT = 28;

function clampZoom(zoom: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, zoom));
}

export function ZoomScaleBar({ zoom, minZoom, maxZoom, onZoomChange }: ZoomScaleBarProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const range = maxZoom - minZoom;

  const applyZoomFromX = useCallback(
    (x: number) => {
      if (trackWidth <= 0) return;
      const ratio = Math.max(0, Math.min(1, x / trackWidth));
      const newZoom = clampZoom(minZoom + ratio * range, minZoom, maxZoom);
      onZoomChange(newZoom);
    },
    [trackWidth, minZoom, maxZoom, range, onZoomChange]
  );

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      'worklet';
      runOnJS(applyZoomFromX)(e.x);
    })
    .runOnJS(true);

  const thumbPosition =
    trackWidth > 0
      ? ((zoom - minZoom) / range) * (trackWidth - THUMB_WIDTH)
      : 0;

  const tickValues = [1, 2, 3, 5, 10].filter((t) => t >= minZoom && t <= maxZoom);

  return (
    <View style={styles.wrapper}>
      <GestureDetector gesture={panGesture}>
        <View
          style={styles.track}
          onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}>
          <View style={[styles.thumb, { left: thumbPosition }]} />
          {trackWidth > 0 && (
            <View style={styles.tickContainer} pointerEvents="none">
              {tickValues.map((t) => (
                <View
                  key={t}
                  style={[
                    styles.tick,
                    { left: ((t - minZoom) / range) * (trackWidth - 2) },
                  ]}
                />
              ))}
            </View>
          )}
        </View>
      </GestureDetector>
      <Text style={styles.label}>{formatZoom(zoom)}</Text>
    </View>
  );
}

function formatZoom(z: number): string {
  if (z <= 1) return '1x';
  return z % 1 === 0 ? `${z}x` : `${z.toFixed(1)}x`;
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  track: {
    flex: 1,
    height: TRACK_HEIGHT,
    justifyContent: 'center',
  },
  thumb: {
    position: 'absolute',
    width: THUMB_WIDTH,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    top: (TRACK_HEIGHT - 20) / 2,
  },
  tickContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    pointerEvents: 'none',
  },
  tick: {
    position: 'absolute',
    width: 2,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.6)',
    top: (TRACK_HEIGHT - 8) / 2,
    marginLeft: -1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    minWidth: 36,
    textAlign: 'right',
  },
});
