/**
 * 媒体存储服务（保存照片/视频到相册或应用内）
 * 与具体实现解耦
 */

export interface SaveOptions {
  /** 保存到系统相册（默认）或仅应用内 */
  toAlbum?: boolean;
}

export interface MediaService {
  savePhoto(uri: string, options?: SaveOptions): Promise<string>;
  saveVideo(uri: string, options?: SaveOptions): Promise<string>;
  /** 获取最近拍摄的媒体列表（用于相册入口） */
  getRecentUris(limit?: number): Promise<string[]>;
}

/** 占位实现：实际接入 expo-media-library 等 */
export const mediaService: MediaService = {
  async savePhoto() {
    return '';
  },
  async saveVideo() {
    return '';
  },
  async getRecentUris() {
    return [];
  },
};
