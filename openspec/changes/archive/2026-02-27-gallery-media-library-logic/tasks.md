# 相册模块逻辑变更 - 任务

## 1. 应用媒体库存储与数据源

- [x] 1.1 在 `features/gallery/lib` 中实现应用内媒体库：使用 expo-file-system 在应用文档目录下创建 `media`（或等效）子目录；定义媒体元数据结构（如 id、filename、uri、createdAt）及持久化方式（如 JSON 文件或 AsyncStorage 存 id 列表 + 文件系统存文件）。
- [x] 1.2 实现「保存到应用媒体库」：给定拍照得到的本地 URI，将文件复制到应用 media 目录、生成唯一文件名与 id、更新元数据列表并持久化；提供按创建时间倒序的读取接口（返回 GalleryAsset 兼容结构或新类型，便于现有组件复用）。
- [x] 1.3 修改 `features/gallery/lib/mediaLibrary.ts`（或拆分为 appMediaLibrary + systemSave）：移除「从系统相册 getAssetsAsync 读取」的逻辑；改为从应用媒体库元数据 + 文件 URI 提供列表与最新一张；保留 `requestGalleryPermission`、`savePhotoToLibrary(localUri)` 用于「下载到系统相册」。
- [x] 1.4 更新 GalleryContext：列表数据来源改为应用媒体库的读取接口；`savePhoto(localUri)` 改为先写入应用媒体库（1.2），再刷新列表；保留 `refresh`、权限与「保存到系统相册」所需能力。
- [x] 1.5 应用媒体库删除接口：在应用媒体库层提供按 id（或 id 列表）删除的能力（删除对应文件并从元数据中移除）；GalleryContext 暴露 `deleteFromAppLibrary(ids: string[])` 或单 id 方法，删除后刷新列表。

## 2. 相册页默认列表与列表体验

- [x] 2.1 修改 `app/gallery.tsx`：相册打开时默认视图改为「列表」；无资源时仍显示空状态；移除「默认进入最新一张大图」的逻辑。
- [x] 2.2 重构列表组件（如 `GalleryThumbnailList` 或新组件）：使用 `FlatList` 展示媒体列表，支持上下滑动；配置 `initialNumToRender`、`maxToRenderPerBatch`、`windowSize` 实现懒加载；列表项使用图片组件，在 onLoad 或 uri 就绪时触发渐现动画（opacity 0→1，如 Reanimated 或 Animated）。
- [x] 2.3 列表布局：采用多列网格（如 numColumns=3）或单列列表，与 design 一致；保证滚动流畅与懒加载生效。

## 3. 全屏大图与左右滑动

- [x] 3.1 实现全屏大图视图：点击列表项时进入全屏大图页（可为同一屏幕内状态切换或独立路由）；大图占满屏幕，支持双指缩放（保留现有 GalleryImageView 缩放逻辑，最小比例 1）。
- [x] 3.2 大图左右滑动：大图视图使用横向 FlatList（或 ScrollView horizontal pagingEnabled），data 为当前媒体列表，initialScrollIndex 为点击项索引；左右滑动切换上一张/下一张；每页渲染单张大图，可结合懒加载减少内存。
- [x] 3.3 大图页保留长按「保存到系统相册」；可选：顶部或底部提供返回按钮回到列表。
- [x] 3.4 大图页删除：大图页支持删除当前张（如长按菜单或工具栏「删除」）；删除前二次确认（「仅从本应用移除，无法恢复」）；删除后若存在下一张则自动切换到下一张，若无下一张则退回列表视图。

## 4. 长按与批量选择（保存到系统相册 + 删除）

- [x] 4.1 列表项长按：单张长按弹出菜单，包含「保存到系统相册」与「删除」；保存使用该资源本地文件 URI 调用 `savePhotoToLibrary(localUri)`；删除前确认，再调用应用媒体库删除接口并刷新列表。不实现左滑删除。
- [x] 4.2 批量选择模式：列表页增加进入「批量选择」的入口（如顶部按钮）；选择模式下可勾选多项；提供「下载到系统相册」与「删除」按钮；下载将选中项依次调用 `savePhotoToLibrary` 并给予进度或结果提示；删除前确认，再批量调用应用媒体库删除接口并刷新列表。
- [x] 4.3 大图页长按：全屏大图下长按当前张可触发「保存到系统相册」或「删除」（与 3.4 一致）；删除后显示下一张或退回列表。

## 5. 相册入口与收尾

- [x] 5.1 CameraBottomBar 相册入口：继续从应用媒体库取「最新一张」的缩略图 URI（应用媒体库接口返回的首项）；无资源时显示默认 images-outline 图标；点击跳转 /gallery 不变。
- [x] 5.2 拍照流程：拍照完成后仍调用 gallery 的「保存新照片」接口，该接口改为写入应用媒体库（1.2），并刷新 Context 列表。
- [x] 5.3 运行 lint、修复类型与格式；确认权限与 expo-file-system / expo-media-library 配置正确。

## 6. 后续优化（UX 与遗留组件）

- [x] 6.1 列表长按「保存到系统相册」：保存成功或失败后给出 Alert 提示（如「已保存到系统相册」/「保存失败」），避免静默无反馈。
- [x] 6.2 批量保存到系统相册：多张保存时给予进度或结果反馈（如「已保存 N 张」或逐张进度），避免长时间无反馈。
- [x] 6.3 GalleryImageView：主流程已改用 GalleryDetailView；在组件与 index 导出处标注为遗留（推荐使用 GalleryDetailView），或从 index 移除导出。
