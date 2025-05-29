<template>
  <div>
    <vco-page-search @keyup.enter="searchHandle(false)">
      <vco-page-search-item width="100" :title="t('类型')">
        <a-select :placeholder="t('请选择')" v-model:value="searchForm.type">
          <a-select-option v-for="item in typeData" :key="item.value" :value="item.value">
            {{ item.label }}
          </a-select-option>
        </a-select>
      </vco-page-search-item>

      <vco-page-search-item :title="t('项目信息')" width="250">
        <vco-type-input v-model="searchForm.project_keyword" v-model:type="searchForm.project_search_type" :type-data="projectsTypeData" :placeholder="t('请输入')"></vco-type-input>
      </vco-page-search-item>

      <vco-page-search-item :title="t('借款人信息')" width="250">
        <vco-type-input v-model="searchForm.borrower_keyword" v-model:type="searchForm.borrower_search_type" :type-data="borrowerTypeData" :placeholder="t('请输入')"></vco-type-input>
      </vco-page-search-item>


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
import { ref } from 'vue';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash';
import { useI18n } from 'vue-i18n';
import { useProjectsStore } from '@/store';
import { selectDateFormat } from '@/utils/tool';
const pageStore = useProjectsStore();

const emits = defineEmits(['search']);
const props = defineProps(['type']);

const { t } = useI18n();

const typeData = ref([
  {
    label: t('申请中'),
    value: ''
  },
  {
    label: t('已批准'),
    value: 'name'
  },
  {
    label: t('已拒绝'),
    value: 'name'
  }
]);

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

const searchForm = ref({
  borrower_keyword: '',
  borrower_search_type: '',
  project_search_type: '',
  project_keyword: '',
});

const disabledDateFormatAfter = (current) => {
  const targetDate = new Date(searchForm.value.start_date).setHours(0, 0, 0, 0);
  return current && current < targetDate;
};

const searchHandle = (flag) => {
  if (flag) {
    for (const key in searchForm.value) {
      searchForm.value[key] = '';
    }
  }
  const data = cloneDeep(searchForm.value);
  if (data.start_date) {
    data.start_date = dayjs(data.start_date).format('YYYY-MM-DD');
  }
  if (data.end_date) {
    data.end_date = dayjs(data.end_date).format('YYYY-MM-DD');
  }
  pageStore.setSearchParams(data);
  // emits('search', data)
};

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
}
</style>
