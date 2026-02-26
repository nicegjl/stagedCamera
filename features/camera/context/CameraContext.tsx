/**
 * 相机状态上下文
 * 集中管理拍摄模式、闪光、画幅、倒计时等，与 UI 解耦
 */

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import type { AspectRatio, CameraFacing, FlashMode, TimerOption } from '@/types';

export interface CameraContextValue {
  facing: CameraFacing;
  flash: FlashMode;
  aspectRatio: AspectRatio;
  timer: TimerOption;
  gridEnabled: boolean;
  zoom: number;
  exposureBias: number;
  setFacing: (f: CameraFacing) => void;
  setFlash: (f: FlashMode) => void;
  setAspectRatio: (a: AspectRatio) => void;
  setTimer: (t: TimerOption) => void;
  setGridEnabled: (v: boolean) => void;
  setZoom: (z: number) => void;
  setExposureBias: (e: number) => void;
}

const defaultState = {
  facing: 'back' as CameraFacing,
  flash: 'auto' as FlashMode,
  aspectRatio: '4:3' as AspectRatio,
  timer: 0 as TimerOption,
  gridEnabled: false,
  zoom: 1,
  exposureBias: 0,
};

const CameraContext = createContext<CameraContextValue | null>(null);

export function CameraProvider({ children }: { children: React.ReactNode }) {
  const [facing, setFacing] = useState<CameraFacing>(defaultState.facing);
  const [flash, setFlash] = useState<FlashMode>(defaultState.flash);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(defaultState.aspectRatio);
  const [timer, setTimer] = useState<TimerOption>(defaultState.timer);
  const [gridEnabled, setGridEnabled] = useState(defaultState.gridEnabled);
  const [zoom, setZoom] = useState(defaultState.zoom);
  const [exposureBias, setExposureBias] = useState(defaultState.exposureBias);

  const value = useMemo<CameraContextValue>(
    () => ({
      facing,
      flash,
      aspectRatio,
      timer,
      gridEnabled,
      zoom,
      exposureBias,
      setFacing,
      setFlash,
      setAspectRatio,
      setTimer,
      setGridEnabled,
      setZoom,
      setExposureBias,
    }),
    [facing, flash, aspectRatio, timer, gridEnabled, zoom, exposureBias]
  );

  return <CameraContext.Provider value={value}>{children}</CameraContext.Provider>;
}

export function useCamera(): CameraContextValue {
  const ctx = useContext(CameraContext);
  if (!ctx) throw new Error('useCamera must be used within CameraProvider');
  return ctx;
}

export function useCameraOptional(): CameraContextValue | null {
  return useContext(CameraContext);
}
