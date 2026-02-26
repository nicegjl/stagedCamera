## 1. 相册模块与媒体库

- [x] 1.1 新建 features/gallery 目录结构：context 或 store 管理媒体列表、hook 提供 useLatestMediaUri/useMediaList；接入 expo-media-library 权限与读写（创建相册/保存资源、按时间读取）
- [x] 1.2 拍照完成后在 index 或 camera 流程中调用 gallery 的「保存刚拍照片」接口，将 takePictureAsync 得到的 URI 写入媒体库并刷新相册数据
- [x] 1.3 实现相册大图视图组件：显示单张资源大图、双指缩放（最小比例 1，使用 GestureHandler + Reanimated 或等效）、长按弹出「保存到系统相册」并调用系统保存 API
- [x] 1.4 实现相册缩略图列表组件：网格展示资源缩略图、长按保存到系统相册；提供从大图「退回列表」的导航

## 2. 相册页与入口

- [x] 2.1 app/gallery 改为使用 features/gallery：默认展示「最新一张大图」视图，无资源时显示空状态；提供顶部返回与「进入列表」入口，列表与大图间可互相切换
- [x] 2.2 在 CameraBottomBar 相册入口：从 gallery 模块获取最新一张缩略图 URI，有则渲染为缩略图、无则显示默认 Ionicons images-outline；点击仍跳转 /gallery

## 3. 相机仅拍照

- [x] 3.1 移除 CameraBottomBar 中的拍照/录像切换 UI（modeRow、mode/setMode 使用）；移除 isRecording 相关 props 与录像圆点；快门仅保留拍照语义
- [x] 3.2 CameraContext：移除 mode/setMode 或固定 mode 为 'photo'；类型 CameraMode 仅保留 'photo' 或从导出中移除 video
- [x] 3.3 app/(tabs)/index：移除 isRecording 状态与 recordAsync/stopRecording 逻辑；handleShutterPress 仅执行拍照与倒计时；清理对 mode 的分支

## 4. 收尾

- [x] 4.1 添加 expo-media-library（及所需权限配置）、必要时 react-native-gesture-handler / reanimated 依赖；运行 lint 并修复类型与格式
