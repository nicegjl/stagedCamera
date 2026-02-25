/**
 * 相机权限 Hook
 * 封装 permissionsService，供相机页与模版取景页使用
 */

import { useCallback, useEffect, useState } from 'react';

import { permissionsService } from '@/services';
import type { PermissionStatus } from '@/services';

export function useCameraPermission() {
  const [status, setStatus] = useState<PermissionStatus>('undetermined');

  const request = useCallback(async () => {
    const result = await permissionsService.requestCamera();
    setStatus(result);
    return result;
  }, []);

  useEffect(() => {
    permissionsService.getCameraStatus().then(setStatus);
  }, []);

  return { status, request, openSettings: permissionsService.openSettings };
}
