# MMX-REMIX — MaxFoot Shopify Theme（Claude Code 开机手册）

> 这是 Claude 每次新对话的**自动加载**手册。只放"最快进入工作状态"的硬规则 + 导航指针。
> **深度文档一律去 `README.md`**（21 节 + 附录，覆盖 90+ sections、全部规范与踩坑）。
> 本文件与 README 不一致时：本文件是较新的权威（mf25-stitch 工作未收进 README）。

## 0. 项目速览（30 秒）

- **是什么**：MaxFoot 美国电三轮/通勤车品牌 Shopify 主题。调性黑 + 黄 `#FFC000`，**不蓝、不 playful**。
- **唯一编辑目录**：`C:\Users\Coulson\Desktop\MMX-REMIX`（本仓库）。
- **绝不碰**：`Desktop\maxfoot-theme\`（legacy 备份）、`Desktop\dawn\`（Dawn 原版 workspace，**不是**本工程）。
- **同步链路**：`git push origin main` → GitHub → Shopify GitHub 整合 → CDN。**经常卡 5+ 分钟**；看到 `Update from Shopify for theme MMX-REMIX/main` bot commit 属正常。
- **设计稿**：根目录 `pdp-mockup-*.html`（mf25-stitch 的设计来源，已在 `.gitignore`，仅本地参考）。
- **规模实测（README 已过时）**：132 sections（129 liquid + 3 group）、60 templates（含 `customers/` 7 个账户模板）、91 snippets、150 assets、**31 种语言 locale**。README 的"~90 sections / 单语言英文站"是旧数据。

## 1. 新对话开机序列

1. `cd C:\Users\Coulson\Desktop\MMX-REMIX` —— 先确认路径（系统 workspace 默认在 dawn，不在本工程）。
2. `git status` + `git log --oneline -10` —— 识别本地改动 vs 远程 bot commit；本地落后 origin 时先 `git pull --rebase`。
3. 改动涉及 `mf25-stitch-*` → 先读共享样式 `snippets/mf25-stitch-styles.liquid`（该家族的唯一 CSS 源）再看对应 section。
4. 需要全局上下文/规范细节 → 读 `README.md`（目录见其 §目录）。
5. 改完跑验证（§3）→ commit + push（格式见 §2）。

## 2. 硬规则（commit+push 前必须满足）

- **theme check 零 error**：`shopify theme check --fail-level error`（整主题跑 1-2 分钟；已存在的 locale/bot 相关 pre-existing error 与本次无关）。**标准：本次改动的文件零 error 零 warning**。
- **commit 格式**：`feat|fix|refactor|docs|style|chore(scope): subject`。scope = section/文件名（如 `mf25-stitch-bundle`）；subject ≤50 字符、动词现在时、小写开头；body 写 **why**。
- **push 前**：`git fetch origin main` 看有无 bot commit → 有则 `git pull --rebase` 再推。push rejected → rebase 是常态。bot commit 可 `git push --force-with-lease` 覆盖。
- **不要删**：`index.json` / `product.json` / `page.json` / `collection.json`（Shopify fallback，删了 bot 会 auto-restore 制造噪音 commit）。
- **改 schema 后**：Shopify admin 里旧 section instance 仍引用旧字段 → 需用户 reset / 删了重加。GitHub 整合不重 process 时，`--force-with-lease` 或改个 literal 值触发。
- **文档同步（硬性）**：结构性改动（新增/删 section/template、新模式/坑、数量或命名变化）必须同步 `README.md` + 本文件。文档漂移 = 踩坑（例：首页实测 14 sections 非 13、主题实测 31 语言非单语言）。

## 3. 验证清单（改完 commit 前）

1. `shopify theme check --fail-level error` → 本次文件零问题。更快只查改动文件：`--output json` 输出 + python 过滤（命令见记忆 `liquid-section-rules.md`）。
2. 涉及 about-*/schema 字节 → `python C:\Users\Coulson\AppData\Roaming\npm\validate-about-schemas.py`。
3. `git status` 确认没误加 `_debug\`、mockup html（已在 .gitignore）。
4. **结构性改动 → 同步文档再 commit**：新增/删 section/template、新模式/坑、数量或命名变化 → 更新 `README.md`（§10/§11 列表、§15 坑、附录）与本文件（§0 计数、§5 家族）。

## 4. Section / Liquid / CSS 规范

- section 标准结构、schema 规范、媒体模式、blocks limit、presets → README §6.5 / §7 / §17.2。
- `assign s = section.settings` 必须放在 section 顶部 liquid 块第一行。
- **blocks 渲染必须按 `block_order` 输出**（`{%- for block in section.blocks %}` 主循环 + case 分发），不写死位置；多 block 要放同一 form 内时用 `{%- capture -%}` 预收集再统一输出。
- **重构 section 保留原 class / HTML 结构 / 标签**（CSS 依赖它们），改结构前先 grep 对应 CSS。
- `<img>` 必须带 width/height —— 用 `image_tag` filter（自动带 w/h + 响应式 srcset）。
- schema 按**字节**算：`header.content`/`label` ≤50，`info` ≤150（em-dash `—` = 3 字节）。
- `| t` 的 `default:` 会被 locale 文件覆盖。**主题含 31 种语言 locale**（README 的"单语言→硬编码"已过时）：用户可见文案要么走 locale key，要么确认当前市场语言，别默认是英文。
- 单 CTA 原则；标题 `font-weight:900` + uppercase 是 DNA（不为对齐降重，改 line-height）。
- CSS 不塞 `<div style>`；走 `assets/` 文件或共享 snippet。媒体字段必带 `info` 说明推荐尺寸。
- 新 section 的 schema 必带 `presets`，否则 editor "Add section" 搜不到。

## 5. README 未收录的新 section（最新工作）

- **`about-mission.liquid`**：about-us 家族新增（README §10.7 没列），**且正挂在线上**：`page.about-us.json` 的 `mission_text` 用的是它，不是 README 附录 A 写的 `about-mission-pillars`。
- **首页模板实测**：`index.json` 实际 **14 个 sections**，含 **2 个 hero**（`hero` + `hero_NijgLE`）——README §10.2 说 13 个 / 1 个 hero 是旧数据。改首页先看 `templates/index.json` 实际构成。
- **mf25-stitch 家族**（8 个）：`mf25-stitch-bundle` / `-confidence` / `-feature` / `-gallery` / `-performance` / `-reviews` / `-size` / `-specs`，全部挂在 `templates/product.mf-25-stitch.json`（MF-25 Stitch PDP）。
- **confidence section**（bundle 之后）：信任条（Warranty / Shipping / Customer Service），块驱动（icon select → shield/truck/headset SVG + title/sub），设计源 `pdp-mockup-mf25.html` 的 CONFIDENCE BAND。
- **共享 CSS**：section 顶部 `{% render 'mf25-stitch-styles' %}`（唯一源，含全部 `.mf25-*` 样式）。**例外**：`mf25-stitch-performance.liquid` 自带一份内联 copy（历史遗留，勿再复制）。
- **bundle section 关键点**（已实现）：
  - 每个 item = `product_1/2/3`（关联商品）+ `image_1/2/3`（1:1 上传，空则回退商品主图）+ `item_1/2/3`（自定义短文案，空则回退商品标题）。
  - "Add Bundle to Cart" = POST `/cart/add.js`，加**主产品（跟随 `#pdp__form` 已选变体，回退默认）+ 全部关联产品**，刷新 `cart-drawer`。JS 模式参考 `sections/mf-pdp-accessory-bundles.liquid`（同款 data-items JSON + cart drawer renderContents）。
  - `Total Value` = 三个关联产品 `selected_or_first_available_variant.price` 之和（渲染删除线），位于 Price 上方。
- **加购/购物车机制**：cart-drawer + `window.routes.cart_add_url`；`assets/maxfoot.js` 处理变体选择（更新 `.product-variant-id` hidden input）；`assets/product-form.js` 是 main-product 加购参考。

## 6. README 导航速查（深度文档入口）

| 想查 | README § |
|---|---|
| 全项目结构 / 三目录边界 | §2 |
| 品牌视觉 DNA / 调性 | §3 |
| 设计 tokens（颜色/字体/按钮） | §4（tokens 在 `layout/theme.liquid` ~239-254） |
| 跟 Coulson 配合的沟通铁律 | §5 |
| commit 格式 / 命名 / section 模板 | §6 |
| Liquid 规范 / 媒体 / schema 坑 | §7 |
| CSS 架构 / 通用模式 / 断点 | §8 |
| JS 规范 / maxfoot.js 模块地图 | §9 |
| 90+ section 全库 | §10 |
| 25+ 模板 | §11 |
| product card / metafields | §12 |
| header/footer/cart 全局组件 | §13 |
| App 集成（Impact-cart/Judge.me/Pagefly） | §14 |
| 20+ 踩坑清单 | §15 |
| 验证工具 / git 操作 | §16 |
| 常见任务模板 | §17 |
| troubleshooting | §18 |
| 用户设计偏好 | §19 |

## 7. 沟通偏好（跟 Coulson）

- 白话 + 实物（commit hash / 截图），拒绝空话与长 explanation；重要决策给 A/B/C 让他拍板。
- 数据说话不记忆说话；用户截图打脸先验证再认错。
- 详见 README §5.1 / §19。
