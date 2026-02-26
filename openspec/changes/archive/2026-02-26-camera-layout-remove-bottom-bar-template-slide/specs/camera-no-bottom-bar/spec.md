## ADDED Requirements

### Requirement: 不展示 Tab 底部栏

在 (tabs) 分组内，应用 SHALL 不展示 Tab 底部栏（即不显示「相机」「模版」等 Tab 图标栏）；导航 SHALL 以 Stack 方式从相机推入模版页，而非 Tab 切换。

#### Scenario: 用户进入相机页

- **WHEN** 用户进入 (tabs) 的 index（相机页）
- **THEN** 界面底部无 Tab 栏；相机页保持 CameraTopBar、取景、CameraBottomBar（相册、快门、模版）

---

### Requirement: 相机底部栏与快门保持现状

相机页 SHALL 继续展示 CameraBottomBar，包含相册入口、中央拍摄按钮与拍照/录像切换、模版入口；快门 SHALL 居中放置，行为与现有一致。

#### Scenario: 用户在相机页拍照/切换模版

- **WHEN** 用户在相机页使用底部栏的快门或模版入口
- **THEN** 行为与改动前一致（拍照/录像、进入模版列表）
