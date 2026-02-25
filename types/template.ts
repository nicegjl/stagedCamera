/**
 * 人物拍照模版类型定义（对应 PRD 4.3.2 模版数据结构）
 */

/** 单个人物线框 */
export interface TemplateFigure {
  /** 线框资源：本地 require 或远程 URL */
  image: number | string;
  /** 默认缩放，用于不同屏幕适配 */
  defaultScale: number;
  /** 默认在画布上的偏移 */
  defaultOffset: { x: number; y: number };
  /** 多人时的位置提示，如 "left" | "center" | "right" */
  roleHint?: string;
}

/** 模版推荐画幅 */
export type TemplateAspectRatio = '4:3' | '16:9' | '1:1' | 'full';

/** 分类维度（可扩展） */
export type TemplateCategoryId =
  | 'scene-background'
  | 'scene-architecture'
  | 'scene-venue'
  | 'scene-holiday'
  | 'people-solo'
  | 'people-couple'
  | 'people-group'
  | 'pose-standing'
  | 'pose-sitting'
  | 'pose-interaction'
  | string;

/** 模版实体 */
export interface Template {
  id: string;
  name: string;
  description?: string;
  categoryIds: TemplateCategoryId[];
  tags: string[];
  figures: TemplateFigure[];
  aspectRatio: TemplateAspectRatio;
  /** 列表缩略图 */
  previewImage: number | string;
  sortOrder: number;
}

/** 取景叠加时的线框显示状态（用户可调） */
export interface TemplateOverlayState {
  opacity: number;
  scale: number;
  offsetX: number;
  offsetY: number;
}
