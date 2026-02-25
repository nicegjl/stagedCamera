# stagedCamera 架构说明

**版本**：v0.1  
**更新日期**：2025-02-25  
**技术栈**：React Native + Expo（Expo Router）

本文档描述项目在 PRD 基础上的架构设计，旨在实现**易维护、易扩展、易阅读**，并遵循**高内聚、低耦合**原则。

---

## 一、设计原则

### 1.1 高内聚

- **按领域/功能聚合**：相机相关逻辑集中在 `features/camera`，人物模版相关集中在 `features/templates`，避免散落多处。
- **类型与数据就近**：各 feature 使用的类型在 `types/` 统一定义，feature 内部可有自己的 context、hooks、components，对外通过单一 `index.ts` 导出。
- **服务层内聚**：权限、媒体存储等与系统/IO 打交道的逻辑集中在 `services/`，便于替换实现与测试。

### 1.2 低耦合

- **界面与状态解耦**：页面（`app/`）只做组合与路由，具体状态由 `features/*` 的 Context 管理，UI 通过 hooks 消费。
- **功能模块间少直接依赖**：camera 与 templates 通过「选中模版」等状态协作，不互相 import 内部实现；需要协作时通过 Context 或少量共享类型。
- **与原生能力解耦**：通过 `services` 接口访问相机、相册、权限，具体实现可切换（expo-camera、expo-media-library 等），业务层不依赖具体 SDK。

### 1.3 易扩展

- **新功能 = 新 feature**：新增「相册」「设置」等时，在 `features/` 下新建目录，实现 context/components/hooks，再在 `app/` 增加路由即可。
- **模版扩展**：模版数据结构（`types/template.ts`）已支持多维度分类与多人线框，新增场景/节日/人数只需扩展数据与筛选 UI，无需改架构。
- **相机能力扩展**：相机状态（`CameraContext`）与类型（`types/camera.ts`）已预留画幅、倒计时、网格等，新控件只消费 context，不新增全局状态。

---

## 二、目录结构

```
stagedCamera/
├── app/                          # 路由与页面（Expo Router）
│   ├── _layout.tsx                # 根布局：Theme + CameraProvider + TemplateProvider
│   ├── (tabs)/
│   │   ├── _layout.tsx            # Tab 配置
│   │   ├── index.tsx              # 首页
│   │   ├── camera.tsx             # 相机页
│   │   ├── templates.tsx          # 模版库页
│   │   └── explore.tsx            # 发现
│   └── modal.tsx
│
├── features/                      # 功能模块（按领域）
│   ├── index.ts                   # 统一导出
│   ├── camera/
│   │   ├── index.ts
│   │   ├── context/CameraContext.tsx
│   │   ├── components/CameraControls.tsx
│   │   └── hooks/useCameraPermission.ts
│   └── templates/
│       ├── index.ts
│       ├── context/TemplateContext.tsx
│       ├── components/TemplateOverlay.tsx
│       └── data/mockTemplates.ts
│
├── components/                    # 共享 UI 组件
│   ├── index.ts
│   ├── ui/                        # 基础组件（图标、折叠等）
│   ├── themed-text.tsx
│   ├── themed-view.tsx
│   └── ...
│
├── hooks/                         # 共享 Hooks（主题等）
│   ├── index.ts
│   ├── use-color-scheme.ts
│   └── use-theme-color.ts
│
├── services/                      # 与系统/IO 对接的服务层
│   ├── index.ts
│   ├── permissions.ts             # 相机、相册、麦克风权限
│   └── media.ts                   # 保存照片/视频、最近列表
│
├── types/                         # 全局类型定义
│   ├── index.ts
│   ├── camera.ts                  # 相机模式、画幅、闪光等
│   └── template.ts                # 模版、线框、分类
│
├── constants/                     # 主题、配置常量
│   └── theme.ts
│
└── assets/                        # 静态资源
```

---

## 三、各层职责

### 3.1 app/（路由与页面）

- **只做组合与导航**：引入 `features` 中的 Provider、组件与 hooks，不承载业务状态与复杂逻辑。
- **路由与 PRD 对应**：
  - `(tabs)/camera`：常规相机 + 模版叠加取景，对应 PRD 第三节与第四节取景页。
  - `(tabs)/templates`：模版库与分类筛选，对应 PRD 4.2 模版选择。
  - 后续可增加：相册页（`gallery`）、设置页（`settings`）、全屏取景栈等。

### 3.2 features/（功能模块）

| 模块 | 职责 | 对外 API |
|------|------|----------|
| **camera** | 拍摄模式、闪光、画幅、变焦、倒计时、网格等状态；权限 Hook；控件占位 | `CameraProvider`、`useCamera`、`useCameraOptional`、`CameraControls`、`useCameraPermission` |
| **templates** | 当前选中模版、叠加层透明度/缩放/偏移；模版数据；叠加层组件 | `TemplateProvider`、`useTemplate`、`useTemplateOptional`、`TemplateOverlay`、`getTemplates` |

- **约定**：其他模块与页面仅通过各 feature 的 `index.ts` 导入，不直接引用其内部文件（如 `context/`、`data/`），以保持边界清晰。

### 3.3 components/（共享组件）

- **与领域无关**：主题文本/视图、图标、触觉 Tab、折叠、外链等，可被任意页面与 feature 使用。
- **不依赖 features**：共享组件不 import `features/*`，避免循环依赖；若某组件强依赖某一 feature，应放入该 feature 的 `components/`。

### 3.4 services/（服务层）

- **接口 + 占位实现**：`PermissionService`、`MediaService` 等以接口定义能力，当前为占位实现；后续接入 `expo-camera`、`expo-media-library` 等时，仅替换实现文件，业务层调用方式不变。
- **便于测试**：业务层通过依赖注入或直接 import 的 service 调用，测试时可 mock `services/*`。

### 3.5 types/（类型）

- **与 PRD 一致**：`camera.ts` 对应常规相机能力（模式、闪光、画幅、倒计时等），`template.ts` 对应 PRD 4.3.2 模版与线框结构。
- **跨模块共享**：features、services、app 均可从 `@/types` 或 `@/types/camera`、`@/types/template` 引用，保证数据结构统一。

### 3.6 constants/、hooks/

- **主题与通用 Hook**：如 `theme.ts`、`useColorScheme`、`useThemeColor`，与具体 feature 解耦，供全局使用。

---

## 四、数据流与依赖关系

```
                    ┌─────────────┐
                    │   app/      │  路由与页面组合
                    └──────┬──────┘
                           │ 使用
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
  │features/    │  │components/  │  │ hooks/      │
  │camera       │  │ (shared UI) │  │ (theme…)   │
  │templates    │  └─────────────┘  └─────────────┘
  └──────┬──────┘
         │ 依赖
         ▼
  ┌─────────────┐  ┌─────────────┐
  │ types/      │  │ services/   │
  └─────────────┘  └─────────────┘
```

- **自上而下**：app → features / components / hooks；features → types、services。
- **避免**：features 互相引用内部实现；components 引用 features；services 引用 features 或 app。

---

## 五、与 PRD 的对应

| PRD 模块 | 架构落点 |
|----------|----------|
| 常规相机功能（拍照、录像、前后摄、闪光、变焦、对焦、画幅、倒计时、网格、相册、权限等） | `types/camera.ts` 定义状态与能力；`features/camera` 管理状态与控件；`services/permissions.ts`、`services/media.ts` 提供权限与存储；具体 Native 预览/录制在 camera 组件内接入。 |
| 人物拍照模版（模版库、选择、取景叠加、线框可调、成片不含线框、模式切换） | `types/template.ts` 定义模版与线框结构；`features/templates` 管理选中模版与叠加状态、模版数据与叠加层 UI；与相机页通过 `TemplateProvider` 共享状态，实现「选模版 → 取景叠加 → 拍摄」闭环。 |
| 模版扩展性（场景/人数/节日等） | `Template` 的 `categoryIds`、`tags`、`figures[]` 已支持多维度扩展；新增分类或远程拉取只需扩展 `data/` 与筛选 UI。 |

---

## 六、扩展指南

### 6.1 新增一个功能领域（如「相册」）

1. 在 `features/` 下新建 `gallery/`。
2. 定义所需类型（若仅本模块用可放在 `gallery/types.ts`，若全局共享则补充 `types/`）。
3. 实现 `context/`、`components/`、`hooks/`，在 `gallery/index.ts` 中导出。
4. 在 `app/(tabs)/` 或其它路由下新增页面，使用 `GalleryProvider` 与导出的组件/hooks。
5. 若需读写相册，在 `services/media.ts` 扩展接口并在实现中对接 expo-media-library。

### 6.2 新增相机控件（如「曝光补偿滑块」）

1. 在 `types/camera.ts` 中已有 `exposureBias`，`CameraContext` 已提供 `setExposureBias`。
2. 在 `features/camera/components/` 下新增 `ExposureSlider.tsx`，内部只调用 `useCamera().setExposureBias`。
3. 在 `CameraControls.tsx` 或相机页中挂载该组件即可，无需新增全局状态。

### 6.3 模版数据改为远程拉取

1. 在 `services/` 中新增 `templateApi.ts`（或类似），提供 `fetchTemplates(): Promise<Template[]>`。
2. 在 `features/templates/data/` 中增加从该 service 拉取并缓存的逻辑，或提供 `useTemplates()` hook 内部请求。
3. `getTemplates()` 或 `useTemplates()` 的返回仍为 `Template[]`，列表与叠加层组件无需改类型，仅数据来源变化。

### 6.4 接入真实相机预览与拍摄

1. 在 `features/camera/components/` 中新增 `CameraPreview.tsx`，内部使用 `expo-camera` 的 `CameraView` 等，通过 `useCamera()` 读取 mode、flash、aspectRatio 等并传给原生组件。
2. 拍照/录像回调中调用 `services/media` 的 `savePhoto`/`saveVideo`。
3. 相机页用 `CameraPreview` 替换当前占位「取景区域」，并在其上层叠加 `TemplateOverlay`（若为模版模式）。

---

## 七、总结

- **易维护**：按领域划分 features，类型与服务集中，职责清晰。
- **易扩展**：新功能新 feature，新控件新组件 + 现有 Context；模版与相机能力均预留扩展点。
- **易阅读**：目录即文档，从 `app/` 到 `features/` 到 `types/`、`services/` 依赖单向，新人可沿数据流快速理解。

架构与 PRD 对齐，后续实现相机预览、模版列表 UI、权限与存储时，只需在现有骨架内填充实现，无需推翻重做。
