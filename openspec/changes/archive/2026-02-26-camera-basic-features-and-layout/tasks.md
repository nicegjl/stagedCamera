## 1. 相机页布局结构调整

- [x] 1.1 将相机页拆为三块：取景区（全屏）、顶部工具栏区、底部栏区；使用 SafeAreaView 或 useSafeAreaInsets 保证刘海/横条安全区
- [x] 1.2 新增 CameraTopBar 组件，置于取景区上方，半透明背景，内含占位或图标（闪光/翻转/倒计时/变焦/画幅/九宫格）
- [x] 1.3 重构底部为 CameraBottomBar：左侧相册入口、中央拍摄按钮、右侧模版入口；从现有 CameraControls 抽离快门与模式切换到中央，左右为两个新入口按钮
- [x] 1.4 在 app/(tabs)/index 中组合 CameraPreview + TemplateOverlay + CameraTopBar + CameraBottomBar，去掉旧 CameraControls 单栏

## 2. 顶部工具栏能力

- [x] 2.1 顶部栏闪光灯：保留与 CameraContext.flash 联动，循环关/开/自动，图标区分三种状态
- [x] 2.2 顶部栏前后摄像头翻转：调用 setFacing，与现有逻辑一致
- [x] 2.3 顶部栏倒计时：提供 0 / 3s / 10s 选择（分段或循环），更新 CameraContext.timer
- [x] 2.4 顶部栏变焦：提供档位按钮（如 0.5x、1x、2x 或设备支持档位），更新 CameraContext.zoom，CameraPreview 已消费 zoom
- [x] 2.5 顶部栏画幅：提供 4:3、16:9、1:1、full 选择，更新 CameraContext.aspectRatio；取景区或 CameraView 按 aspectRatio 做视觉裁剪/比例（在 expo-camera 支持范围内）
- [x] 2.6 顶部栏九宫格开关：更新 CameraContext.gridEnabled；在取景区上叠加九宫格 View（绝对定位，不参与成片）

## 3. 底部栏与快门逻辑

- [x] 3.1 底部中央拍摄按钮：拍照模式下调现有 onShutterPress（takePictureAsync）；若 timer > 0 先启动倒计时 UI 再执行拍照，倒计时期间禁用按钮
- [x] 3.2 底部中央拍摄按钮：录像模式下调用 cameraRef.record() / stopRecording()，按钮状态切换为「录制中」红点或停止图标（可选本 change 内实现 record，或仅 UI 占位）
- [x] 3.3 底部左侧相册入口：点击后请求媒体库权限（expo-media-library 或 permissionsService），通过 router.push 至新屏或 Linking 打开系统相册；无权限时展示引导
- [x] 3.4 底部右侧模版入口：点击后 router.push 至 /(tabs)/templates 或打开模版选择 Modal；选模版后返回并 setSelectedTemplate，相机页显示 TemplateOverlay

## 4. 集成与收尾

- [x] 4.1 导出 CameraTopBar、CameraBottomBar 自 features/camera，相机页仅引用不内联实现
- [x] 4.2 确认顶部栏在小屏或横屏下不严重遮挡取景，必要时收拢为「更多」或减少图标数量
- [x] 4.3 运行 lint，修复类型与格式问题
