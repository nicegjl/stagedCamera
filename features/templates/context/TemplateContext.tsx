/**
 * 人物模版状态上下文
 * 当前选中的模版、叠加层透明度/缩放/偏移，与模版列表、取景叠加 UI 解耦
 */

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import type { Template, TemplateOverlayState } from '@/types';

const DEFAULT_OVERLAY: TemplateOverlayState = {
  opacity: 0.6,
  scale: 1,
  offsetX: 0,
  offsetY: 0,
};

export interface TemplateContextValue {
  /** 当前选中的模版，null 表示常规相机模式 */
  selectedTemplate: Template | null;
  overlayState: TemplateOverlayState;
  setSelectedTemplate: (t: Template | null) => void;
  setOverlayOpacity: (v: number) => void;
  setOverlayScale: (v: number) => void;
  setOverlayOffset: (x: number, y: number) => void;
  resetOverlay: () => void;
  /** 是否处于「模版引导」模式（有选中的模版） */
  isTemplateMode: boolean;
}

const TemplateContext = createContext<TemplateContextValue | null>(null);

export function TemplateProvider({ children }: { children: React.ReactNode }) {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [overlayState, setOverlayState] = useState<TemplateOverlayState>(DEFAULT_OVERLAY);

  const setOverlayOpacity = useCallback((opacity: number) => {
    setOverlayState((s) => ({ ...s, opacity }));
  }, []);
  const setOverlayScale = useCallback((scale: number) => {
    setOverlayState((s) => ({ ...s, scale }));
  }, []);
  const setOverlayOffset = useCallback((offsetX: number, offsetY: number) => {
    setOverlayState((s) => ({ ...s, offsetX, offsetY }));
  }, []);
  const resetOverlay = useCallback(() => {
    setOverlayState(DEFAULT_OVERLAY);
  }, []);

  const value = useMemo<TemplateContextValue>(
    () => ({
      selectedTemplate,
      overlayState,
      setSelectedTemplate,
      setOverlayOpacity,
      setOverlayScale,
      setOverlayOffset,
      resetOverlay,
      isTemplateMode: selectedTemplate !== null,
    }),
    [
      selectedTemplate,
      overlayState,
      setOverlayOpacity,
      setOverlayScale,
      setOverlayOffset,
      resetOverlay,
    ]
  );

  return (
    <TemplateContext.Provider value={value}>{children}</TemplateContext.Provider>
  );
}

export function useTemplate(): TemplateContextValue {
  const ctx = useContext(TemplateContext);
  if (!ctx) throw new Error('useTemplate must be used within TemplateProvider');
  return ctx;
}

export function useTemplateOptional(): TemplateContextValue | null {
  return useContext(TemplateContext);
}
