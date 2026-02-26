/**
 * Camera 功能模块对外 API
 * 遵循高内聚：相机相关状态、控件、权限均由此模块提供
 */

export { CameraProvider, useCamera, useCameraOptional } from './context/CameraContext';
export type { CameraContextValue } from './context/CameraContext';
export { CameraControls } from './components/CameraControls';
export { CameraPreview } from './components/CameraPreview';
export type { CameraPreviewProps } from './components/CameraPreview';
export { CameraTopBar } from './components/CameraTopBar';
export { CameraBottomBar } from './components/CameraBottomBar';
export type { CameraBottomBarProps } from './components/CameraBottomBar';
export { GridOverlay } from './components/GridOverlay';
export { useCameraPermission } from './hooks/useCameraPermission';
