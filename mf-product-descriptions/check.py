#!/usr/bin/env python3
"""Validate the generated product descriptions.

  python check.py            # structure + JSON-LD + content coverage vs templates
"""
from __future__ import annotations

import html as htmlmod
import json
import pathlib
import re
import sys

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent
TEMPLATES = {
    "mf-30": ROOT / "templates" / "product.mf-30.json",
    "mf-31": ROOT / "templates" / "product.mf-31.json",
    "mf-32": ROOT / "templates" / "product.mf-32.json",
    "mf-33": ROOT / "templates" / "product.mf-33.json",
    "mf-35": ROOT / "templates" / "product.mf-35-stitch.json",
}
DROP = {"x", "l", "w", "h"}


def canon(s: str) -> str:
    s = re.sub(r"<[^>]+>", " ", s).lower()
    for a, b in [("×", "x"), ("–", "-"), ("—", "-"), ("’", "'"),
                 ("“", '"'), ("”", '"')]:
        s = s.replace(a, b)
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9]+", " ", s)).strip()


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


def load_template(p: pathlib.Path) -> dict:
    raw = p.read_text(encoding="utf-8")
    return json.loads(re.sub(r"^\s*/\*.*?\*/\s*", "", raw, flags=re.S))


SKIP_KEYS = {
    "padding_top", "padding_bottom", "padding_left", "padding_right", "padding",
    "color_scheme", "layout", "image_behavior", "desktop_content_position",
    "desktop_content_alignment", "content_layout", "mobile_content_alignment",
    "desktop_image_width", "height", "width", "image", "video", "custom_css",
    "background_image", "background_color", "text_color", "button_color",
    "overlay_opacity", "mobile_ratio", "debug_shade", "border_radius",
    "media_position", "text_align", "align", "font_size", "text_style",
    "image_position", "max_width", "thumbnail_position", "columns",
    "enable_zoom", "show_gallery", "media", "show_vendor", "show_rating",
    "show_price", "show_button", "show_quick_add", "products_to_show",
    "columns_desktop", "columns_mobile", "full_width", "show_view_all",
    "view_all_style", "enable_desktop_slider", "rows", "columns_1",
    "select_product", "product", "collection", "menu", "item_background",
    "hover_background", "border_color", "title_color", "question_color",
    "icon_color", "heading_font", "content_font", "container_color_scheme",
    "heading_alignment", "background_style", "desktop_layout", "mobile_layout",
    "custom_liquid", "content_alignment", "swiperBanner_imgAlt",
    "review_data", "empty_state", "show_shop_reviews", "max_width",
}
NOISE = re.compile(r"^(https?://|shopify://|//|\{|\}|\[|data:|/)", re.I)


def template_strings(tpl: dict):
    out = []
    for sec in tpl.get("sections", {}).values():
        if sec.get("disabled"):
            continue
        for key, val in (sec.get("settings") or {}).items():
            if isinstance(val, str) and len(val) >= 8 and key not in SKIP_KEYS and not NOISE.match(val.strip()):
                out.append((f"{sec.get('type')}.settings.{key}", val))
        for bid, blk in (sec.get("blocks") or {}).items():
            if blk.get("disabled"):
                continue
            for key, val in (blk.get("settings") or {}).items():
                if isinstance(val, str) and len(val) >= 8 and key not in SKIP_KEYS and not NOISE.match(val.strip()):
                    out.append((f"{blk.get('type')}.{bid}.{key}", val))
    return out


def present(s: str, doc_toks: list, doc_join: str) -> bool:
    toks = [t for t in canon(s).split() if t not in DROP]
    if not toks:
        return True
    if (" " + " ".join(toks) + " ") in doc_join:
        return True
    i = gaps = 0
    for t in doc_toks:
        if i < len(toks) and t == toks[i]:
            i += 1
            gaps = 0
            if i == len(toks):
                return True
        else:
            gaps += 1
            if gaps > 14:
                return False
    return False


fails = 0


def price_issues(published: str) -> list:
    """The description must not carry price or stock - Shopify owns those."""
    out = []
    body = re.sub(r"<!--.*?-->", " ", published, flags=re.S)
    if re.search(r"\$\s?[\d,]", body):
        out.append("a dollar amount is present")
    if re.search(r"\b(in stock|out of stock|only \d+ units?)\b", body, re.I):
        out.append("a stock claim is present")
    if re.search(r"save\s+\$", body, re.I):
        out.append("a savings claim is present")
    # a "Price" row is only a problem if its own cells carry a number
    for m in re.finditer(r"<th[^>]*>\s*price\s*</th>", body, re.I):
        row_end = body.find("</tr>", m.end())
        row = body[m.end():row_end if row_end > 0 else m.end() + 200]
        row = re.sub(r"<[^>]+>", " ", row)   # drop class names like "mf35-winner"
        if re.search(r"[\d$]", row):
            out.append("a Price row carries a number")
    # no free trial - the store does not offer one
    for pat, label in ((r"free\s+trial", "a free-trial claim"),
                       (r"\b14[\s-]day\b", "a 14-day claim"),
                       (r"trial\s+period", "a trial-period claim"),
                       (r"ride\s+it\s+at\s+home", "a trial claim")):
        if re.search(pat, body, re.I):
            out.append(f"{label} is present")
    for key in ('"offers"', '"priceCurrency"', '"availability"', '"priceValidUntil"',
                '"compareAtPrice"'):
        if key in body:
            out.append(f"{key} is present in the JSON-LD")
    return out


for f in sorted(HERE.glob("mf-*.html")):
    fam = f.name.split("-")[0] + "-" + f.name.split("-")[1]
    doc = f.read_text(encoding="utf-8")
    problems = []

    # --- JSON-LD ---
    blocks = re.findall(r'<script type="application/ld\+json">(.*?)</script>', doc, re.S)
    types = []
    for b in blocks:
        try:
            d = json.loads(b)
            types.append(d.get("@type"))
            if d.get("@type") == "Product":
                ar = d.get("aggregateRating")
                reviews = int(ar["reviewCount"]) if ar else 0
                if reviews == 0 and ar:
                    problems.append("aggregateRating emitted for a 0-review product")
                if reviews > 0 and not ar:
                    problems.append(f"aggregateRating missing for a {reviews}-review product")
                if d.get("offers", {}).get("availability", "").endswith("InStock"):
                    # look at the rendered price bar, not the CSS class definition
                    bar = re.search(r'<div class="mf-price-bar">(.*?)</div>', doc, re.S)
                    if bar and "is-out" in bar.group(1):
                        problems.append("marks in stock but the price bar says out of stock")
        except Exception as exc:
            problems.append(f"JSON-LD parse fail: {exc}")
    if len(blocks) != 3:
        problems.append(f"expected 3 JSON-LD blocks, got {len(blocks)}")

    # --- no price / no stock in what actually ships ---
    published = re.sub(r"<!--.*?-->\s*", "", doc, flags=re.S)
    for issue in price_issues(published):
        problems.append(issue)

    # --- tag balance ---
    for t in ("article", "table", "details", "section", "dl", "ul", "script", "style", "figure"):
        o = len(re.findall(rf"<\s*{t}[\s>]", doc))
        c = len(re.findall(rf"<\s*/\s*{t}\s*>", doc))
        if o != c:
            problems.append(f"<{t}> open={o} close={c}")

    # --- heading order ---
    hs = re.findall(r"<h([1-6])", doc)
    if not hs or hs[0] != "1":
        problems.append("first heading is not h1")
    prev = 1
    for h in hs:
        if int(h) - prev > 1:
            problems.append(f"heading level jump h{prev}->h{h}")
            break
        prev = int(h)

    # --- content coverage against the template ---
    tpl = load_template(TEMPLATES[fam])
    doc_toks = [t for t in canon(visible(doc)).split() if t not in DROP]
    doc_join = " " + " ".join(doc_toks) + " "
    missing = []
    for path, val in template_strings(tpl):
        if not present(val, doc_toks, doc_join):
            missing.append((path, val))
    real = [(p, v) for p, v in missing
            if not any(k in canon(v) for k in (
                # mobile-only header variants (same copy, different spelling)
                "get fit withoutdoor cycling", "off roadchampion", "ebike commuting era now",
                # swiper / banner image alts
                "captionslide", "slider", "swiper", "banner", "bicycleTabs_box_AWMpLX",
                "rearwheel", "spinner", "badge", "placeholder",
                # MF-35: deliberate copy cleanups + label expansions, documented
                # in mf-35-brooklyn-gray.html
                "min rider ht", "max rider ht", "wheel base", "mini saddle height",
                "max saddle height", "batteryflexible charging",
                "fold and unfold in under 10 seconds without detaching wheels or wiring cables unfold",
                "step steady rear wheel power for smoother starts and everyday rides aight through",
                "47 27 5 35 3", "yes 10 sec quick fold",
                # MF-30: the buy-box promo banner states a price, so it is
                # deliberately not repeated in the description
                "limited time offer", "only 1699 save 900 for a limited time", "shop now",
                # MF-35: the price comparison row became a number-free row
                "direct factory price", "1 199 00", "2 254 00", "1 499 00"))]
    if real:
        problems.append(f"{len(real)} template strings not represented")

    status = "OK " if not problems else "FAIL"
    print(f"[{status}] {f.name:34} ld={types} tables={doc.count('<table>')} "
          f"details={doc.count('<details>')} missing={len(real)}")
    for p in problems:
        print(f"        - {p}")
    for p, v in real[:6]:
        print(f"        ? {p}: {v[:90]!r}")
    fails += bool(problems)

print("\nRESULT:", "PASS" if not fails else f"{fails} file(s) with problems")
sys.exit(0 if not fails else 1)
