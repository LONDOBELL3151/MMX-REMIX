---
name: shopify-admin-token
description: 获取 Shopify Admin API 的 access token（client_credentials grant）。当用户需要调用 Shopify Admin API（GraphQL/REST）、需要 X-Shopify-Access-Token 请求头、或提到 Dev Dashboard / Client ID / Client secret / access token 时使用。适用于"商家自用、app 与店铺同 org"的场景。
---

# Shopify Admin Access Token

用 **client credentials grant** 换取 Shopify Admin API 的 access token（24h 有效），供后续调用 GraphQL/REST API 使用。

## 什么时候用

- 用户要调 Shopify Admin API（GraphQL 或 REST），需要 `X-Shopify-Access-Token` 请求头。
- 用户提到 Dev Dashboard、Client ID、Client secret、access token、admin API 认证。

## 前置条件

1. 项目根（或当前目录、或本 skill 目录）存在 `.env`，包含：
   ```
   SHOPIFY_SHOP=your-store
   SHOPIFY_CLIENT_ID=your-client-id
   SHOPIFY_CLIENT_SECRET=your-client-secret
   ```
   凭证来源：Dev Dashboard → 打开 app → **Settings** → Client ID / Client secret。
2. app 与目标店铺必须在**同一个 Dev Dashboard org**，否则报 `shop_not_permitted`。

没有 `.env` 时：把 `.claude/skills/shopify-admin-token/.env.example` 复制成项目根 `.env` 并填真实值。

## 用法

```bash
node .claude/skills/shopify-admin-token/get-admin-token.mjs
```

- 默认输出**裸 token**（适合管道给 curl），从缓存读取，24h 内复用、过期前 60s 自动刷新。
- `--json`：输出 `{ token, scope, expires_in, expiresAt }`，用于展示 scope / 过期时间。
- `--refresh`：强制换新 token（例如权限变更后）。
- `--env <path>` / `--cache-file <p>`：覆盖 `.env` 路径与缓存位置。缓存默认在系统临时目录，按 shop 分 key。

## 调用示例

```bash
# 拿到 token 后调 GraphQL Admin API
TOKEN=$(node .claude/skills/shopify-admin-token/get-admin-token.mjs)
curl -s -X POST "https://$SHOPIFY_SHOP.myshopify.com/admin/api/2025-01/graphql.json" \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Access-Token: $TOKEN" \
  -d '{"query": "{ products(first: 3) { edges { node { id title handle } } } }"}'
```

## 安全注意

- token 是**敏感凭证**：不要回显到对话/聊天里，不要写进文件或提交仓库；只在本地管道中消费。
- Client secret 只存在 `.env`（已被 `.gitignore` 忽略），**绝不提交**。
- 报 `Invalid API key or access token`：说明把 client_id/secret 直接发给了 API，必须先换 token。
- 报 `shop_not_permitted`：app 和店铺不在同一个 Dev Dashboard org（详见 Shopify 文档 Troubleshooting）。
