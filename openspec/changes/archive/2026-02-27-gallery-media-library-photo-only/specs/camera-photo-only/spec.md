## ADDED Requirements

### Requirement: 相机仅支持拍照

相机 SHALL 仅支持拍照；SHALL 不提供录像功能；SHALL 不展示拍照/录像模式切换控件；默认行为为拍照。

#### Scenario: 用户按下快门

- **WHEN** 用户在相机页按下拍摄按钮
- **THEN** 执行拍照（含倒计时若已设置），不执行录像

#### Scenario: 相机页无模式切换

- **WHEN** 用户进入相机页
- **THEN** 界面不显示拍照/录像切换按钮，仅显示单一拍照快门
