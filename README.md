# MMX-REMIX — MaxFoot Shopify Theme

> **Handoff 文档**：下一个 AI 同胞接手时，从这个 README 入手。
> 内容覆盖整个项目（不只是 about-us）— 写法、思路、规范、踩过的坑、常用任务模板，全部在这里。
>
> 最后一次工作：把 `/pages/about-us` 按 lectric eBikes 视觉重做（11 个 sections），并整理出这份完整 handoff。

---

## 目录

| § | 标题 | 用途 |
|---|---|---|
| 0 | [TL;DR](#0-tldr--30-秒读完) | 30 秒项目速览 |
| 1 | [项目背景](#1-项目背景) | 品牌、用户、调性 |
| 2 | [仓库结构 (3 个目录)](#2-仓库结构-3-个目录) | MMX-REMIX / maxfoot-theme / dawn |
| 3 | [品牌视觉 DNA](#3-品牌视觉-dna) | 颜色、字体、节奏、跟 lectric 的差异 |
| 4 | [设计系统 Token](#4-设计系统-tokens) | 颜色 / 字体 / 间距 / 圆角 / 阴影 |
| 5 | [工作思路 (开发哲学)](#5-工作思路-开发哲学) | 怎么跟 Coulson 配合、决策逻辑 |
| 6 | [代码规范](#6-代码规范) | commit 格式、命名、文件组织、动/静态分离 |
| 7 | [Liquid 编码规范](#7-liquid-编码规范) | settings、blocks、媒体、`\| t` 陷阱 |
| 8 | [CSS 架构规范](#8-css-架构规范) | 分层、命名、模式 |
| 9 | [JavaScript 规范](#9-javascript-规范) | maxfoot.js、data-attrs、defer |
| 10 | [Section 库（全部 90+）](#10-section-库全部-90) | 文件位置、用途、当前状态 |
| 11 | [Page 模板（全部 25+）](#11-page-模板全部-25) | 哪个模板配哪些 sections |
| 12 | [Product Card 完整规范](#12-product-card-完整规范) | 两种 card、metafields、rating |
| 13 | [全局组件 (header / footer / cart)](#13-全局组件) | 跨页面共用元素 |
| 14 | [App 集成 (Impact-cart / Judge.me / Pagefly)](#14-app-集成) | 第三方 app 怎么挂的 |
| 15 | [踩过的坑（20+ 条）](#15-踩过的坑20-条) | bug + 根因 + 修法 |
| 16 | [验证工具](#16-验证工具) | `validate-about-schemas.py` 等 |
| 17 | [常见任务模板](#17-常见任务模板) | 改文案 / 加 section / 修样式 / 排查 |
| 18 | [问题排查 (troubleshooting)](#18-问题排查-troubleshooting) | 症状 → 根因 → 修法 |
| 19 | [设计原则 (Coulson 偏好)](#19-设计原则-coulson-偏好) | 单 CTA、不加旁白、bold DNA |
| 20 | [历史 commit 与里程碑](#20-历史-commit-与里程碑) | 关键节点 |
| 21 | [Memory 与继续](#21-memory-与继续) | 跨 session 上下文怎么读 |
| A | [附录 A: About Us 11 Sections 详解](#附录-a-about-us-11-sections-详解) | 单页深度文档（最近一次大改） |

---

## 0. TL;DR（30 秒读完）

- **项目**：MaxFoot 美国电动三轮车（e-trike + step-thru 通勤车）品牌 Shopify 主题。
- **域名**：`maxfoot.bike` · **Shopify shop**：`maxfoot-electric-bike.myshopify.com`
- **唯一编辑目录**：`C:\Users\Coulson\Desktop\MMX-REMIX\`
- **不要碰**：`C:\Users\Coulson\Desktop\maxfoot-theme\`（legacy 副本）
- **系统 workspace**：`C:\Users\Coulson\Desktop\dawn`（Dawn 原始主题，**不是** MaxFoot 工程，路径要确认）
- **同步链路**：本地 `git push origin main` → GitHub `LONDOBELL3151/MMX-REMIX` → Shopify GitHub 整合 → admin → CDN（**经常卡 5+ 分钟**，需要手动 re-import）
- **用户**：Coulson，技术决策者，自述不懂代码但能听懂白话版。
  - 喜欢直接给硬货、给 A/B/C 让他拍板、给白话总结 + 实物（截图/数据）
  - 拒绝空话、拒绝"您真是太厉害了"、拒绝 5 段长 explanation
- **调性**：黑 + 黄 (#FFC000)、稳重不 playful、不抄 lectric 的"Joy Seekers"梗
- **核心约定**：
  - 单 CTA 原则（每段只一个主按钮）
  - 预览不加旁白
  - 数字 outlined 风格（lectric 风但 maxfoot 配色）
  - 验证优先（绝不在没 `git log` + `Get-ChildItem` 之前承认错误）

---

## 1. 项目背景

### 1.1 品牌定位

**MaxFoot**：美国电三轮（e-trike）+ step-thru 通勤车，主打 3 个卖点：
- **Affordable premium** — 不走 lectric 那种"超低价"打法，但也不能像 Trek/Rad Power 那样贵
- **U.S. focused** — 美国市场、本土仓、本土客服
- **Direct from factory** — 直营，跳过中间商

### 1.2 用户群体

senior / 家庭用户 / 通勤者 / 周末骑手 — **不是年轻人 / tech bro 市场**。
- 注重实用、可靠、安全
- 不喜欢"fun"、"playful"调性
- 接受 60+ 岁审美（稳重、清晰、有信息量）

### 1.3 调性 vs Lectric

| 维度 | Lectric | MaxFoot |
|---|---|---|
| 调性 | playful fun | dependable, real-world |
| 颜色 | 蓝色 #00A3E0 | **黄色 #FFC000** |
| 字体 | museo-sans | **Big Shoulders Display + Inter Tight** |
| 创始人梗 | Shop Dog / Joy Seekers | **不搞**（不用私人梗） |
| 节日营销 | 大轮播 + 情感口号 | **不堆**（只留必要的） |
| Hero | 视频背景 | 视频或图片（**编辑可控**） |
| Stats | 4 个 outlined 大数字 | 4 个 outlined 大数字（同款，6+ / 9+ / 85mi / 2yr） |
| Founder | 背景 + 浮动白卡 | 同款 |

**关键差异**：MaxFoot 不做 lectric 那种"Never Outgrow the Ride"、"An Excuse To Have Fun"的口号文案。我们用 "Built for **real rides**, not showroom rides." 这种稳重语气。

---

## 2. 仓库结构 (3 个目录)

```
C:\Users\Coulson\Desktop\
├── MMX-REMIX\            ← 唯一编辑这里（active）
│   ├── assets\
│   │   ├── maxfoot-*.css        MaxFoot 自有 CSS（base / components / responsive）
│   │   ├── page-*.css           单页专属（page-about-us.css 等）
│   │   ├── section-*.css        各 section 专属
│   │   ├── component-*.css      Dawn 组件 CSS（product card / facets / cart 等）
│   │   ├── *.js                 vanilla JS（maxfoot.js / cart.js / facets.js / ...）
│   │   ├── gsap.js / scrollTrigger.js / swiper*.js / keen-slider*  动画 / 轮播
│   │   └── base.css / style.css Dawn 原版（保留兼容）
│   ├── sections\
│   │   ├── header-group.json / footer-group.json / impact-overlay-group.json
│   │   ├── header.liquid / footer.liquid / announcement-bar.liquid
│   │   ├── main-*.liquid        page / product / collection / cart / account / order / search / blog...
│   │   ├── about-*.liquid       about-us 11 个（最新重做）
│   │   ├── mf-pdp-*.liquid      product detail page 模块
│   │   ├── impact-*.liquid      Impact-cart app 集成
│   │   ├── judgeme_*.liquid     Judge.me 评价 app 集成
│   │   ├── blog-*.liquid / Home-*.liquid
│   │   └── ... ~90 sections
│   ├── snippets\
│   │   ├── product-card.liquid                    主 product card
│   │   ├── maxfoot-collection-card-product.liquid Dawn 版 product card
│   │   ├── promo-card.liquid                      collection 内插的 promo card
│   │   ├── facets.liquid / pagination.liquid / icon*.liquid
│   │   ├── cart-drawer.liquid / cart-notification.liquid
│   │   ├── social-icons.liquid / meta-tags.liquid / stars.liquid / price.liquid
│   │   ├── product-*.liquid (media / thumbnail / variant)
│   │   ├── impact-*.liquid / mf-quick-add-form.liquid / pdp-color-family.liquid
│   │   └── ... ~75 snippets
│   ├── templates\
│   │   ├── index.json                  home (13 sections)
│   │   ├── collection.json / collection.collection.json  默认 + fallback
│   │   ├── collection.e-trike.json     e-trike collection (10+ sections)
│   │   ├── collection.e-bike.json      e-bike collection
│   │   ├── product.json / product.mf-25.json / product.front-basket-for-mf25.json
│   │   ├── product.pet-bag.json / product.trailer.json / product.rear-rack-bag.json
│   │   ├── page.about-us.json / page.contact.json / page.affiliate-program.json
│   │   ├── page.coming-soon.json / page.payment-plan.json / page.prime-day.json
│   │   ├── page.judgeme_all_reviews.liquid
│   │   ├── 404.json / article.json / blog.json / cart.json / list-collections.json
│   │   ├── password.json / search.json / gift_card.liquid
│   ├── layout\
│   │   ├── theme.liquid                全局 layout（**body 必须 display: block**）
│   │   └── password.liquid             密码保护页 layout
│   ├── config\
│   │   ├── settings_schema.json        主题 settings（color_scheme / typography / favicon / social_*-link）
│   │   └── settings_data.json          实际 settings 值
│   ├── blocks\                         Shopify 2.0+ theme app extension blocks（暂未广泛使用）
│   ├── locales\en.default.json         翻译（单语言英文站）
│   ├── _debug\                         临时 debug 截图（不要 commit）
│   └── README.md                       ← 本文件
│
├── maxfoot-theme\         ← LEGACY,只读参考,不编辑（deletion-safe）
│
└── dawn\                  ← Dawn 原始主题（Mavis 系统 workspace,不是 MaxFoot 工程）
    └── ... Dawn 原版
```

### 2.1 三个目录的边界

| 目录 | 角色 | 编辑？ | 用途 |
|---|---|---|---|
| `Desktop\MMX-REMIX` | **active** — 唯一编辑 | ✅ 改这里 | 本地 Git repo，push 到 `LONDOBELL3151/MMX-REMIX` |
| `Desktop\maxfoot-theme` | **legacy** — 备份 | ❌ 不要碰 | 早期 maxfoot 主题的副本，跟 MMX-REMIX 内容早就不同步 |
| `Desktop\dawn` | **Dawn 原版** | ❌ 不要碰 | 系统默认 workspace，Mavis 启动时 fallback 路径 |

**`workspace=Desktop\dawn` 不代表 MaxFoot 工程在那里**。改任何 MaxFoot 文件前，**先确认路径**：`cd C:\Users\Coulson\Desktop\MMX-REMIX`。

---

## 3. 品牌视觉 DNA

> 这是 MaxFoot 的视觉基因。**所有新 section 必须遵守**。

### 3.1 配色（硬规矩）

| Token | 值 | 用途 |
|---|---|---|
| `--color-primary` | `#121212` | 主黑 — 文字、按钮、heading、卡片底色（暗 sections） |
| `--color-accent` | `#FFC000` | 品牌黄 — CTA、accent 文字、highlight、hero badge |
| `--color-accent-dark` | `#E6AC00` | hover / secondary accent |
| `--color-text` | `#1A1A1A` | 正文黑 |
| `--color-text-soft` | `#6A6A6A` | 次要文字、meta |
| `--color-bg-soft` | `#F7F7F5` | 浅灰背景 — section 隔断 |
| `--color-border` | `#E5E5E5` | 边框 |

**用法**：
- 标题（h1-h6）：`var(--color-primary)`（`maxfoot-base.css:16`）
- heading 强调（用 `<em>`）：自动变 `var(--color-accent-dark)`（`maxfoot-base.css:24`）
- 强调用 `<strong>` / `<em>`，**不要用新的 class**
- 不要换 lectric 的蓝色，绝对

### 3.2 字体

| Token | 值 | 用途 |
|---|---|---|
| `--font-display` | `'Big Shoulders Display'` | 标题 / 数字 / 按钮 / hero title（大、超粗、几何感） |
| `--font-body` | `'Inter Tight'` | 正文 / meta / 描述 |
| `--font-mono` | `'JetBrains Mono'` | meta 小字 / 数字 / code |

**约定**：
- 所有 h1-h6 → `--font-display` + `font-weight: 900`（**强制**，即使 markdown 写 700 也被覆盖）
- 数字（stat number、按钮 label） → `--font-display` + uppercase
- 长段落正文 → `--font-body`
- 12px 以下的 meta / 数字 / code → `--font-mono`

### 3.3 视觉节奏

- **section padding**: 80px（`--section-padding-y`）
- **container max-width**: 1440px（`--page-width`）
- **container gutter**: 24px → 20px (≤990px) → 16px (≤560px)（`--gutter` 变量在 `maxfoot-responsive.css`）
- **border-radius**: `sm 4px / md 8px / lg 16px`（**默认微圆角**，**只有 hero 浮卡用 48px+**）
- **shadow**: `sm 0 1px 2px / md 0 4px 12px / lg 0 12px 32px`
- **transition**: `0.2s cubic-bezier(0.4, 0, 0.2, 1)`

### 3.4 标题层级

| 元素 | 字号 clamp | 用途 |
|---|---|---|
| h1 | 36-72px | page title（只在 main-*.liquid 的 page 标题用） |
| h2 | 28-48px | section 标题 |
| h3 | 22-32px | 卡片标题、subsection 标题 |
| h4 | 18-24px | 小标题 |
| h5 / h6 | 18 / 16px | 极少用 |

**所有标题强制**：`text-transform: uppercase` + `letter-spacing: -0.02em` + `line-height: 1.1`（由 `maxfoot-base.css:16` 强制）。

### 3.5 数字 outlined 风格（lectic 风）

lectric 的 4 个 stat 数字（"700k"、"A+"、"500+"、"5"）是大号 outlined 字符。**MaxFoot 复用这个模式**（6+ / 9+ / 85mi / 2yr）：

```css
font-family: var(--font-display);
font-weight: 900;
font-size: clamp(44px, 5vw, 72px);
line-height: 1;
letter-spacing: -.03em;
color: transparent;
-webkit-text-stroke: 2px var(--color-primary);
text-stroke: 2px var(--color-primary);
text-transform: uppercase;
```

**fallback**（老浏览器不支持 text-stroke）：
```css
@supports not (-webkit-text-stroke: 2px var(--color-primary)) {
  .about-floating-story__stat-num {
    color: var(--color-primary);
    -webkit-text-stroke: 0;
  }
}
```

### 3.6 跟 Lectric 的关键差异

| 维度 | 做法 |
|---|---|
| **品牌色** | 黑 + 黄 (#FFC000)。**绝不用蓝**。 |
| **圆角** | 微圆角 (8-16px)。**只有 hero 浮卡**用大圆角 (48px+)。 |
| **slogan** | "Built for real rides, not showroom rides." — 稳重、实用。不要 "Joy Seekers" / "Never Outgrow" 这种 lifestyle 口号。 |
| **创始人** | 不用私人梗、宠物狗梗。Founder 卡片用 "Built for the rest of us" 这种 **普通用户视角**。 |
| **节日营销** | 不堆 Prime Day / Black Friday 的全站轮播。**只留必要**（`page.prime-day.json` 是单独 template，不挂首页）。 |
| **数字** | 6+ / 9+ / 85mi / 2yr 这种**高识别度短数字**，不要写 "Over 6 years of experience" 这种长句。 |
| **CTA 文案** | 短直接："Shop Trikes" / "Read the journal" / "Subscribe"。不要 "Discover your perfect ride today" 这种套话。 |

---

## 4. 设计系统 Tokens

所有 token 在 `layout/theme.liquid` 的 `<style>` 块里（line 237-262）。**单一 source of truth，不要在 section 文件里再写一遍颜色/字体**。

### 4.1 颜色

```css
--color-primary: #121212;       /* 主黑 — 文字、按钮、heading */
--color-accent: #FFC000;        /* 主黄 — 品牌色 CTA、accent 文字、highlight */
--color-accent-dark: #E6AC00;   /* 深黄 — hover / secondary accent */
--color-bg: #FFFFFF;           /* 主背景 */
--color-bg-soft: #F7F7F5;       /* 浅灰背景 — section 隔断 */
--color-text: #1A1A1A;          /* 正文黑 */
--color-text-soft: #6A6A6A;     /* 次要文字 */
--color-border: #E5E5E5;        /* 边框 */
--color-success: #1F7A4D;       /* 成功 */
--color-danger: #C83A3A;        /* 错误 */
```

### 4.2 字体

```css
--font-display: 'Big Shoulders Display', system-ui, sans-serif;
--font-body: 'Inter Tight', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

### 4.3 排版 + 间距

```css
--font-size-base: 16px;
--page-width: 1440px;          /* 容器最大宽度 */
--section-padding-y: 80px;     /* section 默认上下 padding */
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 16px;
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
--shadow-md: 0 4px 12px rgba(0,0,0,0.08);
--shadow-lg: 0 12px 32px rgba(0,0,0,0.12);
--transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
```

### 4.4 按钮 (.btn)

```html
<a class="btn btn--primary">Shop Now</a>     <!-- 黑底白字 -->
<a class="btn btn--accent">Learn More</a>    <!-- 黄底黑字 -->
<a class="btn btn--ghost">Cancel</a>         <!-- 透明底黑边黑字 -->
<a class="btn btn--outline">More</a>          <!-- 同 ghost（不区分） -->
<a class="btn btn--sm">Quick</a>             <!-- 小尺寸 -->
<a class="btn btn--lg">Big CTA</a>            <!-- 大尺寸 -->
<a class="btn btn--block">Full Width</a>     <!-- display: flex; width: 100% -->
```

**单 CTA 原则**：每个 section / 卡 / 块只放一个主 `.btn`（通常是 `btn--primary` 或 `btn--accent`）。**不放 ghost 副按钮**，不放"See all"、"·"分隔、副链接。

> 例外：CTA 双块（about-cta 的 2 个 box）是允许的——它们代表 2 个**不同的转化路径**（"Shop" vs "Contact"），不是同一个 CTA 的 2 个按钮。

---

## 5. 工作思路 (开发哲学)

> 这章是**给 AI 兄弟**看的 — 怎么跟 Coulson 配合，怎么思考。

### 5.1 跟用户沟通的 5 条铁律

1. **直接给硬货，不空话**。
   - ✅ "功率跳 0 是 FUN_00009F6C 读 state+0x31a 单路的问题。修法 A 临时快修 / B 治本等两路同步再算。选哪个？"
   - ❌ "您好，我分析了一下您的 bug。让我详细解释一下..."

2. **技术细节给白话版或可执行总结二选一**。
   - 用户自述不懂代码但业务判断强。所以解释 BUG 时，要么"修车/收银员比喻"，要么"改 X 行/加 Y 字段"的可执行总结。
   - 不要把 Ghidra 反汇编 / HTTP 抓包原始数据直接甩给他。

3. **重要决策给 A/B/C 让用户拍板**。
   - 不要一次性问"你想怎么做"，而是给 3 个方案，标好 trade-off，让他选。
   - 例：bug 修复给 A 临时 / B 治本 / C 防御加固。

4. **拍板做完给白话总结 + 实物**。
   - 提交后告诉用户：改了哪些文件、关键 commit hash、实物（截图 / 新固件 / 部署 URL）。
   - 不要"已完成，请查收"这种空话。

5. **拒绝时温和但坚定，给替代方案**。
   - 做不到就说做不到，给限制原因和能做的部分。
   - 例：Playwright MCP 挂了 → 切到 web_fetch + node 脚本截图。

### 5.2 决策逻辑（5 个优先级）

| 优先级 | 原则 | 例子 |
|---|---|---|
| 1 | **数据说话，不记忆说话** | 用户截图打脸说"我搞错了" → 立刻 `Get-ChildItem` + `git log` 验真，**不基于"我之前记得"继续推断** |
| 2 | **设计 DNA > 一致性** | mileage 标题 `font-weight: 900` 不能为了跟 feature tabs 600 对齐改成 700 — 用 line-height 调 |
| 3 | **治本 > 快修** | 用户明确说"不止要快速能用，要治本"，B 方案优先 |
| 4 | **编辑可控 > 自动假设** | hero 媒体要"图片 OR 视频"（用户手动选），不要默认视频 + 写死 mp4 URL |
| 5 | **A/B 测试给选项** | 重要设计决策给 A/B/C 三个方案 + trade-off，让用户选 |

### 5.3 验证纪律（绝不妥协的 7 条）

> 来自 2026-07-09 / 10 两次降智事故。具体还原在 memory `MEMORY.md` 末段。

1. **Session 报 `workspace=Desktop\dawn` ≠ MaxFoot 工程在那里**。改任何 MaxFoot 文件前，先 cross-check `MMX-REMIX` + `maxfoot-theme` 两个 repo。
2. **用户报告"section 没显示"** → 优先怀疑 (a) GitHub integration 还没同步完 (1-3 分钟), (b) 浏览器缓存 (Ctrl+Shift+R), (c) section 在 editor 里被关。**最后才怀疑代码本身**。
3. **PowerShell `Get-ChildItem -Filter` 不可信**。**先 `Get-ChildItem dir -File` 看全目录再过滤**，尤其用户列了"具体文件"时。
4. **用户给截图打脸** → 立刻认错 + 跑 `Get-ChildItem` 看真状态，不要基于"我之前记忆"继续推断。
5. **改 schema / 加 section / 任何 commit 后，先 `git log --oneline -3` 自检**再向用户报告"已修好"，避免虚报。
6. **`commit amend + rebase --continue` 后必须 `git rev-parse HEAD^` 看 parent** — 确认 commit 真在 rebase base descendant 上。如果不是，需要 `git pull --rebase origin main` 清 stale state。
7. **删 Shopify 默认 templates 前先确认** `collection.json` / `product.json` / `page.json` / `index.json` 是 fallback，**绝对不能删**。删了 Shopify bot 会 auto-restore，但会让 git history 出现噪音 commit。

### 5.4 处理 "用户不懂但能听懂" 的技术解释

| 场景 | 修车比喻 | 收银员比喻 |
|---|---|---|
| 反编译固件 | 改装发动机，拆开看每个零件，但只有图纸 | — |
| Liquid settings 改名 | 改收银机的"折扣"按钮，从"折上折"改成"会员价" | 收银系统里商品价格的"标签"改个名 |
| Git rebase | 改行程，把"先到 A 再到 B"重排成"先到 B 再到 A"，最后一张票没动 | 整理收据，把今天的票重新按时间排 |
| CDN 缓存 | 顾客看菜单看到的是 1 小时前的版本，等新菜单送过来 | 橱窗里的菜单更新要等供应商印好送来 |
| `| t` default 陷阱 | 店里招牌是英文，但店里所有价签都按中文店规填的，你以为英文会是 fallback，其实没用 | 改"折上折"按钮名字没用，因为店里所有价签是按另一个规则显示的 |

---

## 6. 代码规范

### 6.1 Commit message 格式

**强制格式** (Conventional Commits):
```
<type>(<scope>): <subject>

<body>
```

**type**:
- `feat` — 新功能（section / page / template）
- `fix` — bug 修复
- `refactor` — 重构（不改行为）
- `docs` — 文档（README / memory）
- `style` — CSS / 格式化（不动 liquid 逻辑）
- `chore` — 杂项（vendor update / 注释 / force re-process）

**scope** (section 名 / 系统名 / 文件名):
- `about-floating-story` (单 section)
- `header` / `footer` / `main-collection` (单 section)
- `theme.liquid` (单文件)
- `MMX-REMIX` (跨多个)
- `validator` / `playwright` / `git` (工具)

**subject**:
- 简短（≤50 字符）
- 用动词现在时："add", "fix", "merge", "revert"
- 首字母小写

**body**:
- 解释 *为什么* 改，不是 *改了啥*（diff 自己能看到）
- 引用 issue / 用户原话 / commit reference

**示例**:
```
feat(about-floating-story): add big number + outlined style for lectric-level impact

User asked for stat numbers to match lectric's "700k / A+ / 500+ / 5" visual
level. Replaced 24px plain text with 64px outlined numbers using
-webkit-text-stroke. Card padding 36→48px, border-radius 32→48px.
```

### 6.2 文件命名规范

| 类型 | 命名 | 例 |
|---|---|---|
| Section | `kebab-case.liquid` | `about-floating-story.liquid` |
| Snippet | `kebab-case.liquid` | `product-card.liquid` |
| Template | `page.<handle>.json` | `page.about-us.json` |
| CSS (全局) | `maxfoot-<role>.css` | `maxfoot-base.css` |
| CSS (单页) | `page-<handle>.css` | `page-about-us.css` |
| CSS (单 section) | `section-<section-name>.css` | `section-mileage-tabs.css` |
| CSS (Dawn 组件) | `component-<name>.css` | `component-facets.css` |
| JS (全局) | `<role>.js` | `maxfoot.js`, `cart.js` |
| JS (单页) | `<role>.js` | `predictive-search.js` |
| Image asset | `<descriptive-name>.<ext>` | `maxfoot-logo.png`, `mf-30-hero.webp` |

### 6.3 命名 / 风格

**Liquid 变量**:
- `snake_case` 风格
- 简短、语义化
- 例：`card_product`, `section_blocks`, `promo_blocks`

**CSS class**:
- BEM-ish：`block__element--modifier`
- 例：`.product-card__media--placeholder`、`.about-floating-story__stat-num`、`.section--soft`
- 不用 snake_case、camelCase

**CSS 变量**:
- `--kebab-case`
- 颜色：`--color-*`
- 字体：`--font-*`
- 尺寸：`--*`（如 `--page-width`, `--gutter`, `--section-padding-y`）

**JS**:
- camelCase 变量：`cardProduct`, `navToggle`
- data attribute 全小写连字符：`data-mobile-menu`, `data-cart-count`

### 6.4 动 / 静态分离

**强约定**：CSS 全部走 `*.css` 文件，**不要在 `<div style="...">` 里塞大段 CSS**。
- 例外：动态值（Liquid 渲染的 `style="background-image:url({{ s.bg_image | image_url }})"`）允许
- 静态 layout / spacing / color / 排版规则必须走 class + CSS 文件

**为什么**：inline style 难 grep、难改、重复写。

### 6.5 Section 文件结构（标准模板）

```liquid
{%- liquid
  assign s = section.settings
  assign block_a = block.settings  # blocks 内部
-%}

<section class="my-section section-{{ section.id }}" {{ section.shopify_attributes }}>
  <div class="container">
    {%- comment -%} 主体内容 - 写清晰、加 comment 解释非显然的逻辑 {%- endcomment -%}
  </div>
</section>

<style>
  /* 当 CSS 必须依赖 Liquid 变量时（如颜色 / 媒体）才用 inline */
  .section-{{ section.id }} .my-section__el {
    background: {{ s.bg_color }};
  }
</style>

{% schema %}
{
  "name": "My Section",
  "tag": "section",
  "class": "section-my-section",
  "settings": [
    { "type": "text", "id": "title", "label": "Title", "default": "Default" }
  ],
  "blocks": [
    {
      "type": "item",
      "name": "Item",
      "limit": 6,
      "settings": [
        { "type": "text", "id": "name", "label": "Name" }
      ]
    }
  ],
  "presets": [
    { "name": "My Section" }
  ]
}
{% endschema %}
```

**约定**:
- `{{ section.shopify_attributes }}` 在外层 `<section>` 上（admin 标记用）
- 媒体字段必须有 `info` 字段说明推荐尺寸
- blocks 必带 `limit`
- 至少一个 `presets` 让 admin 能加新 section
- `class="section-xxx"` 让外部 CSS 可定位

---

## 7. Liquid 编码规范

### 7.1 Settings 读取模式

```liquid
{%- liquid
  assign s = section.settings
  # 块设置用：assign b = block.settings
  assign cols = s.columns | default: '3'
-%}
```

**约定**：
- 每个 section 第一行永远是 `{%- liquid assign s = section.settings -%}`
- 默认值用 `default:` filter（但要小心 §7.5 关于 `| t` default 的坑）
- 多行 liquid 用 `{%- ... -%}`（带连字符去空白）

### 7.2 Blocks 模式

```liquid
{%- for block in section.blocks -%}
  {%- if block.type == 'pillar' -%}
    <div class="about-pillar" {{ block.shopify_attributes }}>
      <h3>{{ block.settings.title }}</h3>
      <p>{{ block.settings.text }}</p>
    </div>
  {%- endif -%}
{%- endfor -%}
```

**约定**：
- `{{ block.shopify_attributes }}` 必须放在外层 wrapper 上
- 用 `case` 或 `if` 分发 block type（不写 default 兜底，让未识别 type 不渲染）
- block.settings 里的 image 用 `image_picker` 类型，liquid 读取用 `block.settings.icon | image_url: width: 240`

### 7.3 媒体处理 (image + video) — 统一模式

**先 video，再 image，最后 placeholder fallback**：

```liquid
{%- if s.bg_video_url != blank -%}
  <video src="{{ s.bg_video_url }}" {% if s.bg_image != blank %}poster="{{ s.bg_image | image_url: width: 1920 }}"{% endif %}
         autoplay muted loop playsinline preload="metadata"></video>
{%- elsif s.bg_image != blank -%}
  <img src="{{ s.bg_image | image_url: width: 1920 }}"
       srcset="{{ s.bg_image | image_url: width: 960 }} 960w, {{ s.bg_image | image_url: width: 1280 }} 1280w, ..."
       sizes="100vw"
       alt="" loading="lazy">
{%- else -%}
  <!-- placeholder CSS class -->
  <div class="section__placeholder">...</div>
{%- endif -%}
```

**字段命名约定**：
- 媒体对（image + video）用 `media_image` / `media_video_url`，或 `bg_image` / `bg_video_url`
- 单图用 `image`、`icon`、`logo`
- 不重复写 media_type select（用 if/elsif 优先级判断就够）

### 7.4 Settings / Schema 规范

#### 字节长度限制（**关键**）

| 字段 | 限制 |
|---|---|
| `header.content` | **50 字节** |
| `label` | **50 字节** |
| `info` | **150 字节** |

- **em-dash `—` (U+2014) 是 3 字节**，50 字符的 label 带 1 个 em-dash 就变 52 字节
- 用 `len(val.encode("utf-8"))` 算字节，不是 `len(val)`
- 错误信息误导性说"字符"，实际是字节
- 错误**只在 Shopify admin 后台日志**，不在 GitHub commit log
- **写完 section 必跑** `python C:\Users\Coulson\AppData\Roaming\npm\validate-about-schemas.py`

#### `info` 字段用法

每个媒体字段必带 `info`，告诉用户推荐尺寸和格式：

```json
{
  "type": "image_picker",
  "id": "media_image",
  "label": "Story image / video poster",
  "info": "Recommended: 1280×960 (4:3), JPG/PNG, <300KB. Used as video poster if video is set, otherwise as full media."
}
```

#### `default` 必填

每个有意义的文本字段都给 `default`（admin 加新 section 时不至于空白）。

#### Limit 数量

```json
{
  "type": "stat",
  "name": "Stat card",
  "limit": 6,  // ← blocks 永远加 limit
  "settings": [...]
}
```

### 7.5 `| t` filter 的坑

```liquid
{{ 'foo.bar' | t: default: 'fallback' }}  <!-- default 只在 locale 没这个 key 时才用 -->
```

- 一旦 `locales/en.default.json` 里有这个 key，Shopify 用 locale 值，**default 被忽略**
- MaxFoot 是单语言英文站 → **直接硬编码**，不用 `| t`
- 例外：像 `{{ 'general.electric_bike' | t: default: 'Electric Bike' }}` 这种通用短语可以加

**实际踩坑**：`snippets/product-card.liquid` 改 `"Shop now"` 时只改 default 没生效，根因是 `locales/en.default.json:548` 有 `"choose_options": "Choose Options"` 覆盖了。

### 7.6 Settings key 严格匹配 `settings_schema.json`

- `settings.social_facebook_link` (snippet) ↔ `"id": "social_facebook_link"` (schema)
- 错一个字符就**静默失败**（返回 blank）
- 改 schema 时必须同步 `grep -r "settings.X" sections/ snippets/` 看哪些文件用了

**实际坑**：`sections/footer.liquid` 早期漏 `_link` 后缀，5 个 social key 全错。

---

## 8. CSS 架构规范

### 8.1 文件分层

```
assets\
├── maxfoot-base.css         全局 reset + tokens + typography + .btn .container .section 等 primitives
├── maxfoot-components.css   全局组件（header/footer/hero/announcement/cart drawer...）
├── maxfoot-responsive.css   全局 media queries
├── page-about-us.css        /pages/about-us 11 sections 专属
├── section-mileage-tabs.css mileage-tabs section 专属
├── section-feature-tabs.css
├── section-reliability-trust-grid.css
├── section-why-features-grid.css
├── section-main-collection.css  /collections/* 用的 product grid
├── section-collection-banner.css
├── impact-cart-modal-dialog.css
├── component-blog-carousel.css
└── ... 其它 section 专属
```

**约定**：
- 通用样式进 `maxfoot-components.css` 或 `maxfoot-base.css`
- 单 section 专属样式进 `section-xxx.css` 或 `page-xxx.css`
- `maxfoot-responsive.css` 只放全局 media query（container padding / font size 等）

### 8.2 命名规范

- BEM-ish：`block__element--modifier`
- 颜色和尺寸用 token (var(--...))，不要 hardcode

### 8.3 通用 CSS 模式

#### Outlined 数字

```css
.ledc-stat-num {
  font-family: var(--font-display);
  font-weight: 900;
  font-size: clamp(44px, 5vw, 72px);
  line-height: 1;
  letter-spacing: -.03em;
  color: transparent;
  -webkit-text-stroke: 2px var(--color-primary);
  text-transform: uppercase;
}
```

#### 浮动卡片（在 hero 下方重叠）

```css
.floating-section {
  position: relative;
  z-index: 5;
  margin-top: -80px;  /* 与 hero 重叠 */
  padding: 0 0 16px;
}
@media (max-width: 990px) {
  .floating-section { margin-top: -56px; }
}
```

#### 视频/图片背景（带暗色 overlay）

```css
.bg-section {
  position: relative;
  background: var(--color-primary);  /* fallback 颜色 */
  overflow: hidden;
}
.bg-section__media { position: absolute; inset: 0; z-index: 0; overflow: hidden; }
.bg-section__media video,
.bg-section__media img { 
  position: absolute; inset: 0; 
  width: 100%; height: 100%; 
  object-fit: cover; display: block; 
}
.bg-section__overlay {
  position: absolute; inset: 0; z-index: 1;
  background: linear-gradient(180deg, rgba(0,0,0,.45) 0%, rgba(0,0,0,.7) 100%);
  pointer-events: none;
}
.bg-section__content { position: relative; z-index: 2; }
```

#### Mobile 横向 swipe carousel

```css
@media (max-width: BREAKPOINT) {
  .carousel {
    display: flex;
    overflow-x: auto;
    overflow-y: hidden;
    scroll-snap-type: x mandatory;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    gap: 0;
    margin: 0 calc(-1 * var(--gutter));
    padding-left: max(var(--gutter), calc((100vw - 85vw) / 2));
    padding-right: max(var(--gutter), calc((100vw - 85vw) / 2));
  }
  .carousel::-webkit-scrollbar { display: none; }
  .carousel > * {
    flex: 0 0 85vw;             /* 必须 vw, 不用 % */
    scroll-snap-align: center;  /* 居中 snap */
    margin-right: 4vw;
  }
}
```

#### Promo card (image fills entire card)

```css
.promo-card {
  position: relative;  /* grid 同行同高 */
  overflow: hidden;
  border-radius: var(--radius-md);
}
.promo-card__image {
  position: absolute; inset: 0;  /* 100% 填满 */
  width: 100%; height: 100%;
  object-fit: cover;
}
.promo-card__body {
  position: absolute; bottom: 0; left: 0; right: 0;
  padding: 24px;
  color: #fff;
  background: linear-gradient(180deg, transparent 0%, rgba(0,0,0,calc(0.7 * var(--overlay-alpha, 0.5))) 100%);
}
```

#### Overlay opacity 用 CSS 变量

```css
.promo-card__body { 
  background: linear-gradient(180deg, transparent, rgba(0,0,0, calc(0.7 * var(--overlay-alpha, 0.5))));
}
/* inline in section liquid:
   <div class="promo-card" style="--overlay-alpha: {{ s.overlay_opacity | divided_by: 100.0 }}"> */
```

**反直觉提示**：`opacity: 0.8` = div 80% 透明（更亮），不是 80% 黑。要用 `rgba(0,0,0, alpha)` 才是黑。

### 8.4 响应式断点

- `990px` — 平板/小桌面，常见 2-column → 1-column
- `560px` — 手机，进一步缩小 padding / 字号

---

## 9. JavaScript 规范

### 9.1 文件加载

`layout/theme.liquid:35-38` 加载顺序：
```liquid
<script src="{{ 'constants.js' | asset_url }}" defer="defer"></script>
<script src="{{ 'pubsub.js' | asset_url }}" defer="defer"></script>
<script src="{{ 'global.js' | asset_url }}" defer="defer"></script>
<script src="{{ 'maxfoot.js' | asset_url }}" defer="defer"></script>
```

**`maxfoot.js` 是 MaxFoot 自有的 vanilla JS**，所有自定义交互都在这里（mobile menu / cart count / form submit / search toggle / variant picker / etc.）。

### 9.2 maxfoot.js 模块结构（按行号段）

| 行 | 模块 | 说明 |
|---|---|---|
| 7-34 | Mobile menu | `data-mobile-menu` 开关，ESC 关闭 |
| 36-51 | Cart drawer | `data-cart-drawer` 开关（page 模式默认不开启） |
| 53-69 | Quantity selectors | `data-qty` +/- 按钮 |
| 70-92 | Variant picker (PDP) | swatch 切换 + 加车 |
| 93-101 | Search toggle | header 搜索按钮 |
| 102-110 | Cart line update via AJAX | drawer 模式 |
| 111-120 | Sort by | collection 排序下拉 |
| 121-149 | Mobile filter drawer | collection 筛选 |
| 150-152 | Newsletter inline submit | prevent default |
| 153-159 | Announcement bar marquee | 克隆内容无缝循环 |
| 160-173 | Header dropdown menus | desktop hover |
| 174-178 | Cart count badge | 实时更新 |
| 179-191 | Lazy load images | intersection fallback |
| 192-202 | Share button copy link | 复制 URL 到剪贴板 |
| 203-216 | Gallery thumbnail | PDP 缩略图点击 |
| 217-219 | Form: contact form | Shopify 接管 |
| 220-254 | ESC closes drawers | 全局 ESC 关闭所有 |
| 255-312 | Nav dropdown (submenu panel) | 每个 parent item 下的 submenu |
| 313-... | Reviews coverflow (3D) | 3D 旋转效果 |

### 9.3 编码规范

```js
(function () {
  'use strict';

  // ============ Module name ============
  const el = document.querySelector('[data-foo]');
  if (!el) return;
  el.addEventListener('click', () => { ... });

  // ============ Next module ============
  // ...
})();
```

**约定**：
- IIFE 包住避免污染全局
- `'use strict'`
- 用 `data-*` 属性找元素，**不要**依赖 className（className 是样式）
- 找不到元素 `if (!el) return;` 早退，不要抛错
- 用箭头函数（除非要 `this`）
- 模块间用 `// ============` 分隔（大写字母）

### 9.4 找元素 vs 找元素集合

```js
// 单个元素
const menu = document.querySelector('[data-mobile-menu]');

// 多个元素
const cartBtns = document.querySelectorAll('[data-cart-count-wrap]');
cartBtns.forEach((btn) => btn.addEventListener('click', openCart));
```

### 9.5 全局 cart 字符串（来自 theme.liquid）

```js
window.cartStrings = { error, quantityError };
window.variantStrings = { addToCart, soldOut, unavailable, ... };
window.accessibilityStrings = { ... };
window.routes = { cart_add_url, cart_change_url, ... };
window.shopUrl = '{{ request.origin }}';
```

JS 模块用这些全局字符串，不要自己 hardcode 英文。

### 9.6 调试时不要硬编码

**反例**:
```js
// ❌ 不要这样
const menuText = 'Open menu';
menuToggle.setAttribute('aria-label', 'Open menu');
```

**正例**:
```js
// ✅ 用 i18n 字符串（如果可能）
// 或 Liquid 直接渲染:
<button aria-label="{{ 'header.open_menu' | t: default: 'Open menu' }}">
```

---

## 10. Section 库（全部 90+）

按角色分类。所有 `sections/*.liquid` 都遵循 §6.5 的标准模板。

### 10.1 全局框架 (theme-wide)

| Section | 文件 | 用途 |
|---|---|---|
| `header-group.json` | (group) | 包含 announcement-bar + header，全局头部 |
| `footer-group.json` | (group) | 包含 footer，全局页脚 |
| `impact-overlay-group.json` | (group) | 弹窗/遮罩层（cart drawer / pop-up） |
| `header.liquid` | `sections/header.liquid` | 头部（sticky 76px） |
| `footer.liquid` | `sections/footer.liquid` | 页脚 |
| `announcement-bar.liquid` | `sections/announcement-bar.liquid` | 顶部滚动文字（marquee） |

### 10.2 Home (`templates/index.json`)

| Section key | Section type | 文件 | 说明 |
|---|---|---|---|
| hero | `hero` | `hero.liquid` | 大标题 + 副标题 + 按钮 + 视频/图背景 |
| trust | `trust-badges` | `trust-badges.liquid` | 4 个 trust icons (Buy Now / Secure / Free Ship / 2yr Warranty) |
| story | `brand-story` | `brand-story.liquid` | 品牌故事（hero 段） |
| proof | `proof-bar` | `proof-bar.liquid` | 4 个数字（黑底） |
| lineup | `featured-collection` | `featured-collection.liquid` | 3 个产品卡 (MF-25 / MF-30 / MF-33) |
| why | `why-maxfoot` | `why-maxfoot.liquid` | 3 个数字 pillar (100% / 2x / 2-7) |
| press | `press-quote` | `press-quote.liquid` | 媒体引述（黄底） |
| gallery | `gallery` | `gallery.liquid` | MaxFootLife 5 张图 |
| blog_feed | `blog-feed` | `blog-feed.liquid` | 3 篇 blog |
| riders | `reviews-coverflow` | `reviews-coverflow.liquid` | 5 个 review 3D coverflow |
| faq | `faq` | `faq.liquid` | 4 个 FAQ accordion |
| cta | `cta-strip` | `cta-strip.liquid` | 黄底 CTA "Ready to ride?" |
| newsletter | `newsletter` | `newsletter.liquid` | "$50 off first order" |

### 10.3 Collection Pages

#### `templates/collection.e-trike.json`（最重要的 collection 模板）

```
collection-banner → feature-tabs → main-collection
  → mileage-tabs → reliability-trust-grid → why-features-grid → faq
```

| Section key | Section type | 文件 | 说明 |
|---|---|---|---|
| collection-banner | `collection-banner` | `collection-banner.liquid` | collection 顶部大标题 |
| feature-tabs | `feature-tabs` | `feature-tabs.liquid` | 特性 tab 切换 |
| main-collection | `main-collection` | `main-collection.liquid` | **产品 grid（支持内嵌 promo card）** |
| mileage-tabs | `mileage-tabs` | `mileage-tabs.liquid` | 续航 tab 切换（title font-weight 900 硬规矩） |
| reliability-trust-grid | `reliability-trust-grid` | `reliability-trust-grid.liquid` | 可靠性 + 信任墙（黄底） |
| why-features-grid | `why-features-grid` | `why-features-grid.liquid` | 为什么选 + 特性 grid（媒体 4:3） |
| faq | `faq` | `faq.liquid` | FAQ |
| promo card (block) | `promo` (block) | `promo-card.liquid` snippet | 插在产品 grid 里的宣传卡（position 0-12） |

**main-collection 里的 promo card 是关键创新**：可以指定 `position: 0-N` 把卡片插在第 N 个产品位置，**模拟 lectric 的 image-tout 效果**。

### 10.4 Product Pages

`templates/product.json`：
```
main-product → collapsible-content (multiple rows) → related-products → multirow → text-module
```

`templates/product.mf-25.json` 等：单型号模板，可包含 `mf-pdp-*` 区块（gallery / complete-ride / accessory-bundles / banner）。

### 10.5 About Us

11 个 sections — 详见 [附录 A](#附录-a-about-us-11-sections-详解)。

### 10.6 Page Templates (其他)

| 模板 | 用途 |
|---|---|
| `page.about-us.json` | 关于我们（11 sections） |
| `page.contact.json` | 联系我们（表单 + 时区） |
| `page.affiliate-program.json` | 联盟营销 |
| `page.coming-soon.json` | 即将推出 |
| `page.payment-plan.json` | 付款计划 |
| `page.prime-day.json` | Prime Day 营销（**不挂首页**，单独 template） |
| `page.test-page.json` | 测试用 |
| `page.judgeme_all_reviews.liquid` | Judge.me 全部评价 |
| `page.media.json` | 媒体页 |

### 10.7 所有 section 一览（按字母序）

<details>
<summary>点击展开全部 90+ section 列表</summary>

| 文件 | 角色 |
|---|---|
| `about-cta.liquid` | about-us CTA 2 大色块 |
| `about-floating-stats.liquid` | about-us DEPRECATED 旧 stats 段 |
| `about-floating-story.liquid` | about-us stats + story 合并卡 ⭐ |
| `about-founder.liquid` | about-us 创始人卡片 |
| `about-hero.liquid` | about-us hero（视频支持） |
| `about-mission-pillars.liquid` | about-us 4 根支柱 |
| `about-newsletter.liquid` | about-us 邮件订阅（dark） |
| `about-pillars.liquid` | about-us 6 张黑底卡 |
| `about-stats.liquid` | about-us 旧 stats 段 |
| `about-story.liquid` | about-us 旧 story 段 |
| `about-story-grid.liquid` | about-us 2-column text+media |
| `about-timeline.liquid` | about-us 时间线 |
| `about-trust-strip.liquid` | about-us 6 个 logo 信任 |
| `accordion-module.liquid` | accordion 通用 |
| `aannouncement-bar.liquid` | **typo** 版本（typo 文件，勿用） |
| `announcement-bar.liquid` | 顶部滚动文字 |
| `apps.liquid` | app 集成预留位 |
| `bicycle-collection.liquid` | 老式 collection |
| `bicycle_tabs.liquid` | 老式 tabs |
| `bike-spec-info.liquid` | bike 规格信息 |
| `blog-feed.liquid` | blog feed 模块 |
| `blog-hero.liquid` | blog hero |
| `brand-story.liquid` | 品牌故事 |
| `cart-drawer.liquid` | 购物车 drawer |
| `cart-icon-bubble.liquid` | cart icon 角标 |
| `cart-live-region-text.liquid` | a11y live region |
| `cart-notification-button.liquid` | add-to-cart 通知按钮 |
| `cart-notification-product.liquid` | add-to-cart 通知产品 |
| `collage.liquid` | collage layout |
| `collapsible-content.liquid` | Dawn 原版 collapsible |
| `collection-banner.liquid` | collection 顶部大标题 |
| `collection-list.liquid` | collection 列表 |
| `contact-form.liquid` | 联系表单 |
| `cta-strip.liquid` | CTA 条 |
| `custom-announcement-bar.liquid` | 自定义 announcement |
| `custom-liquid.liquid` | 通用 liquid 容器 |
| `email-signup-banner.liquid` | 邮件订阅 banner |
| `faq.liquid` | FAQ accordion |
| `featured-blog.liquid` | 精选 blog |
| `featured-collection.liquid` | 精选产品 |
| `featured-product.liquid` | 精选单产品 |
| `featured-products-container.liquid` | 容器（deprecated） |
| `feature-tabs.liquid` | 特性 tab 切换 |
| `footer.liquid` | 页脚 |
| `fourSquares_feature.liquid` | 4 方格 feature |
| `fourSquares_icon.liquid` | 4 方格 icon |
| `gallery.liquid` | MaxFootLife gallery |
| `graphic-module.liquid` | graphic 模块 |
| `header.liquid` | 头部 |
| `hero.liquid` | hero |
| `Home-Article.liquid` | 首页 article 块（中文命名，legacy） |
| `Home-BikeTab.liquid` | 首页 bike tab（中文命名） |
| `Home-ContactFrom.liquid` | 首页 contact form |
| `Home-ImageText.liquid` | 首页 image+text |
| `Home-PhotoWall.liquid` | 首页 photo wall |
| `Home-SlideShow.liquid` | 首页 slideshow |
| `image-banner.liquid` | 图片 banner |
| `image-text-box.liquid` | image+text box |
| `image-text-stack-group.liquid` | 多图文堆叠（中文 schema） |
| `image-with-text.liquid` | image+text |
| `impact-carousel-icon-img.liquid` | impact cart 轮播 |
| `impact-cart-modal-dialog.liquid` | impact cart 弹窗 |
| `impact-featured-collection.liquid` | impact cart featured collection |
| `impact-featured-collection-buy.liquid` | impact cart buy |
| `impact-swiper-video.liquid` | impact cart 视频 swiper |
| `judgeme_carousel_section.liquid` | Judge.me 评价轮播 |
| `main-404.liquid` | 404 page |
| `main-account.liquid` | 账户 page |
| `main-activate-account.liquid` | 激活账户 page |
| `main-addresses.liquid` | 地址 page |
| `main-article.liquid` | 文章 page |
| `main-blog.liquid` | blog page |
| `main-cart-footer.liquid` | cart 页底部 |
| `main-cart-items.liquid` | cart 页商品 |
| `main-collection.liquid` | **主 collection grid** ⭐（含 promo block） |
| `main-collection-banner.liquid` | collection banner |
| `main-collection-product-grid.liquid` | Dawn 原版 product grid |
| `main-list-collections.liquid` | collection 列表 page |
| `main-login.liquid` | 登录 page |
| `main-order.liquid` | 订单 page |
| `main-page.liquid` | 通用 page |
| `main-password-footer.liquid` | 密码页底部 |
| `main-password-header.liquid` | 密码页头部 |
| `main-product.liquid` | **主 product page** |
| `main-register.liquid` | 注册 page |
| `main-reset-password.liquid` | 重置密码 page |
| `main-search.liquid` | 搜索 page |
| `mf-pdp-accessory-bundles.liquid` | PDP 配件组合 |
| `mf-pdp-banner.liquid` | PDP banner |
| `mf-pdp-complete-ride.liquid` | PDP complete ride |
| `mf-pdp-gallery.liquid` | PDP gallery |
| `mileage-tabs.liquid` | 续航 tab（**title font-weight 900**） |
| `multicolumn.liquid` | 多列 |
| `multi-product-module.liquid` | 多产品模块 |
| `multirow.liquid` | 多行 |
| `newsletter.liquid` | 邮件订阅 |
| `page.liquid` | page fallback |
| `pickup-availability.liquid` | 门店自提可用性 |
| `pop-up.liquid` | 弹窗 |
| `predictive-search.liquid` | 预测搜索 |
| `press-quote.liquid` | 媒体引述 |
| `product-recommendations.liquid` | 产品推荐 |
| `proof-bar.liquid` | 数字 proof bar |
| `regedit-form.liquid` | 注册 form |
| `related-products.liquid` | 相关产品 |
| `reliability-trust-grid.liquid` | 可靠性 + 信任墙 |
| `reviews-coverflow.liquid` | 3D 评价 coverflow |
| `rich-text.liquid` | rich text 块 |
| `rider-testimonials.liquid` | 骑手评价 |
| `slide-bar.liquid` | slide bar |
| `slideshow.liquid` | Dawn 原版 slideshow |
| `slideshow-2.liquid` | Dawn 原版 v2 |
| `swiper_banner.liquid` | swiper banner |
| `swiper-graphic.liquid` | swiper graphic |
| `tab-products.liquid` | tab 产品 |
| `text-module.liquid` | text 模块 |
| `trust-badges.liquid` | trust badges |
| `video.liquid` | 视频 section |
| `why-features-grid.liquid` | why + features grid |
| `why-maxfoot.liquid` | why maxfoot 3 pillar |

</details>

---

## 11. Page 模板（全部 25+）

| Template | 用途 | Sections |
|---|---|---|
| `index.json` | Home | 13 sections (hero, trust, story, proof, lineup, why, press, gallery, blog, riders, faq, cta, newsletter) |
| `collection.json` | 默认 collection | Dawn 默认 |
| `collection.e-trike.json` | **e-trike collection**（最重要） | 10+ sections (collection-banner, feature-tabs, main-collection, mileage-tabs, reliability, why, faq) |
| `collection.e-bike.json` | e-bike collection | 复用 e-trike 结构 |
| `collection.collection.json` | collection fallback | Dawn 默认 |
| `product.json` | 默认 product | main-product + collapsible + related |
| `product.mf-25.json` | MF-25 型号 | 包含 mf-pdp-* |
| `product.front-basket-for-mf25.json` | 配件 | 单产品 |
| `product.pet-bag.json` / `product.trailer.json` / `product.rear-rack-bag.json` | 配件 | 单产品 |
| `page.about-us.json` | **About Us（11 sections，详见附录 A）** | 11 sections |
| `page.contact.json` | 联系我们 | contact-form + 时区 |
| `page.affiliate-program.json` | 联盟营销 | rich-text + form |
| `page.coming-soon.json` | 即将推出 | 简单 |
| `page.payment-plan.json` | 付款计划 | rich-text |
| `page.prime-day.json` | Prime Day | **单独 template，不挂首页** |
| `page.test-page.json` | 测试 | 各种 sections |
| `page.judgeme_all_reviews.liquid` | Judge.me 全部评价 | liquid page |
| `page.pormo.json` / `page.register-page.json` / `page.reviewp.json` / `page.get-your-special-discount.json` | 各种 landing | 各种 |
| `page.sign-up-for-new-model.json` | 新型号登记 | form |
| `page.media.json` | 媒体页 | gallery |
| `404.json` | 404 | main-404 |
| `article.json` | 文章 | main-article |
| `blog.json` | blog 列表 | main-blog |
| `cart.json` | 购物车 | main-cart-* |
| `list-collections.json` | collection 列表 | main-list-collections |
| `password.json` | 密码页 | main-password-* |
| `search.json` | 搜索结果 | main-search |
| `gift_card.liquid` | 礼品卡 | Dawn 原版 |

---

## 12. Product Card 完整规范

### 12.1 两种 product card

| Snippet | 用途 |
|---|---|
| `product-card.liquid` | **主 card**（自定义版）。有 rating / specs / price-save / "Shop now" CTA。Collection 页面用 |
| `maxfoot-collection-card-product.liquid` | Dawn 原版 card。Checkout / fallback 用 |

**约定**：collection 页面（grid 里）用主 card（更信息密集）。checkout 附近用 Dawn 版（更轻量）。

### 12.2 Product card metafields 读取

```liquid
{%- if card_product.metafields.motor.wattage -%}
  {{ card_product.metafields.motor.wattage }}W
{%- else -%}
  750W  ← fallback
{%- endif -%}
```

**Metafields 命名**：
- `motor.wattage` — 电机功率
- `battery.range` — 续航（mi）
- `specs.payload` — 载重（lb）

### 12.3 Rating 数据源（按优先级）

`product-card.liquid` 优先级：Judge.me > Reviews > Loox > Yotpo

```liquid
{%- if card_product.metafields.judgeme.rating -%}
  ...
{%- elsif card_product.metafields.reviews.rating.value -%}
  ...
{%- elsif card_product.metafields.loox.avg_rating -%}
  ...
{%- elsif card_product.metafields.yotpo.reviews_average -%}
  ...
{%- endif -%}
```

如果 Judge.me 安装了但没评价，渲染隐藏 row 保持 layout 一致（不抖动）。

### 12.4 "Shop now" vs "Add to Cart"

```liquid
{%- if card_product.has_only_default_variant == false -%}
  Shop now
{%- else -%}
  {{ 'product.add_to_cart' | t: default: 'Add to Cart' }}
{%- endif -%}
```

**逻辑**：只有一个 default variant 才能直接加购物车；多 variant 必须跳产品页选规格。

### 12.5 Card 改文案的正确位置

1. 想改 `product-card.liquid:142` "Shop now" → 改 `snippets/product-card.liquid`，**不要改 `| t` default**（locale 文件会覆盖）
2. 想改 `Add to Cart` → 改 `locales/en.default.json` 的 `products.product.add_to_cart`

---

## 13. 全局组件

### 13.1 Header (sections/header.liquid)

- **关键**：`sticky_header` setting (default: true) + 内联 `<style>` 让 section wrapper 也 sticky
- **Logo**: `s.logo` > `settings.logo` > `shop.name` 文本 fallback
- **菜单**: blocks，每个 block = 一个 menu (link_list)
- **Submenu**: 自动从 menu link depth 检测（`link.links.size > 0`）
- **Mobile menu**: 独立的 `<aside id="MobileMenu">` 在 header 元素外
- **必带 setting**: `sticky_header` (default true), `show_search` (default true), `show_account` (default true), `logo_height` / `logo_height_mobile`

**Sticky 实现**（§6 + §8 + §13 联动）:
1. `layout/theme.liquid` body 必须是 `display: block`（**不是 grid**）
2. `sections/header.liquid` 内联 `<style>`:
   ```liquid
   {%- if s.sticky_header -%}
   .shopify-section.section-header:has(> .header--sticky){position:sticky;top:0;z-index:100;background:#fff}
   {%- endif -%}
   ```
3. `header` 元素加 `class="header header--sticky"` (当 setting true)
4. CSS 用 `:has()` 让 section wrapper 也 sticky（这样 containing block = body，不是 77px section）

### 13.2 Footer (sections/footer.liquid)

- **Brand col**: logo + tagline + 5 social icons
- **Menu cols**: blocks，每个 block 一个 link_list menu
- **Newsletter col**: 内嵌 `{% form 'customer' %}`（Shopify customer 表单）
- **Bottom**: copyright + payment icons (loop `shop.enabled_payment_types`)

**关键 schema 字段**:
- `footer_logo` (image_picker)
- `tagline` (textarea)
- `show_social` (checkbox, default true)
- `show_payment_icons` (checkbox, default true)
- `copyright_text` (text)

**Social 链接**（**重点**）:
- 用 `settings.social_facebook_link` (有 `_link` 后缀)
- `settings.social_instagram_link`、`twitter_link`、`youtube_link`、`tiktok_link`
- 漏 `_link` 后缀 → 静默失败 → 整个 footer social 区域不显示

### 13.3 Announcement Bar (sections/announcement-bar.liquid)

- **Marquee**: `enable_marquee` (default true) + `data-marquee` + CSS 动画
- **Block type**: `message` (新) / `announcement` (legacy) — 两种都支持
- **Dot**: 黄色 `·` 分隔符

### 13.4 Cart Drawer (snippets/cart-drawer.liquid)

- **触发**: `data-cart-drawer` 元素
- **关闭**: `data-cart-drawer-close` 元素 + ESC
- **AJAX 更新**: `impact-cart-modal-dialog.js` 处理（drawer 模式开启时）
- **Page 模式**: 默认导航到 `/cart`

### 13.5 Search

- Header 搜索按钮 `data-search-toggle` → 展开 predictive search
- Predictive search 由 `snippets/predictive-search.liquid` + `assets/predictive-search.js` 处理
- Setting: `predictive_search_enabled` 控制是否加载

---

## 14. App 集成

### 14.1 Impact-cart（购物车 app）

**作用**：增强购物车弹窗、推荐配件、quick-add。

**Files**:
- `sections/impact-cart-modal-dialog.liquid` — 弹窗主容器
- `sections/impact-featured-collection.liquid` — 推荐配件
- `sections/impact-featured-collection-buy.liquid` — 推荐带 buy 按钮
- `sections/impact-swiper-video.liquid` — 视频 swiper 推荐
- `sections/impact-carousel-icon-img.liquid` — icon 轮播
- `snippets/impact-*.liquid` (~12 个) — 各种 product variant / quick-add 组件
- `assets/impact-*.css` / `assets/impact-*.js`

**Section group**: `impact-overlay-group.json` 包含 modal dialog，作为全局 overlay 渲染（layout/theme.liquid:414）

**加载**:
```liquid
{%- sections 'impact-overlay-group' -%}
<script src="{{ 'impact-cart-modal-dialog.js' | asset_url }}" defer="defer"></script>
```

### 14.2 Judge.me（评价 app）

**作用**: 评分、reviews、photo reviews

**Files**:
- `sections/judgeme_carousel_section.liquid` — review 轮播
- `snippets/judgeme_all_reviews.liquid` — 全部 review page
- `snippets/judgeme_core.liquid` / `judgeme_widgets.liquid` — 核心 widget

**数据接入**:
- `product.metafields.judgeme.rating`
- `product.metafields.judgeme.review_count`
- 优先级最高（`product-card.liquid` §12.3）

**Page**: `page.judgeme_all_reviews.liquid`

### 14.3 Pagefly（landing page builder，legacy）

**Files**:
- `snippets/pagefly-app-header.liquid`
- `snippets/pagefly-main-css.liquid`
- `snippets/pagefly-main-js.liquid`
- `snippets/pagefly-render-section.liquid`
- `snippets/pf-image-render.liquid`

**状态**: legacy，不主动开发新 Pagefly 页。已存在的 Pagefly 页保留。

### 14.4 自定义 blocks/ folder

`blocks/` 目录是 Shopify 2.0+ theme app extension blocks（不常用）。当前有 2 个 AI 生成 block（`ai_gen_block_*.liquid`）。

---

## 15. 踩过的坑（20+ 条）

> 这里列**完整**的 bug 根因 + 修法。新加的坑也补到这里。

### 15.1 Shopify schema 按**字节**算长度（不是字符）
- `header.content` ≤ 50 字节,`label` ≤ 50 字节,`info` ≤ 150 字节
- em-dash `—` 是 3 字节,50 字符 + 1 em-dash = 52 字节 → 校验失败
- 错误**只在 Shopify admin 后台日志**,不在 GitHub commit log
- 防御:跑 `validate-about-schemas.py` (在 `C:\Users\Coulson\AppData\Roaming\npm\`)

### 15.2 `body { display: grid }` 破坏 sticky header
- 表现:header `position: sticky; top: 0` 不工作,scroll 时跟着跑
- 根因:grid item 的 containing block 是它的 grid track,track 高度 = `auto` = content 高度 = header 高度(77px)。Sticky 元素只能 stick 在 77px 内
- 修法:`layout/theme.liquid` 里 body 必须是 `display: block`
- 验证:`getComputedStyle(body).display` 应该是 `"block"` 而不是 `"grid"`

### 15.3 Section wrapper 也要 sticky
- header 在 `<section class="shopify-section section-header">` 内,section wrapper 高度 = header 高度
- 即使 body 是 block,header 的 containing block 是 77px 的 section,sticky 失败
- 修法:让 section wrapper 也 sticky(通过 `:has(> .header--sticky)` CSS 选择器)
- **最可靠**: 把 CSS 内联到 `sections/header.liquid` 的 `<style>` 块

### 15.4 `| t` filter 的 `default:` 不可靠
- `default:` 只在 locale 没这个 key 时才用
- 一旦 `locales/en.default.json` 里有,Shopify 用 locale 值,**default 被忽略**
- MaxFoot 是单语言英文站 → **直接硬编码**,不用 `| t`(除了 `general.electric_bike` 这类通用短语)

### 15.5 `settings.X` key 名必须严格匹配 `settings_schema.json`
- MaxFoot 的 `sections/footer.liquid` 早期漏写 `_link` 后缀(`social_facebook` vs `social_facebook_link`)
- 静默失败:返回 blank → 整段不渲染
- 改 schema 时必须同步 grep 所有用到这个 key 的 liquid 文件
- 用 `validate-about-schemas.py` 也能发现

### 15.6 rebase 时 vim 弹出阻塞
- `git rebase --continue` 会打开 vim 让你确认 commit message
- 在 PowerShell 远程执行时 vim 会卡死
- 解决 1:设置 `GIT_EDITOR=true` 或 `git rebase --continue --no-edit`
- 解决 2:看到 vim 弹出来立即 `:q!` 退出
- 解决 3:`git rebase --abort` 重做
- 解决 4:直接 `git push --force-with-lease`(force push,bot commit 没意义)

### 15.7 Shopify GitHub 整合经常卡
- 表现:`git push` 后 5+ 分钟 CDN 仍返回旧 HTML
- 检查:`git fetch origin main` 看有没有 `Update from Shopify for theme MMX-REMIX/main` 这种 bot commit
- 如果 5+ 分钟没动 bot commit → 整合挂了
- 解决:让用户在 Shopify admin → Themes → MMX-REMIX → "Re-import from GitHub" 手动触发
- **新发现**: `git push --force-with-lease` 经常能强制触发 bot 重新处理

### 15.8 PowerShell `Get-ChildItem -Filter` 不可信
- `Get-ChildItem dir -Filter "*.json"` 在某些 PowerShell 版本会过滤错误
- 习惯用 `Get-ChildItem dir -File` 看全目录再过滤

### 15.9 `<img>` 在空 src 时显示破图
- 不要写 `<img src="">` → 会显示破图
- 永远用 `{% if image != blank %}<img ...>{% endif %}`

### 15.10 Dawn `div:empty { display: none }` 让空 div 消失
- 写空 overlay div 时,Shopify 不会显示
- 修法:`display: block !important` 或塞个非空子元素

### 15.11 不要删 Shopify 默认 templates
- 删 `collection.json` / `product.json` / `page.json` / `index.json` 后,Shopify bot 会 auto-restore,但 git history 出现噪音 commit
- 这些是 fallback,**绝对不能删**

### 15.12 workspace ≠ MaxFoot 工程目录
- 系统默认 workspace 是 `C:\Users\Coulson\Desktop\dawn`,**不是** MMX-REMIX
- 改任何文件前**先确认路径**:`cd C:\Users\Coulson\Desktop\MMX-REMIX`

### 15.13 改 schema 后要重新 import
- 改了 section 文件的 schema,Shopify admin 里旧的 section instance 可能还引用旧字段
- 解决:在 admin 里删除旧 section,重新添加;或 "Reset to default" button

### 15.14 不要在 inline style 里塞大段 CSS
- 老代码有些 section 用 `style="display:grid;grid-template-columns:..."` 等十几行 inline
- 改不动,grep 不到,重复写
- 修法:抽到 CSS 文件,只剩 `style="..."` 留给真正动态的值

### 15.15 Liquid filter split 跟 `}` 冲突
- `{{ X | split: '{amount}' }}` 中含 `}` 会让 Liquid parser 提前终止
- **修法**: `{% assign placeholder = '{amount}' %}` 然后 `{{ X | split: placeholder }}`
- validator (`validate-about-schemas.py` 在 `AppData\Roaming\npm\`) 加了规则

### 15.16 Liquid filter 在 if 里的特殊语法
- `{% if X starts_with Y %}` 和 `{% if X | starts_with: Y %}` 是**两种**语法,后者支持变量,前者**只**支持字符串字面量
- 报错 `Expected end_of_string but found id` 通常就是这个
- 统一用 pipe form: `{% if X | starts_with: Y %}`（**唯一安全的统一形式**）

### 15.17 Flex-basis 在 row↔column 切换时变方向
- `flex: 1 1 480px` 在 row 是横向基准,在 column 变纵向基准 → 移动端 header 高度爆炸
- 修法: media query 里 reset `flex: 0 0 auto`
- 更稳: 用 `flex: 1 1 auto` + 显式 `width: 480px; max-width: 100%`

### 15.18 `<img src="">` 在 Dawn mobile 切 row→column 时
- 与 §15.17 同根因，写 mobile 样式要测试实际尺寸

### 15.19 mileage-tabs title font-weight 是 DNA，不能动
- maxfoot 设计 DNA = title font-weight 900
- 想"对齐视觉间距"时改 line-height / margin，**不要**改 font-weight

### 15.20 settings_schema 改后要 sync
- 改 schema 后 Shopify admin 里 section instance 还引用旧 ID → silent blank
- 解决: 让用户 admin → "Reset to default" 或删除 section 重加

### 15.21 Bot commit 改 SHA 后 integration 不重拉
- `git rebase` 把 commit 的 parent 改了,Shopify bot 的内部 SHA 跟踪 stall
- 解决: Shopify admin → Apps → GitHub integration → "从 GitHub 重新导入模板文件"

### 15.22 Playwright MCP 当前坏了
- `mavis mcp call playwright browser_evaluate --stdin` 报 `Cannot find module 'H:\MiniMax Code\resources\resources\daemon\cli.js'`
- 替代: `web_fetch` + node 脚本做 verification

### 15.23 Bash heredoc / `&&` 在 PowerShell 远程执行会乱
- 必须用 PowerShell 语法（`;`, `Get-ChildItem`, `Select-String`）
- 不要 `cmd && cmd`、`ls -la`、`head`、`tail`

---

## 16. 验证工具

### 16.1 `validate-about-schemas.py` ⭐ 必跑

**位置**: `C:\Users\Coulson\AppData\Roaming\npm\validate-about-schemas.py`

**跑**:
```powershell
python C:\Users\Coulson\AppData\Roaming\npm\validate-about-schemas.py
```

**检查**:
1. 所有 `sections/about-*.liquid` 的 `{% schema %}` 块是合法 JSON
2. liquid 里用的 `s.X` / `block.settings.X` 在 schema 里都有定义
3. 所有 `header.content` / `label` / `info` 字段**字节数** ≤ Shopify 限制
4. template `page.about-us.json` 里的 section type / block type / setting id 都在对应 schema 里

**新写 section 必跑**。Commit 之前跑一次。

### 16.2 其他辅助工具

- `check-bytes.py` — 单独检查字段字节数
- `check-founder.py` / `check-founder2.py` — 调试特定 section
- `shoot.js` / `shoot2.js` — Playwright 截图（**当前 Playwright 挂了**，待修）
- `test-sticky*.js` (5 版本) — Playwright sticky header 验证
- `fectch-lectric-about.js` — fetch lectric eBikes /pages/about-us HTML
- `resolve-conflict.py` — 解决 git rebase 冲突（如 template JSON 有 `<<<<<<< HEAD` 标记）

### 16.3 git 操作最佳实践

```powershell
# 改之前先看 status 和 diff
cd C:\Users\Coulson\Desktop\MMX-REMIX
git status
git diff

# 改完本地验证
python C:\Users\Coulson\AppData\Roaming\npm\validate-about-schemas.py

# 提交（带详细 message）
git add -A
git commit -m "feat(scope): short description

Longer explanation if needed."

# 推送
git fetch origin main  # 先看下有没有 bot commit
git rebase origin/main  # 如果有
git push origin main    # 如果 push rejected
# 如果 rebase 一直冲突 → git push --force-with-lease origin main
```

---

## 17. 常见任务模板

### 17.1 改文案 / 数字

1. `cd C:\Users\Coulson\Desktop\MMX-REMIX`
2. 找对应 section 文件 (`sections/*.liquid` 或 `templates/*.json`)
3. 改 default 值（**不要**改 `| t` default，locale 文件会覆盖）
4. 改完跑 `python C:\Users\Coulson\AppData\Roaming\npm\validate-about-schemas.py`
5. `git add -A && git commit -m "fix(...): ..." && git push origin main`
6. 等 5+ 分钟看 CDN（如果还卡让用户手动 re-import）

### 17.2 加新 section

1. 仿造相似 section 的结构（推荐 `about-floating-story.liquid` 或 `main-collection.liquid`）
2. 写对应的 CSS（参考其他 section 的命名 class）
3. 在 `templates/*.json` 加 section 配置
4. 在 `assets/section-xxx.css` 或 `assets/page-xxx.css` 加样式
5. 跑 `validate-about-schemas.py` 验证 schema 合法
6. commit + push

### 17.3 加新 page template

1. 复制相似 template（如 `page.about-us.json`）到 `page.xxx.json`
2. 配 sections
3. Shopify admin 里 Create new page → 选 template = xxx

### 17.4 加新 snippet

1. 写 `snippets/xxx.liquid`
2. 在要用的 section / template 用 `{% render 'xxx', param: value %}`
3. snippet 不需要 schema，但 snippets 写好就 commit

### 17.5 修样式（CSS）

1. 找对应 CSS 文件（`maxfoot-components.css` / `section-xxx.css` / `page-xxx.css`）
2. 改 class
3. **如果 Shopify 整合不重 process**（CDN 仍返回旧 CSS）：
   - 改一个 literal value 强制 hash 变（trick: 加个 `/* comment */` 或改一个数字）
   - 或 inline CSS 到 section liquid 的 `<style>` 块
   - 或 `git push --force-with-lease` 触发重 process
4. commit + push

### 17.6 修 Liquid 逻辑

1. 找对应 `.liquid` 文件
2. 改逻辑
3. **如果用了 `| t`**，确认改的不是 `| t` default
4. commit + push

### 17.7 加新 product metafield

1. Shopify admin → Settings → Metafields → Products
2. 加 definition（namespace.key）
3. 给相关 product 填值
4. 在 `snippets/product-card.liquid` 用 `card_product.metafields.<namespace>.<key>`

### 17.8 改全局 token（颜色/字体）

1. 改 `layout/theme.liquid` 的 `<style>` 块 (line 237-262)
2. **所有** section / page 立即生效（因为都从 `var(--xxx)` 读）
3. commit + push

---

## 18. 问题排查 (troubleshooting)

### 18.1 Section 不显示

| 排查步骤 | 工具 |
|---|---|
| 1. 文件存在 + 路径对？ | `Get-ChildItem sections/xxx.liquid` |
| 2. Schema 合法？ | `python validate-about-schemas.py` |
| 3. Template 里的 section type 在 sections/ 有对应文件？ | `grep "type": templates/xxx.json` vs `Get-ChildItem sections/*.liquid` |
| 4. Block type 在 section schema 里存在？ | `grep "type":` 在 schema 块里 |
| 5. Setting id 在 schema 里存在？ | `grep "id":` |
| 6. 看 Shopify admin 后台日志 | admin → Settings → Apps → GitHub integration → "从 GitHub 重新导入模板文件" 看输出 |

### 18.2 样式不对

| 症状 | 排查 |
|---|---|
| 完全不显示 | CDN 缓存没更新 / `display: block !important` 缺失 / `div:empty` 隐藏 |
| 错位 | 检查 body display: block (不是 grid) |
| 字体不对 | 检查是否漏 `--font-display` 等 token |
| 移动端高度爆炸 | flex-basis 在 column 方向变纵向基准（§15.17） |
| Card 不居中 | carousel 用 `85vw` 不用 `85%`（§8.3） |
| Card 偏 8px | `margin: 0 -24px` 硬编码，匹配 `var(--gutter)` |

### 18.3 Git 问题

| 症状 | 排查 |
|---|---|
| Push rejected | `git fetch origin main` + `git rebase origin/main` |
| Rebase vim 卡死 | `git rebase --abort` 或 `git push --force-with-lease` |
| 看到 bot commit | `git fetch origin main` 看 `Update from Shopify for theme MMX-REMIX/main` |
| Commit 不在 rebase base 上 | `git rev-parse HEAD^` 验证 parent |

### 18.4 CDN / Shopify 问题

| 症状 | 排查 |
|---|---|
| 改完了页面没变 | 等 5+ 分钟 / 浏览器 Ctrl+Shift+R / admin 手动 re-import |
| Admin 显示 section disabled | 99% 是 schema 错误（`validate-about-schemas.py` 跑一下） |
| 改的 CSS 不生效 | hash 没变 → 改 literal value 强制重 process |

---

## 19. 设计原则 (Coulson 偏好)

### 19.1 单 CTA 原则
**每段只放一个主 CTA**。不放 ghost 副按钮、不放 "See all" 副链接、不放 "·" 分隔、不放多余 entry point。

```
❌ [Primary] [Ghost] See all →
✅ [Primary]
```

例外：CTA 双块（about-cta 的 2 个 box）是允许的——它们代表 2 个**不同的转化路径**（"Shop" vs "Contact"），不是同一个 CTA 的 2 个按钮。

### 19.2 不加旁白
- HTML / CSS preview 只展示设计本身
- 不加 author 注释、设计说明、灰底 padding 块
- anchor 跳转直接放 section id,不放在"← 第 N 块"上

### 19.3 不要 playful
- 不放"Shop Dog"、"Joy Seekers"、"An Excuse To Have Fun" 这种梗
- 不放"Never Outgrow the Ride"这种 lifestyle 口号
- 用"Built for **real rides**"、"Dependable quality"、"Real-world usability"

### 19.4 数字 outlined 风格
- lectric 的大数字 (700k / A+ / 500+ / 5) 是 maxfoot 借鉴的设计
- outlined 字符(透明填充 + 黑色描边)给"显眼但轻盈"的感觉
- **保留**:6+ / 9+ / 85mi / 2yr 这种高识别度数字
- 永远 `font-weight: 900` + `text-transform: uppercase`

### 19.5 不要蓝/不要圆
- MaxFoot = 黑 + 黄
- lectric = 蓝
- 不换成 lectric 的蓝色
- 卡片方角/微圆角(8-16px),不要 lectric 那种 50px 大圆角(除了 hero 浮卡)

### 19.6 字体粗细
- `font-weight: 900` 是 MaxFoot 标题 DNA
- 永远不要为对齐而降低 weight

---

## 20. 历史 commit 与里程碑

### 20.1 关键节点

| Commit | 内容 |
|---|---|
| `bb84098` | docs: add handoff README for next AI接手 |
| `19416ba` | feat(about-floating-story): add big number + outlined style |
| `2ac27bb` | feat(about-us): merge floating-stats + story into single card module |
| `2ff92e2` | fix(about-us): trim Shopify schema field lengths |
| `51f2c06` | feat(about-us): full rebuild in lectric style with maxfoot colors |
| `f6cfd32` | fix(header): inline sticky CSS in section for reliable deploy |
| `5b662b6` | chore: trivial comment to force CSS re-process |
| `bdfa35a` | fix(header): also make section wrapper sticky (containing block was 77px) |
| `a7d818d` | fix(header): make sticky header work + wire the sticky_header setting |
| `a858295` | revert(mileage-tabs): font-weight 700 → 900 (user feedback: 700 too ugly) |
| 更早 | promo card / mileage / reliability / feature / why grids |
| 更早 | overlay opacity (--overlay-alpha) + display: block !important 修 Dawn `div:empty` |
| 更早 | "Choose options" → "Shop now" |
| 更早 | footer social icons (settings.social_xxx_link 修 _link 后缀) |

### 20.2 最近 20 个 commit

```powershell
git log --oneline -20
```

实际历史里**经常**有 `Update from Shopify for theme MMX-REMIX/main` 这种 bot commit — **这些可以 force push 覆盖**。

---

## 21. Memory 与继续

### 21.1 跨 session 上下文

Coulson 的偏好 / MMX-REMIX workflow / 验证纪律 / Shopify schema 字节限制 / `| t` default 陷阱 / 所有踩过的坑都已写入 `C:\Users\Coulson\.minimax\agents\mavis\memory\MEMORY.md`（agent 跨 session 共享 memory）。

**新接手的 AI 兄弟如果也用 Mavis/同款 agent**:
1. 读 `MEMORY.md` 完整文件（hot layer + topic file `shopify-mmx-theme.md`）
2. 读这个 `README.md`
3. 跑 `python C:\Users\Coulson\AppData\Roaming\npm\validate-about-schemas.py` 自检
4. 看 `git log --oneline -20` 摸历史
5. `cd C:\Users\Coulson\Desktop\MMX-REMIX` 进工程目录

### 21.2 不要重置的"沉淀"

下面这些**不要重新发明**（已沉淀到代码 / 文档 / memory）：
- 验证优先纪律（`MEMORY.md` 末段）
- Shopify schema 字节限制（`validate-about-schemas.py`）
- Sticky header 三件套（body display: block + section :has() sticky + 内联 CSS）
- `| t` default 陷阱（locale 文件会覆盖）
- footer social 链接 `_link` 后缀
- `display: block !important` 破 Dawn `div:empty`
- `--overlay-alpha` CSS 变量代替 `opacity` 反直觉
- 单 CTA 原则（README §19.1 + MEMORY §设计偏好）
- promo card = image fills entire card（`section-main-collection.css`）
- mobile carousel `85vw` 不是 `85%`，`var(--gutter)` 不是 `-24px`

### 21.3 如果还有问题

- Shopify admin 翻一遍所有 sections 实操
- 问 Mavis（memory 里也有 thread）

---

## 附录 A: About Us 11 Sections 详解

> 11 个 sections 是最近一次大改（2026-07-21~24），从 lectric 视觉风格借鉴，套 maxfoot 配色。

`templates/page.about-us.json` 顺序：

### A.1 `about-hero` (sections/about-hero.liquid)
- **视觉**：全宽图片或视频背景 + 暗色 overlay
- **字段**：
  - `media_image` (image_picker) — 视频 poster 或全宽图（1920×1080 <500KB）
  - `media_video_url` (text) — 背景视频 mp4 URL（1920×1080 <8MB）
  - `eyebrow` / `title` (inline_richtext，用 `<em>` 强调) / `subtitle`
  - `meta_1` 到 `meta_4` — 4 个短语 + dot
- **CSS**：`assets/maxfoot-components.css` 的 `.about-hero`

### A.2 `about-floating-story` (sections/about-floating-story.liquid) ⭐ 关键
- **视觉**：大白卡 48px 圆角，浮在 hero 下方 -80px
- **上半部分**：4 个 stat blocks（outlined 大数字 + icon + label）
- **1px 分割线**
- **下半部分**：story 内容（eyebrow + title + body + CTA + 媒体）
- **块**：最多 6 个 `stat` block,每个有 `number` (text, "6+") / `icon` (image_picker) / `label` (text)
- **字段**：`story_eyebrow` / `story_title` (inline_richtext) / `story_body` (richtext) / `story_image` (image_picker) / `story_video_url` (text) / `story_button_label` / `story_button_link` / `story_button_external`
- **CSS**：`assets/page-about-us.css` 的 `.about-floating-story`

### A.3 `about-founder` (sections/about-founder.liquid)
- **视觉**：大图/视频背景 + 浮动白卡（右下角）
- **白卡内容**：icon + eyebrow + title + richtext body + 签名
- **字段**：`bg_image` / `bg_video_url` / `icon` (icon_picker) / `eyebrow` / `title` / `body` / `signature`
- **CSS**：`assets/page-about-us.css` 的 `.about-founder`

### A.4 `about-mission-pillars` (sections/about-mission-pillars.liquid)
- **视觉**：4 根柱子（白底圆角），居中
- **块**：最多 6 个 `pillar` block,每个有 `number` / `icon` / `title` / `text`
- **字段**：`eyebrow` / `heading` (inline_richtext) / `subheading`
- **CSS**：`assets/page-about-us.css` 的 `.about-mission`

### A.5 `about-story-grid` (sections/about-story-grid.liquid)
- **视觉**：2-column（文字 + 媒体），可换方向
- **块**：多个 `list_item` block（每行一个 ✓ 项）
- **字段**：`background` / `layout` (image_left / image_right) / `media_style` (year_block / category_blocks / ul_badge,当没传图时的占位) / `eyebrow` / `title` / `lead_text` / `body_text` + 各种媒体字段
- **CSS**：`assets/page-about-us.css` 的 `.about-story-grid`

### A.6 `about-pillars` (sections/about-pillars.liquid)
- **视觉**：黑底 6 张卡片（1a1a1a 背景 + 黄色数字）
- **块**：6 个 `pillar` block（铝车架/750W/Samsung/后双碟/差速/尾灯）
- **字段**：`heading` / `subheading` / `columns` (2 或 3)
- **CSS**：`assets/page-about-us.css` 的 `.about-pillars`

### A.7 `about-timeline` (sections/about-timeline.liquid)
- **视觉**：5 个里程碑左右交替图文
- **块**：多个 `milestone` block
- **每块**：奇数 = 图右文左,偶数 = 图左文右
- **字段**：每个里程碑有 `year` / `title` / `text` + 媒体（image_picker + video_url）
- **CSS**：`assets/page-about-us.css` 的 `.about-timeline`

### A.8 `about-trust-strip` (sections/about-trust-strip.liquid)
- **视觉**：6 个 logo 信任墙（白底圆角 2x3 grid）
- **块**：6 个 `trust` block,每个有 `logo` (image_picker) / `title` / `subtitle`
- **字段**：`eyebrow` / `heading`
- **CSS**：`assets/page-about-us.css` 的 `.about-trust-strip`

### A.9 `about-cta` (sections/about-cta.liquid)
- **视觉**：2 个并列大色块（黄 + 黑），可加背景图/视频
- **块**：2 个 `box` block
- **每块字段**：`variant` (accent / primary / soft) / `bg_image` / `bg_video_url` / `title` / `text` (richtext) / `button_label` / `button_link` / `button_external`
- **CSS**：`assets/page-about-us.css` 的 `.about-cta`

### A.10 `about-newsletter` (sections/about-newsletter.liquid)
- **视觉**：dark variant（黑底黄字）
- **块**：heading + paragraph + email_form
- **CSS**：`assets/page-about-us.css` 的 `.about-newsletter`

### A.11 `main` (sections/main-page.liquid)
- **Dawn 原版**，`disabled: true`（about-us 不用）

### A.12 完整字段速查表

| Section | 媒体字段 | 文字字段 | Blocks |
|---|---|---|---|
| about-hero | media_image, media_video_url | eyebrow, title, subtitle, meta_1-4 | — |
| about-floating-story | story_image, story_video_url | story_eyebrow, story_title, story_body, story_button_label, story_button_link, story_button_external | stat (≤6) |
| about-founder | bg_image, bg_video_url, icon | eyebrow, title, body, signature | — |
| about-mission-pillars | — | eyebrow, heading, subheading | pillar (≤6) |
| about-story-grid | 多种 image + video | eyebrow, title, lead_text, body_text | list_item (≤10) |
| about-pillars | — | heading, subheading | pillar (≤6) |
| about-timeline | image + video_url (per milestone) | year, title, text (per milestone) | milestone (≤8) |
| about-trust-strip | logo (per trust) | eyebrow, heading, title, subtitle (per trust) | trust (≤6) |
| about-cta | bg_image, bg_video_url (per box) | title, text, button_label, button_link (per box) | box (≤2) |
| about-newsletter | — | heading, paragraph | email_form |
| main | — | — | — |

### A.13 媒体字段 info 建议（每个 image_picker 都应该配）

```
Recommended: 1920×1080 (16:9) JPG/PNG <500KB. Used as video poster if video set, else full bg.
```

或更小：

```
Recommended: 1280×960 (4:3), JPG/PNG, <300KB. Used as video poster if video is set, otherwise as full media.
```

### A.14 当前默认内容（待用户配媒体）

11 个 sections 的所有 `*_image` / `*_video_url` 都是空的，需要用户在 Shopify admin 上传。文字 default 已配好，**可以预览**但没有媒体显得空。

---

**如果其他 AI 兄弟拿到这份 README 还搞不清楚:去 Shopify admin 翻一遍所有 sections,实操一遍就懂了。或者直接问我（Mavis memory 里也有 thread）。**
