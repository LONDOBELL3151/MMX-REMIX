if (!customElements.get('impact-product-card')) {
  class ImpactProductCard extends HTMLElement {
    constructor() {
      super();

      this.colorSwatches = this.querySelectorAll('.info .color_input');
      this.productImage = this.querySelector('.impactFeaturedCollectionBuy_product-img');
      this.productUrls = this.querySelectorAll('.product-url');

      this.colorSwatches.forEach((swatch) => {
        swatch.addEventListener('click', this.handleSwatchClick.bind(this));
      });

      // 图片缓存系统（存储src和srcset）
      this.imageCache = new Map(); // 格式: { url: { src: string, srcset: string } }
    }

    /**
     * 处理颜色选择点击事件
     * @param {Event} event 点击事件
     */
    handleSwatchClick(event) {
      const clickedSwatch = event.currentTarget;
      if (clickedSwatch.classList.contains('active')) return;

      const newImageUrl = clickedSwatch.dataset.productColorImg;
      const fullImageUrl = 'https:' + newImageUrl;

      // 生成srcset（响应式图片所需的不同尺寸）
      const srcsetValue = this.generateSrcSet(fullImageUrl);

      const productDataColorUrl = clickedSwatch.dataset.productColorUrl;

      // 禁用按钮防止重复点击
      this.disableSwatches();

      // 检查缓存
      if (this.imageCache.has(newImageUrl)) {
        const cached = this.imageCache.get(newImageUrl);
        this.switchImage(cached.src, cached.srcset, productDataColorUrl);
        this.updateActiveSwatch(clickedSwatch);
        this.enableSwatches();
      } else {
        // 预加载新图片
        this.preloadImage(fullImageUrl, srcsetValue)
          .then(() => {
            // 缓存图片数据
            this.imageCache.set(newImageUrl, {
              src: fullImageUrl,
              srcset: srcsetValue,
            });
            // 切换图片
            this.switchImage(fullImageUrl, srcsetValue, productDataColorUrl);
            this.updateActiveSwatch(clickedSwatch);
          })
          .catch((error) => {
            console.error('图片加载失败:', error);
          })
          .finally(() => {
            this.enableSwatches();
          });
      }
    }

    generateSrcSet(baseUrl) {
      const widths = [200, 300, 400, 500, 600, 700, 800, 1000, 1200, 1400, 1600, 1800];
      return widths.map((width) => `${baseUrl}&width=${width} ${width}w`).join(', ');
    }

    /**
     * 禁用所有颜色选择按钮
     */
    disableSwatches() {
      this.colorSwatches.forEach((swatch) => {
        swatch.style.pointerEvents = 'none';
        swatch.style.opacity = '0.7';
      });
    }

    /**
     * 启用所有颜色选择按钮
     */
    enableSwatches() {
      this.colorSwatches.forEach((swatch) => {
        swatch.style.pointerEvents = 'auto';
        swatch.style.opacity = '1';
      });
    }

    /**
     * 切换显示的产品图片
     */
    switchImage(newImageUrl, srcsetValue, productDataColorUrl) {
      // 1. 先淡出当前图片
      this.productImage.style.opacity = '0';

      // 2. 创建临时图片预加载
      const tempImg = new Image();
      tempImg.src = newImageUrl;
      tempImg.srcset = srcsetValue;

      tempImg.onload = () => {
        // 3. 更新图片元素属性
        this.productImage.src = newImageUrl;
        this.productImage.srcset = srcsetValue;

        this.productUrls.forEach((item) => {
          item.href = productDataColorUrl;
        });

        // 4. 淡入新图片
        setTimeout(() => {
          this.productImage.style.opacity = '1';
        }, 50);
      };

      tempImg.onerror = () => {
        console.error('图片加载失败:', newImageUrl);
        this.productImage.style.opacity = '1'; // 恢复显示原图
      };
    }

    /**
     * 预加载图片
     */
    preloadImage(url, srcset) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = url;
        img.srcset = srcset;

        img.onload = resolve;
        img.onerror = reject;
      });
    }

    /**
     * 更新当前选中的颜色按钮状态
     */
    updateActiveSwatch(newActiveSwatch) {
      // 移除所有active状态
      this.colorSwatches.forEach((swatch) => {
        swatch.classList.remove('active');
        swatch.removeAttribute('aria-current');
      });

      // 设置新选中状态
      newActiveSwatch.classList.add('active');
      newActiveSwatch.setAttribute('aria-current', 'true');
    }
  }

  customElements.define('impact-product-card', ImpactProductCard);
}

class ImpactVariantSelectColor extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    this.addEventListener('change', (event) => {
      this.updateSelectionMetadata(event);
    });
  }
  updateSelectionMetadata({ target }) {
    const { value, tagName } = target;
    if (tagName === 'INPUT' && target.type === 'radio') {
      const selectedSwatchValue = target.closest(`.product-form__input`).querySelector('[data-selected-value]');
      if (selectedSwatchValue) selectedSwatchValue.innerHTML = value;
    }
  }
}
customElements.define('impact-variant-select-color', ImpactVariantSelectColor);
