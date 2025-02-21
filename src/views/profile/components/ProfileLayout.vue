<template>
  <div class="TabsPanel">
    <div class="Panel">
      <h2 class="Panel-Title">
        <a-tag class="Tag">{{ userName }}` {{ t('用户中心') }}</a-tag>
      </h2>
    </div>
    <div class="TabsPanel-Tab">
      <a-button
        v-for="item in panes"
        :key="item.key"
        @click="onChange(item.key)"
        :class="`tab-button ${
          item.key === props.activeTab ? 'active-tab' : ''
        }`"
      >
        {{ item.label }}
        {{ item.extraInfo ? `(${item.extraInfo})` : '' }}
      </a-button>
    </div>
  </div>
  <div class="profile-container">
    <div class="profile-info">
      <div class="profile-info-header">
        <div class="avatar">
          <vco-avatar :size="124" style="margin: auto" :src="avatarSrc" />
        </div>
        <div class="info-detail">
          <p v-for="(info,index) in baseInfo" :key="index">
            <span class="label">
              <i
                :class="`iconfont ${info.isVerify ? 'iconfont_yellow' : ''}`"
                v-html="info.icon"
                v-if="info.icon"
              />
              {{ info.label }}:
            </span>
            <span class="value">{{ info.value }}</span>
          </p>
        </div>
      </div>
      <div class="profile-info-detail">
        <p v-for="(info,index) in extraInfo" :key="index">
          <span class="label">
            <i class="iconfont text-2xl" v-html="info.icon" v-if="info.icon" />
            &nbsp;
          </span>
          <span class="detail">
            {{ info.value }}
          </span>
        </p>
      </div>
    </div>
    <div class="profile-content">
      <slot name="content"></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useUserDetailStore, useNoticeStore } from '@/store';

const { t } = useI18n();
const router = useRouter();
const userDetailStore = useUserDetailStore();
const noticeStore = useNoticeStore();
const baseInfo = ref();
const extraInfo = ref();
const userName = ref('');
const avatarSrc = computed(() => userDetailStore.userDetail.avatar);

const props = defineProps(['activeTab']);

const panes = reactive([
  {
    key: 'about',
    label: t('关于'),
  },
  {
    key: 'safe',
    label: t('安全'),
  },
  {
    key: 'notice',
    label: t('通知'),
    extraInfo: 0,
  },
  {
    key: 'parentTeam',
    label: t('我的组织'),
  },
  {
    key: 'team',
    label: t('我的团队'),
  },
]);

const onChange = (key) => {
  if (noticeStore.showDetail) {
    noticeStore.setShowDetail(false);
  } else {
    router.push(`/profile/${key}`);
  }
};

const setUserInfo = (data) => {
  const {
    username,
    email,
    email_ok,
    pre,
    mobile,
    mobile_ok,
    user_name,
    roles,
  } = data;
  const _baseInfo = [
    {
      label: 'ID',
      value: username,
    },
    {
      icon: '&#xe73b;',
      label: t('名字'),
      value: user_name,
    },
    {
      icon: '&#xe66f;',
      label: t('邮箱'),
      value: email,
      isVerify: !!email_ok,
    },
    {
      icon: '&#xe61d;',
      label: t('手机号'),
      value: `+${pre} ${mobile}`,
      isVerify: !!mobile_ok,
    },
  ];
  const _extraInfo = [
    {
      icon: '&#xe8db;',
      value: roles.join('/'),
    },
  ];
  baseInfo.value = _baseInfo;
  extraInfo.value = _extraInfo;
  userName.value = user_name;
};

onMounted(() => {
  userDetailStore.getUserInfo();

});

watch(
  () => userDetailStore.userDetail,
  (val) => {
    if (Object.keys(val)) {
      setUserInfo(val);
    }
  }
);

watch(
  () => noticeStore.noticeCount,
  (val) => {
    if (val) {
      panes.forEach((item) => {
        if (item.key === 'notice') {
          item.extraInfo = val;
        }
      });
    }
  },
  {
    immediate: true,
  }
);
</script>

<style scoped lang="less">
@import '@/styles/variables.less';

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
  position: relative;
  display: grid;
  grid-template-columns: 315px 1fr;
  gap: 24px;
  align-items: flex-start;

  .profile-info {
    overflow: hidden;
    background-color: #faf9f9;
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

    .iconfont_yellow {
      color: @clr_yellow;
    }
  }

  .profile-content {
    background-color: #faf9f9;
    border-radius: 12px;
    padding: 30px;
  }
}
</style>
