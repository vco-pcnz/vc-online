<template>
  <div class="layout_header">
    <div class="header_title">VC Online</div>
    <div class="header_container">
      <div class="menu_content">
        <router-link v-for="link in menuData" :key="link.path" :to="link.path" class="link" :class="{ link_active: isActive(link.path) }">
          <a-badge v-if="link.path === '/tasks'" :count="taskInfo.total">
            <p class="router-name">{{ t(link.title) }}</p>
          </a-badge>

          <a-dropdown v-else-if="link.path === '/dashboard'">
            <p class="router-name flex gap-1">
              {{ t(link.title) }}
              <DownOutlined style="transform: scale(0.7)" />
            </p>
            <template #overlay>
              <a-menu style="margin-left: -8px; margin-top: 15px">
                <a-menu-item>
                  <a class="fs_sm" href="/dashboard/cashflow">Cashflow </a>
                </a-menu-item>
                <a-menu-item>
                  <a class="fs_sm" href="/dashboard/income">{{ t('收入') }}</a>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
          <p class="router-name" v-else>{{ t(link.title) }}</p>
        </router-link>
      </div>

      <div class="profile_content">
        <div class="profile_info">
          <!-- <language-select></language-select> -->
            <vco-avatar class="cursor-pointer" :src="userInfo?.avatar || ''" :size="26" @click="toProfile('/profile/about')" />
          <div class="link" :class="{ link_active: isUserActive() }">
            <div class="user_info">
              <a-space>
                <span class="user_name" @click="toProfile('/profile/about')">{{ userInfo?.user_name || 'UserName' }}</span>
                <a-badge @click.stop="toProfile('/profile/notice')" class="badge" size="small" :count="noticeStore.noticeCount" v-if="!!noticeStore.noticeCount" />
              </a-space>
              <div v-if="userInfo?.roles">
                <template v-for="item in userInfo?.roles.split('/')" :key="item">
                  <a-tag color="orange" v-if="item == 'Funding Partner' && userInfo?.roles.split('/').length != 1" @click="toLoans(item)">{{ item }}</a-tag>
                  <a-tag color="orange" v-else-if="item == 'Umbrella' && userInfo?.roles.split('/').length != 1" @click="toLoans(item)">{{ item }}</a-tag>
                  <span class="mr-3" v-else>{{ item }}</span>
                </template>
              </div>
              <p v-else>Vip</p>
            </div>
          </div>
        </div>
        <a-dropdown class="dropdown_menu">
          <a class="ant-dropdown-link" @click.prevent>
            <i class="iconfont">&#xe77f;</i>
          </a>
          <template #overlay>
            <a-menu>
              <a-menu-item v-if="hasPermission('profile:apply:broker') && userInfo?.roles === 'Vip'">
                <ApplyBroker v-if="!applyBrokerData">
                  <div class="user-hanle-item">{{ t('申请中介') }}</div>
                </ApplyBroker>
                <ApplyBrokerDetail :detailData="applyBrokerData?.data" :process="applyBrokerData" @update="LoadApplyBrokerDetail" v-else>
                  <div class="user-hanle-item">{{ t('申请中介') }}</div>
                </ApplyBrokerDetail>
              </a-menu-item>
              <a-menu-item v-for="item in menuItem" :key="item.key" @click="goTo(`${item.to}`)">
                <div class="user-hanle-item">{{ item.label }}</div>
              </a-menu-item>
              <a-menu-item>
                <div class="user-hanle-item" @click="handleLogout">{{ t('退出') }}</div>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { cloneDeep } from 'lodash';
import LanguageSelect from '@/components/language-select/index.vue';
import { useUserStore, useNoticeStore } from '@/store';
import { useRouter, useRoute } from 'vue-router';
import { navigationTo } from '@/utils/tool';
import { systemConfigData } from '@/api/system';
import { hasPermission } from '@/directives/permission/index';
import ApplyBroker from '@/views/profile/apply-broker/form.vue';
import ApplyBrokerDetail from '@/views/profile/apply-broker/detail.vue';
import { applyBrokerDetail } from '@/api/tasks';
import { DownOutlined } from '@ant-design/icons-vue';

const pageRole = computed(() => useUserStore().pageRole);

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

const userStore = useUserStore();
const userInfo = computed(() => userStore.userInfo);
const taskInfo = computed(() => userStore.taskInfo);

const noticeStore = useNoticeStore();

const menuData = computed(() => {
  const data = userStore.routerInfo || [];
  const dataArr = cloneDeep(data);
  const resData = dataArr
    .filter((item) => !item.meta.hide)
    .map((item) => {
      return {
        title: item.meta.title,
        path: item.path
      };
    });
  return resData;
});

const otherRoute = ['/profile'];
const processShowRoute = ['requests'];

const routeInArr = (path, arr) => {
  let res = false;
  for (let i = 0; i < arr.length; i++) {
    res = path.indexOf(arr[i]) > -1;
    if (res) {
      return res;
    }
  }
  return res;
};

const routeActive = (path) => {
  let res = route.path.startsWith(path);
  if (route.path.indexOf('process') > -1) {
    res = routeInArr(path, processShowRoute);
  }
  return res;
};

const isActive = (path) => {
  return routeInArr(route.path, otherRoute) ? false : routeActive(path); // 判断当前路径是否以父级路径开头
};

const isUserActive = () => {
  return route.path.startsWith('/profile');
};

const menuItem = [
  { label: t('编辑详情'), key: 'edit-profile', to: pageRole.value == 'Investor' ? '/investor/profile/about' : '/profile/about' },
  { label: t('修改密码'), key: 'change-pwd', to: pageRole.value == 'Investor' ? '/investor/profile/safe' : '/profile/safe' }
];

const goTo = (path) => {
  router.push(path);
};

const handleLogout = () => {
  userStore.logout();
};

const applyBrokerData = ref();
const LoadApplyBrokerDetail = () => {
  applyBrokerDetail().then((res) => {
    applyBrokerData.value = res;
  });
};

const toLoans = (val) => {
  if (val === 'Funding Partner') {
    navigationTo('/investor/projects', true);
  }
  if (val === 'Umbrella') {
    navigationTo('/umbrella/projects', true);
  }
};

const toProfile = (val) => {
  let mode = pageRole.value ? '/' + pageRole.value.toLowerCase() : '';
  navigationTo(mode + val);
};

// 组件挂载时启动定时器
onMounted(() => {
  systemConfigData({ pcode: 'web_config', code: 'notes_interval_time' }).then((res) => {
    if (res.notes_interval_time) {
      noticeStore.startPolling(res.notes_interval_time);
    }
  });

  if (hasPermission('profile:apply:broker')) {
    LoadApplyBrokerDetail();
  }
});

// 组件卸载时停止定时器
onUnmounted(() => {
  noticeStore.stopPolling();
});
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.layout_header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  height: 72px;

  .header_title {
    white-space: nowrap;
    font-size: 38px;
    font-weight: 500;
  }

  .header_container {
    flex: 1;
    margin-left: 48px;
    display: flex;
    justify-content: space-between;
    height: 100%;

    .menu_content {
      display: flex;
      align-items: center;
      justify-content: flex-end;

      .link {
        padding-left: 10px;
        padding-right: 10px;
      }
    }

    .profile_info {
      display: flex;
      align-items: center;
      height: 100%;
      gap: 5px;

      :deep(.lang-item) {
        margin-right: 15px;
      }
    }

    .profile_content {
      display: flex;

      .user_info {
        padding: 0 6px;
        .user_name {
          font-weight: 700;
          font-size: 16px;
          color: #181818;
        }
        > p,
        span {
          color: #888;
          font-size: 13px;
        }
      }
      .dropdown_menu {
        align-self: center;
        width: 32px;
        height: 32px;
        text-align: center;
        margin-left: 12px;
      }
    }
  }

  .link {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 64px;
    font-size: @fs_sm;
    font-weight: 600;
    color: @clr_charcoal;
    height: 100%;
    cursor: pointer;
    &:hover :deep(.ant-badge .ant-badge-count) {
      background: #ff7875;
    }
    // &:hover,
    // &:focus {
    //   &:not(.link_active) {
    //     background-color: rgba(@color_black, 0.1);
    //   }
    // }

    &_active {
      border-bottom: 3px solid @clr_yellow;
    }
  }
}

.user-hanle-item {
  min-width: 100px;
  text-align: center;
  white-space: nowrap;
}

.router-name {
  line-height: 2;
}
</style>
