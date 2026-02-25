/**
 * 相机模块类型定义（对应 PRD 常规相机功能）
 */

/** 拍摄模式 */
export type CameraMode = 'photo' | 'video';

/** 闪光灯模式 */
export type FlashMode = 'off' | 'on' | 'auto';

/** 画幅比例 */
export type AspectRatio = '4:3' | '16:9' | '1:1' | 'full';

/** 倒计时秒数 */
export type TimerOption = 0 | 3 | 10;

/** 相机 UI 状态（与具体 Native 实现解耦） */
export interface CameraState {
  mode: CameraMode;
  flash: FlashMode;
  aspectRatio: AspectRatio;
  timer: TimerOption;
  gridEnabled: boolean;
  /** 当前变焦倍数，如 1, 2, 0.5 */
  zoom: number;
  /** 曝光补偿档位，如 -2..2 */
  exposureBias: number;
}

/** 相机能力（设备是否支持，用于降级） */
export interface CameraCapabilities {
  hasFlash: boolean;
  hasFrontCamera: boolean;
  zoomRange: { min: number; max: number };
  supportedAspectRatios: AspectRatio[];
}
