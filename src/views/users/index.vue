<template>
  <div>
    <vco-page-nav sup-path="/users">
      <template #action>
        <a-button type="cyan" shape="round" @click="handleAddUser">
          {{ t('新增用户') }}
        </a-button>
      </template>
    </vco-page-nav>

    <div class="mt-5">
      <table-search></table-search>
      <div class="mt-10">
        <vco-table-tool>
          <template #left>
            <a-button
              type="cyan"
              :disabled="!rowSelection.length"
              @click="setOpen(true)"
            >
              {{ t('分配角色') }}
            </a-button>
          </template>
          <template #right>
            <vco-table-sort
              v-model="sortType"
              v-model:value="sortValue"
              :type-data="sortTypeData"
            ></vco-table-sort>
          </template>
        </vco-table-tool>

        <div class="mt-5">
          <a-spin :spinning="tableLoading" size="large">
            <div class="table-content">
              <table-block
                :table-data="tableData"
                :indeterminate="
                  Boolean(
                    rowSelection.length &&
                      rowSelection.length !== tableData.length
                  )
                "
                @check="checkHandle"
              ></table-block>
            </div>
            <div class="mt-5">
              <a-pagination
                size="small"
                :total="usersStore.total"
                show-size-changer
                show-quick-jumper
                :show-total="(total) => t('共{0}条', [total])"
                @change="handlePageChange"
              />
            </div>
          </a-spin>
        </div>
      </div>
    </div>
  </div>
  <add-user v-model:open="showAdd" :title="t('新增用户')" />
  <assign-roles
    v-model:open="open"
    :title="t('分配角色')"
    :uuids="rowSelection"
  />
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import TableSearch from './components/UsersSearch.vue';
import TableBlock from './components/UsersTable.vue';
import { useUsersStore } from '@/store';
import AssignRoles from './components/AssignRoles.vue';
import AddUser from './components/AddUser.vue';

const { t } = useI18n();
const usersStore = useUsersStore();
const tableLoading = ref(false);
const tableData = computed(() => usersStore.userList);
const open = ref(false);
const showAdd = ref(false);

const sortType = ref('desc');
const sortValue = ref('');
const sortTypeData = ref([
  {
    label: t('默认'),
    value: '',
  },
  {
    label: t('名字'),
    value: 'firstName',
  },
  {
    label: t('ID'),
    value: 'id',
  },
  {
    label: t('注册日期'),
    value: 'create_time',
  },
]);

const handleAddUser = () => {
  showAdd.value = true;
};

const rowSelection = computed(() => {
  return tableData.value.filter((item) => item.checked);
});

const setOpen = (flag) => {
  open.value = flag;
};

const currentCheckAll = ref(false);
const checkHandle = (flag) => {
  currentCheckAll.value = flag;
  tableData.value.forEach((item) => (item.checked = flag));
};

const handlePageChange = (current, size) => {
  usersStore.setPaginate(current, size);
};

onMounted(() => {
  usersStore.getUserList();
});

watch([sortType, sortValue], ([newSortType, newSortValue]) => {
  let desc = 'sort__desc';
  let asc = 'sort__asc';
  let params = {};
  if (newSortType === 'desc') {
    params = {
      [desc]: newSortValue,
      [asc]: undefined,
    };
  } else {
    params = {
      [desc]: undefined,
      [asc]: newSortValue,
    };
  }
  usersStore.setSearchParams(params);
});
</script>

<style lang="less" scoped>
.table-content {
  width: 100%;
  min-height: 300px;
}
</style>
