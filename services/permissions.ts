/**
 * 权限服务（相机、麦克风、相册）
 * 与具体实现（expo 或 native 模块）解耦，便于测试与替换
 */

export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

export interface PermissionService {
  requestCamera(): Promise<PermissionStatus>;
  requestMicrophone(): Promise<PermissionStatus>;
  requestMediaLibrary(): Promise<PermissionStatus>;
  getCameraStatus(): Promise<PermissionStatus>;
  getMediaLibraryStatus(): Promise<PermissionStatus>;
  openSettings(): void;
}

/** 占位实现：实际接入 expo-camera / expo-media-library 等 */
export const permissionsService: PermissionService = {
  async requestCamera() {
    return 'undetermined';
  },
  async requestMicrophone() {
    return 'undetermined';
  },
  async requestMediaLibrary() {
    return 'undetermined';
  },
  async getCameraStatus() {
    return 'undetermined';
  },
  async getMediaLibraryStatus() {
    return 'undetermined';
  },
  openSettings() {
    // 打开系统设置
  },
};
