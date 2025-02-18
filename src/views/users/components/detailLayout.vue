<template>
  <div class="TabsPanel">
    <vco-page-panel :title="userInfo?.user_name+'` '+ title" :isBack="true">
    </vco-page-panel>
    <div class="profile-container">
      <div class="profile-info">
        <div class="profile-info-header">
          <div class="avatar">
            <vco-avatar :size="110" style="margin: auto" :src="userInfo?.avatar" />
          </div>
          <div class="info-detail">
            <p v-for="(info, index) in baseInfo" :key="index">
              <span class="label">
                <i :class="`iconfont ${info.isVerify ? 'iconfont_yellow' : ''}`" v-html="info.icon" v-if="info.icon" />
                {{ info.label }}:
              </span>
              <span class="value">{{ info.value }}</span>
            </p>
          </div>
        </div>
        <div class="profile-info-detail">
          <p v-for="(info, index) in extraInfo" :key="index">
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
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { getUserInfo } from '@/api/users';
import { useRoute } from 'vue-router';
const { t } = useI18n();
const route = useRoute();
const emit = defineEmits(['setDetail']);

const props = defineProps({
  title: {
    type: String
  }
});
const baseInfo = ref();
const extraInfo = ref();
const userInfo = ref();

const setInfoCard = (data) => {
  const { username, email, email_ok, pre, mobile, mobile_ok, user_name, roles } = data;
  const _baseInfo = [
    {
      label: 'ID',
      value: username
    },
    {
      icon: '&#xe73b;',
      label: t('名字'),
      value: user_name
    },
    {
      icon: '&#xe66f;',
      label: t('邮箱'),
      value: email,
      isVerify: !!email_ok
    },
    {
      icon: '&#xe61d;',
      label: t('手机号'),
      value: `+${pre} ${mobile}`,
      isVerify: !!mobile_ok
    }
  ];
  const _extraInfo = [
    {
      icon: '&#xe8db;',
      value: roles.join(' ')
    }
  ];
  baseInfo.value = _baseInfo;
  extraInfo.value = _extraInfo;
};

const getUserDetail = (userId) => {
  const uuid = userId || route.query.uuid;
  if (uuid) {
    getUserInfo({ uuid }).then((res) => {
      userInfo.value = res;
      setInfoCard(res);
      emit('setDetail',res)
    });
  }
};

onMounted(() => {
  getUserDetail();
});

// 暴露方法给父组件
defineExpose({
  getUserDetail
});
</script>

<style scoped lang="less">
@import '@/styles/variables.less';

.TabsPanel {
  position: relative;
  .back-link {
    position: absolute;
    top: -30px;
    left: -15px;
    font-weight: 400;

    &-icon {
      transform: rotate(-135deg);
    }
    :deep(.iconfont) {
      font-size: 12px;
    }
  }
  .Panel {
    // display: grid;
    // grid-template-columns: 1fr auto;
    margin-bottom: 40px;
    padding-bottom: 16px;
    border-bottom: 1px solid grey;

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
}
</style>
