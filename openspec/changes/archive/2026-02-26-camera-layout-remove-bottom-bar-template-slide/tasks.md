## 1. 移除 Tab 栏并改为 Stack

- [x] 1.1 将 app/(tabs)/_layout.tsx 从 Tabs 改为 Stack；默认屏为 index（相机），第二屏为 templates；screenOptions 中不渲染 tabBar（即不再使用 Tabs 组件）

## 2. 模版页顶部返回

- [x] 2.1 在 (tabs)/_layout 的 Stack 中为 templates 屏设置 headerShown: true、title 为「模版」（或等效），使模版页显示顶部栏与返回按钮，返回即回到相机

## 3. 收尾

- [x] 3.1 确认相机页与 CameraBottomBar 无需改动（模版入口已指向 /(tabs)/templates）；运行 lint
