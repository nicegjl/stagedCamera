/**
 * 内置模版数据（占位）
 * 后续可替换为远程拉取或本地 JSON，结构保持 Template 类型
 */

import type { Template } from '@/types';

export const mockTemplates: Template[] = [
  {
    id: 'solo-standing-1',
    name: '单人站姿',
    description: '经典站姿，适合景点打卡',
    categoryIds: ['people-solo', 'pose-standing', 'scene-background'],
    tags: ['单人', '站姿', '打卡'],
    figures: [
      {
        image: 0, // 占位，实际为 require('@/assets/templates/...')
        defaultScale: 0.8,
        defaultOffset: { x: 0, y: 0 },
        roleHint: 'center',
      },
    ],
    aspectRatio: '4:3',
    previewImage: 0,
    sortOrder: 0,
  },
];

export function getTemplates(): Template[] {
  return mockTemplates;
}
