## ADDED Requirements

### Requirement: 模版页以 Stack 屏呈现且带顶部返回

模版选择（templates 路由）SHALL 以 Stack 推入方式呈现（从相机点击模版后滑动进入）；界面 SHALL 在顶部提供返回按钮，用户点击后 SHALL 关闭当前界面并回到相机页。

#### Scenario: 用户从相机页打开模版

- **WHEN** 用户在相机页点击底部栏的模版入口
- **THEN** 以 Stack 推入方式进入模版页（无 Tab 栏）

#### Scenario: 用户在模版页点击返回

- **WHEN** 用户在模版页点击顶部返回按钮
- **THEN** 界面关闭，回到相机取景页

---

### Requirement: 选择模版后写回并返回（可选延续）

若模版页支持选择模版，用户选择后 SHALL 将选中模版写回 TemplateContext（setSelectedTemplate），并可关闭界面返回相机；本 change 不强制修改模版列表 UI，仅要求顶部返回可用。
