## Why

用户希望简化布局：去掉 **Tab 底部栏**（相机 | 模版 两个 Tab 的入口），减少干扰；模版仍从相机底部栏的「模版」进入，进入后为独立界面且带**顶部返回**，以此返回相机。

## What Changes

- **删除 Tab 底部栏**：在 `app/(tabs)/_layout.tsx` 中不再使用 Tabs 渲染底部 Tab 栏；改为 Stack 导航，默认为相机页，模版为推入的二级屏。
- **相机底部栏保持不变**：`CameraBottomBar` 不删不改，仍包含相册、中央快门、模版入口；快门保持居中。
- **模版入口与返回**：相机底部「模版」点击后进入 `/templates` 路由（即 `(tabs)/templates`）；该界面 SHALL 包含**顶部栏与返回按钮**，用户点击返回后回到相机页。
- 无破坏性 API 变更；仅导航与布局调整。

## Capabilities

### New Capabilities

- `no-tab-bar`: 应用在 (tabs) 分组内不展示 Tab 底部栏；相机与模版通过 Stack 切换，模版以推入方式呈现。
- `templates-screen-with-back`: 模版页以 Stack 屏呈现，顶部有返回按钮，返回后回到相机页。

### Modified Capabilities

- （无）

## Impact

- **影响**：`app/(tabs)/_layout.tsx`（Tabs → Stack，取消 tabBar）、`app/(tabs)/templates.tsx`（启用顶部栏/返回，可选标题「模版」）；相机页与 CameraBottomBar 无需改动。
- **依赖**：expo-router Stack、现有 CameraBottomBar 与模版路由。
