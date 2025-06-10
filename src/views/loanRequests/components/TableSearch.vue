<template>
  <div>
    <vco-page-search @keyup.enter="searchHandle(false)">
      <template v-if="roterName !== 'LoanRequestsBe_roker'">
        <vco-page-search-item width="120" :title="t('类型')" v-if="typeData.length">
          <a-select :placeholder="t('请选择')" v-model:value="searchForm.type">
            <a-select-option v-for="item in typeData" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-select-option>
          </a-select>
        </vco-page-search-item>
        <template v-if="roterName === 'LoanRequestsJournal'">
          <vco-page-search-item width="180" :title="t('类型')">
            <a-tree-select
              class="treeSelectHak"
              :loading="loading_type"
              v-model:value="treeDataValue"
              labelInValue
              style="width: 100%"
              :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
              :tree-data="treeData"
              :placeholder="t('请选择')"
              @change="handleChange"
            />
          </vco-page-search-item>
        </template>
        <vco-page-search-item width="120" :title="t('状态')" v-if="statusData.length && currentTab === '1'">
          <a-select :placeholder="t('请选择')" v-model:value="searchForm.state">
            <a-select-option v-for="item in statusData" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-select-option>
          </a-select>
        </vco-page-search-item>

        <vco-page-search-item :title="t('项目信息')" width="210">
          <vco-type-input v-model="searchForm.project_keyword" v-model:type="searchForm.project_search_type" :type-data="projectsTypeData" :placeholder="t('请输入')"></vco-type-input>
        </vco-page-search-item>

        <vco-page-search-item :title="t('借款人信息')" width="210">
          <vco-type-input v-model="searchForm.borrower_keyword" v-model:type="searchForm.borrower_search_type" :type-data="borrowerTypeData" :placeholder="t('请输入')"></vco-type-input>
        </vco-page-search-item>
      </template>

      <template v-else>
        <vco-page-search-item width="320" :title="t('关键字')">
          <vco-type-input v-model="searchForm.keywords" v-model:type="searchForm.key" :type-data="baseInfoData" :placeholder="t('请输入')"></vco-type-input>
        </vco-page-search-item>
      </template>

      <vco-page-search-item width="100%">
        <div class="flex items-center gap-2">
          <a-button type="dark" @click="searchHandle(false)"><i class="iconfont">&#xe756;</i>{{ t('搜索') }}</a-button>
          <a-button type="dark-line" @click="searchHandle(true)"><i class="iconfont">&#xe757;</i>{{ t('重置') }}</a-button>
        </div>
      </vco-page-search-item>
    </vco-page-search>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { cloneDeep } from 'lodash';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { quick } from '@/api/home/index';
import { systemDictData } from '@/api/system';
const route = useRoute();

const emits = defineEmits(['search']);
const props = defineProps({
  currentTab: {
    type: String
  },
  typeData: {
    type: Array
  },
  statusData: {
    type: Array
  },
  roterName: {
    type: String
  }
});

const { t } = useI18n();

const borrowerTypeData = [
  {
    label: t('全部属性'),
    value: ''
  },
  {
    label: t('姓名'),
    value: 'name'
  },
  {
    label: t('电话'),
    value: 'phone'
  },
  {
    label: t('邮箱'),
    value: 'email'
  }
];

const projectsTypeData = [
  {
    label: t('全部属性'),
    value: ''
  },
  {
    label: t('名称'),
    value: 'name'
  },
  {
    label: t('ID'),
    value: 'apply_sn'
  },
  {
    label: t('地址'),
    value: 'address'
  }
];

const baseInfoData = [
  {
    label: t('全部'),
    value: 'all'
  },
  {
    label: t('姓名'),
    value: 'name'
  },
  {
    label: t('邮箱'),
    value: 'email'
  },
  {
    label: t('电话'),
    value: 'mobile'
  },
  {
    label: t('用户Id'),
    value: 'id'
  }
];
const searchForm = ref({
  state: '',
  cate: '',
  type: '',
  borrower_keyword: '',
  borrower_search_type: '',
  project_search_type: '',
  project_keyword: '',
  key: 'all',
  keywords: ''
});

const searchHandle = (flag) => {
  if (flag) {
    for (const key in searchForm.value) {
      searchForm.value[key] = '';
      if (key == 'type') {
        searchForm.value[key] = props.typeData.length ? props.typeData[0].value : '';
      }
    }
    searchForm.value.key = 'all';
  }

  if (props.currentTab !== '1') {
    Object.assign(searchForm.value, {
      state: ''
    });
  }
  let updateData = cloneDeep(searchForm.value);

  emits('search', updateData);
};

watch(
  () => props.typeData,
  (val) => {
    if (val && val.length) {
      searchForm.value.type = val[0].value;
    }
  },
  { deep: true, immediate: true }
);

const treeDataValue = ref();
const treeData = ref([
  { value: '0', label: 'Journal', children: [] },
  { value: '1', label: 'Duration', children: [] }
]);

const loading_type = ref(false);
const loadType = (reset) => {
  loading_type.value = true;
  systemDictData('journal_type')
    .then((res) => {
      treeData.value[0].children = res.map((item) => {
        return {
          value: '0_' + item.code,
          label: item.name
        };
      });
    })
    .finally((_) => {
      loading_type.value = false;
    });
  systemDictData('duration')
    .then((res) => {
      treeData.value[1].children = res.map((item) => {
        return {
          value: '1_' + item.code,
          label: item.name
        };
      });
    })
    .finally((_) => {
      loading_type.value = false;
    });
};

const handleChange = (val) => {
  let arr = val.value.split('_');
  searchForm.value.type = '';
  if (arr[0] == '0' && arr.length > 1) {
    val.label = 'Journal/' + val.label;
    searchForm.value.type = val.value.split('_')[1];
  }
  if (arr[0] == '1' && arr.length > 1) {
    val.label = 'Duration/' + val.label;
    searchForm.value.type = val.value.split('_')[1];
  }
  searchForm.value.cate = arr[0] === '0' ? '1' : '2';

  treeDataValue.value = val;
};

onMounted(() => {
  if (props.roterName === 'LoanRequestsJournal') {
    loadType();
  }
});

// 暴露方法给父组件
defineExpose({
  searchHandle
});
</script>

<style lang="less" scoped>
.num {
  font-size: 20px;
  font-weight: 600;
  line-height: 1.2;
  margin-bottom: 8px;
}
.page-search-content {
  margin-top: 0;
  gap: 16px;
}
</style>
