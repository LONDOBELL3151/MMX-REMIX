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

// ============ Nav dropdown (submenu panel under each parent item) ============
(function () {
  function closeSubmenu(submenu) {
    if (!submenu) return;
    submenu.setAttribute('aria-hidden', 'true');
    const toggleId = submenu.id;
    if (toggleId) {
      const toggle = document.querySelector('[data-nav-toggle="' + toggleId + '"]');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    }
  }

  function openSubmenu(submenu, toggle) {
    if (!submenu) return;
    // Close any other open submenu first
    document.querySelectorAll('.nav__submenu[aria-hidden="false"]').forEach((s) => {
      if (s !== submenu) closeSubmenu(s);
    });
    submenu.setAttribute('aria-hidden', 'false');
    if (toggle) toggle.setAttribute('aria-expanded', 'true');
  }

  // Toggle buttons: open/close on click
  document.querySelectorAll('[data-nav-toggle]').forEach((toggle) => {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const submenuId = toggle.dataset.navToggle;
      const submenu = document.getElementById(submenuId);
      if (!submenu) return;
      const isOpen = submenu.getAttribute('aria-hidden') === 'false';
      if (isOpen) {
        closeSubmenu(submenu);
      } else {
        openSubmenu(submenu, toggle);
      }
    });
  });

  // Click outside the nav closes any open submenu
  document.addEventListener('click', (e) => {
    if (e.target.closest('.nav__menu')) return;
    document.querySelectorAll('.nav__submenu[aria-hidden="false"]').forEach(closeSubmenu);
  });

  // ESC closes any open submenu and returns focus to the trigger
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const openSub = document.querySelector('.nav__submenu[aria-hidden="false"]');
    if (!openSub) return;
    const toggleId = openSub.id;
    closeSubmenu(openSub);
    if (toggleId) {
      const toggle = document.querySelector('[data-nav-toggle="' + toggleId + '"]');
      if (toggle) toggle.focus();
    }
  });
})();

// ============ Reviews coverflow (3D) ============
(function () {
  function initCoverflow(root) {
    if (!root || root.dataset.reviewsCfReady === 'true') return;
    const slides = Array.prototype.slice.call(root.querySelectorAll('[data-reviews-slide]'));
    const prevBtn = root.querySelector('[data-reviews-prev]');
    const nextBtn = root.querySelector('[data-reviews-next]');
    const viewport = root.querySelector('[data-reviews-viewport]');
    if (slides.length < 2 || !prevBtn || !nextBtn) return;

    root.dataset.reviewsCfReady = 'true';

    let activeIndex = Math.min(parseInt(root.dataset.initialIndex || '0', 10), slides.length - 1);
    if (activeIndex < 0) activeIndex = 0;
    let isAnimating = false;
    let suppressClickUntil = 0;
    let pointerStartX = 0;
    let pointerDeltaX = 0;
    let pointerActive = false;
    let pointerDragging = false;
    let lastPointerType = '';

    function getMaxVisible() {
      const w = window.innerWidth;
      let max = 7;
      if (w <= 767) max = 3;
      else if (w <= 999) max = 5;
      return Math.min(slides.length, max);
    }

    function labelForOffset(offset) {
      if (offset === 0) return 'center';
      const half = Math.floor(getMaxVisible() / 2);
      if (Math.abs(offset) > half) return 'hidden';
      return offset < 0 ? 'left-' + (-offset) : 'right-' + offset;
    }

    function update(instant) {
      const half = slides.length / 2;
      slides.forEach((s, i) => {
        let raw = i - activeIndex;
        if (raw > half) raw -= slides.length;
        if (raw < -half) raw += slides.length;
        const label = labelForOffset(raw);
        if (instant) {
          const prev = s.style.transition;
          s.style.transition = 'none';
          s.setAttribute('data-3d', label);
          // force reflow before restoring transition
          // eslint-disable-next-line no-unused-expressions
          s.offsetHeight;
          s.style.transition = prev;
        } else {
          s.setAttribute('data-3d', label);
        }
      });
    }

    function goTo(nextIndex, instant) {
      if (isAnimating && !instant) return;
      activeIndex = (nextIndex + slides.length) % slides.length;
      if (!instant) {
        isAnimating = true;
        setTimeout(() => { isAnimating = false; }, 650);
      }
      update(instant);
    }

    prevBtn.addEventListener('click', () => goTo(activeIndex - 1));
    nextBtn.addEventListener('click', () => goTo(activeIndex + 1));

    // Keyboard
    root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(activeIndex - 1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); goTo(activeIndex + 1); }
    });

    // Click on side cards → jump to that index
    function findSlideFromPoint(cx, cy) {
      if (typeof document.elementsFromPoint !== 'function') return -1;
      const stack = document.elementsFromPoint(cx, cy);
      for (let i = 0; i < stack.length; i++) {
        let el = stack[i];
        while (el && el !== viewport) {
          const idx = slides.indexOf(el);
          if (idx !== -1) {
            if (slides[idx].getAttribute('data-3d') !== 'hidden') return idx;
          }
          el = el.parentElement;
        }
      }
      return -1;
    }

    if (viewport) {
      viewport.addEventListener('click', (e) => {
        if (Date.now() < suppressClickUntil) { e.preventDefault(); return; }
        if (lastPointerType && lastPointerType !== 'mouse') return;
        const idx = findSlideFromPoint(e.clientX, e.clientY);
        if (idx !== -1 && idx !== activeIndex) goTo(idx);
      });

      // Drag / swipe
      viewport.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        pointerActive = true;
        pointerDragging = false;
        pointerDeltaX = 0;
        lastPointerType = e.pointerType || 'mouse';
        pointerStartX = e.clientX;
      });

      window.addEventListener('pointermove', (e) => {
        if (!pointerActive) return;
        pointerDeltaX = e.clientX - pointerStartX;
        if (!pointerDragging && Math.abs(pointerDeltaX) > 8) {
          pointerDragging = true;
          viewport.classList.add('is-dragging');
        }
        if (pointerDragging) e.preventDefault();
      });

      function endDrag(e) {
        if (!pointerActive) return;
        const delta = (e && e.clientX != null) ? e.clientX - pointerStartX : pointerDeltaX;
        const swipe = pointerDragging && Math.abs(delta) > 36;
        pointerActive = false;
        pointerDragging = false;
        pointerDeltaX = 0;
        viewport.classList.remove('is-dragging');
        if (swipe) {
          suppressClickUntil = Date.now() + 280;
          if (delta < 0) goTo(activeIndex + 1);
          else goTo(activeIndex - 1);
        }
      }
      window.addEventListener('pointerup', endDrag);
      window.addEventListener('pointercancel', () => {
        pointerActive = false;
        pointerDragging = false;
        viewport.classList.remove('is-dragging');
      });
    }

    window.addEventListener('resize', () => update(true));
    update(true);
  }

  document.querySelectorAll('[data-reviews-cf]').forEach(initCoverflow);
})();

})();