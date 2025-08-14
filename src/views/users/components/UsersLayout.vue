<template>
  <div>
    <!-- <vco-page-nav sup-path="/users">
      <template #action>
        <a-button type="cyan" shape="round" @click="showUserModal()">
          {{ t('新增用户') }}
        </a-button>
      </template>
    </vco-page-nav> -->
    <GroupTab>
      <a-button type="cyan" shape="round" @click="showUserModal()">
        {{ t('新增用户') }}
      </a-button>
    </GroupTab>

    <div class="mt-5">
      <vco-page-tab :tabData="tabData" v-model:current="currentTab" @change="tabChange"></vco-page-tab>
      <table-search></table-search>
      <div class="mt-10">
        <vco-table-tool>
          <template #left>
            <a-button type="cyan" :disabled="!rowSelection.length" @click="setOpen(true)" v-if="hasPermission('users:distribute')">
              {{ t('分配角色') }}
            </a-button>
            <a-button type="cyan" :disabled="!rowSelection.length" @click="setOpenProjects(true)" v-if="hasPermission('users:distribute') && usersStore.searchParams.role_cid == 4">
              {{ t('分配项目') }}
            </a-button>
          </template>
          <template #right>
            <vco-table-sort v-model="sortType" v-model:value="sortValue" :type-data="sortTypeData"></vco-table-sort>
          </template>
        </vco-table-tool>

        <div class="mt-5">
          <a-spin :spinning="usersStore.loading" size="large">
            <div class="table-content">
              <table-block :table-data="tableData" v-model:keys="rowSelection" v-model:data="rowSelectionData"></table-block>
            </div>
            <div class="mt-5">
              <a-pagination
                size="small"
                :total="usersStore.total"
                :pageSize="usersStore.pagination.limit"
                :current="usersStore.pagination.page"
                show-size-changer
                show-quick-jumper
                :hideOnSinglePage="true"
                :show-total="(total) => t('共{0}条', [total])"
                @change="handlePageChange"
              />
            </div>
          </a-spin>
        </div>
      </div>
    </div>
  </div>
  <add-user v-model:open="showAdd" :userData="userData" />
  <assign-roles v-model:open="open" :title="t('分配角色')" :uuids="rowSelection" :selectedData="rowSelectionData" />
  <assign-projects v-model:visible="open_projects" :uuids="rowSelection" :selectedData="rowSelectionData" />
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { hasPermission } from '@/directives/permission/index';
import { useI18n } from 'vue-i18n';
import TableSearch from './UsersSearch.vue';
import TableBlock from './UsersTable.vue';
import { useUsersStore } from '@/store';
import AssignRoles from './AssignRoles.vue';
import AssignProjects from './AssignProjects.vue';
import GroupTab from './../components/GroupTab.vue';
import AddUser from './AddUser.vue';

const { t } = useI18n();
const usersStore = useUsersStore();
const open = ref(false);
const open_projects = ref(false);
const showAdd = ref(false);
const userData = ref({});

const sortType = ref('desc');
const sortValue = ref('');

const rowSelection = ref([]);
const rowSelectionData = ref([]);

const tableData = computed(() => usersStore.userList);

const sortTypeData = ref([
  {
    label: t('默认'),
    value: ''
  },
  {
    label: t('名字'),
    value: 'firstName'
  },
  {
    label: t('ID'),
    value: 'id'
  },
  {
    label: t('注册日期'),
    value: 'create_time'
  }
]);

const showUserModal = (data = {}) => {
  showAdd.value = true;
  userData.value = data;
};

const setOpen = (flag) => {
  open.value = flag;
};

const setOpenProjects = (flag) => {
  open_projects.value = flag;
};

const handlePageChange = (current, size) => {
  usersStore.setPaginate(current, size);
};

watch([sortType, sortValue], ([newSortType, newSortValue]) => {
  let desc = 'sort__desc';
  let asc = 'sort__asc';
  let params = {};
  if (newSortType === 'desc') {
    params = {
      [desc]: newSortValue,
      [asc]: undefined
    };
  } else {
    params = {
      [desc]: undefined,
      [asc]: newSortValue
    };
  }
  usersStore.setSearchParams(params);
});

const currentTab = ref(undefined);
const tabData = ref([
  {
    label: t('列表'),
    value: ''
  },
  {
    label: t('个人'),
    value: '0'
  },
  {
    label: t('公司'),
    value: '1'
  }
]);

const tabChange = () => {
  usersStore.setSearchParams({ type: currentTab.value ? currentTab.value : undefined });
};
</script>

<style lang="less" scoped>
.table-content {
  width: 100%;
  min-height: 300px;
}
</style>
