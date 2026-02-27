# 优化媒体库逻辑 - 设计

## Context

- 相册页 `app/gallery.tsx` 有两种视图：列表（默认）与大图（GalleryDetailView）。列表头部为左「返回/取消」、中「相册/已选 N 张」、右「选择」；多选时在头部下方有一栏 batchBar，含「下载到系统相册」「删除」文字按钮及保存进度。
- 大图页 GalleryDetailView 头部为左「返回」、中「相册」、右占位；单张通过长按弹出「保存到系统相册」「删除」菜单；支持双指缩放，暂无平移与缓动。
- 技术栈：expo-router、React Native、react-native-gesture-handler、react-native-reanimated、@expo/vector-icons。

## Goals / Non-Goals

**Goals:**

- 多选时工具栏移到右上角区域，下载/删除改为图标；保存中进度可仍在同一区域或临时替换为进度文案。
- 大图页提供显式操作入口（如右上角菜单图标），点击后弹出与长按相同的「保存到系统相册」「删除」菜单。
- 列表模式左上角：返回 icon + 相机 icon（返回 = router.back()，相机 = 跳转相机 tab/页）；大图模式左上角：仅返回（回列表）。
- 大图支持单指拖动平移；松手后位移/回弹使用 Reanimated 缓动（如 withSpring 或 withDecay），风格接近 iOS 相册。

**Non-Goals:**

- 不改变现有媒体库数据源、权限与保存到系统相册的 API；不新增相册与相机之外的 tab。

## Decisions

- **多选工具栏布局**：列表头部右侧在「选择模式」下不再显示「选择」，改为显示「下载」图标 + 「删除」图标（有选中项时）；保存中可显示 ActivityIndicator + 「N/M」或仅占位，完成后恢复图标。图标使用 @expo/vector-icons（如 Ionicons：download-outline、trash-outline）。移除原 batchBar 整栏，避免底部单独一栏。
- **大图操作入口**：在 GalleryDetailView 头部右侧增加「更多/菜单」图标（如 ellipsis-horizontal）；点击后弹出与长按相同的 Alert 菜单（保存到系统相册、删除）。长按保留，行为一致。
- **列表左上角双入口**：左侧为两个可点击区域：返回 icon（chevron-back 或 arrow-back）+ 相机 icon（camera-outline）。返回：若在多选则退出多选，否则 router.back()。相机：router 跳转到相机 tab（如 `/(tabs)` 或 `/(tabs)/`），具体路由与现有 app 结构一致。
- **大图平移与缓动**：在现有 Pinch 缩放基础上，为 DetailPage 内图片增加 Pan 手势；translateX/Y 用 useSharedValue 存储，与 scale 一起在 useAnimatedStyle 中应用。边界限制：平移范围可限制在「不超出视口过多」或允许一定越界后回弹。松手时使用 withSpring 或 withDecay 做回弹/惯性，阻尼与刚度参考 iOS 手感（如 damping ~20, stiffness ~200 或使用 runOnJS 配合 withDecay）。缩放 > 1 时允许平移，缩放 = 1 时也可允许小幅平移或限制为回弹到居中。

## Risks / Trade-offs

- **[Trade-off]** 列表左上角放两个图标可能挤占标题空间；若标题「相册」与「已选 N 张」仍居中，可保留；若空间不足可缩小图标或仅保留图标不保留文字标题。
- **[Risk]** 大图 Pan 与横向 FlatList 滑动可能冲突。**Mitigation**：Pan 仅在单页内生效（当前大图项），手势识别器需与 FlatList 的 horizontal scroll 协调（如 simultaneousHandlers 或 activeOffsetX 限制），避免左右滑动切图时误触平移。

## Open Questions

- 大图「缩放=1」时是否允许平移：若允许，需定义边界与回弹；若不允许多余平移，可仅在有缩放时启用 Pan。
