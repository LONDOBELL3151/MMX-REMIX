#!/usr/bin/env python3
"""Render one HTML product description per MaxFoot trike SKU.

Facts (specs, feature copy, FAQ, metric tiles, promo) are read straight out of
the Shopify product templates so they can never drift from the live page.
Editorial prose (lede, highlights, who-it's-for) lives in content.py.

Usage:
    python build.py              # fetch live data from the Admin API, render
    python build.py --offline    # render from the cached API snapshot
"""
from __future__ import annotations

import copy
import html
import json
import os
import pathlib
import re
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from content import FAMILIES, POLICY  # noqa: E402

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent
SNAPSHOT = HERE / "mf3_products.json"
STORE = "maxfoot.bike"

# product id -> (family key, colour slug)
PRODUCTS = {
    "4630401777746": ("mf-30", "neptune-blue"),
    "7566492008530": ("mf-30", "candy-red"),
    "7566492074066": ("mf-30", "grey"),
    "7566492106834": ("mf-30", "dark-green"),
    "7566492172370": ("mf-30", "yellow"),
    "7226488684626": ("mf-33", "yellow"),
    "7566494203986": ("mf-33", "orange"),
    "7284559020114": ("mf-31", "picton-blue"),
    "7566494761042": ("mf-31", "pangea-green"),
    "7284560691282": ("mf-32", "pangea-green"),
    "7566494433362": ("mf-32", "picton-blue"),
}


# --------------------------------------------------------------------------
# template extraction
# --------------------------------------------------------------------------

def visible_text(s: str) -> str:
    s = re.sub(r"<style.*?</style>", " ", s, flags=re.S | re.I)
    s = re.sub(r"<script.*?</script>", " ", s, flags=re.S | re.I)
    s = re.sub(r"<!--.*?-->", " ", s, flags=re.S)
    s = re.sub(r"<figcaption[^>]*>(.*?)</figcaption>", r" \1 ", s, flags=re.S | re.I)
    s = re.sub(r"<[^>]+>", " ", s)
    s = (s.replace("&nbsp;", " ").replace("&amp;", "&").replace("&mdash;", "—")
           .replace("&ndash;", "–").replace("&quot;", '"').replace("&middot;", "·"))
    return re.sub(r"\s+", " ", s).strip()


def load_template(fam_key: str) -> dict:
    raw = (ROOT / "templates" / f"product.{fam_key}.json").read_text(encoding="utf-8")
    return json.loads(re.sub(r"^\s*/\*.*?\*/\s*", "", raw, flags=re.S))


def template_copy(fam_key: str) -> dict:
    """Pull every shopper-facing string out of the product template."""
    tpl = load_template(fam_key)
    out = {
        "promo": None, "intro": None, "quads": [], "tiles": [], "motor": None,
        "tabs": [], "iwt": [], "spec_groups": [], "faq": [], "alts": [],
        "video_heading": "", "quads_title": "", "multicol_title": "",
    }
    for sec in tpl.get("sections", {}).values():
        if sec.get("disabled"):
            continue
        stype = sec.get("type", "")
        settings = sec.get("settings") or {}
        blocks = sec.get("blocks") or {}

        if stype == "main-product":
            for blk in blocks.values():
                if blk.get("type") == "promo_banner" and not blk.get("disabled"):
                    bs = blk.get("settings") or {}
                    if bs.get("heading"):
                        out["promo"] = {"heading": bs.get("heading", ""),
                                        "body": bs.get("body", ""),
                                        "link_text": bs.get("link_text", "")}

        elif stype == "text-module" and settings.get("text"):
            out["intro"] = {"title": settings.get("main_title", ""),
                            "subhead": settings.get("subhead", ""),
                            "text": visible_text(settings["text"])}

        elif stype == "video" and settings.get("heading"):
            out["video_heading"] = settings["heading"]

        elif stype == "multicolumn":
            out["multicol_title"] = settings.get("title", "")
            for blk in blocks.values():
                if blk.get("disabled"):
                    continue
                bs = blk.get("settings") or {}
                t = bs.get("title", "")
                d = visible_text(bs.get("text", ""))
                if t:
                    out.setdefault("multicol", []).append({"title": t, "desc": d})

        elif stype == "fourSquares_feature":
            out["quads_title"] = settings.get("fourSquares_title", "")
            for blk in blocks.values():
                if blk.get("disabled"):
                    continue
                bs = blk.get("settings") or {}
                header = bs.get("fourSquares_header_Pc") or bs.get("fourSquares_header_Phpne") or ""
                desc = bs.get("fourSquares_desc", "")
                if header:
                    out["quads"].append({"title": header, "desc": visible_text(desc)})

        elif stype == "graphic-module":
            for blk in blocks.values():
                if blk.get("disabled"):
                    continue
                bs = blk.get("settings") or {}
                title = bs.get("main_title", "")
                label = bs.get("text", "")
                if title or label:
                    out["tiles"].append({"value": title, "label": label})

        elif stype == "custom-liquid":
            raw = (settings.get("custom_liquid") or "")
            txt = visible_text(raw)
            if "Rear Drive Motor" in txt and "750W" in txt:
                out["motor"] = txt

        elif stype == "bicycle_tabs":
            for blk in blocks.values():
                if blk.get("disabled"):
                    continue
                bs = blk.get("settings") or {}
                title = bs.get("bicycleTabs_tabTitle") or bs.get("bicycleTabs_contentHeader") or ""
                desc = visible_text(bs.get("bicycleTabs_contentDesc", ""))
                if title:
                    out["tabs"].append({"title": title, "desc": desc})

        elif stype == "image-with-text":
            heading = ""
            text = ""
            for blk in blocks.values():
                if blk.get("disabled"):
                    continue
                bs = blk.get("settings") or {}
                if blk.get("type") == "heading":
                    heading = bs.get("heading", "")
                elif blk.get("type") == "text":
                    text = visible_text(bs.get("text", ""))
            if heading or text:
                out["iwt"].append({"title": heading, "desc": text})

        elif stype == "accordion-module":
            for blk in blocks.values():
                if blk.get("disabled"):
                    continue
                bs = blk.get("settings") or {}
                rows = []
                for i in range(1, 13):
                    h = (bs.get(f"item_heading_{i}") or "").strip()
                    c = (bs.get(f"item_content_{i}") or "").strip()
                    if h or c:
                        rows.append((h, visible_text(c) if c else ""))
                if rows:
                    out["spec_groups"].append({"title": bs.get("heading", ""), "rows": rows})

        elif stype == "collapsible-content":
            out["faq_heading"] = settings.get("heading", "")
            for blk in blocks.values():
                if blk.get("disabled"):
                    continue
                bs = blk.get("settings") or {}
                q = bs.get("heading", "")
                a = visible_text(bs.get("row_content", ""))
                if q:
                    out["faq"].append((q, a))

        elif stype == "swiper_banner":
            out["swiper_title"] = settings.get("swiperBanner_title", "")
            for blk in blocks.values():
                if blk.get("disabled"):
                    continue
                alt = (blk.get("settings") or {}).get("swiperBanner_imgAlt", "")
                if alt:
                    out["alts"].append(alt)

        elif stype == "rich-text":
            heading, text = "", ""
            for blk in blocks.values():
                if blk.get("disabled"):
                    continue
                bs = blk.get("settings") or {}
                if blk.get("type") == "heading":
                    heading = bs.get("heading", "")
                elif blk.get("type") == "text":
                    text = visible_text(bs.get("text", ""))
            if heading or text:
                out.setdefault("rich", []).append({"title": heading, "desc": text})

        elif stype == "_blocks":
            for blk in blocks.values():
                if blk.get("disabled"):
                    continue
                bs = blk.get("settings") or {}
                if bs.get("title"):
                    out["faq_heading"] = bs["title"]
                if bs.get("description"):
                    out["faq_desc"] = visible_text(bs["description"])
                if "question_1" in bs:
                    for i in range(1, 20):
                        q = bs.get(f"question_{i}")
                        if not q:
                            continue
                        a = visible_text(bs.get(f"answer_{i}", ""))
                        out["faq"].append((q, a))
    return out


# --------------------------------------------------------------------------
# rendering
# --------------------------------------------------------------------------

CSS = """
.mf-desc{font-family:'Space Grotesk','Inter Tight',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0F1115;line-height:1.6;max-width:960px;margin:0 auto;padding:0 16px}
.mf-desc *{box-sizing:border-box}
.mf-desc h1,.mf-desc h2,.mf-desc h3{font-family:'Oswald','Big Shoulders Display',Impact,sans-serif;font-weight:600;text-transform:uppercase;letter-spacing:.01em;line-height:1.15;color:#0F1115;margin:32px 0 12px}
.mf-desc h1{font-size:clamp(28px,4.5vw,44px);font-weight:700;margin-top:0;padding-bottom:14px;border-bottom:4px solid #FFC000}
.mf-desc h2{font-size:clamp(22px,3vw,32px)}
.mf-desc h3{font-size:clamp(18px,2.2vw,22px)}
.mf-desc p{margin:0 0 14px}
.mf-desc ul{margin:0 0 16px;padding-left:22px}
.mf-desc li{margin-bottom:8px}
.mf-desc .mf-kicker{display:inline-block;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#0F1115;background:#FFC000;padding:4px 10px;border-radius:3px;margin:0 0 10px}
.mf-desc .mf-lede{font-size:18px;color:#18181B}
.mf-desc .mf-facts{display:flex;flex-wrap:wrap;gap:10px;list-style:none;padding:0;margin:20px 0}
.mf-desc .mf-facts li{font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#0F1115;background:#FFC000;border-radius:4px;padding:8px 14px;margin:0}
.mf-desc .mf-trust{display:flex;flex-wrap:wrap;gap:10px;list-style:none;padding:0;margin:18px 0 24px}
.mf-desc .mf-trust li{font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;background:#F1F3F5;border:1px solid #E4E4E7;border-radius:999px;padding:6px 12px;margin:0}
.mf-desc table{width:100%;border-collapse:collapse;margin:16px 0 24px;font-size:14px;background:#FFFFFF}
.mf-desc caption{text-align:left;font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#71717A;padding-bottom:8px}
.mf-desc th,.mf-desc td{padding:10px 14px;border-bottom:1px solid #E4E4E7;text-align:left;vertical-align:top}
.mf-desc thead th{background:#F8F9FA;font-family:'Oswald',sans-serif;font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#0F1115;border-bottom:1px solid #D1D5DB}
.mf-desc tbody th{font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;color:#71717A;width:38%}
.mf-desc tbody td{color:#18181B;font-weight:600}
.mf-desc .mf-metric-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:14px;margin:16px 0 24px}
.mf-desc .mf-metric{border:1px solid #E4E4E7;border-radius:8px;padding:16px;background:#FFFFFF}
.mf-desc .mf-metric-tag{display:block;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#18181B;background:#F8F9FA;border:1px solid #E4E4E7;border-radius:4px;padding:5px 9px;margin-bottom:10px}
.mf-desc .mf-metric-val{font-family:'Oswald',sans-serif;font-size:40px;font-weight:700;line-height:1;color:#0F1115}
.mf-desc .mf-metric-unit{font-family:'Oswald',sans-serif;font-size:20px;font-weight:700;color:#E5AC00;margin-left:4px}
.mf-desc .mf-metric-title{display:block;font-family:'Oswald',sans-serif;font-size:16px;font-weight:600;text-transform:uppercase;margin:8px 0 6px}
.mf-desc .mf-metric-body{display:block;font-size:14px;color:#18181B;margin:0 0 10px}
.mf-desc .mf-metric-foot{display:block;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:#71717A;border-top:1px solid #E4E4E7;padding-top:8px}
.mf-desc .mf-feature{border-top:1px solid #E4E4E7;padding-top:20px;margin-top:20px}
.mf-desc .mf-feature:first-of-type{border-top:0}
.mf-desc .mf-feature ul{list-style:none;padding:0}
.mf-desc .mf-feature li{padding-left:24px;position:relative}
.mf-desc .mf-feature li:before{content:"\\2713";position:absolute;left:0;top:0;color:#E5AC00;font-weight:700}
.mf-desc .mf-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px;margin:16px 0 24px}
.mf-desc .mf-tile{border:1px solid #E4E4E7;border-radius:8px;padding:16px;background:#FFFFFF}
.mf-desc .mf-tile h3{font-size:15px;font-weight:600;text-transform:uppercase;margin:0 0 6px}
.mf-desc .mf-tile p{margin:0;font-size:14px;color:#18181B}
.mf-desc .mf-note{background:#F8F9FA;border:1px solid #E4E4E7;border-left:4px solid #FFC000;border-radius:6px;padding:14px 18px;margin:16px 0;font-size:14px}
.mf-desc details{border:1px solid #E4E4E7;border-radius:8px;padding:14px 18px;margin-bottom:12px;background:#FFFFFF}
.mf-desc details summary{font-family:'Oswald',sans-serif;font-size:17px;font-weight:600;text-transform:uppercase;cursor:pointer;color:#0F1115}
.mf-desc .mf-a{margin-top:10px;font-size:15px;color:#18181B}
.mf-desc .mf-winner{background:#FFFBEB !important;border-left:2px solid #FFC000;border-right:2px solid #FFC000;color:#0F1115 !important;font-weight:700}
.mf-desc dl{margin:16px 0 24px;padding:0;border:1px solid #E4E4E7;border-radius:8px;overflow:hidden}
.mf-desc dt{font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;color:#71717A;background:#F8F9FA;padding:8px 14px;border-bottom:1px solid #E4E4E7}
.mf-desc dd{margin:0;padding:10px 14px;font-weight:600;color:#18181B;border-bottom:1px solid #F1F3F5}
.mf-desc .mf-footer-note{font-size:13px;color:#71717A;border-top:1px solid #E4E4E7;margin-top:28px;padding-top:14px}
.mf-desc figure{margin:0 0 16px}
.mf-desc figure img{width:100%;max-width:600px;height:auto;border:1px solid #E4E4E7;border-radius:8px}
@media screen and (max-width:600px){
  .mf-desc tbody th{width:auto}
  .mf-desc .mf-metric-val{font-size:32px}
}
"""


def esc(s) -> str:
    return html.escape(str(s), quote=False)


def money(v) -> str:
    return f"${v:,.2f}"


def render(fam_key: str, prod: dict, copy: dict) -> str:
    fam = FAMILIES[fam_key]
    pid = prod["id"].split("/")[-1]
    variant = prod["variants"]["edges"][0]["node"]
    color = variant["selectedOptions"][0]["value"]
    price = float(variant["price"])
    compare = float(variant["compareAtPrice"] or 0) or None
    available = bool(variant.get("availableForSale"))
    qty = variant.get("inventoryQuantity")
    handle = prod["handle"]
    url = f"https://{STORE}/products/{handle}"
    h1 = f"{fam['product_name']} &mdash; {esc(color)}"

    mf = {f"{x['node']['namespace']}.{x['node']['key']}": x["node"]["value"]
          for x in prod["metafields"]["edges"]}
    reviews, rating = 0, None
    if "judgeme.review_widget_data" in mf:
        try:
            j = json.loads(mf["judgeme.review_widget_data"])
            reviews = int(j.get("number_of_reviews") or 0)
            rating = float(j.get("average_rating") or 0) or None
        except Exception:
            pass

    images = [i["node"]["url"] for i in prod["images"]["edges"]]
    image_alts = [(i["node"]["url"], i["node"]["altText"] or "") for i in prod["images"]["edges"]]

    # ---------------- key facts strip ----------------
    # Price, compare-at, savings and stock are deliberately NOT here: Shopify
    # owns those fields and they change. An AI agent reads them from the
    # catalog; a stale copy in the description would contradict it.
    bits = [f"<li>{esc(k)}</li>" for k in fam.get("key_facts", [])]

    trust = ["Ships from US Warehouse", fam["warranty_short"], "Free US Shipping",
             "Affirm financing", "US-Based Support Team"]
    if reviews:
        trust.insert(0, f"{rating:.2f}/5 from {reviews} Reviews")

    # ---------------- spec tables (accordion groups, verbatim) ----------------
    spec_html = ""
    for grp in copy["spec_groups"]:
        rows = "\n".join(
            f'        <tr><th scope="row">{esc(h)}</th><td>{esc(v)}</td></tr>'
            for h, v in grp["rows"] if h or v)
        spec_html += f"""
    <h3>{esc(grp['title'])}</h3>
    <table>
      <caption>{esc(fam['model'])} &mdash; {esc(grp['title'])}</caption>
      <thead>
        <tr><th scope="col">Specification</th><th scope="col">Value</th></tr>
      </thead>
      <tbody>
{rows}
      </tbody>
    </table>
"""

    # the commercial rows ride along with the first spec table. Only Colour is
    # safe to state here - it identifies the SKU and cannot go stale. Price and
    # stock are catalog fields, so they are deliberately absent.
    commercial = "\n".join([
        f'        <tr><th scope="row">Colour</th><td>{esc(color)}</td></tr>',
    ])
    if spec_html:
        spec_html = spec_html.replace("      </tbody>", commercial + "\n      </tbody>", 1)

    # ---------------- metric tiles (graphic-module + editorial body) ----------
    metric_html = ""
    bodies = fam.get("metric_bodies", {})
    for t in copy["tiles"]:
        label = t["label"]
        value = t["value"]
        body = bodies.get(label, "")
        if value:
            # "350 lbs" splits into number + unit; "48V -20 Ah" stays verbatim
            m = re.match(r"^(\d+(?:\.\d+)?)\s+([A-Za-z][A-Za-z./']*)$", value)
            if m:
                num, unit = m.group(1), m.group(2)
                val_html = (f'<span class="mf-metric-val">{esc(num)}'
                            f'<span class="mf-metric-unit">{esc(unit)}</span></span>')
            else:
                val_html = f'<span class="mf-metric-val">{esc(value)}</span>'
        else:
            val_html = ""
        metric_html += f"""
    <div class="mf-metric">
      <span class="mf-metric-tag">{esc(label)}</span>{val_html}
      <span class="mf-metric-body">{body}</span>
    </div>"""
    if not metric_html:
        for label, body in bodies.items():
            metric_html += f"""
    <div class="mf-metric">
      <span class="mf-metric-tag">{esc(label)}</span>
      <span class="mf-metric-body">{body}</span>
    </div>"""

    # ---------------- highlights ----------------
    hl = "\n".join(f"      <dt>{k}</dt>\n      <dd>{v}</dd>" for k, v in fam["highlights"])

    # ---------------- feature panels ----------------
    feat_html = ""
    if copy["intro"]:
        it = copy["intro"]
        feat_html += f"""
  <section class="mf-feature">
    <span class="mf-kicker">{esc(it['subhead'])}</span>
    <h2>{esc(it['title'])}</h2>
    <p>{esc(it['text'])}</p>
  </section>
"""
    if copy["motor"]:
        feat_html += f"""
  <section class="mf-feature">
    <span class="mf-kicker">Rear Drive Motor</span>
    <h2>MAXFOOT 750W Rear Drive Motor</h2>
    <p>{esc(copy['motor'])}</p>
  </section>
"""
    for q in copy["quads"]:
        feat_html += f"""
  <section class="mf-feature">
    <h2>{esc(q['title'])}</h2>
    <p>{esc(q['desc'])}</p>
  </section>
"""
    if copy.get("quads_title"):
        feat_html = feat_html.replace(
            f'<h2>{esc(copy["quads"][0]["title"])}</h2>',
            f'<span class="mf-kicker">{esc(copy["quads_title"])}</span>\n'
            f'    <h2>{esc(copy["quads"][0]["title"])}</h2>', 1)
    for r in copy.get("rich", []):
        feat_html += f"""
  <section class="mf-feature">
    <h2>{esc(r['title'])}</h2>
    <p>{esc(r['desc'])}</p>
  </section>
"""
    for t in copy["tabs"]:
        feat_html += f"""
  <section class="mf-feature">
    <h2>{esc(t['title'])}</h2>
    <p>{esc(t['desc'])}</p>
  </section>
"""
    for i in copy["iwt"]:
        feat_html += f"""
  <section class="mf-feature">
    <h2>{esc(i['title'])}</h2>
    <p>{esc(i['desc'])}</p>
  </section>
"""
    # MF-33's family intro paragraph (text-module) comes through `intro`; the
    # MF-30/31/32 templates have no separate "share the journey" block.

    # ---------------- feature tiles ----------------
    grid_html = ""
    tiles = copy.get("multicol") or copy["quads"]
    grid_title = copy.get("multicol_title") or "Features"
    if tiles:
        tiles_html = "\n".join(f"""
    <div class="mf-tile">
      <h3>{esc(t['title'])}</h3>
      <p>{esc(t.get('desc', ''))}</p>
    </div>""" for t in tiles)
        grid_html = f"""
  <section id="features">
    <h2>{esc(grid_title)}</h2>
    <div class="mf-grid">{tiles_html}
    </div>
  </section>
"""

    # ---------------- FAQ ----------------
    faq_html = "\n".join(f"""
    <details>
      <summary>{esc(q)}</summary>
      <div class="mf-a">
        <p>{esc(a)}</p>
      </div>
    </details>""" for q, a in copy["faq"])

    # ---------------- who ----------------
    who_html = "\n".join(f"      <li>{w}</li>" for w in fam["who"])

    # ---------------- gallery ----------------
    gallery = ""
    if copy.get("video_heading"):
        gallery += f"""
    <h3>{esc(copy['video_heading'])}</h3>
    <p>A {esc(copy['video_heading'].lower())} product video plays on the product page, showing the
    {esc(fam['model'])} in motion.</p>
"""
    for u, alt in image_alts[:4]:
        a = alt or f"{fam['product_name']} in {color}"
        gallery += f"""
    <figure>
      <img src="{u}" alt="{esc(a)}" width="1500" height="1500" loading="lazy">
    </figure>
"""
    if copy["alts"]:
        extra = "\n".join(f"      <li>{esc(a)}</li>" for a in copy["alts"])
        gallery += f"""
    <h3>{esc(copy.get('swiper_title') or 'Riding Moment')}</h3>
    <ul>
{extra}
    </ul>
"""

    # ---------------- JSON-LD ----------------
    props = []
    for grp in copy["spec_groups"]:
        for h, v in grp["rows"]:
            if h and v:
                props.append({"@type": "PropertyValue", "name": h.strip(), "value": v})
    props.append({"@type": "PropertyValue", "name": "Colour", "value": color})
    props.append({"@type": "PropertyValue", "name": "Warranty", "value": fam["warranty"]})

    ld_product = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": f"{fam['product_name']} - {color}",
        "sku": f"{fam['model']}-{color.upper().replace(' ', '-')}",
        "description": visible_text(fam["lede"]),
        "brand": {"@type": "Brand", "name": "MaxFoot"},
        "manufacturer": {"@type": "Organization", "name": "MaxFoot"},
        "category": fam["category"],
        "color": color,
        "keywords": ", ".join(fam["keywords"]),
        "audience": {"@type": "PeopleAudience", "suggestedMinAge": 18, "suggestedMaxAge": 120},
        "additionalProperty": props,
        # No "offers" block on purpose. Price, compare-at and availability are
        # Shopify catalog fields that change; a hardcoded copy inside
        # body_html would go stale and contradict the catalog the agent reads.
        # The catalog feed carries the authoritative offer.
    }
    if images:
        ld_product["image"] = images
    if rating and reviews:
        ld_product["aggregateRating"] = {
            "@type": "AggregateRating",
            "ratingValue": f"{rating:.2f}",
            "bestRating": "5",
            "worstRating": "1",
            "reviewCount": str(reviews),
        }

    ld_faq = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [{"@type": "Question", "name": q,
                        "acceptedAnswer": {"@type": "Answer", "text": a}}
                       for q, a in copy["faq"]],
    }
    ld_bc = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": f"https://{STORE}/"},
            {"@type": "ListItem", "position": 2, "name": fam["product_name"], "item": url},
        ],
    }

    def ld(obj):
        return ("<script type=\"application/ld+json\">\n"
                + json.dumps(obj, ensure_ascii=False, indent=2) + "\n</script>")

    price_line = f"${price:,.2f}" + (f" (was ${compare:,.2f})" if compare else "")
    stock_line = "in stock" if available else "OUT OF STOCK"
    if qty is not None:
        stock_line += f" ({qty} units)"
    rating_line = f"{reviews} at {rating:.2f}/5" if rating else f"{reviews} (no aggregateRating emitted)"

    header = f"""<!--
  MaxFoot {fam['model']} product description &mdash; {color}
  ============================================================
  Generated by mf-product-descriptions/build.py - do not hand edit.
  Copy source ... templates/product.{fam_key}.json
  Live data ..... Admin API, product {pid} (handle "{handle}")
  Push with ..... mf-product-descriptions/push.py

  Structured for Shopify's agentic sales channel: one h1 with brand +
  model + category + colour, a lede that leads with the headline numbers,
  the template's own specification tables reproduced verbatim, real
  comparison and fit tables, details/summary FAQ, and Product / FAQPage /
  BreadcrumbList JSON-LD.

  NO PRICE, NO STOCK. Price, compare-at, savings and availability are
  Shopify catalog fields and they change; a hardcoded copy here would go
  stale and contradict the catalog the agent reads. Verified live at build
  time only so we can see what changed:
    price ..... {price_line}
    stock ..... {stock_line}
    colour .... {color} (single-variant SKU; the other colours are separate products)
    reviews ... {rating_line}
  ============================================================
-->"""

    return f"""{header}
<style>{CSS}</style>
{ld(ld_product)}
{ld(ld_faq)}
{ld(ld_bc)}

<article class="mf-desc">
  <header>
    <h1>{h1}</h1>
    <p class="mf-lede">{fam['lede']}</p>
    <ul class="mf-facts">{''.join(bits)}</ul>
    <ul class="mf-trust">{''.join(f'<li>{t}</li>' for t in trust)}</ul>
  </header>

  <section id="overview">
    <span class="mf-kicker">// {esc(fam['family_label'])}</span>
    <h2>Built for Range, Safety and Everyday Utility</h2>
    <p>{fam['lede']}</p>
    <h3>Highlights</h3>
    <dl>
{hl}
    </dl>
  </section>

  <section id="performance">
    <h2>Performance Metrics</h2>
    <div class="mf-metric-grid">{metric_html}
    </div>
  </section>
{feat_html}{grid_html}
  <section id="specifications">
    <span class="mf-kicker">// Full Technical Specifications</span>
    <h2>Technical Specifications</h2>{spec_html}  </section>

  <section id="size-and-fit">
    <span class="mf-kicker">// Size &amp; Fit</span>
    <h2>Will It Fit You Comfortably?</h2>
    <p>The {esc(fam['family_label'])} is built for riders from 5'2&quot; to 6'4&quot;. The
    step-through frame lets you span the frame and get on the trike easily, whatever you are wearing,
    and the saddle with backrest and adjustable handlebar and seat height keep the ride comfortable
    over longer distances.</p>
  </section>

  <section id="faq">
    <h2>{esc(copy.get("faq_heading") or "Frequently Asked Questions")}</h2>
    <p>{esc(copy.get("faq_desc") or f"What you need to know about the {fam['family_label']}.")}</p>
{faq_html}
  </section>

  <section id="who-its-for">
    <h2>Who Is the {esc(fam['model'])} Best For?</h2>
    <ul>
{who_html}
    </ul>
  </section>

  <section id="shipping-warranty-returns">
    <h2>Shipping, Warranty &amp; Returns</h2>
    <ul>
      <li><strong>Shipping:</strong> {POLICY['shipping']}.</li>
      <li><strong>Warranty:</strong> {fam['warranty']}.</li>
      <li><strong>Assembly:</strong> {fam['assurance']}</li>
      <li><strong>Support:</strong> US-based support team &mdash; support@maxfoot.bike,
      Monday to Friday, 10:00 am - 5:30 pm PST.</li>
      <li><strong>Returns:</strong> {POLICY['returns']}.</li>
      <li><strong>Financing:</strong> 0% APR financing available, plus Affirm financing, Shop Pay,
      Klarna and Affirm at checkout.</li>
    </ul>
  </section>

  <section id="product-gallery">
    <h2>Product Gallery</h2>
{gallery}  </section>

  <p class="mf-footer-note">
    Product: {esc(fam['product_name'])} &mdash; {esc(color)}.
    Ships from the US warehouse with free US shipping and a {fam['warranty_short'].lower()}.
    Current price and availability are shown on the product page.
  </p>
</article>
"""


def load_products(offline: bool) -> dict:
    if offline:
        return json.loads(SNAPSHOT.read_text(encoding="utf-8"))
    import urllib.request
    q = ("{ nodes(ids: [%s]) { ... on Product { id title handle status templateSuffix "
         "productType tags descriptionHtml priceRangeV2 { minVariantPrice { amount currencyCode } "
         "maxVariantPrice { amount currencyCode } } variants(first: 12) { edges { node { id title "
         "price compareAtPrice availableForSale inventoryQuantity selectedOptions { name value } } } } "
         "images(first: 8) { edges { node { url altText width height } } } "
         "metafields(first: 30) { edges { node { namespace key type value } } } } } }") % ", ".join(
        '"gid://shopify/Product/%s"' % i for i in PRODUCTS)
    token = (os.environ.get("SHOPIFY_ADMIN_TOKEN", "").strip()
             or os.environ["SHOPIFY_TOKEN"])
    req = urllib.request.Request(
        f"https://{os.environ['SHOPIFY_SHOP']}.myshopify.com/admin/api/2025-01/graphql.json",
        data=json.dumps({"query": q}).encode(),
        headers={"Content-Type": "application/json",
                 "X-Shopify-Access-Token": token})
    raw = json.loads(urllib.request.urlopen(req, timeout=90).read().decode())
    if "errors" in raw:
        raise SystemExit("GraphQL errors: " + json.dumps(raw["errors"])[:600])
    data = {n["id"].split("/")[-1]: n for n in raw["data"]["nodes"] if n}
    SNAPSHOT.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
    return data


def main():
    offline = "--offline" in sys.argv
    data = load_products(offline)
    copies = {}
    for pid, (fam_key, slug) in PRODUCTS.items():
        copies.setdefault(fam_key, template_copy(fam_key))
        out = HERE / f"{fam_key}-{slug}.html"
        out.write_text(render(fam_key, data[pid], copies[fam_key]), encoding="utf-8")
        print(f"wrote {out.name}  ({out.stat().st_size} chars)")
    print("done")


if __name__ == "__main__":
    main()
