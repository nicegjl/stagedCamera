# 重构变焦的逻辑 - 设计

## Context

- 当前：CameraContext 中 `zoom` 为 number，默认 1；CameraTopBar 提供「变焦」按钮，在 ZOOM_OPTIONS = [0.5, 1, 2] 间循环；CameraPreview 将 zoom 映射为 expo-camera 的 0–1 后传入 CameraView。
- 目标：去掉顶部变焦按钮；默认 1x；双指捏合 + 底部刻度条滑动实现连续变焦；刻度条展示当前焦距并支持滑动调节。

## Goals / Non-Goals

**Goals:**

- 移除顶部栏变焦按钮，默认 zoom = 1。
- 在取景区域支持双指捏合，根据手势实时更新 zoom（连续值），并受设备 zoom 范围约束。
- 在相机可视区底部增加横向变焦刻度条：显示当前焦距（如 1x、2x），支持滑动改变 zoom；与捏合共用同一 zoom 状态。

**Non-Goals:**

- 不改变 CameraContext 中 zoom 的类型（仍为 number）；不改变闪光、画幅、倒计时等其它顶部栏能力。
- 不要求支持键盘/外设调节 zoom。

## Decisions

### 1. 顶部栏

- 从 CameraTopBar 移除与变焦相关的 UI 与逻辑：删除变焦按钮、cycleZoom、ZOOM_OPTIONS 及对 setZoom 的暴露（若仅用于变焦按钮）。Context 仍保留 zoom / setZoom 供预览与刻度条使用。

### 2. Zoom 状态与范围

- zoom 仍为 number，表示倍数（1 = 1x）。默认 1。
- 范围：以 expo-camera 能力为准（可运行时读取或使用合理默认，如 min 1、max 由设备或 expo 文档给出）；捏合与刻度条均将 zoom 限制在此范围内。

### 3. 双指捏合变焦

- 在包裹 CameraView 的容器上增加捏合手势（PinchGestureHandler 或等价），手势过程中根据 scale 变化量更新 zoom（例如基于初始 zoom 与 scale 乘积，再 clamp 到 min/max）。
- 与 CameraContext 的 setZoom 联动，保证预览（CameraView 的 zoom 属性）与状态一致；映射方式延续现有 zoomToExpoZoom（或按 expo 新 API 调整），支持连续值。

### 4. 底部变焦刻度条

- **位置**：相机可视区域（取景框）底部，不遮挡主要取景，可略高于底部栏或与底部栏上方贴齐，需考虑安全区。
- **形态**：横向条状，带刻度线/刻度值，表示 zoom 范围（如 1x 到最大 x）；当前 zoom 对应位置有指示（如游标或高亮）。
- **交互**：支持水平滑动（拖拽或滑杆），根据滑动位置计算 zoom 并 setZoom，同时更新刻度条指示；与捏合共用 zoom，双向同步。
- **实现建议**：可做成独立组件（如 ZoomScaleBar），接收 zoom、zoomRange、onZoomChange，内部用 Slider 或 PanResponder/手势实现滑动；刻度可离散（如每 0.5x 一档）或连续，以可读性为准。

### 5. 预览与映射

- CameraPreview 继续从 useCamera() 取 zoom，用 zoomToExpoZoom(zoom) 传给 CameraView；zoom 为连续值时，zoomToExpoZoom 需支持连续映射（现有公式已支持）。
- 若 expo-camera 提供 zoom 范围（如 useCameraDevice 或 ref 方法），应在挂载或就绪后取 min/max，用于捏合与刻度条的范围限制及刻度展示。

## Risks / Trade-offs

- 不同设备最大 zoom 可能不同，需在运行时获取或做兼容；若无法获取，可先用合理默认（如 1–10）并在后续用 API 替换。
- 捏合与刻度条同时存在时，需保证两者不冲突（同一 state 更新即可）。

## Open Questions

- 无；实现时若发现 expo-camera 无法获取 zoom 范围，可暂用固定最大 zoom（如 10）并注明后续替换。
