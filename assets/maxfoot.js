/* MaxFoot Dawn — minimal vanilla JS for interactivity.
   Loaded with defer in theme.liquid. */

(function () {
  'use strict';

  // ============ Mobile menu ============
  const menu = document.querySelector('[data-mobile-menu]');
  const menuToggle = document.querySelector('[data-mobile-menu-toggle]');
  const menuCloseEls = document.querySelectorAll('[data-mobile-menu-close]');

  function openMenu() { if (menu) menu.classList.add('is-open'); }
  function closeMenu() { if (menu) menu.classList.remove('is-open'); }

  if (menuToggle) menuToggle.addEventListener('click', openMenu);
  menuCloseEls.forEach((el) => el.addEventListener('click', closeMenu));

  // ============ Cart drawer ============
  const cartDrawer = document.querySelector('[data-cart-drawer]');
  const cartBtns = document.querySelectorAll('[data-cart-count-wrap]');
  const cartCloseEls = document.querySelectorAll('[data-cart-drawer-close]');

  function openCart() { if (cartDrawer) cartDrawer.classList.add('is-open'); }
  function closeCart() { if (cartDrawer) cartDrawer.classList.remove('is-open'); }

  // Cart buttons: navigate to /cart by default (page mode).
  // To enable drawer mode, render data-cart-drawer="enabled" on the
  // drawer element (controlled by a theme setting) and uncomment:
  //   cartBtns.forEach((btn) => btn.addEventListener('click', (e) => {
  //     e.preventDefault();
  //     openCart();
  //   }));
  cartCloseEls.forEach((el) => el.addEventListener('click', closeCart));

  // ============ Quantity selectors ============
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-qty]');
    if (!btn) return;
    const dir = btn.dataset.qty;
    const input = btn.parentElement.querySelector('input[data-qty-input], input[data-cart-qty]');
    if (!input) return;
    const current = parseInt(input.value, 10) || 0;
    const min = parseInt(input.min, 10) || 0;
    const max = parseInt(input.max, 10) || 999;
    let next = dir === 'inc' ? current + 1 : current - 1;
    if (next < min) next = min;
    if (next > max) next = max;
    input.value = next;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });

  // ============ Variant picker (PDP) ============
  const pdpForm = document.querySelector('#pdp__form');
  if (pdpForm) {
    const productIdInput = pdpForm.querySelector('[data-product-id]');
    pdpForm.addEventListener('change', (e) => {
      if (e.target.matches('input[type=radio], select')) {
        const selectedOptions = Array.from(
          pdpForm.querySelectorAll('input[type=radio]:checked, select')
        ).map((el) => el.value);
        // Update selected option label
        const index = e.target.dataset.optionIndex;
        const labelEl = pdpForm.querySelector('[data-selected-option="' + index + '"]');
        if (labelEl) labelEl.textContent = e.target.value;
        // Try to find matching variant from data attribute (set server-side ideally)
        // For now: try to read from data-variant-id if single option
        const variantId = e.target.dataset.variantId;
        if (variantId && productIdInput) {
          productIdInput.value = variantId;
        }
      }
    });
  }

  // ============ Search toggle (header search icon) ============
  const searchToggle = document.querySelector('[data-search-toggle]');
  if (searchToggle) {
    searchToggle.addEventListener('click', () => {
      const url = '/search';
      window.location.href = url;
    });
  }

  // ============ Cart line update via AJAX (for drawer mode) ============
  function updateCartLine(line, qty) {
    return fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ line: line, quantity: qty })
    }).then((r) => r.json());
  }

  // ============ Sort by ============
  const sortSelect = document.querySelector('[data-sort-by]');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      const url = new URL(window.location.href);
      url.searchParams.set('sort_by', sortSelect.value);
      window.location.href = url.toString();
    });
  }

  // ============ Mobile filter drawer (collection page) ============
  const facets = document.getElementById('Facets');
  const facetForm = document.getElementById('FacetFiltersForm');
  const mobileFilterOpen = document.querySelector('[data-mobile-filters-open]');
  const mobileFilterCloseEls = document.querySelectorAll('[data-mobile-filters-close]');

  if (mobileFilterOpen && facets) {
    mobileFilterOpen.addEventListener('click', () => facets.classList.add('is-mobile-open'));
    mobileFilterCloseEls.forEach((el) => el.addEventListener('click', () => facets.classList.remove('is-mobile-open')));
  }

  // Filter UI: on checkbox toggle, navigate to the collection URL with
  // selected tags appended as path segments (/collections/handle/tag1+tag2).
  // Shopify recognizes path-based tag filters; query-string filter.p.tag
  // is not honored on collection pages. Price range still uses native
  // form submit (filter.v.price.gte is a valid query-param filter).
  if (facetForm) {
    const base = facetForm.getAttribute('action') || window.location.pathname;
    facetForm.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
      cb.addEventListener('change', () => {
        const tags = Array.from(facetForm.querySelectorAll('input[type="checkbox"]:checked'))
          .map((c) => c.value)
          .filter(Boolean)
          .join('+');
        window.location.href = tags ? `${base.replace(/\/$/, '')}/${tags}` : base;
      });
    });
  }

  // ============ Newsletter inline submit (prevent default if AJAX) ============
  // Standard form submission works out of the box with Shopify's {% form 'customer' %}

  // ============ Announcement bar marquee: clone content for seamless loop ============
  const tracks = document.querySelectorAll('[data-marquee]');
  tracks.forEach((track) => {
    const clone = track.innerHTML;
    track.innerHTML = clone + clone;
  });

  // ============ Header dropdown menus (desktop hover) ============
  const navMenus = document.querySelectorAll('.nav__menu');
  navMenus.forEach((menu) => {
    const trigger = menu.querySelector('.nav__menu-trigger');
    const submenu = menu.querySelector('.nav__submenu');
    if (!trigger || !submenu) return;
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const open = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', open ? 'false' : 'true');
      submenu.hidden = open;
    });
  });

  // ============ Cart count badge live update (after AJAX cart change) ============
  function updateCartCountUI(count) {
    document.querySelectorAll('[data-cart-count]').forEach((el) => { el.textContent = count; });
  }

  // ============ Lazy load images (Shopify adds loading="lazy" but ensure intersection fallback) ============
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('loaded');
          obs.unobserve(entry.target);
        }
      });
    });
    document.querySelectorAll('img[loading="lazy"]').forEach((img) => obs.observe(img));
  }

  // ============ Share button copy link ============
  const copyBtn = document.querySelector('[data-share-copy]');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(window.location.href).then(() => {
        copyBtn.setAttribute('aria-label', 'Copied!');
        setTimeout(() => copyBtn.setAttribute('aria-label', 'Copy link'), 2000);
      });
    });
  }

  // ============ Gallery thumbnail click (PDP) ============
  const thumbs = document.querySelectorAll('.product-thumb');
  const mainImg = document.getElementById('ProductMainImg');
  thumbs.forEach((thumb) => {
    thumb.addEventListener('click', () => {
      thumbs.forEach((t) => t.classList.remove('is-active'));
      thumb.classList.add('is-active');
      if (mainImg && thumb.dataset.thumbSrc) {
        mainImg.src = thumb.dataset.thumbSrc;
        mainImg.srcset = '';
      }
    });
  });

  // ============ Form: contact form (Shopify handles server-side) ============
  // No custom JS needed — {% form 'contact' %} posts natively.

  // ============ ESC closes drawers/menus ============
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMenu();
      closeCart();
      document.querySelectorAll('.nav__menu-trigger[aria-expanded="true"]').forEach((t) => {
        t.setAttribute('aria-expanded', 'false');
        const sub = t.parentElement.querySelector('.nav__submenu');
        if (sub) sub.hidden = true;
      });
    }
  });


// Compare table: highlight best value per row
(function () {
  document.querySelectorAll('[data-compare-table]').forEach((table) => {
    table.querySelectorAll('[data-spec-row]').forEach((row) => {
      const direction = row.getAttribute('data-compare-direction') || 'high';
      const cells = row.querySelectorAll('td[data-spec-value]');
      let best = null;
      let bestVal = direction === 'high' ? -Infinity : Infinity;
      cells.forEach((cell) => {
        const v = parseFloat(cell.getAttribute('data-spec-value')) || 0;
        if (direction === 'high' ? v > bestVal : v < bestVal) {
          bestVal = v;
          best = cell;
        }
      });
      cells.forEach((cell) => cell.classList.remove('is-best'));
      if (best && bestVal > 0) best.classList.add('is-best');
    });
  });
})();

})();