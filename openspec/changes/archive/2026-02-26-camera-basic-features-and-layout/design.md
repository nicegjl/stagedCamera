## Context

- 相机页已有真实预览（CameraPreview + expo-camera）、CameraContext（mode、facing、flash、aspectRatio、timer、gridEnabled、zoom）、底部 CameraControls（快门、闪光循环、翻转、拍照/录像切换）。相册与模版目前通过 Tab 切换进入，未在相机页底部提供直达入口。
- PRD 要求常规相机基础能力（P0/P1）：拍照、录像、前后摄、闪光、变焦、对焦、画幅、倒计时、相册入口、九宫格等；布局上用户要求辅助工具置顶、底部中央快门、左相册右模版。

## Goals / Non-Goals

**Goals:**

- 相机页采用「顶部辅助工具栏 + 底部快门/相册/模版」布局，与 PRD 及设计图一致。
- 顶部集中：闪光灯、前后翻转、倒计时、变焦、画幅调整；可选九宫格开关。
- 底部：左侧相册入口、中央拍摄按钮、右侧模版入口。
- 倒计时、变焦、画幅、九宫格与现有 CameraContext 状态联动并驱动 CameraView/取景。
- 相册入口可跳转至系统相册或应用内最近列表；模版入口跳转至模版 Tab 或弹层选模版。

**Non-Goals:**

- 不实现录像的 record/stopRecording 与时长限制（可后续迭代）。
- 不实现曝光补偿、水平仪、HDR、连拍等 P2 功能。
- 相册页完整 UI 与媒体库深度集成可后续迭代；本 change 以「入口 + 跳转」为主。

## Decisions

- **顶部栏实现方式**：在相机页内新增 `CameraTopBar` 组件（或重构 CameraControls 为 TopBar + BottomBar），置于取景区域上方、安全区内，使用半透明背景保证可读性。理由：与现有 features/camera 结构一致，不引入新路由。
- **变焦交互**：保留 CameraContext.zoom，顶部提供档位按钮（如 0.5x / 1x / 2x）或单按钮循环；手势变焦可选后续加。理由：先满足「可调变焦」与 PRD 档位描述，手势与设备能力在 tasks 中可标注为可选。
- **画幅与取景**：画幅切换更新 CameraContext.aspectRatio；取景区域与 CameraView 的 ratio/裁剪由现有 CameraPreview 或样式约束体现，若 expo-camera 不支持动态 ratio 则用 overlay 裁剪视觉效果。理由：状态先行，视觉与原生能力对齐在实现时细化。
- **倒计时**：CameraContext 已有 timer (0|3|10)。快门按下后若 timer > 0 先显示倒计时再触发 takePictureAsync；倒计时期间禁用再次按下。理由：与 PRD 3.3 一致，逻辑简单。
- **相册入口**：使用 `Linking.openURL` 打开系统相册或使用 expo-media-library 的 presentPermissionsDialogAsync/getAssetsAsync 后跳转至新屏或 Tab。若权限未授予则先请求媒体库权限再进入。理由：MVP 以「能进入相册」为主，具体展示方式在 tasks 中二选一。
- **模版入口**：底部右侧按钮跳转至 `/(tabs)/templates`（router.push）或打开模版选择 Modal；选模版后返回相机页并设置 TemplateContext.selectedTemplate。理由：与现有 Tab 与 TemplateContext 兼容，具体选 Modal 还是 Tab 在 tasks 中定一种。

## Risks / Trade-offs

- **[Risk]** 顶部栏图标/按钮过多导致拥挤或遮挡取景。  
  **Mitigation**：仅放闪光、翻转、倒计时、变焦、画幅（及可选网格），图标+短文案或 tooltip；小屏可考虑折叠为「更多」菜单。
- **[Risk]** 画幅切换与 expo-camera 的 ratio 支持不一致导致取景与成片比例不符。  
  **Mitigation**：实现时以 expo-camera 文档为准，必要时用取景区域 mask 或裁剪成片保证与 aspectRatio 一致。
- **[Trade-off]** 相册入口先做「打开系统相册」可最快交付，但无法展示「仅本应用拍摄」；若做应用内最近列表需 media 服务与权限。本 change 优先可交付入口，应用内列表可标为后续任务。

## Migration Plan

- 无数据迁移。部署：合并后用户打开相机页即为新布局；若此前有未发布版本，无兼容性动作。
- 回滚：还原相机页与 CameraControls/CameraTopBar 相关提交即可。

## Open Questions

- 模版入口采用「跳转至模版 Tab」还是「在当前页打开模版选择 Modal」：建议先采用跳转 Tab，实现简单且与现有路由一致。
