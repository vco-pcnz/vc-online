import { defineComponent, ref, computed, onMounted, onActivated, onDeactivated, onBeforeUnmount, watch, nextTick, h } from "vue";

function createIframeComponent(name, url) {
  return defineComponent({
    name,
    setup() {
      const config = {
        keepAlive: false
      }
      const rootRef = ref(null);
      const iframeEl = ref(null);
      const keepAlive = computed(() => config.keepAlive);
      const createIframe = () => {
        var _a;
        const el = document.createElement("iframe");
        el.classList.add("ele-admin-iframe");
        el.src = url;
        const parentNode = (_a = rootRef.value) == null ? void 0 : _a.parentNode;
        if (parentNode) {
          parentNode.insertBefore(el, rootRef.value);
          iframeEl.value = el;
        }
      };
      onMounted(() => {
        if (keepAlive.value) {
          createIframe();
        }
      });
      onActivated(() => {
        if (iframeEl.value) {
          iframeEl.value.style.display = "";
        }
      });
      onDeactivated(() => {
        if (iframeEl.value) {
          iframeEl.value.style.display = "none";
        }
      });
      onBeforeUnmount(() => {
        var _a;
        if (iframeEl.value) {
          (_a = iframeEl.value.parentNode) == null ? void 0 : _a.removeChild(iframeEl.value);
          iframeEl.value = null;
        }
      });
      watch(keepAlive, (keepAlive2) => {
        if (keepAlive2 && !iframeEl.value) {
          nextTick(() => {
            createIframe();
          });
        }
      });
      return () => {
        if (config.keepAlive || iframeEl.value) {
          return h("div", {
            ref: rootRef,
            style: { display: "none" }
          });
        }
        return h("iframe", {
          ref: rootRef,
          src: url,
          class: "ele-admin-iframe"
        });
      };
    }
  });
}
export {
  createIframeComponent
};
