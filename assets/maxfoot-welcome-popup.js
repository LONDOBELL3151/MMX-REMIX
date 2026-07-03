(function () {
  function safeStorageGet(key) {
    try {
      var rawValue = window.localStorage.getItem(key);

      if (!rawValue) {
        return null;
      }

      return JSON.parse(rawValue);
    } catch (error) {
      return null;
    }
  }

  function safeStorageSet(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {}
  }

  function createExpiringState(days) {
    var numericDays = Number(days);

    return {
      expiresAt: Date.now() + numericDays * 24 * 60 * 60 * 1000
    };
  }

  function isStateActive(state) {
    if (!state) {
      return false;
    }

    if (!state.expiresAt) {
      return true;
    }

    return Number(state.expiresAt) > Date.now();
  }

  function copyText(value) {
    if (!value) {
      return Promise.resolve(false);
    }

    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(value).then(function () {
        return true;
      }).catch(function () {
        return false;
      });
    }

    return new Promise(function (resolve) {
      var helper = document.createElement('textarea');

      helper.value = value;
      helper.setAttribute('readonly', '');
      helper.style.position = 'absolute';
      helper.style.left = '-9999px';

      document.body.appendChild(helper);
      helper.select();

      var copied = false;

      try {
        copied = document.execCommand('copy');
      } catch (error) {
        copied = false;
      }

      document.body.removeChild(helper);
      resolve(copied);
    });
  }

  function toggleDocumentScroll(locked) {
    document.documentElement.classList.toggle('maxfoot-welcome-popup-open', locked);
    document.body.classList.toggle('maxfoot-welcome-popup-open', locked);
  }

  function initializePopup(popup) {
    if (!popup || popup.dataset.initialized === 'true') {
      return;
    }

    popup.dataset.initialized = 'true';

    var sectionId = popup.dataset.sectionId || 'default';
    var delay = Number(popup.dataset.delayMs || 0);
    var dismissDays = Number(popup.dataset.expiryDays || 90);
    var isDesignMode = popup.dataset.designMode === 'true';
    var couponCode = popup.dataset.couponCode || '';
    var dismissalKey = 'maxfoot-welcome-popup-dismissed-' + sectionId;
    var subscribedKey = 'maxfoot-welcome-popup-subscribed-' + sectionId;
    var nameKey = 'maxfoot-welcome-popup-name-' + sectionId;
    var stateSource = popup.querySelector('[data-popup-state-source]');
    var formPanel = popup.querySelector('[data-popup-form-panel]');
    var successPanel = popup.querySelector('[data-popup-success-panel]');
    var nameInput = popup.querySelector('[data-popup-name]');
    var closeButtons = popup.querySelectorAll('[data-popup-close]');
    var copyButton = popup.querySelector('[data-popup-copy]');
    var form = popup.querySelector('form');
    var greeting = popup.querySelector('[data-popup-greeting]');
    var greetingName = popup.querySelector('[data-popup-subscriber-name]');
    var couponDisplay = popup.querySelector('[data-popup-coupon-display]');
    var shouldForceOpen = stateSource && stateSource.dataset.popupForceOpen === 'true';
    var shouldShowSuccess = stateSource && stateSource.dataset.popupShowSuccess === 'true';
    var openTimer = null;
    var copyTimer = null;
    var lastFocusedElement = null;

    function restoreNameField() {
      var storedName = safeStorageGet(nameKey);

      if (nameInput && !nameInput.value && storedName && storedName.value) {
        nameInput.value = storedName.value;
      }
    }

    function updateGreeting() {
      var storedName = safeStorageGet(nameKey);
      var value = storedName && storedName.value ? String(storedName.value).trim() : '';

      if (!greeting || !greetingName) {
        return;
      }

      if (value) {
        greeting.hidden = false;
        greetingName.textContent = value;
      } else {
        greeting.hidden = true;
        greetingName.textContent = '';
      }
    }

    function setDismissed() {
      safeStorageSet(dismissalKey, createExpiringState(dismissDays));
    }

    function setSubscribed() {
      safeStorageSet(subscribedKey, createExpiringState(3650));
    }

    function setPanelState(showSuccess) {
      if (formPanel) {
        formPanel.hidden = showSuccess;
      }

      if (successPanel) {
        successPanel.hidden = !showSuccess;
      }
    }

    function focusPrimaryElement(showSuccess) {
      window.requestAnimationFrame(function () {
        var target = showSuccess
          ? popup.querySelector('[data-popup-copy]')
          : popup.querySelector('[data-popup-name], [data-popup-email]');

        if (target) {
          target.focus();
        }
      });
    }

    function openPopup(showSuccess) {
      popup.hidden = false;
      popup.setAttribute('aria-hidden', 'false');
      setPanelState(showSuccess);
      updateGreeting();
      lastFocusedElement = document.activeElement;

      window.requestAnimationFrame(function () {
        popup.classList.add('is-visible');
      });

      toggleDocumentScroll(true);
      focusPrimaryElement(showSuccess);
    }

    function closePopup(rememberDismissal) {
      if (rememberDismissal) {
        setDismissed();
      }

      popup.classList.remove('is-visible');
      popup.setAttribute('aria-hidden', 'true');
      toggleDocumentScroll(false);

      window.setTimeout(function () {
        if (!popup.classList.contains('is-visible')) {
          popup.hidden = true;
        }
      }, 240);

      if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
        lastFocusedElement.focus();
      }
    }

    restoreNameField();
    updateGreeting();

    if (couponDisplay) {
      couponDisplay.textContent = couponCode;
    }

    if (form) {
      form.addEventListener('submit', function () {
        if (nameInput && nameInput.value.trim()) {
          safeStorageSet(nameKey, {
            value: nameInput.value.trim()
          });
        }
      });
    }

    closeButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        closePopup(true);
      });
    });

    popup.addEventListener('click', function (event) {
      if (
        event.target === popup ||
        (event.target instanceof Element && event.target.hasAttribute('data-popup-backdrop'))
      ) {
        closePopup(true);
      }
    });

    popup.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closePopup(true);
      }
    });

    if (copyButton) {
      copyButton.addEventListener('click', function () {
        copyText(couponCode).then(function (copied) {
          if (!copied) {
            return;
          }

          window.clearTimeout(copyTimer);
          copyButton.classList.add('is-copied');
          copyButton.textContent = copyButton.dataset.copiedLabel || 'Code copied';

          copyTimer = window.setTimeout(function () {
            copyButton.classList.remove('is-copied');
            copyButton.textContent = copyButton.dataset.defaultLabel || 'Copy code';
          }, 1800);
        });
      });
    }

    if (shouldShowSuccess) {
      setSubscribed();
      setDismissed();
      openPopup(true);
      return;
    }

    if (shouldForceOpen) {
      openPopup(false);
      return;
    }

    if (isDesignMode) {
      openPopup(false);
      return;
    }

    if (isStateActive(safeStorageGet(dismissalKey)) || isStateActive(safeStorageGet(subscribedKey))) {
      return;
    }

    openTimer = window.setTimeout(function () {
      openPopup(false);
    }, delay);
  }

  function initializeAll(root) {
    var scope = root || document;

    scope.querySelectorAll('[data-maxfoot-welcome-popup]').forEach(initializePopup);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initializeAll(document);
    });
  } else {
    initializeAll(document);
  }

  document.addEventListener('shopify:section:load', function (event) {
    initializeAll(event.target);
  });
})();
