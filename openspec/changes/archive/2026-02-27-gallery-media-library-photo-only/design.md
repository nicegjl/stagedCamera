## Context

- 当前相册为占位页（app/gallery.tsx），无媒体库接入；拍摄使用 takePictureAsync 未持久化到相册；CameraBottomBar 相册入口为固定图标。相机支持 photo/video 模式切换，由 CameraContext 的 mode 与 index 页的 isRecording 控制。
- 技术栈：expo-router、expo-camera、React Native；需接入媒体存储与系统相册保存。

## Goals / Non-Goals

**Goals:**

- 新建 features/gallery 模块：媒体列表数据源、首图缩略图供给、大图/列表屏、长按保存到系统相册、照片双指缩放（最小比例 1）。
- 拍摄完成后将照片写入媒体库，相册可读并展示；底部栏相册入口显示相册第一张缩略图，无则默认图标。
- 相册默认进入显示最新一张大图；可退出到缩略图列表。
- 相机仅拍照：移除拍照/录像切换与录像逻辑；CameraContext 不再暴露 mode/setMode（或固定为 photo）。

**Non-Goals:**

- 不实现录像或视频在相册中的展示；不在此 change 内做云端同步或多设备相册。

## Decisions

- **媒体库与存储**：使用 expo-media-library 创建相册/资源并读取；拍照完成后先得到本地 URI，再调用 MediaLibrary.createAssetAsync（或 saveToLibraryAsync）写入媒体库；相册模块维护「最近拍摄」列表（可从 MediaLibrary 按时间取相册内资源，或应用内维护一份 ID 列表）。若需兼容无媒体库权限场景，可先写应用文档目录再在授权后迁移。
- **相册入口缩略图**：CameraBottomBar 相册按钮从 features/gallery 获取「第一张资源」（最新一张）的缩略图 URI；gallery 模块提供 hook 如 useLatestMediaUri()，无资源时返回 null，底部栏用 null 时显示默认 images-outline 图标。
- **相册页结构**：app/gallery 作为 Stack 屏，内容由 features/gallery 提供。默认路由即「大图页」显示最新一张（全屏图 + 双指缩放，最小 1）；提供「退回列表」入口（如顶部返回或按钮）切到「缩略图列表」视图；列表为网格/列表展示所有资源，长按弹出「保存到系统相册」并调用 MediaLibrary.saveToLibraryAsync 或系统保存 API。
- **照片缩放**：大图页使用可缩放视图（如 react-native-gesture-handler + react-native-reanimated 的 PinchGestureHandler，或 expo-image 的 zoom 能力），最小缩放比例 1，禁止缩小到小于 1。
- **相机仅拍照**：CameraContext 移除 mode/setMode（或保留类型但仅 'photo'）；CameraBottomBar 移除 modeRow（拍照/录像两个按钮）与 isRecording 相关 UI，仅保留快门；index 页移除 isRecording 状态、recordAsync/stopRecording 逻辑，handleShutterPress 仅执行拍照与倒计时；类型 CameraMode 可保留为仅 'photo' 或从类型中删除 video。

## Risks / Trade-offs

- **[Risk]** 媒体库权限被拒绝时相册为空或保存失败。**Mitigation**：首次进入相册或保存时请求权限并提示；无权限时列表为空、相册入口显示默认图标。
- **[Trade-off]** 相册数据源若仅依赖应用内写入，卸载后系统相册不会自动包含本应用拍摄；用户需通过「长按保存」将单张写入系统相册。

## Migration Plan

- 无服务端迁移。发布后首次打开相册请求媒体库权限；已有拍摄不会自动出现，仅新拍摄进入相册。相机页移除录像后，现有依赖 mode/isRecording 的代码需一并删除或简化为仅拍照。
- 回滚：恢复 CameraContext mode、CameraBottomBar modeRow、index 录像逻辑；gallery 模块可保留但入口可改回占位或隐藏。

## Open Questions

- 相册「最近」范围：仅本应用写入的资源，还是包含设备相册中最近项？建议先仅本应用写入，便于权限与一致性。
