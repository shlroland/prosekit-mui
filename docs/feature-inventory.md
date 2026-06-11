# ProseKit MUI 功能盘点

本文档用于规划 `prosekit-mui` 对 `tiptap-v3` 的视觉和功能体验复刻。目标不是复刻 Tiptap API 或代码模式，而是用 ProseKit 的 extension、command、plugin state、React node/mark view 和 MUI 组件分层重新实现。

## 已确认边界

- 复刻目标：视觉和功能体验。
- 实现模式：遵循 ProseKit，不保留 Tiptap 链式 API 设计。
- Markdown：不迁移 `EditorMarkdown` 和 `@tiptap/markdown`。Markdown 由外部 remark 转 HTML，再交给 ProseKit 解析渲染。
- Link：不用 ProseKit 内置 mark link，采用自定义 node link。
- Link 类型：同时实现 `inlineLink` 和 `blockLink`。
- Link attrs：沿用上游字段并收紧类型。`inlineLink` 只允许 `text | icon`，`blockLink` 固定 `block`。
- ProseKit 版本：已升级到 `prosekit@0.21.4`。优先使用 ProseKit 提供的 `highlight`、`superscript`、`subscript`、`text-align`、`text-color`、`background-color`、`font-family` 能力；`font-size` 尚未由 ProseKit 提供，后续如需要再单独确认自定义实现。Emoji 走 ProseKit autocomplete primitive，不保留当前重复实现。
- 只读/静态渲染：不在本项目实现；另一个项目负责静态渲染机制。本项目聚焦编辑态。
- 暂不实现：Flow/Mermaid、Excalidraw。
- 后续每个功能实现前都需要单独核对方案。

## 分层原则

| 层 | 负责内容 | 不负责内容 |
| --- | --- | --- |
| Extension 层 | schema、commands、keymap、input/paste/drop rules、plugin state、node/mark view 注册 | MUI 布局细节 |
| State/Adapter 层 | active/canExec/selectors、外部能力注入、上传/校验/派生状态 | 具体菜单样式 |
| UI 层 | Toolbar、Bubble menu、Drag handle、弹层、表格 overlay、viewer | 直接改 schema 或绕过 commands |

## 功能矩阵

| 功能 | 上游入口 | 当前仓库状态 | ProseKit 内置 | 推荐策略 | 优先级 | 待确认 |
| --- | --- | --- | --- | --- | --- | --- |
| 编辑器创建/Provider | `useTiptap`, `Editor` | 有 `ProseKitProvider`, `EditorContent`, `EditorShell` | `createEditor`, React provider | 保留 ProseKit 原生 editor，补稳定 hook/组合组件 | P0 | hook 名称和外部 API |
| 内容读写 | `setContent`, `getHTML`, `getJSON`, `getText` | 只有 create/provider 基础能力 | 部分由 editor/view/schema 支撑 | 做 thin adapter，不做 Tiptap 链式 API | P0 | 是否需要 HTML 序列化 helper |
| 只读/可编辑 | `editable` | 不进入本项目范围 | ProseKit 有 readonly 能力但不使用 | 本项目只做编辑态；静态渲染由另一个项目实现 | Out | 无 |
| 基础 schema | StarterKit | `defineBasicExtension` 已有 | doc/text/paragraph/heading/list/blockquote/hr/hardBreak/codeBlock/table 等 | 以 ProseKit 内置为主 | P0 | 标题 level 范围 |
| History | undo/redo | 已有 `defineHistory` | 有 | 直接用 ProseKit | P0 | 无 |
| Gap/drop cursor | StarterKit/dropcursor | gap 有，drop demo 有 | 有 | 内置 + 主题色配置 | P0 | 无 |
| Toolbar 基础容器 | `EditorToolbar` | `src` 有 primitives，demo 有 minimal toolbar | 无 | 自己实现 MUI toolbar，对齐上游视觉 | P0 | simple/advanced 是否首期做 |
| Toolbar 插入菜单 | `EditorInsert` | demo 仅少量插入 | 无 | 自己实现，命令全部走 ProseKit commands | P0 | 插入项分期 |
| Heading 菜单 | `EditorHeading` | demo 有 H1-H3 | heading 内置 | UI 自己做，命令用内置 | P0 | 是否支持 H1-H6 |
| 粗体/斜体/删除线/下划线 | toolbar + bubble | 已有 | 内置 | 直接用 ProseKit marks + MUI UI | P0 | 无 |
| 行内代码 | `CodeExtension` | basic 有 code | 内置 | 直接用 ProseKit code mark，样式对齐上游 | P0 | 无 |
| 代码块 | `CodeBlockLowlightExtension` | basic 有 codeBlock，无 lowlight UI | codeBlock 内置 | 首期用内置 codeBlock；高亮渲染单独确认 | P1 | 是否需要 lowlight 语言高亮 |
| 清除格式 | toolbar | demo 有手写清除 | 部分内置 | 做统一 command wrapper，避免 UI 堆条件 | P0 | 清除是否包含 block/list/link |
| 高亮 | `@tiptap/extension-highlight` | 已有自定义 mark/input/paste/keymap，应替换 | ProseKit 有 `highlight` | 用 ProseKit 内置 `defineHighlight`，UI 自己做 | P0 | 是否需要补项目级 paste/multicolor adapter |
| 文本颜色 | `TextStyleKit` | 已有自定义 textStyle color，应替换 | ProseKit 有 `textColor` mark | 用 ProseKit 内置 `defineTextColor`，UI 自己做 | P1 | 是否需要项目命令别名 |
| 背景色 | `TextStyleKit` + highlight | 已有自定义 textStyle backgroundColor，应替换 | ProseKit 有 `backgroundColor` mark | 用 ProseKit 内置 `defineBackgroundColor`，与 highlight 分清语义 | P1 | 是否需要项目命令别名 |
| 字号 | `TextStyleKit` | 旧实现已删除 | 暂无内置 font-size extension | 后续单独确认是否自定义 mark/attrs + MUI selector | P1 | 是否要恢复为项目自定义能力 |
| 字体/行高 | `TextStyleKit` | 已有命令，UI 未完整 | ProseKit 有 `fontFamily`，无 `lineHeight` | 字体用 ProseKit 内置；行高如需要再自定义 | P2 | 是否真的需要行高 |
| 垂直对齐 | `VerticalAlign` | 已有 textStyle verticalAlign | 无专用内置 | 自定义 mark attr | P2 | 用于哪些节点/文本 |
| 上标/下标 | custom nodes/marks | 已有自定义 mark，应替换 | ProseKit 有 `superscript` / `subscript` | 用 ProseKit 内置 `defineSuperscript` / `defineSubscript` | P1 | 是否需要互斥 wrapper |
| Text align | `TextAlign` | 已有自定义，应替换 | ProseKit 有 `text-align` | 用 ProseKit 内置 `defineTextAlign`，若无法匹配 schema 再包装 | P0 | 覆盖 paragraph/heading 还是更多节点 |
| List | `ListKit` | basic 用 ProseKit flat list，demo 有菜单 | ProseKit list 支持 bullet/ordered/task/toggle | 直接用 ProseKit list | P0 | 是否把 toggle list 用作 details |
| Blockquote | insert/toolbar/slash | 已有内置 | 有 | 直接用 | P0 | 无 |
| Horizontal rule | custom HR | 已有内置 | 有 | 直接用，样式对齐上游 | P0 | 无 |
| Link inline/block | `InlineLinkExtension`, `BlockLinkExtension` | 已有自定义 node link，需校准 | 内置 link 是 mark，不用 | 自定义 `inlineLink` + `blockLink` | P0 | 已确认数据模型 |
| Link UI | node view + popover | 已有初版 | 无 | 对齐上游插入、编辑、复制、取消、类型切换 | P0 | 是否保留 favicon |
| Link autolink/paste | helpers | 当前有 paste/click 逻辑 | ProseKit 内置 mark link 不用 | 自定义 input/paste/enter/click handlers | P1 | 是否自动链接默认开启 |
| Image node | `ImageExtension` | basic 用 ProseKit image，无完整 node view | ProseKit image + upload handler | 用内置 image spec/commands，补自定义 node view 和上传 UI | P1 | 是否需要裁剪 |
| 图片 URL 上传 | `onUploadImgUrl` | 未完整 | 无 | 自定义能力注入 | P1 | 是否保留后端接管 URL |
| 粘贴/拖拽图片上传 | `FileHandler` + upload progress | 未完整 | ProseKit image upload/file handlers | 优先用 ProseKit handlers，UI 自定义 | P1 | upload progress 形态 |
| Image viewer | `ImageViewerProvider` | 未实现 | 无 | 纯 UI 自己实现 | P2 | 首期是否做 |
| 附件 inline/block | `InlineAttachment`, `BlockAttachment` | 未实现 | ProseKit file 是 handler，不是附件卡片 | 自定义 attachment nodes + upload adapter | P2 | 是否首期进入 |
| 音频 | `AudioExtension` | 未实现 | 无 | 自定义 media node/view | P2 | 是否需要上传还是 URL |
| 视频 | `VideoExtension` | 未实现 | 无 | 自定义 media node/view | P2 | 支持本地上传/URL |
| YouTube | `YoutubeExtension` | 未实现 | 无 | 可并入 video/iframe 或单独 node | P3 | 是否需要 |
| Iframe/Bilibili | `IframeExtension` | 未实现 | 无 | 自定义 iframe node + URL 校验 | P2 | 白名单策略 |
| Table schema/commands | `TableExtension` | basic 用 ProseKit table | ProseKit table commands 完整 | 直接用 ProseKit table | P0 | 表格 attrs 是否够用 |
| Table size picker | toolbar insert | 未完整 | 无 | 自己实现 MUI picker，命令用 `insertTable` | P0 | 默认 3x4 还是上游逻辑 |
| Table overlay/handles | TableHandle, ExtendButton, SelectionOverlay, CellMenu | 未实现 | table commands 有，UI 没有 | 自己实现 overlay/handles/cell menu | P1 | 首期 overlay 范围 |
| 表格拖拽/移动行列 | TableHandler plugin | 未实现 | ProseKit exposes move row/column commands | 优先用内置 commands，必要时补 plugin UI | P2 | 是否需要行列拖拽 |
| Mention | `MentionExtension` + list | 未实现；只有 emoji autocomplete | ProseKit mention spec/command + autocomplete | 用内置 mention node + 自定义 source/menu | P2 | mention attrs/value 结构 |
| Slash commands | `SlashCommands` | 未实现 | ProseKit autocomplete 示例/primitive | 按 ProseKit slash command 示例实现；本库负责命令 registry 和 MUI menu | P1 | slash 项首期范围 |
| Emoji syntax/menu | `EmojiExtension` | 旧自定义 emoji syntax 已删除 | ProseKit 提供 autocomplete primitive | 用 ProseKit autocomplete 模式；本库负责 trigger、数据源、搜索和 MUI menu/picker | P1 | 是否需要 emoji picker 按钮 |
| Placeholder | `Placeholder` | 未在 core extension 里接入 | ProseKit placeholder | 直接用 ProseKit placeholder，补按节点动态文案 | P0 | 动态文案是否对齐上游 |
| Trailing node | StarterKit trailingNode | 已有自定义 | ProseKit 无同等高层 API | 保留当前自定义 | P0 | 只读时是否禁用 |
| Bubble menu | `CustomBubbleMenu` | `InlineMenu` 初版 | ProseKit React positioner/autocomplete primitives | 自己实现 MUI bubble menu | P0 | bubble 菜单项范围 |
| Drag handle | `CustomDragHandle` | 未实现 | 无 | 自定义 block handle + block commands | P1 | 块操作首期范围 |
| 块操作 | 上方/下方插入、复制、剪切、删除 | 未实现 | 无直接高层 | 自定义 commands/UI | P1 | 是否需要剪贴板 HTML |
| Alert block | `AlertExtension` | 未实现 | 无 | 自定义 block node/view | P2 | variant/type 结构 |
| Details/collapse | `DetailsExtension` | 未实现 | list 支持 toggle，但非同款 | 倾向自定义 details nodes | P2 | 用原生 details 还是自定义结构 |
| FlipGrid | `FlipGridExtension` | 已有 ProseKit 自定义 | 无 | 保留并对齐上游 UI/resize | P1 | 是否支持 resize |
| Mermaid Flow | `FlowExtension` | 不进入当前范围 | 无 | 暂不实现 | Out | 无 |
| Excalidraw | `DrawPanel` | 不进入当前范围 | 无 | 暂不实现 | Out | 无 |
| Math inline/block | `Mathematics` | 未实现 | ProseKit math spec/view hooks | 用 ProseKit math spec + 自定义 MUI edit/view | P2 | KaTeX/渲染器选择 |
| Tooltip mark | `Tooltip` | 已有自定义 mark/view | 无 | 保留，校准上游 popover 样式 | P1 | tooltip 内容编辑交互 |
| Indent | `Indent` | 未实现 | 无通用内置 | 自定义 node attrs/commands | P2 | 是否需要覆盖所有块 |
| AI writing | `AiWritingExtension` | 未实现 | 无 | 后置，自定义 plugin state + decoration | P3 | 是否纳入本项目 |
| TOC | `TableOfContents` | 未实现 | 无 | 自定义 derived state plugin | P2 | 是否只 callback 不渲染 |
| Structured Diff | `EditorDiff` | 未实现 | 无 | 后置，迁移算法但用 ProseKit schema 适配 | P3 | 是否进入首期 |
| Theme provider | `EditorThemeProvider` | 依赖 MUI theme，未完整复刻 | MUI 自带 | 做轻量 theme provider/style tokens | P1 | 是否保留 dark mode |
| 快捷键弹窗 | `EditorMore/NotificationDialog` | 未实现 | 无 | 纯 UI，从 command registry 生成 | P2 | 是否需要 |
| Character count/limit | `CharacterCount` | 未实现 | 无明显内置 | 自定义 plugin 或后置 | P3 | 是否需要 |
| Invisible characters | `InvisibleCharacters` | 未实现 | 无 | 后置，可不做 | P3 | 是否需要 |
| IME composition fix | `ImeComposition` | 未实现 | 无 | 仅在复现问题后实现 | P3 | 是否需要 |

## 推荐 MVP 顺序

### P0：编辑器骨架和基础富文本

1. 统一 ProseKit editor hook/provider/content API。
2. 基础 schema：paragraph、heading、list、blockquote、hr、hard break、code/codeBlock、table、history、cursor。
3. Toolbar：heading、undo/redo、clear、basic marks、list、align、link、insert 基础项。
4. Link：`inlineLink` + `blockLink` node，编辑弹层、复制、取消、类型切换。
5. Bubble menu：bold/italic/underline/strike/code/link。
6. Placeholder、trailing node、基础样式对齐。

### P1：编辑体验补齐

1. Slash commands。
2. Emoji autocomplete/picker。
3. Tooltip mark。
4. ProseKit 内置 highlight/superscript/subscript/text-color/background-color/font-family；font-size 是否自定义后续单独确认。
5. FlipGrid。
6. Image URL/上传、粘贴/拖拽上传。
7. Table overlay 基础版。
8. Drag handle 和块操作基础版。

### P2：内容块扩展

1. Attachment。
2. Audio/video/iframe/Bilibili。
3. Alert/details。
4. Math。
5. TOC。
6. Indent、vertical align、快捷键弹窗。

### P3：高级/重型功能

1. EditorDiff。
2. AI writing。
3. Invisible characters。
4. Character count/limit。
5. IME composition fix。

## 当前仓库需要重点清理的重复实现

- `src/prosekit/extensions/text-align`：ProseKit 已有 text-align，应替换为内置 `defineTextAlign` 或删除项目包装。
- `src/prosekit/extensions/highlight`：ProseKit 已有 highlight，应替换为内置 `defineHighlight`。
- `src/prosekit/extensions/superscript` 和 `src/prosekit/extensions/subscript`：ProseKit 已有对应扩展，应替换为内置 `defineSuperscript` / `defineSubscript`。
- `src/prosekit/extensions/text-style` 的 color/background/fontFamily：ProseKit 已有对应能力，应替换为内置；fontSize、行高、垂直对齐仍需单独确认是否保留自定义。
- `src/prosekit/extensions/emoji-syntax`：应替换为 ProseKit autocomplete primitive 方案。
- `src/prosekit/extensions/link`：方向正确，但需要按已确认 attrs 收紧类型、校准 block/inline 行为和上游视觉。
- `demo/components/minimal-*`：很多是 demo 组合逻辑，后续应逐步沉淀为可复用 UI 组件或 command state adapter。

## 下一个需要确认的功能

建议先确认 Link 的完整实现细节，因为它已是 P0 且当前仓库已有雏形，改动成本最低、能建立后续 feature 的实现模板。

待确认点：

- HTML parse/serialize 是否沿用 `<a type="block">` 表示 `blockLink`。
- `inlineLink` 空 href 时是否保留“添加链接”占位 node。
- autolink/link-on-paste 是否默认开启。
- favicon 是否保留。
- hover action bar 是否用 MUI Tooltip 还是自定义 floating popover。

## 执行级实现清单

下面的清单用于把每个功能拆到可实现粒度。每个功能都按需要列出 Extension、commands/state、node view/mark view、components、styles、tests/demo 和待确认点。后续实现前仍需要逐项确认，不直接照单全做。

## 自定义 Extension 清单

本项目只实现 ProseKit 没有、或 ProseKit 内置语义与上游视觉/功能不匹配的 extension。ProseKit 已内置的扩展不包装、不重命名、不 re-export；在 `defineRichTextExtension()` 中直接组合使用。

### 必须自定义

| Extension | 原因 | 主要内容 | 相关 UI |
| --- | --- | --- | --- |
| `defineRichTextExtension` | 全功能 convenience helper | 组合 ProseKit 内置扩展 + 本库自定义扩展 | 无直接 UI |
| `defineInlineLinkExtension` / `defineBlockLinkExtension` 或统一 `defineLinkExtension` | ProseKit link 是 mark；本项目需要 node link | `inlineLink`、`blockLink` node specs、commands、paste/input/click handlers、node view 注册 | `LinkEditorPopover`、`LinkActionBar`、`LinkContent` |
| `defineTrailingNode` | ProseKit 当前无同等高层 trailing paragraph 策略 | 文末自动补可输入 paragraph | 无 |
| `defineFlipGridExtension` | ProseKit 无分栏布局节点 | grid/column node specs、set/update widths commands、node views | `FlipGridView`、resize controls |
| `defineLineHeightExtension` | ProseKit 无 line-height 扩展；是否需要待确认 | lineHeight mark/attrs、commands | `EditorLineHeight` |
| `defineVerticalAlignExtension` | ProseKit 无上游同款 vertical-align | verticalAlign mark/attrs、commands | `EditorVerticalAlignSelect` |
| `defineTooltipExtension` | ProseKit 无文本提示 mark | tooltip mark、commands、mark view | `TooltipEditPopover` |
| `defineAttachmentExtension` | ProseKit file 是上传 handler，不是附件卡片节点 | inline/block attachment nodes、upload/update commands | `AttachmentInsertPopover`、`AttachmentView` |
| `defineMediaExtension` 或 `defineAudioExtension` / `defineVideoExtension` | ProseKit 无上游同款 audio/video nodes | media node specs、commands、validate/upload adapter | audio/video insert popovers 和 node views |
| `defineIframeExtension` | ProseKit 无 iframe/Bilibili embed node | iframe node spec、URL normalize/validate commands | `IframeInsertPopover`、`IframeView` |
| `defineAlertExtension` | ProseKit 无 alert block | alert node spec、variant commands、node view | `AlertView` |
| `defineDetailsExtension` | ProseKit list 有 toggle，但不是上游 details 结构 | details/summary/content nodes、toggle commands | `DetailsView` |
| `defineTableOfContentsExtension` | ProseKit 无上游 TOC callback 语义 | heading scan plugin、active item state、callback hook | 可选 `TableOfContentsPanel` |
| `defineIndentExtension` | ProseKit 无通用 block indent | block attrs、indent/dedent commands | toolbar/menu item |
| `defineStructuredDiffExtension` | ProseKit 无上游结构化 diff | diff decoration/attrs、readonly diff rendering support | `EditorDiff` |
| `defineAiWritingExtension` | ProseKit 无 AI ghost text 语义 | plugin state、suggestion decoration、accept command | toolbar AI button |
| `defineCharacterCountExtension` | ProseKit 当前无上游同款 character limit API | count/limit plugin state | footer counter |
| `defineInvisibleCharactersExtension` | ProseKit 无上游同款可视化字符 | decoration plugin | toolbar toggle |

### 直接使用 ProseKit 内置

| 能力 | ProseKit 来源 | 本项目做什么 |
| --- | --- | --- |
| doc/text/paragraph/heading | `prosekit/extensions/*` | 只做 toolbar/UI 和样式 |
| bold/italic/underline/strike/code | `prosekit/extensions/*` | 只做 toolbar/bubble 按钮和 active state |
| codeBlock | `prosekit/extensions/code-block` | 首期直接用；如要语法高亮再单独确认 |
| blockquote/horizontalRule/hardBreak | `prosekit/extensions/*` | 只做菜单入口和样式 |
| list | `prosekit/extensions/list` | 用内置 flat list；MUI 做 list select |
| table | `prosekit/extensions/table` | 用内置 schema/commands；UI handles 用 ProseKit React table-handle + MUI |
| image | `prosekit/extensions/image` | 用内置 schema/upload handler；补 MUI node view/insert UI |
| file upload handlers | `prosekit/extensions/file` | 用作 paste/drop/upload 基础设施；附件卡片仍自定义 |
| mention | `prosekit/extensions/mention` | 用内置 mention node/command；补 source/menu |
| autocomplete | `prosekit/extensions/autocomplete` + `prosekit/react/autocomplete` | 用作 slash/emoji/mention 的触发和定位基础 |
| placeholder | `prosekit/extensions/placeholder` | 用内置扩展；补动态文案和样式 |
| drop/gap/virtual selection/mod-click prevention | ProseKit 内置 | 直接组合 |
| text-align | `prosekit/extensions/text-align` | 用内置扩展；MUI 做选择器 |
| highlight | `prosekit/extensions/highlight` | 用内置扩展；如 multicolor 不足再确认 adapter |
| superscript/subscript | `prosekit/extensions/superscript` / `subscript` | 用内置扩展；如互斥不足再确认 adapter |
| textColor/backgroundColor/fontFamily | ProseKit text color/background/font family 扩展 | 用内置扩展；MUI 做 picker/select |
| fontSize/lineHeight | 自定义待确认 | 暂不实现；如确认需要再做项目自定义 mark/attrs |
| emoji autocomplete | ProseKit autocomplete primitive | 用 ProseKit autocomplete；本库只做数据源、搜索、MUI menu/picker |
| slash commands | ProseKit autocomplete 示例/primitive | 按 ProseKit 模式组织 command registry 和 MUI menu，不做重型自定义 extension |
| math | `prosekit/extensions/math` | 用内置 math spec/view hooks；补 renderer 和 MUI 编辑 UI |

## 自定义组件实现来源

组件原则：编辑器相关的定位、选区、autocomplete、block/table handles、popover 根行为优先用 ProseKit React primitives；视觉、表单、按钮、菜单外观优先用 MUI；图标优先用 lucide-react 或既有图标系统。

| 组件/区域 | ProseKit React primitives | MUI 组件 | 本项目自定义职责 |
| --- | --- | --- | --- |
| `RichTextEditor` | `ProseKit` provider、`createEditor` | 无 | 创建 editor，传入显式 `extension`，渲染自由 children |
| `EditorContent` | ProseKit React editor content API | `Box` wrapper 可选 | 内容区域 class、typography hook |
| `EditorShell` | 无 | `Box`、`Stack`、`Divider` | 布局容器，不直接持有 editor 行为 |
| Toolbar | `useEditor`、`useEditorDerivedValue` | `Box`、`Stack`、`Button`、`Tooltip`、`Divider`、`Menu`/`Popover` | command state selector、按钮 active/disabled、快捷键展示 |
| Insert/heading/list/code/select menus | `useEditorDerivedValue` | `Menu`、`MenuItem`、`ListItemIcon`、`Typography`、`Popover`、`Select` | 上游菜单结构、分组、快捷键、命令绑定 |
| Color/font pickers | `useEditorDerivedValue` | `Popover`、`Button`、`TextField`、`Grid`/`Stack` | preset 色板、当前值读取、输入校验 |
| Bubble menu | `prosekit/react/inline-popover` 或 `popover` | `Paper`、`IconButton`、`Divider`、`Tooltip` | 选区条件、菜单项、样式对齐上游 |
| Link node view | ProseKit React node view API + `popover` | `Avatar`、`Box`、`Stack`、`TextField`、`RadioGroup`、`Button`、`Tooltip` | inline/block link 渲染、编辑弹层、复制/取消/类型切换 |
| Slash commands | `AutocompleteRoot`、`AutocompletePositioner`、`AutocompletePopup`、`AutocompleteItem`、`AutocompleteEmpty` | `Paper`、`List`、`ListItemButton`、`Typography` | command registry、过滤、分组、执行 command |
| Emoji menu | ProseKit autocomplete components | `Paper`、`Stack`、`Typography` | emoji search、shortcode 替换、empty state |
| Mention menu | ProseKit autocomplete components | `Paper`、`ListItemButton`、`Avatar` 可选 | async source、loading/error、insert mention |
| Image node view | ProseKit React node view API + `resizable` 可选 | `Box`、`IconButton`、`Popover`、`LinearProgress` | resize/edit/upload state、viewer hook |
| Image insert/upload | ProseKit image upload handler | `Dialog`/`Popover`、`Tabs`、`TextField`、`Button`、`LinearProgress` | URL/upload tabs、validate/upload adapter |
| Table size picker | 无 | `Popover`、`Box` grid、`Typography` | hover grid state、confirm rows/cols |
| Table handles/menus | `TableHandleRoot`、row/column positioners、menu roots/triggers、drop indicator、drag preview | `Paper`、`IconButton`、`MenuItem`、`Divider` | 上游视觉、命令菜单、cell menu 内容 |
| Block drag handle | `BlockHandleRoot`、`BlockHandlePositioner`、`BlockHandlePopup`、`BlockHandleAdd`、`BlockHandleDraggable` | `IconButton`、`Paper`、`MenuItem` | block actions：insert/duplicate/copy/cut/delete |
| Tooltip mark UI | ProseKit mark view API + `popover`/`tooltip` | `TextField`、`Button`、`Tooltip` | tooltip 内容编辑、hover 展示 |
| FlipGrid node view | ProseKit React node view API + `resizable` 可选 | `Box`、`IconButton` | column rendering、resize controls、width normalization |
| Attachment/media/iframe nodes | ProseKit React node view API + `popover` | `Card`、`Stack`、`TextField`、`Button`、`LinearProgress` | attrs 表单、上传/校验、编辑态空占位 |
| Alert/details/math/flow/excalidraw | ProseKit node view API | MUI form/layout/surface 组件 | 对应节点的编辑态视图和弹层 |

### P0 编辑器骨架

#### Editor runtime

- Extension：提供 `defineRichTextExtension()` 全功能 helper，同时每个单独 extension 都可独立导出；`RichTextEditor` 必须显式接收 `extension`。
- Commands/state：不做 Tiptap 风格 lifecycle/callback/ref；状态订阅使用 ProseKit `useEditor`、`useEditorDerivedValue` 等 hook。
- Components：`RichTextEditor` 只负责创建 editor、提供 ProseKit context、渲染自由 `children`；继续导出 `ProseKitProvider`、`EditorContent`、`EditorShell` primitives。
- NodeView/MarkView：无。
- Styles：统一 editor root class、content typography。
- Tests/demo：新增最小 editor demo、自由组合 demo、内容读写 demo。
- 待确认：`defineRichTextExtension()` 首批纳入哪些已稳定功能。

#### Editable/readonly

- Extension：不接入 readonly 作为本项目目标。
- Commands/state：不做运行时 editable 切换。
- Components：不提供 `RichTextRenderer`；静态渲染由另一个项目负责。
- NodeView/MarkView：只按编辑态实现，除非某个节点在编辑态内需要预览。
- Styles：不规划 readonly 专属样式。
- Tests/demo：不做 readonly demo。
- 待确认：无。

#### Placeholder

- Extension：使用 ProseKit `definePlaceholder`。
- Commands/state：无。
- Components：无单独组件。
- NodeView/MarkView：无。
- Styles：对齐上游 `.custom-placeholder-node` 的颜色、位置、空块行为。
- Tests/demo：空文档、空 heading、空 paragraph。
- 待确认：是否需要按节点类型显示不同 placeholder。

#### Trailing node

- Extension：保留当前 `defineTrailingNode`，校准只读禁用。
- Commands/state：无。
- Components：无。
- NodeView/MarkView：无。
- Styles：无。
- Tests/demo：文末是 table/image/blockLink/flipGrid 时能继续输入。
- 待确认：哪些 block 后必须补 paragraph。

### P0 Toolbar 与基础 UI

#### Toolbar shell

- Extension：无。
- Commands/state：新增 toolbar state selectors，集中计算 active/canExec，避免组件里散写 editor 访问。
- Components：`EditorToolbar`、`EditorToolbarGroup`、`ToolbarItem`、`ToolbarMenu`、`ToolbarDivider`、`ToolbarModeToggle`。
- NodeView/MarkView：无。
- Styles：对齐上游高度 44px、按钮 hover/active/disabled、simple/advanced 横向滚动。
- Tests/demo：advanced toolbar、simple toolbar、禁用态截图。
- 待确认：simple/advanced 是否 P0 实现。

#### Insert menu

- Extension：无。
- Commands/state：建立 insert item registry，item 绑定 command、icon、label、shortcut、children。
- Components：`EditorInsertMenu`、`TableSizePicker`、分组 header、嵌套 menu。
- NodeView/MarkView：无。
- Styles：菜单宽度、分组标题、快捷键尾部文字对齐上游。
- Tests/demo：插入 link/table/hr/blockquote/emoji 这些 P0/P1 项。
- 待确认：首期插入菜单包含哪些条目。

#### Heading menu

- Extension：使用 ProseKit heading。
- Commands/state：`setParagraph`、`setHeading(level)`、active heading level selector。
- Components：`EditorHeadingSelect`。
- NodeView/MarkView：无。
- Styles：菜单项 H1-H6 图标和选中态。
- Tests/demo：H1-H6 切换和 paragraph 回退。
- 待确认：标题是否支持 H1-H6。

#### Basic mark buttons

- Extension：使用 ProseKit bold/italic/underline/strike/code。
- Commands/state：统一 `toggleMarkCommandState`。
- Components：toolbar buttons、bubble menu buttons。
- NodeView/MarkView：无。
- Styles：mark active state、code mark inline 样式。
- Tests/demo：按钮 active/canExec、快捷键。
- 待确认：无。

#### Clear formatting

- Extension：无新增。
- Commands/state：新增 `clearFormatting` command wrapper，清除 marks、text style、link node、blockquote/list/heading 按确认范围处理。
- Components：toolbar clear button。
- NodeView/MarkView：无。
- Styles：无。
- Tests/demo：混合格式清除。
- 待确认：清除格式是否同时清除块类型、列表和 link node。

### P0 Link

#### Inline/block link schema

- Extension：自定义 `defineLinkExtension`，包含 `inlineLink` 和 `blockLink` node spec。
- Commands/state：`setInlineLink`、`toggleInlineLink`、`unsetInlineLink`、`setBlockLink`、`removeLink`、`expandLink`，并提供 `getActiveLinkNode` selector。
- Components：无 schema 专属组件。
- NodeView/MarkView：`LinkView` 统一支持 inline/block。
- Styles：inline text、inline icon、block card、selected、readonly。
- Tests/demo：HTML parse/serialize、inline/block 转换、删除恢复文本。
- 待确认：`<a type="block">` 是否作为 blockLink 序列化格式。

#### Link editing UI

- Extension：无。
- Commands/state：URL normalize、URL validate、title fallback、target/rel 默认值。
- Components：`LinkEditorPopover`、`LinkActionBar`、`LinkDisplayMenu`。
- NodeView/MarkView：Link node view 调用编辑弹层和 action bar。
- Styles：插入占位、hover action bar、popover 表单、favicon/avatar。
- Tests/demo：插入空链接、编辑、复制、取消、type 切换。
- 待确认：favicon 是否保留；空 href 占位 node 是否保留。

#### Link input/paste/click

- Extension：自定义 paste handler、input/enter rule、click handler，不使用 ProseKit mark link。
- Commands/state：autolink/link-on-paste 开关，allowed protocols。
- Components：无。
- NodeView/MarkView：click 行为需 readonly/editable 分叉。
- Styles：无。
- Tests/demo：粘贴 URL、输入 URL、点击 readonly link。
- 待确认：autolink 和 link-on-paste 默认是否开启。

### P0 Bubble menu

- Extension：使用 ProseKit selection/floating 相关能力或自定义 plugin 定位。
- Commands/state：selection state selector，隐藏条件：空选区、codeBlock、node selection 等。
- Components：`InlineMenu`、`InlineMenuGroup`、`InlineMenuButton`、`InlineMenuDivider`，P0 包含 bold/italic/underline/strike/code/link。
- NodeView/MarkView：无。
- Styles：对齐上游 bubble menu 背景、阴影、圆角、箭头。
- Tests/demo：选中文本出现、点击 link 打开编辑、readonly 隐藏。
- 待确认：bubble menu 首期项目范围。

### P0 Table 基础

#### Table schema/commands

- Extension：使用 ProseKit `defineTable`。
- Commands/state：封装 table command state：insert/add row/add column/delete/merge/split/select。
- Components：`TableSizePicker`、toolbar insert table。
- NodeView/MarkView：首期不自定义 table node view。
- Styles：引入 ProseKit table style 后覆盖成上游视觉。
- Tests/demo：插入表格、基础行列操作。
- 待确认：默认插入尺寸。

### P1 文字样式

#### Text color/background/font family

- Extension：使用 ProseKit `defineTextColor`、`defineBackgroundColor`、`defineFontFamily`。
- Commands/state：直接使用内置 `addTextColor/removeTextColor`、`addBackgroundColor/removeBackgroundColor`、`addFontFamily/removeFontFamily`，仅在 UI 层做 selector/helper。
- Components：`EditorFontColor`、`EditorFontBgColor`、`EditorFontFamily`、`ColorPicker`、色板 presets。
- NodeView/MarkView：无。
- Styles：按钮色块、popover、预设色样式。
- Tests/demo：颜色设置、清除、active 色值读取。
- 待确认：是否需要为上游风格命令名提供薄 adapter。

#### Font size/line height

- Extension：fontSize 暂无 ProseKit 内置能力，如确认需要则自定义 mark/attrs；lineHeight 如确认需要也再自定义 mark/attrs。
- Commands/state：如保留 fontSize/lineHeight，则提供 set/unset 和 active attrs selector。
- Components：`EditorFontSize`，后续 `EditorLineHeight`。
- NodeView/MarkView：无。
- Styles：字号 select、文本渲染 style。
- Tests/demo：字号 preset、自定义值、清除格式。
- 待确认：是否需要恢复项目自定义 fontSize；是否需要 lineHeight。

#### Highlight

- Extension：使用 ProseKit `defineHighlight`。
- Commands/state：使用内置 `toggleHighlight`，如 UI 需要 set/unset 再确认是否加薄 adapter。
- Components：toolbar highlight button；如做多色则复用 color picker。
- NodeView/MarkView：无。
- Styles：默认黄色和多色样式。
- Tests/demo：`==text==` 输入/粘贴、高亮切换。
- 待确认：内置 highlight 是否满足 paste rule 和 multicolor 需求。

#### Superscript/subscript

- Extension：使用 ProseKit `defineSuperscript`、`defineSubscript`。
- Commands/state：使用内置 `toggleSuperscript`、`toggleSubscript`；如需互斥再加薄 command adapter。
- Components：toolbar script menu 或独立按钮。
- NodeView/MarkView：无。
- Styles：baseline/字号。
- Tests/demo：上标下标互斥、快捷键。
- 待确认：是否需要上标/下标互斥逻辑。

#### Tooltip mark

- Extension：保留自定义 tooltip mark、commands、mark view。
- Commands/state：set/unset/toggle tooltip，active attrs selector。
- Components：`TooltipEditPopover`、toolbar/bubble tooltip button。
- NodeView/MarkView：`TooltipView`。
- Styles：tooltip underline/hover popover/edit popover 对齐上游。
- Tests/demo：创建、编辑、删除、readonly hover。
- 待确认：tooltip 内容是否允许空字符串。

#### Text align

- Extension：使用 ProseKit `defineTextAlign`。
- Commands/state：set/unset/toggle align，active align selector。
- Components：`EditorAlignSelect`。
- NodeView/MarkView：无。
- Styles：块级 text-align 渲染。
- Tests/demo：paragraph/heading align。
- 待确认：对齐适用节点范围。

#### Code block highlight

- Extension：基础用 ProseKit codeBlock；语法高亮如需要则自定义 node view 或 decoration plugin。
- Commands/state：toggle codeBlock、language attr。
- Components：`EditorCode`、code block language selector。
- NodeView/MarkView：可选 `CodeBlockView`。
- Styles：上游代码块背景、字体、readonly。
- Tests/demo：代码块插入、语言切换。
- 待确认：是否需要 lowlight。

### P1 Slash/Emoji/Mention

#### Slash commands

- Extension：使用 ProseKit autocomplete primitive 和官方 slash command 示例模式；不单独做重型 slash extension。
- Commands/state：slash match state、filtered item registry、keyboard navigation。
- Components：`SlashCommandsList`、`SlashCommandsOverlay`、菜单分组。
- NodeView/MarkView：无。
- Styles：弹层、选中项、快捷键文字。
- Tests/demo：`/` 触发、搜索、Enter/Arrow/Escape。
- 待确认：首期 slash command 条目。

#### Emoji

- Extension：使用 ProseKit autocomplete primitive；不保留当前重复实现。
- Commands/state：emoji search、replace current query command。
- Components：`EmojiAutocompleteMenu`、`EmojiPicker`、toolbar insert emoji。
- NodeView/MarkView：无。
- Styles：emoji popup、empty state、picker 尺寸。
- Tests/demo：`:smile:` 转换、`:query` 菜单、toolbar picker。
- 待确认：是否保留完整 emoji-mart picker。

#### Mention

- Extension：使用 ProseKit `defineMention` + autocomplete。
- Commands/state：mention source adapter：static items、async `mentionSource(query)`、loading/error。
- Components：`MentionList`。
- NodeView/MarkView：可选 mention node view；首期可用 DOM spec。
- Styles：mention chip、menu item。
- Tests/demo：`@` 触发、异步过滤、插入。
- 待确认：mention attrs 是否为 `{ id, value, kind }`。

### P1 Image

#### Image schema/view

- Extension：优先使用 ProseKit `defineImage`，如 attrs 不够再包装自定义 image spec。
- Commands/state：insert image、update attrs、replace src、resize state。
- Components：`ImageInsertPopover`、`ImageToolbar`、`ImageResizeHandle`。
- NodeView/MarkView：`ImageView`。
- Styles：selected、loading/error、resize handle、caption 如需要。
- Tests/demo：URL 插入、编辑 src/size、readonly。
- 待确认：是否需要图片裁剪。

#### Image upload

- Extension：使用 ProseKit `defineImageUploadHandler` 或自定义 paste/drop handler。
- Commands/state：upload adapter、progress、abort、error callback、URL validate。
- Components：upload progress inline UI、insert dialog upload tab。
- NodeView/MarkView：image loading state 或临时 upload node。
- Styles：progress bar、error state。
- Tests/demo：粘贴/拖拽文件、上传成功替换 URL、失败回滚。
- 待确认：`onUploadImgUrl` 是否保留。

#### Image viewer

- Extension：无。
- Commands/state：viewer context，收集当前文档图片。
- Components：`ImageViewerProvider`、`ImageViewerItem`、`ImageViewerToolbar`。
- NodeView/MarkView：ImageView readonly/editable 点击接入 viewer。
- Styles：遮罩、缩放、切换、下载按钮。
- Tests/demo：多图预览、键盘关闭。
- 待确认：是否 P1 做还是后置。

### P1 Table overlay

#### Table handles

- Extension：使用 ProseKit table commands；必要时自定义 plugin 计算 hover/selection state。
- Commands/state：当前 table/cell/row/column state、handle positioning state。
- Components：`TableHandle`、`TableExtendButton`、`TableCellHandleMenu`、`TableSelectionOverlay`。
- NodeView/MarkView：无。
- Styles：行列 handle、选区高亮、resize handle。
- Tests/demo：添加行列、删除、合并拆分、选区 overlay。
- 待确认：首期是否包含 resize 和拖拽移动行列。

### P1 Drag handle/block operations

- Extension：自定义 block selection/drag handle plugin。
- Commands/state：find current block、insert before/after、duplicate、copy、cut、delete。
- Components：`CustomDragHandle`、block action menu。
- NodeView/MarkView：block nodes 需要正确 `data-drag-handle`。
- Styles：左侧 handle、菜单、hover 状态。
- Tests/demo：paragraph/table/image/blockLink/flipGrid 上的块操作。
- 待确认：剪切/复制是否写 HTML 到 clipboard。

### P1 FlipGrid

- Extension：保留当前 `defineFlipGridExtension`。
- Commands/state：set grid、update column widths、normalize widths。
- Components：`FlipGridColumnControls`、resize handles。
- NodeView/MarkView：`FlipGridView`、`FlipGridColumnView`。
- Styles：列 gap、选中态、拖拽 handle。
- Tests/demo：2/3 列插入、列宽调整、嵌套内容。
- 待确认：是否支持 resize。

### P2 内容块

#### Attachment

- Extension：自定义 `inlineAttachment`、`blockAttachment` nodes。
- Commands/state：set inline/block attachment、upload attachment、remove/update attrs。
- Components：`AttachmentInsertPopover`、`AttachmentContent`。
- NodeView/MarkView：`AttachmentView` 支持 inline/block。
- Styles：文件图标、标题、大小、下载、上传进度。
- Tests/demo：URL 附件、上传附件、readonly 下载。
- 待确认：是否同时做 inline 和 block。

#### Audio/video

- Extension：自定义 `audio`、`video` nodes。
- Commands/state：set media、update attrs、upload media、validate URL。
- Components：`AudioInsertPopover`、`VideoInsertPopover`、media controls wrapper。
- NodeView/MarkView：`AudioView`、`VideoView`。
- Styles：播放器尺寸、selected、empty insert placeholder。
- Tests/demo：URL 插入、上传插入、readonly playback。
- 待确认：首期只 URL 还是包含上传。

#### Iframe/Bilibili/YouTube

- Extension：自定义 `iframe` node；YouTube 可作为 iframe type 或独立 node。
- Commands/state：set iframe、validate URL、normalize embed URL。
- Components：`IframeInsertPopover`、`IframeViewToolbar`。
- NodeView/MarkView：`IframeView`。
- Styles：iframe 容器、空状态、readonly。
- Tests/demo：普通 iframe、Bilibili、YouTube。
- 待确认：URL 白名单和 sandbox 策略。

#### Alert

- Extension：自定义 alert block node。
- Commands/state：set/toggle alert、update variant/type。
- Components：`AlertViewContent`、insert menu variants。
- NodeView/MarkView：`AlertView`。
- Styles：info/warning/error/success/default，对齐上游图标和颜色。
- Tests/demo：各 variant、嵌套内容。
- 待确认：alert 是 atom 还是可编辑 content block。

#### Details

- Extension：自定义 `details`、`detailsSummary`、`detailsContent` nodes，或使用 ProseKit toggle list 替代。
- Commands/state：set details、toggle open。
- Components：`DetailsView`。
- NodeView/MarkView：details node view。
- Styles：折叠箭头、summary、content。
- Tests/demo：展开/折叠、readonly。
- 待确认：用原生 details 结构还是自定义 block 结构。

#### Math

- Extension：使用 ProseKit `defineMath`，自定义 render 函数和 commands wrapper。
- Commands/state：set inline math、set block math、update latex、error callback。
- Components：`MathInsertPopover`、`MathEditPopover`。
- NodeView/MarkView：`InlineMathView`、`BlockMathView`。
- Styles：公式渲染、错误态、选中态。
- Tests/demo：inline/block、编辑、渲染错误。
- 待确认：KaTeX 还是其他 renderer。

#### TOC

- Extension：自定义 plugin 扫描 headings。
- Commands/state：toc derived state、active heading、onTocChange callback。
- Components：可选 `TableOfContentsPanel`。
- NodeView/MarkView：无。
- Styles：toc active/scrolled-over。
- Tests/demo：heading 更新触发 TOC。
- 待确认：只提供 callback 还是内置 UI。

#### Indent

- Extension：自定义 block attrs 或 node attribute extensions。
- Commands/state：indent/dedent、max level、indent px。
- Components：toolbar/menu item。
- NodeView/MarkView：无。
- Styles：按 attrs 输出 margin/padding。
- Tests/demo：paragraph/heading/list/media/table indent。
- 待确认：覆盖哪些节点。

#### Theme provider

- Extension：无。
- Commands/state：无。
- Components：`EditorThemeProvider` 或 style token provider。
- NodeView/MarkView：所有 view 使用统一 class/token。
- Styles：light/dark palette、MUI theme overrides、editor CSS variables。
- Tests/demo：light/dark 截图。
- 待确认：是否必须保留 dark mode。

### P3 高级功能

#### Structured diff

- Extension：readonly 模式下的 diff decoration/mark/node attrs。
- Commands/state：HTML parse -> ProseKit doc -> diff result -> readonly view。
- Components：`EditorDiff`。
- NodeView/MarkView：特殊节点的 deleted/inserted preview view。
- Styles：插入/删除/变更高亮。
- Tests/demo：文本、图片、附件、公式、音视频 diff。
- 待确认：是否迁移上游 enhanced diff。

#### AI writing

- Extension：自定义 plugin state + decoration。
- Commands/state：enable/disable、request suggestion、accept with Tab、clear suggestion。
- Components：toolbar AI button、inline suggestion decoration UI。
- NodeView/MarkView：无。
- Styles：ghost text/suggestion。
- Tests/demo：启用、请求、Tab 接受、错误。
- 待确认：是否纳入项目范围。

#### Character count/limit

- Extension：自定义 plugin 统计字符。
- Commands/state：characterCount、limitExceeded、onChange callback。
- Components：footer counter。
- NodeView/MarkView：无。
- Styles：超限颜色。
- Tests/demo：输入统计、超限。
- 待确认：是否需要。

#### Invisible characters

- Extension：自定义 decorations。
- Commands/state：toggle invisible chars。
- Components：toolbar toggle。
- NodeView/MarkView：无。
- Styles：空格、换行、tab 标记。
- Tests/demo：显示/隐藏。
- 待确认：是否需要。

#### IME composition fix

- Extension：仅在复现问题后加 plugin。
- Commands/state：composition state。
- Components：无。
- NodeView/MarkView：无。
- Styles：无。
- Tests/demo：中文输入法回归。
- 待确认：是否存在当前问题。
