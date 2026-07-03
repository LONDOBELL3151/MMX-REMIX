if (!customElements.get('impact-variant-selects') && !window.impactVariantSelectsRegistered) {
  customElements.define(
    'impact-variant-selects',
    class ImpactVariantSelects extends HTMLElement {
      constructor() {
        super();
        this._connected = false;
      }
      connectedCallback() {
        if (this._connected) return;
        this._connected = true;
        // console.trace('连接堆栈跟踪');
        this.addEventListener('change', (event) => {
          this.updateSelectionMetadata(event);
        });
      }

      updateSelectionMetadata({ target }) {
        const { value, tagName } = target;
        if (tagName === 'INPUT' && target.type === 'radio') {
          //更换 目前已选中的sku名字
          const selectedSwatchValue = target
            .closest(`.impact-product-option-fieldset`)
            .querySelector('[data-selected-value]');

          if (selectedSwatchValue) selectedSwatchValue.innerHTML = value;

          //产品图像 a 标签
          const product_card_url = target.closest(`.impact-variant-selects`).querySelector('.impact-product-card_url');

          // 目标图片
          const selectedProduct = target
            .closest(`.impact-variant-selects`)
            .querySelector('.imapct-product-card__image--primary');

          // 要切换的图片链接-src
          const selectedSwatchImage = 'https:' + target.dataset.productFeaturedImg;

          // 要切换的图片链接-srcset
          const widthValue = ['200', '300', '400', '500', '600', '700', '800', '1000', '1200', '1400', '1600', '1800'];

          let srcsetValue = '';
          widthValue.forEach((item) => {
            srcsetValue += `${selectedSwatchImage}&width=${item} ${item}w, `;
          });
          srcsetValue = srcsetValue.trim().slice(0, -1);

          // 禁用按钮防止重复点击
          target.disabled = true;
          // 1. 先淡出当前图片
          selectedProduct.style.opacity = '0';
          // 2. 淡出动画结束后更换图片源
          setTimeout(() => {
            // 创建新的Image对象预加载
            const newImage = new Image();
            newImage.src = selectedSwatchImage;
            newImage.srcset = srcsetValue;

            newImage.onload = function () {
              // 3. 修改图片地址
              selectedProduct.srcset = srcsetValue;
              selectedProduct.src = selectedSwatchImage;

              // 修改对应图片 a 标签地址：商店+ 产品id
              product_card_url.href = target.dataset.productUrl;

              // 4. 淡入新图片
              setTimeout(() => {
                selectedProduct.style.opacity = '1';
                target.disabled = false;

                // 切换完成后修改按钮文本
                // changeBtn.textContent = '已切换到新图片';
              }, 50); // 小延迟确保src已更新
            };

            newImage.onerror = function () {
              console.error('图片加载失败');
              // 恢复显示原图片
              selectedProduct.style.opacity = '1';
              target.disabled = false;
            };
          }, 300); // 等待淡出动画完成（与CSS过渡时间一致）
        }
      }
    }
  );
}
