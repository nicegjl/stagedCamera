/**
 * 模版线框叠加层
 * 在取景画面上绘制半透明人物线框，仅负责渲染，数据来自 useTemplate()
 */

import React from 'react';
import { View } from 'react-native';

import { useTemplateOptional } from '../context/TemplateContext';

export function TemplateOverlay() {
  const template = useTemplateOptional();
  if (!template?.selectedTemplate) return null;
  const { overlayState } = template;
  // 实际实现：根据 selectedTemplate.figures 与 overlayState 渲染 Image 层
  return <View style={{ opacity: overlayState.opacity }} />;
}
