#!/usr/bin/env node
// Get a Shopify Admin API access token via the client_credentials grant.
// Reads SHOPIFY_SHOP / SHOPIFY_CLIENT_ID / SHOPIFY_CLIENT_SECRET from .env,
// caches the 24h token, refreshes ~60s before expiry.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { URLSearchParams } from 'node:url';

const SKILL_DIR = path.dirname(fileURLToPath(import.meta.url));
const CACHE_FILE = process.env.SHOPIFY_TOKEN_CACHE
  || path.join(tmpdir(), 'shopify-admin-token-cache.json');
const FRESHNESS_MS = 60_000; // treat a token as stale 60s before it expires

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const valueOf = (name) => {
  const i = args.indexOf(name);
  return i !== -1 ? args[i + 1] : undefined;
};
const REFRESH = flag('--refresh');
const AS_JSON = flag('--json');

if (flag('--help') || flag('-h')) {
  console.log(`Usage: node get-admin-token.mjs [options]

Options:
  --refresh        Force a fresh token, ignoring the cache.
  --json           Print {token, scope, expires_in, expiresAt} instead of the bare token.
  --env <path>     Path to the .env file (default: <cwd>/.env, then the repo root, then this skill dir).
  --cache-file <p> Cache path (default: $SHOPIFY_TOKEN_CACHE or OS temp dir).
  -h, --help       Show this help.`);
  process.exit(0);
}

function parseEnv(text) {
  const env = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    let key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"'))
        || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function candidates() {
  const list = [];
  if (process.cwd()) list.push(path.join(process.cwd(), '.env'));
  list.push(path.join(SKILL_DIR, '..', '..', '..', '.env')); // repo root
  list.push(path.join(SKILL_DIR, '.env'));
  return list;
}

function loadEnv() {
  const explicit = valueOf('--env');
  const file = explicit || candidates().find((f) => existsSync(f));
  if (!file) return {};
  return parseEnv(readFileSync(file, 'utf8'));
}

const fileEnv = loadEnv();
const get = (k) => process.env[k] ?? fileEnv[k];
const SHOP = get('SHOPIFY_SHOP');
const CLIENT_ID = get('SHOPIFY_CLIENT_ID');
const CLIENT_SECRET = get('SHOPIFY_CLIENT_SECRET');

if (!SHOP || !CLIENT_ID || !CLIENT_SECRET) {
  console.error('Missing credentials. Create a .env file with:');
  console.error('  SHOPIFY_SHOP=your-store');
  console.error('  SHOPIFY_CLIENT_ID=your-client-id');
  console.error('  SHOPIFY_CLIENT_SECRET=your-client-secret');
  console.error('(or set them as environment variables / pass --env <path>)');
  process.exitCode = 1;
} else {
  await main();
}

function readCache() {
  if (!existsSync(CACHE_FILE)) return {};
  try { return JSON.parse(readFileSync(CACHE_FILE, 'utf8')); }
  catch { return {}; }
}

async function main() {
  const cache = readCache();
  const cached = cache[SHOP];
  if (!REFRESH && cached?.token && cached.expiresAt && Date.now() < cached.expiresAt - FRESHNESS_MS) {
    const out = { ...cached, fromCache: true };
    if (AS_JSON) console.log(JSON.stringify(out, null, 2));
    else console.log(cached.token);
    return;
  }

  const response = await fetch(`https://${SHOP}.myshopify.com/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    console.error(`Token request failed: ${response.status} ${response.statusText}`);
    if (body) {
      const isHtml = body.trimStart().startsWith('<');
      console.error(isHtml ? body.slice(0, 300) : body);
    }
    if (response.status === 403 && body.includes('shop_not_permitted')) {
      console.error('shop_not_permitted: the app and store must belong to the same Dev Dashboard org.');
    }
    process.exitCode = 1;
    return;
  }

  const { access_token, scope, expires_in } = await response.json();
  const expiresAt = Date.now() + expires_in * 1000;
  cache[SHOP] = { token: access_token, scope, expires_in, expiresAt };
  writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));

  const out = { token: access_token, scope, expires_in, expiresAt };
  if (AS_JSON) console.log(JSON.stringify(out, null, 2));
  else console.log(access_token);
}
