#!/usr/bin/env python3
"""Push the generated product descriptions to the Shopify Admin API.

For every generated HTML file:
  1. back up the current body_html
  2. PUT the new body_html
  3. re-read the product and verify visible text + element sequence match

Usage:
    SHOPIFY_SHOP=... SHOPIFY_TOKEN=... python push.py            # push all
    python push.py --dry-run                                     # verify only
    python push.py mf-30-neptune-blue mf-33-yellow               # push some
"""
from __future__ import annotations

import html as htmlmod
import json
import os
import pathlib
import re
import sys
import time
import urllib.error
import urllib.request

HERE = pathlib.Path(__file__).resolve().parent
API = "2025-01"
BACKUP = HERE / "_backups"

# generated file -> product id
PRODUCT_IDS = {
    "mf-35-brooklyn-gray": "7659321393234",
    "mf-30-neptune-blue": "4630401777746",
    "mf-30-candy-red": "7566492008530",
    "mf-30-grey": "7566492074066",
    "mf-30-dark-green": "7566492106834",
    "mf-30-yellow": "7566492172370",
    "mf-33-yellow": "7226488684626",
    "mf-33-orange": "7566494203986",
    "mf-31-picton-blue": "7284559020114",
    "mf-31-pangea-green": "7566494761042",
    "mf-32-pangea-green": "7284560691282",
    "mf-32-picton-blue": "7566494433362",
}


def base() -> str:
    return f"https://{os.environ['SHOPIFY_SHOP']}.myshopify.com/admin/api/{API}"


def admin_token() -> str:
    """Prefer a static custom-app Admin API token (SHOPIFY_ADMIN_TOKEN).

    The client_credentials token from the shopify-admin-token skill only
    carries the scopes the store has approved for that org app, and the
    store can withdraw those at any time - which silently breaks product
    reads and writes with a 403. A custom app token (Settings > Apps and
    sales channels > Develop apps > Build app > Install app > Generate an
    Admin API token, scope write_products) does not expire and does not
    depend on that approval.
    """
    tok = os.environ.get("SHOPIFY_ADMIN_TOKEN", "").strip()
    return tok or os.environ["SHOPIFY_TOKEN"]


def req(method: str, path: str, payload=None, tries: int = 4):
    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    r = urllib.request.Request(
        base() + path, data=data, method=method,
        headers={"Content-Type": "application/json",
                 "X-Shopify-Access-Token": admin_token(),
                 "User-Agent": "mmx-mf-desc/1.0"})
    last = None
    for attempt in range(tries):
        try:
            with urllib.request.urlopen(r, timeout=90) as resp:
                return resp.status, json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8", "replace")
            if e.code in (429, 502, 503) and attempt < tries - 1:
                time.sleep(2 * (attempt + 1))
                continue
            return e.code, body
        except Exception as e:           # transient TLS / connection resets
            last = e
            if attempt < tries - 1:
                time.sleep(2 * (attempt + 1))
                continue
    raise last


def visible(s: str) -> str:
    s = re.sub(r"<!--.*?-->", " ", s, flags=re.S)
    s = re.sub(r"<script.*?</script>", " ", s, flags=re.S)
    s = re.sub(r"<style.*?</style>", " ", s, flags=re.S)
    s = re.sub(r"<[^>]+>", " ", s)
    return re.sub(r"\s+", " ", htmlmod.unescape(s)).strip()


def tags(s: str) -> list:
    s = re.sub(r"<!--.*?-->", " ", s, flags=re.S)
    s = re.sub(r"<script.*?</script>", " ", s, flags=re.S)
    s = re.sub(r"<style.*?</style>", " ", s, flags=re.S)
    return re.findall(r"<\s*([a-zA-Z][a-zA-Z0-9]*)\b", s)


def preflight() -> bool:
    """Fail fast with a readable message when the token cannot read products.

    The client_credentials token only carries the scopes the store has
    approved for the org app. If those are withdrawn, every product read
    and write 403s with "requires merchant approval for read_products
    scope" - which is not obvious from a stack trace.
    """
    st, body = req("GET", "/products/4630401777746.json")
    if st == 200:
        return True
    text = body if isinstance(body, str) else json.dumps(body)
    if st == 403 and "scope" in text:
        print("ERROR: this token cannot read products (403).\n"
              f"  {text[:160]}\n\n"
              "The org app's scopes were withdrawn or never approved for this\n"
              "store. Two ways to fix it:\n"
              "  1. Approve them: Shopify admin > Settings > Apps and sales\n"
              "     channels > [the app] > Configuration > approve read_products\n"
              "     and write_products.\n"
              "  2. Use a custom app token (more stable): admin > Settings >\n"
              "     Apps and sales channels > Develop apps > Build app > Install\n"
              "     app > Generate an Admin API token with write_products, then\n"
              "     paste it into SHOPIFY_ADMIN_TOKEN in .env.\n"
              "     build.py and push.py both prefer that token when it is set.")
        return False
    print(f"ERROR: preflight GET products returned {st}: {text[:300]}")
    return False


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    dry = "--dry-run" in sys.argv
    names = args or list(PRODUCT_IDS)
    BACKUP.mkdir(exist_ok=True)
    failures = 0

    if not preflight():
        return 2

    for name in names:
        pid = PRODUCT_IDS[name]
        src = HERE / f"{name}.html"
        if not src.exists():
            print(f"[SKIP] {name}: {src.name} not found")
            failures += 1
            continue
        body = re.sub(r"<!--.*?-->\s*", "", src.read_text(encoding="utf-8"), flags=re.S)

        # what the file claims, so we can compare with what lands
        want_text, want_tags = visible(body), tags(body)
        want_ld = [json.loads(b) for b in
                   re.findall(r'<script type="application/ld\+json">(.*?)</script>', body, re.S)]

        st, cur = req("GET", f"/products/{pid}.json")
        if st != 200:
            print(f"[FAIL] {name}: GET {st} {str(cur)[:200]}")
            failures += 1
            continue
        old = cur["product"]["body_html"] or ""
        (BACKUP / f"{name}.html").write_text(old, encoding="utf-8")

        if not dry:
            st, res = req("PUT", f"/products/{pid}.json",
                           {"product": {"id": pid, "body_html": body}})
            if st != 200:
                print(f"[FAIL] {name}: PUT {st} {str(res)[:300]}")
                failures += 1
                continue
            handle = res["product"]["handle"]
        else:
            handle = cur["product"]["handle"]

        st, chk = req("GET", f"/products/{pid}.json")
        if st != 200:
            print(f"[FAIL] {name}: verify GET {st}")
            failures += 1
            continue
        got = chk["product"]["body_html"] or ""

        problems = []
        if visible(got) != want_text:
            problems.append("visible text differs")
        if tags(got) != want_tags:
            problems.append(f"element sequence differs ({len(tags(got))} vs {len(want_tags)})")
        live_ld = [json.loads(b) for b in
                   re.findall(r'<script type="application/ld\+json">(.*?)</script>', got, re.S)]
        if len(live_ld) != len(want_ld):
            problems.append(f"JSON-LD block count {len(live_ld)} != {len(want_ld)}")
        else:
            for a, b in zip(want_ld, live_ld):
                if a.get("@type") != b.get("@type"):
                    problems.append(f"JSON-LD type {a.get('@type')} != {b.get('@type')}")
        prod = next((x for x in live_ld if x.get("@type") == "Product"), None)
        if prod:
            if "offers" in prod:
                problems.append("the JSON-LD carries an offers block - price belongs to the catalog")
            for key in ("priceCurrency", "availability", "priceValidUntil"):
                if key in prod:
                    problems.append(f"the JSON-LD carries {key}")
        # no price, no stock: Shopify owns those and they change
        for pat, label in ((r"\$\s?[\d,]", "a dollar amount"),
                           (r"\b(in stock|out of stock)\b", "a stock claim"),
                           (r"save\s+\$", "a savings claim"),
                           # the store does not offer a free trial
                           (r"free\s+trial", "a free-trial claim"),
                           (r"\b14[\s-]day\b", "a 14-day claim"),
                           (r"trial\s+period", "a trial-period claim")):
            if re.search(pat, got, re.I):
                problems.append(f"the description carries {label}")
        # a "Price" row is fine as a comparison dimension, as long as its own
        # cells carry no number
        for m in re.finditer(r"<th[^>]*>\s*price\s*</th>", got, re.I):
            row_end = got.find("</tr>", m.end())
            row = re.sub(r"<[^>]+>", " ", got[m.end():row_end if row_end > 0 else m.end() + 200])
            if re.search(r"[\d$]", row):
                problems.append("the description carries a Price row with a number")

        if problems:
            print(f"[FAIL] {name} ({handle}): " + "; ".join(problems))
            failures += 1
        else:
            print(f"[OK  ] {name:24} {handle:70} {len(got):>6} chars, "
                  f"{len(live_ld)} JSON-LD, no-price")

    print(("\nDRY RUN - nothing written" if dry else "\nAll products pushed.")
          if not failures else f"\n{failures} failure(s)")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
