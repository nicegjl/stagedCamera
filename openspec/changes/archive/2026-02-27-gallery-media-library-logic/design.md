# 相册模块逻辑变更 - 设计

## Context

- 当前相册通过 expo-media-library 的 getAssetsAsync 读取**系统相册**中的照片，拍照后通过 createAssetAsync 直接写入系统相册；相册页默认进入「最新一张大图」，可切换到缩略图列表，列表为网格、无懒加载与渐现，大图为单张查看、无左右滑动。
- 技术栈：expo-router、expo-camera、expo-media-library、React Native、react-native-gesture-handler、react-native-reanimated；已有 features/gallery（GalleryContext、GalleryThumbnailList、GalleryImageView、mediaLibrary 封装）。

## Goals / Non-Goals

**Goals:**

- 媒体库与系统相册分离：相册只读写「应用媒体库」（应用内存储或本应用专用相册），不直接读取系统相册。
- 拍照后仅保存到应用媒体库；通过长按或批量选择后，提供「下载到系统相册」。
- 打开相册默认显示列表；列表上下滑动、懒加载、图片渐现效果。
- 点击列表项进入全屏大图；大图支持左右滑动查看上一张/下一张。

**Non-Goals:**

- 不实现云端同步、多设备相册、或系统相册的「导入到应用」；不改变相机仅拍照的既有行为。不实现左滑删除（仅单张长按菜单与批量选择后删除）。

## Decisions

- **应用媒体库存储**：采用「应用文档目录 + 元数据列表」方案。在应用文档目录下创建专用子目录（如 `media`）存放照片文件；维护一份按时间排序的元数据列表（如 JSON 或内存 + 持久化 id 列表），记录文件名、创建时间、本地 URI。这样无需系统相册读取权限即可展示相册；仅当用户执行「保存到系统相册」时再请求 expo-media-library 权限并调用 createAssetAsync(localUri)。备选：使用 expo-media-library 创建仅本应用使用的相册（如 albumName: 'StagedCamera'），只从该相册 getAssetsAsync；但 getAssetsAsync 默认会包含全库，需通过 getAlbum 再 getAssetsFromAlbumAsync 限定范围，实现上可行但依赖「只往该相册写入」的约定，且部分平台可能仍会请求宽泛权限。优先采用文档目录方案以明确「不读系统相册」。
- **列表实现**：使用 React Native 的 FlatList 展示媒体列表（单列或网格由 UI 定）；通过 FlatList 的 windowSize、maxToRenderPerBatch、initialNumToRender 实现懒加载；每个列表项在图片加载完成时使用 Reanimated 或 Animated 做 opacity 0→1 的渐现。
- **大图全屏与左右滑动**：全屏大图页使用横向 FlatList（或 ScrollView horizontal pagingEnabled），data 为当前媒体列表，initialScrollIndex 为点击项索引；每页一图，支持左右滑动切换；保留现有双指缩放与长按保存到系统相册能力（可放在大图页工具栏或长按）。
- **批量选择与下载**：列表支持「批量选择」模式（如顶部按钮进入，或长按某张进入）；选中多项后提供「下载到系统相册」按钮，循环调用 savePhotoToLibrary(asset 对应本地文件 URI)；单张仍可通过长按弹出「保存到系统相册」。
- **相册入口缩略图**：CameraBottomBar 的相册入口继续从应用媒体库取「最新一张」的缩略图 URI（从元数据列表取第一项对应文件 URI），无资源时显示默认图标。
- **应用媒体库删除**：仅支持「单张长按菜单中的删除」与「批量选择模式下的删除」；不实现左滑删除。应用媒体库层提供按 id（或 id 列表）删除的接口：删除对应文件并更新元数据。单张/批量删除前均需二次确认（如「删除后仅从本应用移除，无法恢复」）。大图页支持删除当前张；删除后若存在下一张则自动切换到下一张，若无下一张则退回列表视图。

## Risks / Trade-offs

- **[Risk]** 应用文档目录在卸载或清除数据后丢失，用户若未提前「下载到系统相册」会丢失照片。**Mitigation**：在空状态或设置中提示用户可将重要照片保存到系统相册。
- **[Risk]** 误删：删除为不可恢复。**Mitigation**：单张与批量删除前均弹确认框，文案明确「仅从本应用移除，无法恢复」。
- **[Trade-off]** 应用媒体库与系统相册双份存储，用户需主动选择保存到系统，多一步操作。**Accept**：满足「不直接读系统相册」与「用户主动下载」的需求。

## Migration Plan

- 无服务端迁移。现有逻辑若已从系统相册读取，本次改为从应用文档目录 + 元数据读取；**已有通过本应用写入系统相册的照片不会自动出现在新「应用媒体库」**，仅新拍摄的照片进入应用媒体库。若需兼容旧数据，可做一次性迁移：在首次启动时检测旧来源并复制到应用媒体库（可选，不纳入本变更必须范围）。
- 回滚：恢复 mediaLibrary 使用 getAssetsAsync、相册默认大图、列表无懒加载/渐现、大图无左右滑动。

## Follow-up（后续优化）

- **保存到系统相册反馈**：列表单张长按保存、大图长按保存后，根据 `savePhotoToLibrary` 结果弹 Alert 成功/失败；批量保存时给出「已保存 N 张」或进度，避免静默无反馈。
- **GalleryImageView**：相册主流程已使用 GalleryDetailView（全屏横向滑动）；GalleryImageView 保留用于单张大图场景，在导出与组件内标注为遗留，推荐新用法使用 GalleryDetailView。

## Open Questions

- 列表布局：单列（每行一张缩略图）还是多列网格？建议多列网格以与现有缩略图列表风格一致，并配合 FlatList numColumns 懒加载。
