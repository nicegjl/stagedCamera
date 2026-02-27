# 继续优化媒体库查看大图体验 - 任务

## 1. 缩小后平滑恢复至 1（不来回弹）

- [x] 1.1 在 DetailPage Pinch onEnd 中，当 scale \< 1 时，改用 withTiming(1, { duration: 250 }) 或无过冲的 withSpring 配置，使 scale 平滑回到 1，去掉明显 overshoot。
- [x] 1.2 同步更新 savedScale.value = 1 及 onScaleChange(1)。

## 2. 双指放大结束缓动

- [x] 2.1 在 DetailPage Pinch onEnd 中，当 scale \> 1 时，不直接定格，而是用 withSpring(currentScale, SPRING_CONFIG) 或 withTiming + Easing.out 从当前 scale 缓动到手势结束值，再写回 savedScale。
- [x] 2.2 确保 onScaleChange 在动画结束时或关键帧与 UI 一致（如需可在 withSpring 的 callback 或 runOnJS 中通知）。

## 3. 放大后平移缓动

- [x] 3.1 检查并调整 Pan onEnd 的 withSpring 参数，使快速滑动后平移收敛自然、无卡顿感；必要时根据 velocity 选用 withDecay 再 clamp 或保持 withSpring 统一收尾。

## 4. 边缘「拉一段回弹」后再可切图

- [x] 4.1 在 DetailPage Pan 中检测「已到左/右平移边界」：当 translateX 抵 min 或 max 时，允许继续同向拖动一小段（橡胶带），onEnd 时 withSpring 回弹回边界内。
- [x] 4.2 若本次 Pan 发生了「从边缘拉出并回弹」，通过 onEdgeBouncedLeft / onEdgeBouncedRight（或统一 onEdgeBounced(direction)）回调通知 GalleryDetailView。
- [x] 4.3 GalleryDetailView 维护 edgeUnlockedLeft / edgeUnlockedRight（或 canSwipeToChangePage）；在收到某侧 edgeBounced 后置该侧为 true；下一次同向水平滑动时允许切页（scrollEnabled 临时 true 或 scrollToOffset 一页），切页后或 scale 回 1 时重置。
- [x] 4.4 保证「仅当前页」的 scale 与 edge 状态参与判断，切页或回到列表后状态清空。

## 5. 大图边缘仅在切换时可见

- [x] 5.1 定义 PAGE_GAP（如 12~16），FlatList 每项宽度 = SCREEN_WIDTH + PAGE_GAP；getItemLayout 的 length/offset 按此计算；pagingEnabled 与 onMomentumScrollEnd 的 index 按 (SCREEN_WIDTH + PAGE_GAP) 计算。
- [x] 5.2 每项内容：外层 View 宽 SCREEN_WIDTH + PAGE_GAP，内层大图容器宽 SCREEN_WIDTH 水平居中，使静止时大图全屏，滑动时露出左右间隙。
- [x] 5.3 移除原先在 page 上的 paddingHorizontal，避免默认出现黑边。

## 6. 收尾

- [x] 6.1 运行 lint；真机/模拟器验证：缩小平滑回 1、放大/平移缓动、边缘回弹后再滑切图、默认全屏且仅切换时见边缘。

## 7. 边缘回弹不来回弹

- [x] 7.1 在 DetailPage Pan onEnd 中，当 didOverdragLeft 或 didOverdragRight 为 true 时，translateX/Y 回到边界用 withTiming(target, { duration: 220 }) 替代 withSpring，避免 overshoot。

## 8. 快速滑动 withDecay 缓动距离

- [x] 8.1 在 Pan onEnd 中获取 velocityX/velocityY；当 scale > 1 且未发生边缘 overdrag 时，对 translateX/Y 使用 withDecay({ velocity }) 惯性衰减，在结束回调中 clamp 到合法范围并用 withTiming 收尾（可选）。

## 9. 切换图后原图 scale 恢复至 1

- [x] 9.1 GalleryDetailView 中新增 activeIndexRef = useSharedValue(initialIndex)，在 onMomentumScrollEnd 时同步 activeIndexRef.value = currentIndex。
- [x] 9.2 将 activeIndexRef 与每页的 index 传入 DetailPage；DetailPage 内 useAnimatedReaction 监听 activeIndexRef，当 activeIndexRef.value !== pageIndex 且 scale > 1 或位移非零时，withTiming 将 scale/savedScale 恢复 1、translate 恢复 0，并 runOnJS(onScaleChange)(1)。

## 10. 收尾

- [x] 10.1 运行 lint；验证边缘回弹无过冲、快速滑动惯性、切图后 scale 恢复。

## 11. Bug1：离页立即重置（A）+ 回页兜底（C）

- [x] 11.1 在 useAnimatedReaction 中，当 activeIndex !== pageIndex 且需重置时，改为立即赋值 scale=1、savedScale=1、translateX/Y=0，并 runOnJS(onScaleChange)(1)，去掉 withTiming 200ms。
- [x] 11.2 当 activeIndex === pageIndex 且 scale > 1 或 translate 非零时，执行一次兜底重置（立即赋值），清除残留状态。

## 12. Bug2：Pan 增加 activeOffsetX

- [x] 12.1 在 DetailPage 的 Pan 上增加 .activeOffsetX([-15, 15])，与 activeOffsetY 并存。

## 13. 收尾

- [x] 13.1 运行 lint；验证快速滑走再滑回 scale 正确、左右滑跟手。

## 14. 滑动与 scale 绑定：Pan 仅放大时启用

- [x] 14.1 在 DetailPage 中用 useDerivedValue 得到 isPanEnabled = (scale.value > 1)，Pan 上调用 .enabled(isPanEnabled)，使 scale=1 时 Pan 不参与、左右滑由 FlatList 切图。

## 15. 收尾

- [x] 15.1 运行 lint；验证未放大时左右滑稳定切图、放大后 Pan 移图正常。

## 16. 修复点开大图闪退

- [x] 16.1 将 Pan.enabled 改为布尔：父组件传 isActivePage、isZoomed 给 DetailPage，Pan 使用 .enabled(isActivePage && isZoomed)，移除 useDerivedValue 的 SharedValue 传入。

## 17. 收尾

- [x] 17.1 运行 lint；验证点开大图不再闪退。
