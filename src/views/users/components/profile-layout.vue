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
          :class="`tab-button ${item.key === props.activeTab ? 'active-tab' : ''}`"
        >
          {{ item.label }}
          {{ item.extraInfo ? `(${item.extraInfo})` : "" }}
        </a-button>
      </div>
    </div>
    <div class="profile-container">
      <div class="profile-info">
        <div class="profile-info-header">
          <div class="avatar">
            <vco-avatar :size="124" style="margin: auto" />
          </div>
          <div class="info-detail">
            <p v-for="info in userInfo">
              <span class="label">
                <i class="iconfont" v-html="info.icon" v-if="info.icon" />
                {{ info.label }}:
              </span>
              <span class="value">{{ info.value }}</span>
            </p>
          </div>
        </div>
        <div class="profile-info-detail">
          <p v-for="info in extraInfo">
            <span class="label">
              <i class="iconfont text-2xl" v-html="info.icon" v-if="info.icon" />
            </span>
            <span class="detail">{{ info.value }}</span>
          </p>
        </div>
      </div>
      <div class="profile-content">
        <slot name="content"></slot>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive } from "vue";
  import { useI18n } from "vue-i18n";
  import { useRouter } from "vue-router";
  
  const { t } = useI18n();
  const router = useRouter();

  const props = defineProps(['activeTab']);
  
  // TODO
  const userInfo = reactive([
    {
      label: "ID",
      value: "123456789",
    },
    {
      icon: "&#xe73b;",
      label: t("名字"),
      value: "John",
    },
    {
      icon: "&#xe66f;",
      label: t("邮箱"),
      value: "hanmeimei@vco.com",
    },
    {
      icon: "&#xe61d;",
      label: t("手机号"),
      value: "+64 17002877777",
    },
  ]);
  
  const extraInfo = reactive([
    {
      icon: "&#xe8db;",
      value: ["vip", "broker"],
    },
  ]);
  
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
    router.push(`/users/profile/${key}`);
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
  
  .profile-container {
    display: grid;
    grid-template-columns: 315px 1fr;
    gap: 24px;
    align-items: flex-start;
  
    .profile-info {
      overflow: hidden;
      border: 1px solid @color_mist;
      background-color: @clr_card_bg;
      border-radius: 12px;
  
      &-header {
        padding: 30px;
        border-bottom: 1px solid @color_mist;
  
        .avatar {
          width: 100%;
        }
  
        .info-detail {
          margin-top: 16px;
        }
      }
  
      &-detail {
        padding: 30px;
      }
  
      .label {
        color: @color_grey;
        font-weight: 500;
      }
  
      .value {
        font-weight: 500;
      }
    }
  
    .profile-content {
      border: 1px solid @color_mist;
      background-color: @clr_card_bg;
      border-radius: 12px;
      padding: 30px;
    }
  }
  </style>
  