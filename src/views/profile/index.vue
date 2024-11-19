<template>
  <div class="TabsPanel">
    <div class="Panel">
      <h2 class="Panel-Title">
        <a-tag class="Tag">
          {{ t("用户中心") }}
        </a-tag>
      </h2>
    </div>
    <div class="TabsPanel-Tab">
      <a-button
        v-for="item in panes"
        :key="item.key"
        @click="onChange(item.key)"
        :class="`tab-button ${item.key === activeKey ? 'active-tab' : ''}`"
      >
        {{ item.label }}
        {{ item.extraInfo ? `(${item.extraInfo})` : "" }}
      </a-button>
    </div>
  </div>
  <router-view />
</template>

<script setup>
import { ref, reactive } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const activeKey = ref("about");

const panes = reactive([
  {
    key: "about",
    label: t("关于"),
  },
  {
    key: "safe",
    label: t("安全"),
  },
  {
    key: "notice",
    label: t("通知"),
    // TODO
    extraInfo: "15",
  },
]);

const onChange = (key) => {
  activeKey.value = key;
};
</script>

<style scoped lang="less">
@import "@/styles/variables.less";

.TabsPanel {
  display: grid;
  grid-template-columns: 1fr auto;
  margin-bottom: 40px;
  padding-bottom: 16px;
  border-bottom: 1px solid grey;

  .Panel {
    display: flex;
    justify-content: stretch;
    align-items: center;
    gap: 20px;

    .Panel-Avatar {
      flex-shrink: 0;
    }

    .Panel-Title {
      font-size: @fs_2xl;
      font-weight: bold;
      width: 100%;
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 12px;
    }

    .Tag {
      display: inline-flex;
      align-items: center;
      gap: 6.8px;
      height: 30px;
      padding: 10.2px 20.4px;
      border-radius: 37.4px;

      font-weight: 500;
      font-size: 14px;
      line-height: 2;
      letter-spacing: 1px;
      text-transform: uppercase;
      white-space: nowrap;
      padding: 15px 30px;
      background-color: @clr_charcoal;
      color: @clr_white;

      border-radius: 0 16px 16px 0;
      overflow: hidden;
    }
  }

  &-Tab {
    list-style: none;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 5px;
  }

  .tab-button {
    color: @clr_charcoal;
    background-color: transparent;
    border: 1px solid @clr_charcoal;
    padding: 4px 20px;
    border-radius: 55px;
  }

  .active-tab {
    color: @clr_yellow;
    border: 1px solid @clr_yellow;
  }
}
</style>
