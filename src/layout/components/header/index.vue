<template>
  <div class="layout_header">
    <div class="header_title">VC Online</div>
    <div class="container">
      <div class="menu_content">
        <router-link
          v-for="link in links"
          :key="link.key"
          :to="link.to"
          class="link"
          active-class="link_active"
        >
          {{ link.label }}
        </router-link>
      </div>
      <div class="profile_content">
        <div class="profile_info">
          <a-row>
            <!-- <language-select></language-select> -->
            <a-col>
              <router-link to="/profile" class="link">
                <vco-avatar
                  :src="profile.photo"
                  :size="26"
                  :alt="profile.firstName"
                />
              </router-link>
            </a-col>
            <a-col>
              <router-link
                to="/profile"
                class="link"
                active-class="link_active"
              >
                <div class="user_info">
                  <a-space>
                    <span class="user_name">
                      {{ profile.firstName }}
                      {{ profile.middleName }}
                      {{ profile.lastName }}
                    </span>
                    <a-badge
                      class="badge"
                      size="small"
                      :count="notifications.length"
                      v-if="!!notifications.length"
                    />
                  </a-space>
                  <p>{{ profile.role }}</p>
                </div>
              </router-link>
            </a-col>
          </a-row>
        </div>
        <a-dropdown class="dropdown_menu">
          <a class="ant-dropdown-link" @click.prevent>
            <i class="iconfont">&#xe77f;</i>
          </a>
          <template #overlay>
            <a-menu>
              <a-menu-item v-for="item in menuItem" :key="item.key" @click="goTo(`${item.to}`)">
                {{ item.label }}
              </a-menu-item>
              <a-menu-item>
                <a-button @click="handleLogout">{{ t("退出") }}</a-button>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import LanguageSelect from "@/components/language-select/index.vue";
import { useUserStore } from "@/store";
import { useRouter } from "vue-router";

const { t } = useI18n();
const router = useRouter();

const userStore = useUserStore();
const current = ref(["Projects"]);
const notifications = ref(Array(120).fill(1));

// TODO
const profile = reactive({
  firstName: "John",
  middleName: "Middle",
  lastName: "Doe",
  photo: "",
  role: "Lending Manager",
});

const links = [
  { label: "Projects", key: "Projects", to: "/projects" },
  { label: "Requests", key: "Requests", to: "/requests" },
  { label: "Dashboard", key: "Dashboard", to: "/cashflow" },
  { label: "Users", key: "Users", to: "/users" },
  { label: "Orgs", key: "Orgs", to: "/orgs" },
  { label: "Reconciliation", key: "Reconciliation", to: "/reconciliations" },
];

const menuItem = [
  { label: t('编辑详情'), key: "edit-profile", to: "/profile/about" },
  { label: t('修改密码'), key: "change-pwd", to: "/profile/safe" },
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

  .container {
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
      height: 100%;

      :deep(.ant-row) {
        height: 100%;
      }
    }

    .profile_content {
      display: flex;

      .user_info {
        padding: 0 6px;
      }

      .user_name {
        font-weight: 700;
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
      border-bottom: 3px solid #f19915;
    }
  }
}
</style>
