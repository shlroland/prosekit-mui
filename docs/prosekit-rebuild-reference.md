---
title: Prosekit 重构参考
nav:
  title: Prosekit 重构参考
  order: 20
---

# Prosekit 重构参考

这份文档用于整理当前项目已经实现过的基础富文本编辑器能力，以及现有封装对外暴露的生命周期/回调接口，方便后续按更符合 Prosekit 范式的方式重新设计和实现。

## 目标

- 明确当前项目已经覆盖过哪些基础编辑器功能
- 明确哪些是生命周期钩子，哪些只是能力型回调
- 把现有封装拆解成更适合 Prosekit 的实现维度

## 当前已实现的基础富文本编辑器功能

### 1. 编辑器实例与内容控制

- 创建编辑器实例
- 只读/可编辑切换
- 设置内容 `setContent`
- 获取 HTML `getHTML` / `getContent`
- 获取 JSON `getJSON`
- 获取纯文本 `getText`
- 聚焦 `focus`
- 失焦 `blur`
- 查询编辑器是否可编辑 `isEditable`
- 查询编辑器是否聚焦 `isFocused`
- 查询节点/标记是否激活 `isActive`

### 2. 基础文本格式

- 加粗
- 斜体
- 下划线
- 删除线

### 3. 扩展文本格式

- 高亮
- 上标
- 下标
- 字号
- 文字颜色
- 背景色

### 4. 基础块级结构

- 段落
- 标题 `H1`
- 标题 `H2`
- 标题 `H3`
- 引用块
- 无序列表
- 有序列表
- 分割线
- 代码块

### 5. 对齐能力

- 左对齐
- 居中对齐
- 右对齐
- 两端对齐

### 6. 链接能力

- 插入链接
- 链接地址校验

### 7. 图片能力

- 工具栏插入图片
- 通过 URL 插入图片
- 上传图片后插入
- 粘贴图片上传
- 拖拽图片上传
- 点击图片预览

### 8. 附件能力

- 上传附件
- 插入附件卡片

### 9. 音视频能力

- 插入音频 URL
- 插入视频 URL

### 10. 表格能力

- 插入表格
- 在上方插入行
- 在下方插入行
- 在左侧插入列
- 在右侧插入列
- 删除行
- 删除列
- 删除表格
- 合并单元格
- 拆分单元格
- 表格列宽拖拽
- 表格选区高亮
- 表格操作菜单
- 单元格操作菜单
- 行列轴操作手柄

### 11. 编辑器交互 UI

- Toolbar
- Bubble Menu
- Drag Handle

### 12. 块级快捷操作

- 在当前块上方插入段落
- 在当前块下方插入段落
- 复制块
- 剪切块
- 复制并插入块
- 删除块

### 13. 快捷输入能力

- Mention
- Slash Commands
- Emoji

其中具体交互包括：

- `@` 候选列表与插入
- `/` 命令面板、筛选与插入
- `:` emoji 面板、筛选与插入

### 14. 编辑器辅助能力

- Placeholder
- `Cmd/Ctrl + S` 保存回调
- TOC 提取
- URL 校验回调
- 上传错误回调

### 15. Diff 能力

- `EditorDiff`
- 两份 HTML 的块级结构 diff

## 当前对外暴露的生命周期钩子

下面这些才算当前封装里真正意义上的生命周期钩子。

### `onCreate(editor)`

- 时机：编辑器实例创建完成后触发一次
- 用途：拿到 editor 实例，做初始化绑定

### `onUpdate(editor)`

- 时机：编辑器文档更新时触发
- 用途：响应内容变更

### `onChange(editor)`

- 时机：也是文档更新时触发
- 现状：和 `onUpdate` 当前没有实际语义差异，二者在同一更新链路中一起调用

### `onDestroy(editor)`

- 时机：编辑器销毁时触发
- 用途：资源清理、解绑外部状态

## 当前存在但不属于生命周期的回调

这些是能力型回调，不建议和 lifecycle 混在一起理解。

### `onSave(editor)`

- 时机：按下 `Cmd/Ctrl + S`
- 性质：快捷键回调

### `onTocUpdate(toc)`

- 时机：初始化后执行一次，后续内容更新也会执行
- 性质：派生状态回调

### `onError(error)`

- 时机：内部更新、设值、上传等链路出现异常时触发
- 性质：错误处理回调

### `onUpload(file, onProgress, abortSignal)`

- 时机：图片/附件上传时触发
- 性质：外部能力注入

### `onValidateUrl(url, type)`

- 时机：插入图片、链接、音频、视频时触发
- 性质：外部能力注入

### `onMentionFilter({ query })`

- 时机：mention 候选检索时触发
- 性质：数据源回调

### `onLinkPrompt()`

- 时机：插入链接时触发
- 性质：UI 输入来源回调

### `onTip(type, tip)`

- 时机：部分 UI 操作失败时触发提示
- 性质：反馈回调

## 当前封装的主要问题

如果后续要按 Prosekit 的开发范式重构，当前封装里主要有这几个问题：

- UI 和编辑器能力耦合过重
- toolbar、overlay、menu 直接绑定在统一封装内部
- `onUpdate` 和 `onChange` 语义重复
- 行为和展示没有拆成 headless 能力层与 UI 层
- 一些能力通过大一统 props 注入，不利于 extension 组合

## 建议按 Prosekit 范式拆分的实现层次

建议后续实现时把能力拆成三层。

### 1. 核心 extension 层

负责 schema、plugin、command、input rule、paste/drop handler。

建议按功能拆分：

- basic marks
- heading / list / blockquote / hr
- code block
- link
- image
- attachment
- media
- table
- mention
- slash
- emoji
- placeholder

### 2. 命令与状态层

负责暴露稳定的能力接口，而不是直接把 UI 写死。

建议抽出：

- commands
- canExec
- isActive
- selection state
- table state
- mention state
- slash state
- emoji state
- toc state

### 3. UI 层

完全独立于 extension 设计，按需组合。

建议拆分成：

- editor content view
- toolbar
- bubble menu
- drag handle
- table overlay
- mention menu
- slash menu
- emoji menu
- image viewer

## 建议保留的最小外部 API

如果要重新设计封装，建议先把 API 收敛到最小集。

### 生命周期

- `onCreate`
- `onDestroy`
- `onUpdate`

### 派生状态

- `onTocChange`
- `onSelectionChange`

### 外部能力注入

- `upload`
- `validateUrl`
- `mentionSource`

### 实例方法

- `setContent`
- `getHTML`
- `getJSON`
- `getText`
- `focus`
- `blur`

## 建议的实现顺序

如果你准备自己重做一版，可以按这个顺序推进：

1. 先做最小 editor 实例创建和内容读写
2. 接入基础 marks 和 blocks
3. 接入 commands / canExec / isActive 查询层
4. 再做 toolbar，但 toolbar 只消费 commands 和状态，不直接耦合编辑器内部实现
5. 接入 link / image / attachment / media
6. 接入 table 与 table overlays
7. 接入 mention / slash / emoji
8. 最后补 bubble menu、drag handle、image viewer、diff 等增强能力

## 建议你实现时优先核对的内容

- 哪些能力应该是 extension
- 哪些能力应该是 plugin state
- 哪些能力只是 UI
- 哪些 props 应该改成能力注入接口
- 哪些回调应该合并或删除

## 结论

如果目标是“更符合 Prosekit 范式”，那就不应该继续沿用当前这种把 editor、toolbar、bubble、overlay、upload、prompt 都塞进单层封装的方式。

更合理的方向是：

- 核心能力 headless 化
- UI 组件可插拔
- 生命周期最小化
- 回调只保留真正稳定且必要的边界
