/**
 * 九宫格取景辅助线，叠加在取景区上，不参与成片
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useCamera } from '../context/CameraContext';

export function GridOverlay() {
  const { gridEnabled } = useCamera();
  if (!gridEnabled) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.row}>
        <View style={[styles.cell, styles.borderRight]} />
        <View style={[styles.cell, styles.borderRight]} />
        <View style={styles.cell} />
      </View>
      <View style={[styles.row, styles.borderTop]}>
        <View style={[styles.cell, styles.borderRight]} />
        <View style={[styles.cell, styles.borderRight]} />
        <View style={styles.cell} />
      </View>
      <View style={[styles.row, styles.borderTop]}>
        <View style={[styles.cell, styles.borderRight]} />
        <View style={[styles.cell, styles.borderRight]} />
        <View style={styles.cell} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'column',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
  },
  borderRight: {
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.5)',
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.5)',
  },
});
