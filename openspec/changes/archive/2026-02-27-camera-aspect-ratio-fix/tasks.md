# 修复画幅调整的逻辑 - 任务

## 1. 预览区域随画幅调整

- [x] 1.1 在相机页或 CameraPreview 内消费 `aspectRatio`；竖屏下对 4:3、16:9、1:1 使用有效比例 3/4、9/16、1。
- [x] 1.2 根据预览容器可用尺寸，计算「取景框」宽高（内接于容器且满足目标比例），并居中显示。
- [x] 1.3 将 CameraView 限制在该取景框内（取景框容器 + overflow hidden）；确认 GridOverlay、TemplateOverlay 对齐取景区域。

## 2. 成片满足画幅

- [x] 2.1 拍照流程：takePictureAsync 得原图后，按当前画幅（竖屏 3:4、9:16、1:1）用 expo-image-manipulator 中心裁剪，再 savePhoto。
- [x] 2.2 确保 savePhoto 写入的是最终比例正确的图片。

## 3. 移除 full 档位

- [x] 3.1 类型：`AspectRatio`、`TemplateAspectRatio` 仅保留 '4:3' | '16:9' | '1:1'。
- [x] 3.2 CameraTopBar：`ASPECT_OPTIONS` 去掉 'full'；Context 默认保持 '4:3'。
- [x] 3.3 相机页：移除所有 `aspectRatio === 'full'` 及 `getAspectRatioNumber` 返回 null 的分支；预览与裁剪统一使用竖屏有效比例（3/4、9/16、1）。

## 4. 收尾

- [x] 4.1 运行 lint；真机或模拟器验证：仅三档画幅、竖屏下为 3:4/9:16/1:1，所见即所得。
