<template>
  <div>
    <a-dropdown class="Filter" trigger="click" v-model:open="visible">
      <a-button type="brown" size="small" :class="['picker-btn', { open: visible }]" shape="round" @click="visible = true">
        {{ showText }} <DownOutlined class="DropdownIcon" />
      </a-button>
      <template #overlay>
        <div class="Overlay" style="width: 700px; padding-right: 16px" :style="{ width: type ? '700px' : 'auto' }">
          <div class="flex items-end">
            <a-checkbox v-model:checked="checkedAll" :disabled="checkedAll" class="Filter-Check"> All {{ label }} excluded </a-checkbox>
            <vco-page-search v-if="type">
              <vco-page-search-item :title="t('名称')">
                <a-input v-model:value="searchForm.keywords" :placeholder="t('请输入')" />
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
                <a-checkbox :value="item[valueKey]" v-model:checked="checkedAll" class="Filter-Check">
                  <template v-if="labelKey == 'user_name'"> {{ item.firstName }} {{ item.middleName }} {{ item.lastName }} </template>
                  <template v-else>
                    {{ item[labelKey] }}
                  </template>
                </a-checkbox>
              </li>
            </ul>
          </a-checkbox-group>

          <a-empty v-if="!data || !data.length" />
          <div class="flex justify-center pb-5" v-if="type">
            <a-pagination
              size="small"
              :total="total"
              :pageSize="pagination.limit"
              :current="pagination.page"
              show-quick-jumper
              :show-total="(total) => t('共{0}条', [total])"
              @change="setPaginate"
            />
          </div>
        </div>
      </template>
    </a-dropdown>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { DownOutlined } from '@ant-design/icons-vue';
import { managerList, forecastProjectList } from '@/api/project/forecast';
import { cloneDeep } from 'lodash';

const { t } = useI18n();

const emits = defineEmits(['update:value', 'change']);
const props = defineProps({
  type: {
    type: Number
  },
  label: {
    type: String
  },
  labelKey: {
    type: String
  },
  valueKey: {
    type: String,
    default: 'id'
  },
  searchKey: {
    type: String
  },
  value: {
    type: String
  },
  dataList: {
    type: [Array,Object]
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
  let ajaxFn = null;
  if (props.type === 1) {
    ajaxFn = managerList;
  } else if (props.type === 2) {
    ajaxFn = forecastProjectList;
  }

  if (ajaxFn) {
    loading.value = true;
    let obj = {};
    obj[props.searchKey] = searchForm.value.keywords;
    ajaxFn({ ...pagination.value, ...obj })
      .then((res) => {
        data.value = res.data;
        total.value = res.total;
      })
      .finally(() => {
        loading.value = false;
      });
  }
};

const searchForm = ref({
  keywords: ''
});

// 搜索
const searchHandle = (flag) => {
  if (flag) {
    searchForm.value = {
      keywords: ''
    };
  }

  pagination.value.page = 1;
  loadData();
};

const showText = computed(() => {
  if (checkedAll.value) return 'all ' + props.label + ' excluded';
  if (select.value.length == 1) return getName(data.value, select.value[0]);
  if (select.value.length > 1) return select.value.length + ' ' + props.label;
});

const getName = (arr, selectId) => {
  let index = arr.findIndex((item) => {
    return item[props.valueKey] == selectId;
  });
  if (props.labelKey === 'user_name') {
    return arr[index].firstName + ' ' + arr[index].middleName + ' ' + arr[index].lastName;
  }
  return arr[index][props.labelKey];
};

onMounted(() => {
  if (props.type) loadData();
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
    emits('update:value', select.value.join());
    emits('change');
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
      max-height: 380px;
      overflow-y: auto;
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
