# 优化媒体库逻辑 - 任务

## 1. 多选工具栏移至右上角并图标化

- [x] 1.1 在 `app/gallery.tsx` 列表视图头部：多选模式下，右侧不再渲染「选择」按钮，改为渲染「下载」图标按钮 + 「删除」图标按钮（有选中项时）；使用 @expo/vector-icons（如 Ionicons download-outline、trash-outline），点击逻辑与现有 handleBatchSave、handleBatchDelete 一致。
- [x] 1.2 移除列表视图下原有的独立 batchBar 一栏（或仅保留「保存中」时的进度展示于头部右侧区域）；保存中时可在右侧显示 ActivityIndicator + 「N/M」文案，完成后恢复下载/删除图标。
- [x] 1.3 多选模式下左侧仍为「取消」（退出多选），中间标题为「已选 N 张」；非多选时左侧为返回 + 相机（见任务 3）。

## 2. 大图页显式操作菜单

- [x] 2.1 在 `GalleryDetailView` 头部右侧增加「更多」菜单图标（如 Ionicons ellipsis-horizontal）；点击后弹出与当前长按相同的 Alert（「保存到系统相册」「删除」），逻辑复用现有 handleSave、handleDelete 与确认文案。
- [x] 2.2 保留大图长按弹出同一套操作菜单，确保与右上角菜单行为一致。

## 3. 列表与大图返回入口区分

- [x] 3.1 列表展示时：头部左侧改为「返回 icon」+「相机 icon」两个按钮。返回：若在多选则退出多选并清空选中，否则 `router.back()`。相机：跳转到相机 tab（如 `router.replace('/(tabs)/')` 或当前 app 的相机路由）。
- [x] 3.2 大图展示时：头部左侧保持单一「返回」按钮（或返回 icon），点击回到列表视图（setViewMode('list')），行为不变。

## 4. 大图拖动与缓动

- [x] 4.1 在 `GalleryDetailView` 的 DetailPage 中，在现有 Pinch 缩放基础上增加 Pan 手势：使用 react-native-gesture-handler 的 Gesture.Pan()，更新 translateX/translateY（useSharedValue），与 scale 一起在 useAnimatedStyle 中应用 transform。
- [x] 4.2 平移边界：缩放 > 1 时允许在合理范围内平移（如限制图片不超出视口过多）；缩放 = 1 时可不平移或仅允许小幅位移并回弹居中。
- [x] 4.3 松手时使用 Reanimated 的 withSpring（或 withDecay 做惯性）对 translateX/Y 做缓动/回弹，参数调优至接近 iOS 相册手感（如 damping、stiffness）。
- [x] 4.4 与横向 FlatList 的滑动冲突：通过 gesture 的 activeOffsetX 或 simultaneousHandlers 等配置，避免左右滑动切图时误触发单页内 Pan；优先保证左右滑动切图流畅。

## 5. 收尾

- [x] 5.1 运行 lint，确认无类型与格式错误；检查图标与文案在深色背景下的可见性。
