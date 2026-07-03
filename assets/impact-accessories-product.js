const skuElements = document.querySelectorAll('.impact-accessories-product-item .product_item_sku');
const foldProducts = document.querySelectorAll('.impact-accessories-product-variant-items');
const foldBtn = document.querySelector('.impact-accessories-product-foldBox .fold_btn');

if (foldBtn && foldProducts.length > 0) {
  foldBtn.addEventListener('click', () => {
    resetAllSkuSelectors();
  });
}

// 重置所有SKU选择器为关闭状态
function resetAllSkuSelectors(currentElement = null) {
  foldProducts.forEach((product) => {
    const skuElement = product.querySelector('.product_item_sku');

    const outerParent = skuElement?.closest('.impact-accessories-product_fold');

    if (outerParent && outerParent.classList.contains('overflowHidden') == false) {
      outerParent.classList.add('overflowHidden');
    }

    // 跳过当前点击的元素，避免重复操作
    if (skuElement && skuElement !== currentElement) {
      skuElement.classList.remove('is_open');
      skuElement.classList.add('is_close');

      const skuSelect = product.querySelector('.item_sku-selectList');

      if (skuSelect) {
        // 动画结束后隐藏
        skuSelect.addEventListener(
          'animationend',
          function handler() {
            skuSelect.style.display = 'none';
            skuSelect.removeEventListener('animationend', handler);
          },
          { once: true }
        );
      }
    }
  });
}

if (skuElements.length > 0) {
  skuElements.forEach((skuElement) => {
    const skuSelectList = skuElement.querySelector('.item_sku-selectList');
    const itemSkuBtn = skuElement.querySelector('.item_sku-btn');
    const outerParent = skuElement.closest('.impact-accessories-product_fold');
    const skuSelectListOption = skuElement.querySelector('.item_sku-selectList-option');
    const itemSkuSelected = skuElement.querySelector('.item_sku-selected');

    if (!skuSelectList || !itemSkuBtn) return;

    skuElement.addEventListener('click', (e) => {
      e.stopPropagation();

      const isCurrentlyOpen = skuElement.classList.contains('is_open');

      // 1. 先重置所有其他打开的SKU选择器
      if (!isCurrentlyOpen) {
        resetAllSkuSelectors(skuElement);
      }

      // 2. 切换当前元素的父容器类
      if (outerParent) {
        outerParent.classList.toggle('overflowHidden', isCurrentlyOpen);
      }

      // 3. 切换当前元素状态
      if (isCurrentlyOpen) {
        // 关闭当前元素
        skuElement.classList.remove('is_open');
        skuElement.classList.add('is_close');

        // 动画结束后隐藏
        skuSelectList.addEventListener(
          'animationend',
          function handler() {
            skuSelectList.style.display = 'none';
            skuSelectList.removeEventListener('animationend', handler);
          },
          { once: true }
        );
      } else {
        // 打开当前元素
        skuElement.classList.remove('is_close');
        skuElement.classList.add('is_open');
        skuSelectList.style.display = 'block';
        skuSelectList.classList.remove('ani-close');
      }

      if (
        e.target.tagName == 'P' &&
        e.target.classList.contains('sku-select-option') &&
        !e.target.classList.contains('sku-select-option_disabled')
      ) {
        const optionItem = e.target;
        const options = Array.from(skuSelectListOption.children);

        // 更新选中状态
        options.forEach((option) => option.classList.remove('selected-option'));
        optionItem.classList.add('selected-option');

        // 更新显示文本和ID
        itemSkuSelected.querySelector('span').innerText = optionItem.dataset.option;

        const parent_dom = optionItem.closest('.impact-accessories-product-item');

        const input_dom = parent_dom.querySelector('.product_item_checkbox input');

        const priceElem = optionItem.closest('.product_item_sku').nextElementSibling.firstElementChild;

        const comparePriceElem = optionItem.closest('.product_item_sku').nextElementSibling.lastElementChild;

        parent_dom.dataset.id = optionItem.dataset.id;

        if (optionItem.dataset.price == 0) {
          priceElem.innerText = 'FREE';
          priceElem.classList.remove('price');
          priceElem.classList.add('customize_price');
        } else {
          priceElem.innerText = optionItem.dataset.price;
          priceElem.classList.remove('customize_price');
          priceElem.classList.add('price');
        }
        if (optionItem.hasAttribute('data-compare-price')) {
          comparePriceElem.innerText = optionItem.dataset.comparePrice;
        }

        if (optionItem.dataset.price == 0 && optionItem.hasAttribute('data-compare-price')) {
          input_dom.dataset.price = optionItem.dataset.comparePrice;
        }
        if (optionItem.dataset.price != 0) {
          input_dom.dataset.price = optionItem.dataset.price;
        }
        getCheckedPrice();
      }
    });
  });
}

// 总价格
const skuCheckboxs = document.querySelectorAll('.product-item_checkbox.product-item_check-selest');

if (document.querySelector('.impact-accessories-product-foldBox')) {
  getCheckedPrice();
}
skuCheckboxs.forEach((checkbox) => {
  checkbox.addEventListener('change', () => {
    getCheckedPrice();
  });
});

function getCheckedPrice() {
  const checkedCheckboxes = Array.from(skuCheckboxs).filter((checkbox) => checkbox.checked);

  // 先把价格转换成整数（单位是分），累加后再除以100
  const priceTotalCents = checkedCheckboxes
    .filter((item) => item.dataset.price)
    .reduce((total, item) => {
      const priceStr = item.dataset.price.split('$')[1];
      let priceNum = 0;
      if (priceStr.includes(',')) {
        const priceStr_ = priceStr.replace(/,/g, '');
        priceNum = parseFloat(priceStr_);
      } else {
        priceNum = parseFloat(priceStr);
      }
      if (isNaN(priceNum)) return total;
      return total + Math.round(priceNum * 100);
    }, 0);

  const priceTotal = (priceTotalCents / 100).toFixed(2); // 保留2位小数并转为字符串

  const priceElement = document.querySelector('.impact-accessories-product-foldBox .prict-toal');
  if (priceElement) {
    priceElement.innerText = priceTotal;
  }
}
