if (!customElements.get("product-form")) {
  customElements.define(
    "product-form",
    class ProductForm extends HTMLElement {
      constructor() {
        super();

        this.form = this.querySelector("form");
        this.form.querySelector("[name=id]").disabled = false;
        this.form.addEventListener("submit", this.onSubmitHandler.bind(this));
        this.cart =
          document.querySelector("cart-notification") ||
          document.querySelector("cart-drawer");
        this.quickBuyCart = document.querySelector("impact-cart-modal-dialog");
        this.submitButton = this.querySelector('[type="submit"]');
        if (document.querySelector("cart-drawer"))
          this.submitButton.setAttribute("aria-haspopup", "dialog");

        this.hideErrors = this.dataset.hideErrors === "true";
      }

      onSubmitHandler(evt) {
        evt.preventDefault();

        const formData = new FormData();

        if (this.submitButton.getAttribute("aria-disabled") === "true") return;

        this.handleErrorMessage();

        this.submitButton.setAttribute("aria-disabled", true);
        this.submitButton.classList.add("loading");
        this.querySelector(".loading-overlay__spinner").classList.remove(
          "hidden"
        );

        //附加商品
        let additionalProduct = this.watchCheckboxChanges((item) => {
          additionalProduct = item;
        });

        const config = fetchConfig("javascript");
        config.headers["X-Requested-With"] = "XMLHttpRequest";
        delete config.headers["Content-Type"];

        if (additionalProduct != 0 && additionalProduct?.count > 0) {
          const propertiesId = this.generateUniqueId();

          const accessoryData = [...additionalProduct.values, new FormData(this.form).get('id')];

          accessoryData.forEach((item, index) => {
            if (typeof item === 'string') {
              formData.append(`items[${index}][id]`, item);
            } else {
              formData.append(`items[${index}][id]`, item.id);
              for (const [key, value] of Object.entries(item)) {
                if (key != 'id') {
                  formData.append(`items[${index}][properties][_${key}]`, value);
                }
              }
            }

            if (item == new FormData(this.form).get('id')) {
              formData.append(`items[${index}][quantity]`, new FormData(this.form).get('quantity'));
              formData.append(`items[${index}][properties][_grade]`, 'classA');
            } else {
              formData.append(`items[${index}][quantity]`, 1);
            }

            // 添加属性
            const properties = {
              _bind: propertiesId,
            };
            for (const [key, value] of Object.entries(properties)) {
              formData.append(`items[${index}][properties][${key}]`, value);
            }
          });

          formData.append('form_type', 'product');
          formData.append('utf8', '✓');
        } else {
          new FormData(this.form).forEach((value, key) => {
            formData.append(key, value);
          });
        }

        // const formData = new FormData(this.form);
        if (this.cart) {
          formData.append(
            "sections",
            this.cart.getSectionsToRender().map((section) => section.id)
          );
          formData.append("sections_url", window.location.pathname);
          this.cart.setActiveElement(document.activeElement);
        }
        if (document.querySelectorAll('impact-product-card').length > 0 && this.quickBuyCart) {
          formData.append(
            "sections",
            this.quickBuyCart.getSectionsToRender().map((section) => section.id)
          );
          formData.append("sections_url", window.location.pathname);
        }
        config.body = formData;

        fetch(`${routes.cart_add_url}`, config)
          .then((response) => response.json())
          .then((response) => {
            if (response.status) {
              publish(PUB_SUB_EVENTS.cartError, {
                source: "product-form",
                productVariantId: new FormData(this.form).get('id'),
                errors: response.description,
                message: response.message,
              });
              this.handleErrorMessage(response.description);

              const soldOutMessage =
                this.submitButton.querySelector(".sold-out-message");
              if (!soldOutMessage) return;
              this.submitButton.setAttribute("aria-disabled", true);
              this.submitButton.querySelector("span").classList.add("hidden");
              soldOutMessage.classList.remove("hidden");
              this.error = true;
              return;
            } else if (!this.cart) {
              const quickAddModal = this.closest("quick-add-modal");
              if (
                quickAddModal &&
                quickAddModal?.classList.contains("impact-quick-buy-pop")
              ) {
                this.quickBuyCart.renderContents_(response);
                quickAddModal.hide(true);
              } else {
                window.location = window.routes.cart_url;
              }
              
              return;
            }

            if (!this.error)
              publish(PUB_SUB_EVENTS.cartUpdate, {
                source: "product-form",
                productVariantId: new FormData(this.form).get('id'),
              });
            this.error = false;
            const quickAddModal = this.closest("quick-add-modal");
            if (quickAddModal) {
              document.body.addEventListener(
                "modalClosed",
                () => {
                  setTimeout(() => {
                    this.cart.renderContents(response);
                  });
                },
                { once: true }
              );
              quickAddModal.hide(true);
              if (quickAddModal?.classList.contains("impact-quick-buy-pop")) {
                this.quickBuyCart.renderContents_(response);
              }
            } else {
              this.cart.renderContents(response);
            }
          })
          .catch((e) => {
            console.error(e);
          })
          .finally(() => {
            this.submitButton.classList.remove("loading");
            if (this.cart && this.cart.classList.contains("is-empty"))
              this.cart.classList.remove("is-empty");
            if (!this.error) this.submitButton.removeAttribute("aria-disabled");
            this.querySelector(".loading-overlay__spinner").classList.add(
              "hidden"
            );
          });
      }

      handleErrorMessage(errorMessage = false) {
        if (this.hideErrors) return;

        this.errorMessageWrapper =
          this.errorMessageWrapper ||
          this.querySelector(".product-form__error-message-wrapper");
        if (!this.errorMessageWrapper) return;
        this.errorMessage =
          this.errorMessage ||
          this.errorMessageWrapper.querySelector(
            ".product-form__error-message"
          );

        this.errorMessageWrapper.toggleAttribute("hidden", !errorMessage);

        if (errorMessage) {
          this.errorMessage.textContent = errorMessage;
        }
      }

      // 附加商品
      watchCheckboxChanges(callback) {
        const checkboxes = document.querySelectorAll('.product-item_checkbox.product-item_check-selest');

        if (!(checkboxes && Array.from(checkboxes).length > 0)) return 0;

        const getCheckedData = () => {
          const checkedBoxes = [...checkboxes].filter((cb) => cb.checked);
          return {
            count: checkedBoxes.length,
            values: checkedBoxes.map((cb) => {
              const dom = cb.parentElement.parentElement.dataset;
              const val = {
                id: dom.id,
              };
              if (dom.link) {
                val.link = dom.link;
              }

              if (Object.keys(dom).length == 1) {
                return dom.id;
              } else {
                return val;
              }
            }),
          };
        };

        checkboxes.forEach((checkbox) => {
          checkbox.addEventListener('change', () => {
            callback(getCheckedData()); // 每次变化时返回最新数据
          });
        });

        return getCheckedData(); // 返回初始数据
      }
      // 产品+附加商品绑定
      generateUniqueId() {
        const timestamp = Date.now().toString(36);
        const randomPart = Math.random().toString(36).substring(2, 6);
        return new FormData(this.form).get('id') + '_' + timestamp + randomPart;
      }

    }
  );
}
