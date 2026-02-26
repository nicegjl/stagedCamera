## Context

- 当前 `app/(tabs)/_layout.tsx` 使用 **Tabs**，底部展示「相机 | 模版」两个 Tab；用户希望**删除这条 Tab 底部栏**，相机页的 **CameraBottomBar**（相册、快门、模版）**保持不变**；点击模版后进入模版页，该页需有**顶部返回**回到相机。
- 技术栈：expo-router、现有 (tabs)/index（相机）、(tabs)/templates（模版列表）。

## Goals / Non-Goals

**Goals:**

- (tabs) 分组内不再展示 Tab 底部栏。
- 相机页保持现有布局：CameraTopBar、取景、CameraBottomBar（相册、居中快门、模版）。
- 点击相机底部「模版」进入 `/(tabs)/templates`；模版页以 Stack 推入方式呈现，顶部有返回按钮，返回后回到相机。

**Non-Goals:**

- 不修改 CameraBottomBar 组件或相机页结构；不新增悬浮快门、不删除相册/模版入口。
- 不在此 change 内改模版列表内容或 TemplateContext 行为。

## Decisions

- **导航结构**：将 `(tabs)/_layout.tsx` 从 **Tabs** 改为 **Stack**。index 为默认屏（相机），templates 为第二屏；从相机 `router.push('/(tabs)/templates')` 时以 Stack 推入，无 Tab 栏。
- **模版页顶部返回**：在 Stack 中为 `templates` 屏设置 `headerShown: true`（及标题如「模版」），由 Stack 自带头部提供返回按钮，返回即 `router.back()` 回相机。
- **相机与 CameraBottomBar**：不改动；模版入口已为 `router.push('/(tabs)/templates')`，无需修改。

## Risks / Trade-offs

- 无 Tab 后，从其他入口（若有）进入「模版」需依赖导航栈；当前仅从相机底部进入，无影响。

## Migration Plan

- 无数据迁移。发布后用户打开即无 Tab 栏；从相机点模版进入模版页，顶部返回回相机。
- 回滚：将 _layout 改回 Tabs、templates 的 headerShown 改回 false 即可。

## Open Questions

- 无。
