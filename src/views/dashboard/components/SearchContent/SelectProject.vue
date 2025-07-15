<template>
  <div class="flex">
    <a-input readonly class="input-label" style="width: 60px" value="Project" />
    <div>
      <a-dropdown class="Filter" trigger="click" v-model:open="visible">
        <a-select :open="false" v-model:value="select" mode="multiple" style="width: 180px" :maxTagCount="1" :placeholder="t('请选择')" :options="data" :fieldNames="{ label: 'project_name', value: 'id' }"> </a-select>

        <template #overlay>
          <div class="Overlay" style="width: 700px; padding-right: 16px">
            <div class="flex items-end">
              <a-checkbox v-model:checked="checkedAll" :disabled="checkedAll" class="Filter-Check"> All requests excluded </a-checkbox>
              <vco-page-search @keyup.enter="searchHandle(false)">
                <vco-page-search-item :title="t('名称')">
                  <a-input v-model:value="searchForm.project_name" :placeholder="t('请输入')" />
                </vco-page-search-item>
                <vco-page-search-item width="100%">
                  <div class="flex items-center gap-2">
                    <a-button type="dark" @click="searchHandle(false)"><i class="iconfont">&#xe756;</i>{{ t('搜索') }}</a-button>
                    <a-button type="dark-line" @click="searchHandle(true)"><i class="iconfont">&#xe757;</i>{{ t('重置') }}</a-button>
                  </div>
                </vco-page-search-item>
              </vco-page-search>
            </div>

            <a-checkbox-group v-model:value="select" @change="() => (checkedAll = !select.length)">
              <ul class="Filter-List">
                <li class="Filter-Item" v-for="item in data" :key="item.uuid">
                  <a-checkbox :value="item.id" v-model:checked="checkedAll" class="Filter-Check">
                    {{ item.project_name }}
                  </a-checkbox>
                </li>
              </ul>
            </a-checkbox-group>

            <a-empty v-if="!data || !data.length" />
            <div class="flex justify-center pb-5">
              <a-pagination size="small" :total="total" :pageSize="pagination.limit" :current="pagination.page" show-quick-jumper :show-total="(total) => t('共{0}条', [total])" @change="setPaginate" />
            </div>
          </div>
        </template>
      </a-dropdown>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { forecastProjectList } from '@/api/project/forecast';
import { cloneDeep } from 'lodash';

const { t } = useI18n();

const emits = defineEmits(['change']);
const props = defineProps({
  value: {
    type: String
  },
  dataList: {
    type: [Array, Object]
  }
});

const visible = ref(false);
const checkedAll = ref(true);
const loading = ref(true);
const data = ref([]);
const select = ref([]);
const total = ref(0);
const pagination = ref({
  page: 1,
  limit: 10
});

const setPaginate = (page, limit) => {
  pagination.value = {
    page,
    limit
  };
  loadData();
};

const loadData = () => {
  loading.value = true;
  forecastProjectList({ ...pagination.value, ...searchForm.value })
    .then((res) => {
      data.value = res.data;
      total.value = res.total;
    })
    .finally(() => {
      loading.value = false;
    });
};

const searchForm = ref({
  project_name: ''
});

// 搜索
const searchHandle = (flag) => {
  if (flag) {
    searchForm.value = {
      project_name: ''
    };
  }

  pagination.value.page = 1;
  loadData();
};

onMounted(() => {
  loadData();
});
watch(
  () => checkedAll.value,
  (val) => {
    if (val) select.value = [];
  }
);

watch(
  () => select.value,
  (val) => {
    emits('change', { apply_project_id: select.value.join() });
  }
);

watch(
  () => props.dataList,
  (val) => {
    if (val) {
      data.value = cloneDeep(val);
    }
  },
  { deep: true, immediate: true }
);
</script>

<style scoped lang="less">
@import '@/styles/variables.less';

.Overlay {
  border-radius: 8px;
  box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05);
  background: #fff;
  .ant-checkbox-group {
    padding-left: 0;
    width: 100%;
  }
  :deep(.ant-checkbox-wrapper) {
    color: #181818;
    .ant-checkbox {
      .ant-checkbox-inner {
        border-color: #181818;
      }
      &:hover {
        .ant-checkbox-inner {
          border-color: #d8b480 !important;
        }
      }
      &.ant-checkbox-checked {
        .ant-checkbox-inner {
          background-color: #d8b480;
          border-color: #d8b480;
        }
        &:after {
          border-color: #d8b480;
        }
      }
      &.ant-checkbox-disabled {
        .ant-checkbox-inner {
          background: rgba(0, 0, 0, 0.04);
          border-color: #d9d9d9;
        }
      }
    }
  }
  .Filter {
    &-Check_all {
      font-weight: 600;
      margin-bottom: 8px;
      margin-top: 16px;
      border-bottom: 1px solid #e2e5e2;
    }
    &-Check {
      display: block;
      align-items: center;
      min-height: 38px;
      padding-left: 24px;
      padding-right: 16px;
      width: 100%;
      box-sizing: border-box;
      display: flex;
    }
    &-List {
      width: 100%;
      padding-bottom: 8px;
      padding-top: 8px;
      .Filter-Item {
        line-height: 1.5;
        transition: background-color 0.1s cubic-bezier(0.215, 0.61, 0.355, 1);
      }
    }
  }
}
</style>
