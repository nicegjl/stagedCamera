# 继续优化媒体库查看大图体验 - 设计

## Context

- GalleryDetailView 使用横向 FlatList、pagingEnabled；DetailPage 内为 Pinch + Pan（Simultaneous）。当前：放大后通过 scrollEnabled={!isZoomed} 禁止切图；缩小 \<1 时 withSpring 回弹到 1；每页有 paddingHorizontal 导致始终有左右留白。
- 目标：缩小回弹无过冲、放大/平移结束有缓动、边缘「拉一下回弹」后再允许切图、边缘仅在切换时可见。

## Goals / Non-Goals

**Goals:**

- 缩小 \<1 松手：平滑恢复至 1，无来回弹（withTiming 或无过冲 spring）。
- 放大松手：缓动到最终 scale，不戛然而止。
- 放大后 Pan 松手：平移用缓动收尾，快速滑动也顺滑。
- 放大后：先到边缘并触发「拉一段再回弹」，之后再次同向水平滑才切图。
- 默认大图全屏；左右边缘仅在左右切换图的过程中可见。

**Non-Goals:**

- 不改变操作菜单、删除/保存、列表入口等逻辑。

## Decisions

### 1. 缩小后恢复至 1（不来回弹）

- Pinch onEnd：若 scale \< 1，使用 `withTiming(1, { duration: 200~300 })` 或 `withSpring(1, { damping: 1, stiffness: 高 })` 等无过冲配置，使 scale 平滑回到 1，不出现 overshoot 回弹。

### 2. 双指放大结束缓动

- Pinch onEnd：若 scale \> 1，不直接 `savedScale.value = scale.value` 结束，而是用 `withSpring(scale.value, { damping: 20~25, stiffness: 200 })`（或 withTiming + Easing.out）将 scale 从当前值缓动到手势结束时的值，避免戛然而止。

### 3. 放大后平移缓动

- Pan onEnd：保持用 `withSpring` 将 translateX/Y 收敛到合法范围内；可适当调 spring 参数（如 damping/stiffness）或保证快速滑动时 velocity 通过 withSpring 自然衰减，避免卡顿感。

### 4. 边缘「拉一段回弹」后再可切图

- 状态：父组件维护 `isZoomed` 与「边缘已回弹解锁」状态（如 `edgeUnlockedLeft` / `edgeUnlockedRight` 或统一 `canSwipeToChangePage`）。
- 行为：
  - 放大时 FlatList 仍 `scrollEnabled={false}`，Pan 独占水平滑动。
  - 在 DetailPage Pan 中：当 translateX 已抵边界（左边界或右边界）时，若用户继续同向拖动，则：
    - 本次 Pan：允许 translateX 超出边界一小段（橡胶带效果），onEnd 时用 withSpring 回弹回边界内。
    - 若本次发生了「从边缘拉出并回弹」，则通过回调（如 onEdgeBouncedLeft / onEdgeBouncedRight）通知父组件。
  - 父组件在收到某侧 edgeBounced 后，将该侧「允许切图」置为 true；下一次同向水平滑动时不再拦截，改为允许 FlatList 滚动一页（或通过 scrollToOffset 切页）。切页完成后或 scale 回到 1 时，重置「允许切图」状态。
- 简化实现可选：仅在「当前在左/右边界且 Pan 同向再滑」时做橡胶带 + 回弹，回弹结束后设 flag，父组件在下一帧或下一手势时临时允许 scrollEnabled 或执行一次 scrollToOffset。

### 5. 边缘仅在切换时可见

- 不采用「每页固定 padding 导致始终有黑边」；改为「页与页之间」有间隙：
  - 每项总宽度 = `SCREEN_WIDTH + PAGE_GAP`（如 12~16），getItemLayout 的 length/offset 按此计算，pagingEnabled 按一页 = SCREEN_WIDTH + PAGE_GAP 对齐。
  - 每项内部：外层 View 宽 SCREEN_WIDTH + PAGE_GAP，内层图片容器宽 SCREEN_WIDTH 且水平居中（左右各 PAGE_GAP/2 透明区域）。静止时屏幕正好对准一张图，全屏；滑动过程中才露出左右间隙。
- 这样默认大图全屏，左右边缘只在左右切换图时可见。

## Risks / Trade-offs

- 边缘回弹 + 解锁切图涉及 Pan 与 FlatList 的协调（边界检测、回调、scrollToOffset 时机），实现时需注意手势冲突与状态重置（如 scale 回 1 或切页后清空 edgeUnlocked）。
- 留白改为「项间间隙」后，getItemLayout、initialScrollIndex、onMomentumScrollEnd 的 index 计算需统一按 (SCREEN_WIDTH + PAGE_GAP) 处理。

### 6. 边缘回弹不来回弹

- Pan onEnd 中，当本次发生了边缘 overdrag（didOverdragLeft 或 didOverdragRight）时，translateX/Y 回到边界目标值改用 `withTiming(target, { duration: 200~250 })`，不用 withSpring，避免 overshoot 来回弹。

### 7. 快速滑动调大缓动距离（withDecay）

- Pan onEnd 中，当 scale > 1 且**未**发生边缘 overdrag 时：使用 `withDecay({ velocity: velocityX })`（及 velocityY）让 translateX/Y 按松手时的速度惯性衰减；在 decay 结束的回调中将位移 clamp 到合法范围 [-maxTx, maxTx]、[-maxTy, maxTy]，再视需要 withTiming 收尾到精确边界，使快速滑动有更长缓动距离。

### 8. 放大后切换图，原图 scale 恢复至 1

- 父组件维护 shared value `activeIndexRef`，在 onMomentumScrollEnd（或 currentIndex 变化处）同步 `activeIndexRef.value = currentIndex`。
- 每个 DetailPage 接收 `activeIndexRef` 与自身 `pageIndex`；在 useAnimatedReaction 中监听 `activeIndexRef.value`，当 `activeIndexRef.value !== pageIndex` 且当前 scale > 1 或 translate 非零时，执行重置：scale/savedScale 用 withTiming 回到 1，translateX/Y 回到 0，并 runOnJS(onScaleChange)(1)。

### 9. Bug1 修复：离页立即重置（A）+ 回页兜底重置（C）

- **A**：在 useAnimatedReaction 中，当 `activeIndex !== pageIndex` 且需重置时，不再使用 withTiming(1, { duration: 200 })，改为**立即**赋值：`scale.value = 1`、`savedScale.value = 1`、`translateX.value = 0`、`translateY.value = 0`，并 runOnJS(onScaleChange)(1)。避免用户快速滑回时 200ms 未跑完导致条件不再满足、重置被跳过。
- **C**：当 `activeIndex === pageIndex`（本页再次成为当前页）且 `scale.value > 1` 或 translate 非零时，执行一次兜底重置（同样立即赋值），清除可能残留的放大/位移状态。

### 10. Bug2 修复：Pan 水平方向也可激活

- 在 Pan 上增加 `.activeOffsetX([-15, 15])`，与现有 `activeOffsetY([-20, 20])` 并存；RNGH 下任一方向超出阈值即可激活 Pan，放大后快速左右滑也能跟手移动大图。

### 11. 滑动与 scale 绑定：Pan 仅放大时启用

- **问题**：未放大（scale=1）时左右滑被 Pan 在 15px 后激活并抢走，FlatList 不滚动，表现“卡住、偶尔能切图”。
- **原则**：水平滑动归属与放大状态绑定——未放大时由 FlatList 切图，放大时由 Pan 移图。
- **实现**：父组件向 DetailPage 传入 `isActivePage={currentIndex === index}`、`isZoomed={isZoomed}`，Pan 使用 `.enabled(isActivePage && isZoomed)`（布尔），使 scale=1 时 Pan 不参与、左右滑由 FlatList 切图；scale>1 时 Pan 启用，保留现有 activeOffsetX/Y 与边缘逻辑。避免使用 SharedValue 传入 `.enabled()` 以兼容原生实现。

### 12. 修复点开大图闪退

- **原因**：`.enabled(useDerivedValue(() => scale.value > 1))` 向 RNGH 传入 SharedValue，部分版本/原生仅支持 boolean，易导致崩溃。
- **实现**：不再向 `.enabled()` 传 SharedValue；使用父组件的 `currentIndex` 与 `isZoomed` 计算布尔 `isActivePage && isZoomed` 传入 `.enabled()`。

## Open Questions

- 无；上述 12 点按与用户确认后的细节实现。
