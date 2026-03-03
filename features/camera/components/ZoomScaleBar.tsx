/**
 * 变焦刻度条：横向轨道 + 刻度线 + 拇指滑动；当前焦距仅作数值展示（居中）。
 * 与双指捏合共用 CameraContext 的 zoom，三者联动：捏合/滑动刻度条会更新 zoom，数值与拇指位置随 zoom 同步。
 */

import React, { useCallback } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
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

const TRACK_FRACTION = 0.6;

export function ZoomScaleBar({ zoom, minZoom, maxZoom, onZoomChange }: ZoomScaleBarProps) {
  const { width: windowWidth } = useWindowDimensions();
  const trackWidth = Math.max(0, windowWidth * TRACK_FRACTION);
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
    trackWidth > 0 && range > 0
      ? ((zoom - minZoom) / range) * (trackWidth - THUMB_WIDTH)
      : 0;

  const tickValues = [0.5, 1, 2, 3, 4, 5].filter((t) => t >= minZoom && t <= maxZoom);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.valueCenter} accessibilityLabel={`焦距 ${formatZoom(zoom)}`}>
        {formatZoom(zoom)}
      </Text>
      <View style={styles.trackOuter}>
        <GestureDetector gesture={panGesture}>
          <View style={[styles.track, { width: trackWidth }]}>
            {trackWidth > 0 && (
              <View style={[styles.tickContainer, { width: trackWidth }]} pointerEvents="none">
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
            <View style={[styles.thumb, { left: thumbPosition }]} />
          </View>
        </GestureDetector>
      </View>
    </View>
  );
}

function formatZoom(z: number): string {
  return z % 1 === 0 ? `${z}x` : `${z.toFixed(1)}x`;
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  valueCenter: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 6,
  },
  trackOuter: {
    width: '100%',
    alignItems: 'center',
  },
  track: {
    height: TRACK_HEIGHT,
    justifyContent: 'center',
    position: 'relative',
  },
  thumb: {
    position: 'absolute',
    width: THUMB_WIDTH,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    top: (TRACK_HEIGHT - 20) / 2,
    zIndex: 2,
  },
  tickContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 1,
  },
  tick: {
    position: 'absolute',
    width: 2,
    height: 8,
    backgroundColor: '#fff',
    top: (TRACK_HEIGHT - 8) / 2,
    marginLeft: -1,
  },
});
