/**
 * Templates 功能模块对外 API
 * 高内聚：模版数据、选中状态、叠加层状态、列表/叠加组件均由此模块提供
 */

export { TemplateProvider, useTemplate, useTemplateOptional } from './context/TemplateContext';
export type { TemplateContextValue } from './context/TemplateContext';
export { TemplateOverlay } from './components/TemplateOverlay';
export { getTemplates, mockTemplates } from './data/mockTemplates';
