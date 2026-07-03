function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

// 删除商品
class ImpactCartItemRemove extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('click', (event) => {
      event.preventDefault();
      const cartModalDialog = this.closest('impact-cart-modal-dialog');

      if (this.dataset.grade && this.dataset.grade == 'classA' && this.closest('.bind_product')?.querySelectorAll('.bind_product_fold-sub-li')?.length > 0) {
        let parent_bind_id = this.dataset.bind;
        let parent_variant_id = this.dataset.variantId;
        let bind_products = this.closest('.bind_product')?.querySelectorAll('.bind_product_fold-sub-li');

        if (bind_products?.length > 0) {
          const bind_dom = Array.from(bind_products).map((element) => ({
            bind: element.dataset.bind,
            variant_id: element.dataset.variantId,
          }));

          const allBindEqual = bind_dom.every((item) => item.bind === parent_bind_id);
          const bind_id_arr = [parent_variant_id, ...bind_dom.map((item) => item.variant_id)];

          if (allBindEqual) {
            cartModalDialog.removeBindProducts(bind_id_arr, this.dataset.idx);
          } else {
            cartModalDialog.updateQuantity(this.dataset.idx, 0, event);
          }
        }
      } else {
        cartModalDialog.updateQuantity(this.dataset.idx, 0, event);
      }
    });
  }
}
customElements.define('impact-cart-item-remove', ImpactCartItemRemove);

//修改商品数量
class ImpactCartQuantityInput extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('input');
    this.changeEvent = new Event('change', { bubbles: true });
    const debouncedOnChange = debounce((event) => {
      this.onInputChange(event);
    }, 300);
    this.input.addEventListener('change', debouncedOnChange.bind(this));
    this.querySelectorAll('button').forEach((button) =>
      button.addEventListener('click', this.onButtonClick.bind(this))
    );
  }

  onInputChange(event) {
    this.validateQtyRules(event);
    if (this.input.value > parseInt(this.input.max)) {
      this.input.value = parseInt(this.input.max);
    }
  }

  onButtonClick(event) {
    event.preventDefault();
    const previousValue = this.input.value;
    if (event.target.name === 'plus') {
      if (parseInt(this.input.dataset.min) > parseInt(this.input.step) && this.input.value == 0) {
        this.input.value = this.input.dataset.min;
      } else {
        this.input.stepUp();
      }
    } else {
      this.input.stepDown();
    }

    // 如果值发生了变化，触发change事件
    if (previousValue !== this.input.value) this.input.dispatchEvent(this.changeEvent);

    //当值等于最小值且点击减号按钮时
    if (this.input.dataset.min === previousValue && event.target.name === 'minus') {
      this.input.value = parseInt(this.input.min);
    }
  }

  validateQtyRules(event) {
    const value = parseInt(this.input.value);
    const index = this.input.dataset.index;
    const max = parseInt(this.input.max);
    const cartModalDialog = this.closest('impact-cart-modal-dialog');
    if (this.input.min) {
      const buttonMinus = this.querySelector("button[name='minus']");
      buttonMinus.classList.toggle('disabled', parseInt(value) <= parseInt(this.input.min));
    }
    if (this.input.max) {
      const buttonPlus = this.querySelector("button[name='plus']");
      buttonPlus.classList.toggle('disabled', value >= max);
    }

    if (value == 0) {
      cartModalDialog.updateQuantity(index, 0, event);
    }

    if (this.input.max && value >= max) {
      cartModalDialog.errorsTip(index, max);
    } else {
      cartModalDialog.cancelErrorsTip(index);
    }

    if (value != 0 && this.input.max && value <= max) {
      cartModalDialog.updateQuantity(index, value, event, max);
    }
  }
}
customElements.define('impact-cart-quantity-input', ImpactCartQuantityInput);

class ImpactCartModalDialog extends HTMLElement {
  constructor() {
    super();
    this.rTime = 0;
  }
  connectedCallback() {
    const closetDialog = document.querySelector('.impact-cart-modal-dialog_close');
    if (closetDialog) {
      closetDialog.addEventListener('click', this.closeCartDialog.bind(this));
    }
  }

  // 打开购物车弹窗
  openCartDialog() {
    clearTimeout(this.rTime);
    document.body.classList.add('no-scroll');
    document.querySelector('.impact-cart-modal-dialog').classList.remove('is-closing');
    document.querySelector('.impact-cart-modal-dialog').classList.add('is-opening');
    document.querySelector('.impact-cart-modal-dialog_overlay').classList.remove('close');
    document.querySelector('.impact-cart-modal-dialog_overlay').classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  // 关闭购物车弹窗
  closeCartDialog() {
    document.querySelector('.impact-cart-modal-dialog').classList.remove('is-opening');
    document.querySelector('.impact-cart-modal-dialog').classList.add('is-closing');
    this.rTime = setTimeout(() => {
      document.body.classList.remove('no-scroll');
      document.querySelector('.impact-cart-modal-dialog_overlay').classList.add('close');
      document.querySelector('.impact-cart-modal-dialog_overlay').classList.remove('open');
      document.body.style.overflow = 'auto';
    }, 400);
  }

  // 更新商品数量
  updateQuantity(line, quantity, event, max) {
    this.enableLoading(line); // 显示加载状态

    // 准备请求数据
    const body = JSON.stringify({
      line, // 商品行索引
      quantity, // 新数量
      sections: this.getSectionsToRender().map((section) => section.section), // 需要更新的区块
      sections_url: window.location.pathname, // 当前页面URL
    });

    // 删除操作 or 修改数量
    const eventTarget = event.currentTarget instanceof ImpactCartItemRemove ? 'clear' : 'change';

    fetch(`${routes.cart_change_url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: body,
    })
      .then((response) => response.text())
      .then((state) => {
        this.renderContents(state);
        if (max && quantity == max) {
          document
            .querySelector(`#impact-cart-modal-dialog-item-${line} button[name='plus']`)
            .classList.add('disabled');
          this.errorsTip(line, max);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      })
      .finally(() => {
        if (eventTarget == 'change') {
          this.disableLoading(line); // 隐藏加载状态
        }
      });
  }

  removeBindProducts(variant_id, line) {
    this.enableLoading(line);
    const updates = {};
    variant_id.forEach((item) => {
      updates[item] = 0;
    });
    const body = JSON.stringify({
      updates: updates,
      sections: this.getSectionsToRender().map((section) => section.section),
      sections_url: window.location.pathname,
    });
    fetch(`${routes.cart_update_url}`, { ...fetchConfig(), body })
      .then((response) => response.text())
      .then((state) => {
        const parsedState = JSON.parse(state); // 解析响应

        // 更新所有需要刷新的区块
        this.getSectionsToRender().forEach((section) => {
          const elementToReplace =
            document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);
          elementToReplace.innerHTML = this.getSectionInnerHTML(
            parsedState.sections[section.section],
            section.selector
          );
        });
      })
      .catch(() => {
        // 错误处理
        this.querySelectorAll('.loading__spinner').forEach((overlay) => overlay.classList.add('hidden'));
        const errors = document.getElementById('cart-errors') || document.getElementById('CartDrawer-CartErrors');
        errors.textContent = window.cartStrings.error;
      })
      .finally(() => {
        this.disableLoading(line);
      });
  }

  // 启用加载状态
  enableLoading(line) {
    const cartModalContent = document.querySelector('.impact-cart-modal-dialog_draw-overflow-content');
    cartModalContent?.classList.add('disabled');

    const cartModelItem = document.querySelector(`#impact-cart-modal-loading-icon-${line}`);
    cartModelItem.previousElementSibling.style.opacity = 0.5;
    cartModelItem?.classList.remove('hidden');
  }
  // 禁用加载状态
  disableLoading(line) {
    const cartModalContent = document.querySelector('.impact-cart-modal-dialog_draw-overflow-content');
    cartModalContent?.classList.remove('disabled');

    const cartModelItem = document.querySelector(`#impact-cart-modal-loading-icon-${line}`);
    cartModelItem?.classList.add('hidden');
    if (cartModelItem && cartModelItem.previousElementSibling) {
      cartModelItem.previousElementSibling.style.opacity = 1;
    }
  }

  // 超过库存则报错
  errorsTip(line, max) {
    const cartItemErrors = document.querySelector(`#impact-cart-modal-dialog-item-${line} .cart-item-errors`);
    cartItemErrors.classList.remove('hidden');
    cartItemErrors.querySelector('p').textContent = `Only ${max} items were added to your cart due to availability.`;
  }
  // 取消库存报错
  cancelErrorsTip(line) {
    const cartItemErrors = document.querySelector(`#impact-cart-modal-dialog-item-${line} .cart-item-errors`);
    cartItemErrors.classList.add('hidden');
    cartItemErrors.querySelector('p').textContent = '';
  }

  // 获取需要更新的区块配置
  getSectionsToRender() {
    return [
      {
        id: 'cart-icon-bubble',
        section: 'cart-icon-bubble',
        selector: '.shopify-section',
      },
      {
        id: 'impact-cart-modal-dialog',
        section: 'impact-cart-modal-dialog',
        selector: '.impact-cart-modal-dialog_content',
      },
    ];
  }

  // 从HTML字符串提取指定部分
  getSectionInnerHTML(html, selector) {
    const parsedDoc = new DOMParser().parseFromString(html, 'text/html');
    const element = parsedDoc.querySelector(selector);
    return element ? element.innerHTML : html; // 如果找不到元素，返回整个HTML
  }

  renderContents(state) {
    const parsedState = JSON.parse(state);
    // 更新所有需要刷新的区块
    this.getSectionsToRender().forEach((section) => {
      const elementToReplace =
        document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);
      elementToReplace.innerHTML = this.getSectionInnerHTML(parsedState.sections[section.section], section.selector);
    });
  }
  renderContents_(parsedState) {
    this.cartItemKey = parsedState.key;
    this.getSectionsToRender().forEach((section) => {
      document.getElementById(section.id).innerHTML = this.getSectionInnerHTML(
        parsedState.sections[section.id],
        section.selector
      );
    });
    this.openCartDialog();
  }
  getSectionsToRender_() {
    return [
      {
        id: 'cart-icon-bubble',
      },
      {
        id: 'impact-cart-modal-dialog',
        selector: `[id="impact-cart-modal-dialog-${this.cartItemKey}"]`,
      },
    ];
  }
}

customElements.define('impact-cart-modal-dialog', ImpactCartModalDialog);

//清除购物车
class ImpactCartDialogButton extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('click', (event) => {
      event.preventDefault();
      this.querySelector('.icon-del_cart').style.display = 'none';
      this.querySelector('.icon-loading').style.display = 'block';
      fetch(window.Shopify.routes.root + 'cart/clear.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('success');
          document.querySelector('.impact-cart-modal-dialog').classList.remove('is-opening');
          document.querySelector('.impact-cart-modal-dialog').classList.add('is-closing');
          setTimeout(() => {
            document.body.classList.remove('no-scroll');
            document.querySelector('.impact-cart-modal-dialog_overlay').classList.add('close');
            document.querySelector('.impact-cart-modal-dialog_overlay').classList.remove('open');
            document.body.style.overflow = 'auto';
          }, 400);
          this.querySelector('.icon-del_cart').style.display = 'block';
          this.querySelector('.icon-loading').style.display = 'none';
          window.location.reload();
        })
        .catch((error) => {
          console.error('error:');
        });
    });
  }
}
customElements.define('impact-cart-dialog-button', ImpactCartDialogButton);
