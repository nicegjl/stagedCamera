/**
 * 相机控制栏占位
 * 后续实现：快门、前后摄切换、闪光、变焦等，仅消费 useCamera()，不持有业务逻辑
 */

import React from 'react';
import { View } from 'react-native';

import { useCamera } from '../context/CameraContext';

export function CameraControls() {
  const { mode, setMode, flash, setFlash } = useCamera();
  return <View />;
}
