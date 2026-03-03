# 重构变焦的逻辑 - 任务

## 1. 移除顶部变焦按钮

- [x] 1.1 在 CameraTopBar 中移除变焦按钮、cycleZoom、ZOOM_OPTIONS 及相关样式；不再从 useCamera 解构 setZoom（若仅用于该按钮）。保留 Context 中的 zoom / setZoom 供它处使用。
- [x] 1.2 确认默认 zoom 仍为 1（CameraContext 已有），无需改动。

## 2. 双指捏合连续变焦

- [x] 2.1 在相机页或 CameraPreview 外层增加捏合手势（如 react-native-gesture-handler 的 PinchGestureHandler），手势过程中根据 scale 变化计算新 zoom 并 setZoom，限制在设备 zoom 范围内。
- [x] 2.2 确定 zoom 范围：若 expo-camera 提供 min/max zoom，在相机就绪后读取并存入 state 或 context；否则使用合理默认（如 min 1，max 10），并在注释中注明。
- [x] 2.3 保证 CameraPreview 内 zoom → expo zoom 的映射支持连续值（现有 zoomToExpoZoom 已支持），捏合后预览立即反映新 zoom。

## 3. 底部变焦刻度条

- [x] 3.1 新增组件（如 ZoomScaleBar）：横向刻度条，展示当前 zoom（如 1x、2x）及可选刻度线；接收 zoom、minZoom、maxZoom、onZoomChange。
- [x] 3.2 支持通过滑动（Slider 或拖拽）改变 zoom，调用 onZoomChange 与 CameraContext 的 setZoom 同步；与捏合共用同一 zoom 状态，双向一致。
- [x] 3.3 在相机页布局中，将刻度条放在取景区域底部（取景框下方或底部栏上方），考虑安全区与不遮挡快门；样式与现有底部栏协调。

## 4. 收尾

- [x] 4.1 运行 lint；真机或模拟器验证：无顶部变焦按钮、默认 1x、双指捏合与刻度条滑动均可连续变焦且二者联动、刻度条显示当前焦距。
