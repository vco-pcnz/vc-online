<template>
  <div class="layout_header">
    <div class="header_title">VC Online</div>
    <div class="header_container">
      <div class="menu_content">
        <router-link
          v-for="link in menuData"
          :key="link.path"
          :to="link.path"
          class="link"
          :class="{ 'link_active': isActive(link.path) }"
        >
          {{ t(link.title) }}
        </router-link>
      </div>
      
      <div class="profile_content">
        <div class="profile_info">
          <language-select></language-select>
          <router-link to="/users/list">
            <vco-avatar
              :src="userInfo?.avatar || ''"
              :size="26"
            />
          </router-link>
          <router-link
            to="/users/profile/about"
            class="link"
            :class="{ 'link_active': isUserActive() }"
          >
            <div class="user_info">
              <a-space>
                <span class="user_name">{{ userInfo?.user_name || 'UserName' }}</span>
                <a-badge
                  class="badge"
                  size="small"
                  :count="notifications.length"
                  v-if="!!notifications.length"
                />
              </a-space>
              <p>{{ userInfo?.roles || 'Vip' }}</p>
            </div>
          </router-link>
        </div>
        <a-dropdown class="dropdown_menu">
          <a class="ant-dropdown-link" @click.prevent>
            <i class="iconfont">&#xe77f;</i>
          </a>
          <template #overlay>
            <a-menu>
              <a-menu-item v-for="item in menuItem" :key="item.key" @click="goTo(`${item.to}`)">
                <div class="user-hanle-item">{{ item.label }}</div>
              </a-menu-item>
              <a-menu-item>
                <div class="user-hanle-item" @click="handleLogout">{{ t("退出") }}</div>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { cloneDeep } from "lodash"
import LanguageSelect from "@/components/language-select/index.vue";
import { useUserStore } from "@/store";
import { useRouter, useRoute } from "vue-router";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

const userStore = useUserStore();
const userInfo = computed(() => userStore.userInfo)

const menuData = computed(() => {
  const data = userStore.routerInfo || []
  const dataArr = cloneDeep(data)
  const resData = dataArr.filter(item => !item.meta.hide).map(item => {
    return {
      title: item.meta.title,
      path: item.path
    }
  })
  return resData
})

const otherRoute = ['/users/profile']
const isInOther = (path) => {
  let res = false
  for (let i = 0; i < otherRoute.length; i++) {
    res = path.indexOf(otherRoute[i]) > -1
    if (res) {
      return res
    }
  }
  return res
}
const isActive = (path) => {
  return isInOther(route.path) ? false : route.path.startsWith(path); // 判断当前路径是否以父级路径开头
};

const isUserActive = () => {
  return route.path.startsWith('/users/profile')
}

const notifications = ref(Array(120).fill(1));

const menuItem = [
  { label: t('编辑详情'), key: "edit-profile", to: "/users/profile/about" },
  { label: t('修改密码'), key: "change-pwd", to: "/users/profile/safe" },
]

const goTo = (path) => {
  router.push(path);
};

const handleLogout = () => {
  userStore.logout();
};
</script>

<style lang="less" scoped>
@import "@/styles/variables.less";

.layout_header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 48px;
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
        padding-left: 20px;
        padding-right: 20px;
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
        > p {
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

    &:hover,
    &:focus {
      &:not(.link_active) {
        background-color: rgba(@color_black, 0.1);
      }
    }

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
</style>
