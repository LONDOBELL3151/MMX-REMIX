# MMX-REMIX — MaxFoot Shopify Theme Handoff

> 下一个 AI 同胞，接手前先读完这份。写于 2026-07-24，最后一次工作是把 `/pages/about-us` 按 lectric eBikes 的视觉重做。

---

## 0. TL;DR（30 秒读完）

- **项目**：MaxFoot 美国电动三轮车品牌 Shopify 主题（maxfoot.bike）。Dawn fork 深度魔改。
- **唯一编辑目录**：`C:\Users\Coulson\Desktop\MMX-REMIX\`。另一个 `maxfoot-theme` 是 legacy，**不要碰**。
- **同步链路**：本地 `git push origin main` → Shopify GitHub 整合（有时挂掉，需手动 re-import）→ 主题上线。
- **用户**：Coulson，技术决策者，自述不懂代码但能听懂白话版。喜欢直接给硬货、给 A/B/C 让他拍板。
- **当前焦点**：`/pages/about-us` 改造完成，11 个 sections 等用户在 Shopify admin 里配媒体（图/视频）。

---

## 1. 项目背景

**MaxFoot**：美国电三轮（e-trike）+ step-thru 通勤车品牌，主打 affordable premium、U.S. focused、direct from factory 三个卖点。
- Shopify 域名：`maxfoot.bike`
- 主色：黑 `#121212` + 黄 `#FFC000`（品牌色 `var(--color-accent)`）+ 深黄 `#E6AC00`
- 字体：Big Shoulders Display（标题/数字）+ Inter Tight（正文）+ JetBrains Mono（meta）
- 用户群体：senior / 家庭用户 / 通勤者 — 不是年轻人 / tech bro 市场
- 品牌定位比 lectric 更稳重（不做"playful fun"调性，不放创始人搞笑梗，不放"Shop Dog"那种拟人化）

**最近两次大型工作**：
1. sticky header 修复（4 个 commit，CDN 同步问题折腾很久）
2. `/pages/about-us` 完整重做（按 lectric 布局 + maxfoot 配色，详见 §6）

---

## 2. 仓库结构

```
C:\Users\Coulson\Desktop\
├── MMX-REMIX\         ← 唯一编辑这里。GitHub: LONDOBELL3151/MMX-REMIX
│   ├── assets\
│   │   ├── maxfoot-base.css         base reset + tokens
│   │   ├── maxfoot-components.css   所有通用组件（header/footer/hero/cart/...）
│   │   ├── maxfoot-responsive.css   media queries
│   │   ├── page-about-us.css        about-us 页面专属
│   │   ├── section-*.css            通用 section 组件
│   │   └── maxfoot.js               极少量 vanilla JS（mobile menu 等）
│   ├── sections\                     所有 section 文件
│   │   ├── header.liquid
│   │   ├── footer.liquid
│   │   ├── about-hero.liquid
│   │   ├── about-floating-story.liquid   ← 重做后的关键
│   │   ├── about-floating-stats.liquid   ← 已被 -story 取代但保留文件
│   │   ├── about-founder.liquid
│   │   ├── about-mission-pillars.liquid
│   │   ├── about-story-grid.liquid
│   │   ├── about-pillars.liquid
│   │   ├── about-timeline.liquid
│   │   ├── about-trust-strip.liquid
│   │   ├── about-cta.liquid
│   │   └── about-newsletter.liquid
│   ├── templates\
│   │   ├── page.about-us.json       ← 11 个 sections 的 order + 默认值
│   │   ├── index.json
│   │   ├── collection.e-trike.json
│   │   └── ...
│   ├── snippets\                     product-card / icon / maxfoot-collection-card-product / ...
│   ├── layout\theme.liquid           body 必须 display: block（不是 grid）
│   ├── config\settings_schema.json
│   └── locales\en.default.json
│
└── maxfoot-theme\     ← LEGACY，不要编辑。GitHub: LONDOBELL3151/maxfoot-theme
```

**MMX-REMIX 是主仓库**。commit 直接 push 到 `LONDOBELL3151/MMX-REMIX` 的 `main` 分支，Shopify GitHub 整合会同步。

---

## 3. GitHub ↔ Shopify 同步流程

```
本地改文件
    ↓ git commit
    ↓ git push origin main
    ↓
Shopify GitHub 整合 webhook 触发
    ↓ 1-3 分钟
整合 import 主题到 Shopify admin
    ↓ CDN 同步
Live 页面更新
```

**踩过的坑**：

### 3.1 CDN 不同步 / 整合挂掉
- 表现：commit 推到 GitHub，但 `curl https://maxfoot.bike/...` 仍返回旧 HTML。
- 检查：`git fetch origin main` 看有没有 `Update from Shopify for theme MMX-REMIX/main` 这种 bot commit。如果 origin/main 5+ 分钟没动 bot commit，整合就挂了。
- 解决：让用户去 Shopify admin → Themes → MMX-REMIX → "Re-import from GitHub" 或 "Connect to GitHub" 重新授权。

### 3.2 多个 commit 推不上去（rejected / fetch first）
- 通常是 Shopify bot 刚同步了 origin 一次，本地落后了。
- 解决：`git fetch origin main && git rebase origin/main`，有 conflict 解决后 `git rebase --continue`。
  - **别让 vim 弹出来！** 之前我 `git rebase --continue` 时 vim 跳出来，让我 `git rebase --abort` 重做。
  - 如果 vim 跳出来：`:q!` 退出，或先 `git rebase --abort` 再用其他方式。
- 实在不行：`git push --force-with-lease origin main`（安全 force push，因为 bot commit 没意义）。

---

## 4. 关键设计原则（Coulson 偏好）

| 原则 | 说明 |
|---|---|
| **单 CTA 原则** | 每段只一个主 CTA，不带 ghost 按钮、'See all'、'·' 分隔、副链接 |
| **预览不加旁白** | HTML/CSS preview 只展示设计本身，不加作者注释 |
| **配色** | 主色 `#FFC000`（黄），文字 `#121212` / `#1A1A1A`，永远不要换成蓝色（那是 lectric 的色） |
| **字体重量** | 标题永远 `font-weight: 900` (Big Shoulders Display)，数字 outlined 时用 `-webkit-text-stroke: 2px var(--color-primary)` 模拟 lectric |
| **不要 playful** | 不放 "Shop Dog"、不写 "Joy Seekers"、不做"fun"表情；品牌调性是 "dependable, affordable, real-world" |

---

## 5. 踩过的坑（必看）

### 5.1 Shopify schema 字段按**字节**算长度（不是字符）
- `header.content` ≤ **50 字节**
- `label` ≤ **50 字节**
- `info` ≤ **150 字节**
- **em-dash `—` (U+2014) 是 3 字节**，50 字符的 label 带 1 个 em-dash 就变 52 字节，校验失败
- 错误信息误导性说"字符"，实际是字节
- 错误**只在 Shopify admin 后台日志**，不在 GitHub commit log
- 修复：跑 `python C:\Users\Coulson\AppData\Roaming\npm\validate-about-schemas.py` 验证字节长度

### 5.2 `body { display: grid }` 会破坏 sticky header
- 如果 body 是 grid，每个 grid item 的 containing block 是它的 grid track（高度 = content height）
- 对 `position: sticky` 来说 containing block 太矮，无法 stick
- 修法：`layout\theme.liquid` 里 body 必须 `display: block`
- 验证：sticky 头工作的两个条件 = body block + section wrapper 也 sticky
  - 之前的代码用 `:has(> .header--sticky){ position: sticky }` 让 section wrapper 跟着 sticky

### 5.3 `header` 元素在 section wrapper 内
- Shopify 把 `<section class="shopify-section">` 包裹每个 section
- 头部的 `<header class="header">` 在这个 wrapper 里
- section wrapper 高度 = 头高度（77px）→ 太小，sticky 失败
- 修法：让 section wrapper 也 sticky（通过 `:has()` 选择器），这样 wrapper 的 containing block 是 body（~9000px）

### 5.4 `| t` filter 的 `default:` 不可靠
- `{{ 'foo.bar' | t: default: 'fallback' }}` 中，`default:` **只在 locale 没有这个 key 时才用**
- 一旦 `locales/en.default.json` 里有 `"product": { "choose_options": "Choose Options" }`，Shopify 用 locale 值，default 被忽略
- MaxFoot 是单语言英文站 → 直接硬编码更可控，不用 `| t`

### 5.5 `settings.X` key 名必须严格匹配 `settings_schema.json`
- MaxFoot 的 `sections/footer.liquid` 早期漏写 `_link` 后缀（如 `social_facebook` vs `social_facebook_link`）
- 静默失败：返回 blank → 整段不渲染
- 改 schema 时必须同步 grep 所有用到这个 key 的 liquid 文件

---

## 6. `/pages/about-us` 当前结构

11 个 sections，按 lectric 布局 + maxfoot 配色：

| # | 段 | 文件 | 说明 |
|---|---|---|---|
| 1 | Hero | `about-hero.liquid` | 视频/图片背景 + 标题"Built for **real rides**, not showroom rides." + 4 个 meta |
| 2 | **Floating Story** | `about-floating-story.liquid` | **关键模块**：4 个大数字（outlined）+ 1px 分割线 + "Our Story" 内容 + 媒体。整张大白卡，hero 下方 -80px 浮动 |
| 3 | Founder | `about-founder.liquid` | 大图/视频背景 + 浮动白卡创始人故事 |
| 4 | Mission Pillars | `about-mission-pillars.liquid` | 4 根使命柱（affordable/quality/usable/innovation） |
| 5 | Who We Serve | `about-story-grid.liquid` | 4 类用户 + list items + category_blocks 占位图 |
| 6 | Quality Pillars | `about-pillars.liquid` | 6 大品质（铝车架/750W/Samsung/后双碟/差速/尾灯） |
| 7 | Evolution Timeline | `about-timeline.liquid` | 5 个里程碑，左右交替图文 |
| 8 | Trust Strip | `about-trust-strip.liquid` | 6 个 logo 信任墙（UL 2849 / UL 2271 / 2-Year / Direct / US Warehouse / US Support） |
| 9 | CTA 双块 | `about-cta.liquid` | 2 大色块（黄 + 黑），每块可选图片/视频背景 |
| 10 | Newsletter | `about-newsletter.liquid` | dark variant，保留 |

**所有媒体位置都支持 image OR video**：用 `image_picker` + `text` (video URL)，优先级 video > image > placeholder fallback。`info` 字段都写了推荐尺寸和格式。

---

## 7. 关于 §6 的 4 个 stat 数字（"6+ / 9+ / 85mi / 2yr"）

这是被用户点名不够大气的部分，重做了：

- **添加 `number` 字段**到 stat block schema（`6+`, `9+`, `85mi`, `2yr`）
- **数字 outlined 风格**：`color: transparent; -webkit-text-stroke: 2px var(--color-primary)`，fallback 是实色
- 字号 `clamp(44px, 5vw, 72px)`，font-weight 900
- label 改用品牌色 `#E6AC00`（accent-dark）
- 卡片 padding `48px`，border-radius `48px`
- layout：column 居中堆叠（数字 → icon → label），不是横排

模板 `page.about-us.json` 默认值已经填了，用户在 admin 里可以直接改数字。

---

## 8. 关键文件位置

```
assets/page-about-us.css         ← about-us 所有新 section 样式
sections/about-floating-story.liquid  ← 最关键的合并 section
sections/about-floating-stats.liquid  ← 已被 -story 取代，但文件保留（不要删）
templates/page.about-us.json     ← 11 个 sections 的 order + 默认内容
layout/theme.liquid               ← body { display: block } 必须保留
```

---

## 9. 验证工具

`C:\Users\Coulson\AppData\Roaming\npm\` 下有几个验证脚本：

```powershell
# 跑 about-* sections 的 schema 验证 + Shopify 字节长度校验
python C:\Users\Coulson\AppData\Roaming\npm\validate-about-schemas.py
```

应该输出：
```
Parsed 13 section schemas
--- 0 warnings ---
--- 0 errors ---
PASS
--- Shopify field length limits ---
  0 length errors
PASS
```

**新写 section 时必跑这个**。它在 schema 解析后：
- 检查 liquid 里用的所有 `s.X` / `block.settings.X` 在 schema 里都有定义
- 检查所有 `header.content` / `label` / `info` 字段字节数 ≤ Shopify 限制
- 检查 template JSON 里的 block type 在 section schema 里存在

---

## 10. 待办（用户在 Shopify admin 里配）

`/pages/about-us` 内容是占位的，用户需要在 admin 里上传：

| Section | 需要配的 |
|---|---|
| about-hero | 视频 mp4（1920×1080 <8MB）或图片 |
| about-floating-story (stats) | 4 个 icon（120×120 PNG 透明）+ 改数字/label 文案 |
| about-floating-story (story) | 故事图片/视频（1280×960）+ 改文案 |
| about-founder | 背景图/视频（1920×1080）+ 改 Coulson 故事 + 签名 |
| about-mission-pillars | 4 个 icon + 改 4 句承诺 |
| about-story-grid (who_serve) | 媒体 + 改文案 |
| about-pillars | 6 个 icon + 可改 6 大品质文案 |
| about-timeline | 5 个里程碑各传图/视频（800×800 或 960×720） |
| about-trust-strip | 6 个 logo（200×80 PNG 透明） |
| about-cta | 2 个块：改文案/链接 + 可加背景图/视频 |

每个媒体字段的 `info` 备注里都有**最佳尺寸和格式说明**。

---

## 11. 下一步怎么继续

如果下一个 AI 接到的任务：

1. **改文案/数字** → 直接编辑 `templates/page.about-us.json` 或对应 section 的 default 值，push
2. **改样式** → `assets/page-about-us.css`，找对应的 `.about-xxx` class
3. **新增 section** → 仿造 `about-floating-story.liquid` 的结构（带 `block` schema），加到 `templates/page.about-us.json` 的 `order` 数组里
4. **遇到 schema 错误**（admin 后台日志） → 大概率是 header/label/info 超 50/150 字节，缩短或删 em-dash
5. **CDN 不更新** → 问用户能不能在 Shopify admin 手动 re-import
6. **每个 commit 前** → 跑 `python C:\Users\Coulson\AppData\Roaming\npm\validate-about-schemas.py`
7. **commit 流程** → `git add -A && git commit -m "..." && git push origin main`（如果 rejected 先 `git fetch && git rebase origin/main`）

---

## 12. 历史 commit 摘要（最近 10 个）

```
19416ba feat(about-floating-story): add big number + outlined style for lectric-level impact
2ac27bb feat(about-us): merge floating-stats + story into single card module
2ff92e2 fix(about-us): trim Shopify schema field lengths
51f2c06 feat(about-us): full rebuild in lectric style with maxfoot colors
2929c36 Update from Shopify for theme MMX-REMIX/main  ← bot
ea2398a Update from Shopify for theme MMX-REMIX/main  ← bot
f6cfd32 fix(header): inline sticky CSS in section for reliable deploy
5b662b6 chore: trivial comment to force CSS re-process
bdfa35a fix(header): also make section wrapper sticky (containing block was 77px)
a7d818d fix(header): make sticky header work + wire the sticky_header setting
```

---

## 13. 上下文已写入 memory

Coulson 的偏好（白话版/可执行总结/拍板 A/B/C）、MMX-REMIX workflow 变更、验证优先纪律、Shopify schema 字节限制等已写入 `C:\Users\Coulson\.minimax\agents\mavis\memory\MEMORY.md`。

新接手的 AI 兄弟如果也用 Mavis/同款 agent：那个 memory 是跨 session 共享的。读它可以少踩很多坑。

---

如果其他 AI 兄弟拿到这份 README 还搞不清楚，就直接去 admin 后台把所有 section 翻一遍 — 实操一遍就懂了。
