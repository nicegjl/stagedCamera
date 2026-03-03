# 优化 ZoomScaleBar 组件实现 - 任务

## 1. 统一 zoom 范围为 0.5–5.0

- [ ] 1.1 在 `CameraPreview.tsx` 中定义并导出 `DEFAULT_MIN_ZOOM = 0.5`、`DEFAULT_MAX_ZOOM = 5.0`（如尚未统一），并通过 `features/camera/index.ts` 暴露给相机页与其它组件使用。
- [ ] 1.2 在相机页捏合逻辑中，使用 `DEFAULT_MIN_ZOOM` / `DEFAULT_MAX_ZOOM` 对计算出的 zoom 进行 clamp，确保任何捏合操作都不会产生小于 0.5 或大于 5.0 的 zoom。
- [ ] 1.3 确认 `zoomToExpoZoom` 使用 `[DEFAULT_MIN_ZOOM, DEFAULT_MAX_ZOOM]` 映射到 [0, 1]，避免出现“刻度条到头但相机仍可继续放大/缩小”的不一致。

## 2. 调整 ZoomScaleBar 组件

- [ ] 2.1 在 `ZoomScaleBar.tsx` 中使用 `useWindowDimensions()` 获取屏幕宽度 `windowWidth`，计算 `trackWidth = windowWidth * 0.6` 作为刻度轨道的固定宽度。
- [ ] 2.2 将轨道容器调整为固定宽度 `trackWidth` 并在水平方向居中（例如通过 `trackOuter` 容器 `alignItems: 'center'`），使刻度条在相机可视区域底部看起来总是占屏幕宽度约 60%。
- [ ] 2.3 使用 `[minZoom, maxZoom]` 区间和 `trackWidth` 计算每个刻度线的位置：`ratio = (t - minZoom)/(maxZoom - minZoom)`，`left = ratio * (trackWidth - TICK_WIDTH)`；更新 `tickValues` 为覆盖 0.5–5.0 的关键点（如 0.5、1、2、3、4、5）。
- [ ] 2.4 将拇指位置计算改为与刻度相同的比例公式，确保当前 zoom 对应的拇指位置与刻度完全一致。
- [ ] 2.5 确认手势回调中的 x 坐标使用与 `trackWidth` 对齐的坐标系（考虑左右 padding 或容器偏移），保证拖拽到轨道两端时分别能达到 0.5 和 5.0。

## 3. 边界行为与体验验证

- [ ] 3.1 在模拟器或真机上验证：zoom 为 0.5 时，继续向左拖动刻度条或捏合缩小时，zoom 值不再变化；zoom 为 5.0 时，继续向右拖动或捏合放大，同样不再变化。
- [ ] 3.2 验证刻度条在不同屏幕宽度与方向下均占据约 60% 的宽度，且与底部栏/取景区域视觉协调。
- [ ] 3.3 检查当前焦距数值展示是否与拇指位置、刻度线保持一致（例如在 1x、2x、5x 时，拇指恰好落在对应刻度下方）。

## 4. 收尾

- [ ] 4.1 运行 `npm run lint` 和 TypeScript 检查，确保无新错误或 warning。
- [ ] 4.2 在至少一台真机和一个模拟器上做实际拍摄测试，确认：
  - 变焦范围为 0.5–5.0；
  - 捏合与刻度条拖拽联动一致；
  - 刻度条宽度与布局符合设计预期。
