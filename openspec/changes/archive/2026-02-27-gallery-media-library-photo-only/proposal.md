## Why

用户需要拍摄后的内容在应用内可见、可管理，并支持保存到系统相册；同时简化相机操作，仅保留拍照能力、移除录像与模式切换。

## What Changes

- **相册模块**：在 `features/gallery` 下新建相册模块，负责媒体资源存储/读取、相册 UI 与交互（大图/列表、保存到系统相册、照片缩放）。
- **媒体库接入**：拍摄完成后将照片写入应用可访问的媒体库（如 expo-media-library 或本地目录），相册展示这些资源；底部栏相册入口显示相册中**第一张资源缩略图**（无资源时显示默认图标）。
- **相册交互**：相册默认进入时显示**最新一张资源的大图**；可退出大图进入**缩略图列表页**；列表中资源支持**长按保存到手机系统相册**；照片支持**双指缩放**，最小缩放比例为 1。
- **相机仅拍照**：**删除拍照/录像切换**，相机默认且仅支持拍照；移除 CameraBottomBar 中的模式切换 UI、CameraContext 中与 video 相关状态/API、相机页录像逻辑。

## Capabilities

### New Capabilities

- `gallery-module`: 相册功能模块，位于 features/gallery，提供媒体列表、大图查看、列表/大图导航及保存到系统相册、照片缩放等能力。
- `gallery-media-library`: 媒体库接入：拍摄完成后写入媒体库、相册读取并展示；CameraBottomBar 相册入口显示首张资源缩略图。
- `camera-photo-only`: 相机仅支持拍照；无录像与拍照/录像模式切换。

### Modified Capabilities

- （无；若存在 camera 相关主 spec 可后续在 delta 中补充「仅拍照」约束）

## Impact

- **影响**：新建 `features/gallery`（context/hooks、列表/大图组件、保存与缩放逻辑）、`app/gallery.tsx` 使用 gallery 模块；`features/camera/components/CameraBottomBar.tsx`（相册入口改为显示首张缩略图、移除模式切换）、`app/(tabs)/index.tsx`（移除录像与 mode 相关逻辑）、`features/camera/context/CameraContext.tsx`（移除 video mode 相关）；拍摄流程需在拍照完成后写入媒体库。
- **依赖**：expo-media-library（或等效）、expo-file-system、权限与相册保存 API。
