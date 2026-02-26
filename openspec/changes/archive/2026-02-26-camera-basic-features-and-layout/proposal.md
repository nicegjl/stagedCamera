## Why

PRD 要求实现常规相机的基础能力（拍照、录像、前后摄、闪光、变焦、画幅、倒计时、相册入口等），当前已接入真实预览与基础控件，但辅助功能入口分散、布局未按「顶部工具栏 + 底部拍摄/相册/模版」的常规相机交互落地。需要在本 change 中补齐基础功能并统一相机页排版，提升可用性与与 PRD/设计图一致度。

## What Changes

- **相机页布局调整**
  - **顶部工具栏**：集中放置辅助工具——闪光灯、前后摄像头翻转、倒计时、变焦、画幅调整。取景区域全屏，工具栏悬浮或贴顶，不占用取景主体。
  - **底部栏**：中央为拍摄按钮（拍照/录像），左侧为相册入口，右侧为模版入口。与 PRD 相册入口、模版模式切换一致。
- **常规相机基础功能**
  - 已具备：拍照、录像、前后摄切换、闪光、取景预览、拍照/录像模式切换。
  - 本 change 补齐/明确：**倒计时**（3s/10s 可选项）、**变焦**（档位或手势，与现有 zoom 状态联动）、**画幅调整**（4:3、16:9、1:1、full 与 CameraContext 一致）、**相册入口**（从底部左侧进入最近/相册）、**模版入口**（从底部右侧进入模版 Tab 或模版选择）。
- **九宫格**：可选实现（PRD P1），在顶部工具栏提供开关，控制取景叠加网格。
- 无破坏性变更：仅新增 UI 与状态联动，现有 CameraContext/TemplateContext 与 features 结构保持不变。

## Capabilities

### New Capabilities

- `camera-basic-features`: 常规相机基础能力——倒计时、变焦、画幅、九宫格开关、相册入口、模版入口；与 PRD 3.1–3.3 及现有 CameraContext 对齐。
- `camera-ui-layout`: 相机页 UI 布局——顶部辅助工具栏（闪光/翻转/倒计时/变焦/画幅）、底部中央快门与左右相册/模版入口；与设计图及用户描述一致。

### Modified Capabilities

- （无：未改动既有 openspec/specs 中 API 或数据契约。）

## Impact

- **影响范围**：`app/(tabs)/index.tsx`（相机页）、`features/camera/components/`（CameraControls 拆分为顶部工具栏与底部栏，或新增 CameraTopBar/CameraBottomBar）、可选 `services/media` 或 expo-media-library 用于相册入口。
- **依赖**：现有 expo-camera、CameraContext、TemplateContext；相册入口需相册权限与媒体库能力（可先占位或接 mediaService.getRecentUris）。
- **文档**：.docs/DESIGN.md 中设计图已描述类似布局，本 change 实现与之一致。
