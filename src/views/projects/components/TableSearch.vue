<template>
  <div>
    <vco-page-search @keyup.enter="searchHandle(false)">
      <vco-page-search-item :title="t('项目信息')" width="250">
        <vco-type-input v-model="searchForm.project_keyword" v-model:type="searchForm.project_search_type" :type-data="projectsTypeData" :placeholder="t('请输入')"></vco-type-input>
      </vco-page-search-item>

      <vco-page-search-item :title="t('借款人信息')" width="250">
        <vco-type-input v-model="searchForm.borrower_keyword" v-model:type="searchForm.borrower_search_type" :type-data="borrowerTypeData" :placeholder="t('请输入')"></vco-type-input>
      </vco-page-search-item>

      <vco-page-search-item :title="t('项目周期')" width="266">
        <div class="flex items-center gap-2">
          <a-date-picker v-model:value="searchForm.start_date" :format="selectDateFormat()" :placeholder="t('开放日期')" @change="searchForm.end_date = ''" />
          <p>-</p>
          <a-date-picker v-model:value="searchForm.end_date" :format="selectDateFormat()" :disabledDate="disabledDateFormatAfter" :placeholder="t('到期日期')" />
        </div>
      </vco-page-search-item>
      <vco-page-search-item :title="t('客户经理')" width="180">
        <a-input v-model:value="searchForm.lm_name" :placeholder="t('请输入')" />
      </vco-page-search-item>
      <template v-if="isExpand">
        <vco-page-search-item :title="t('借款金额')" width="264">
          <div class="flex items-center gap-2">
            <a-input-number v-model:value="searchForm.min_loan_money" :min="1" :placeholder="t('最小值')" />
            <p>-</p>
            <a-input-number v-model:value="searchForm.max_loan_money" :min="searchForm.min_loan_money" :placeholder="t('最大值')" />
          </div>
        </vco-page-search-item>
      </template>

      <template v-else>
        <vco-page-search-item>
          <div class="flex items-center gap-2">
          <div class="search_expand" v-if="!isExpand" @click="isExpand = !isExpand">{{ t('展开') }}<DoubleRightOutlined class="icon" /></div>
            <a-button type="dark" @click="searchHandle(false)"><i class="iconfont">&#xe756;</i>{{ t('搜索') }}</a-button>
            <a-button type="dark-line" @click="searchHandle(true)"><i class="iconfont">&#xe757;</i>{{ t('重置') }}</a-button>
          </div>
        </vco-page-search-item>
      </template>
    </vco-page-search>

    <div class="flex justify-between items-end mt-5" style="height: 32px;">
      <p class="num" v-if="type == 'closed'">{{ pageStore.total }} {{ t('已关闭项目') }}</p>
      <p class="num" v-if="type == 'open'">{{ pageStore.total }} {{ t('项目') }}</p>
      <div class="flex items-center gap-2" v-if="isExpand">
        <div class="search_expand isExpand" @click="isExpand = !isExpand">{{ t('收起') }}<DoubleRightOutlined class="icon" /></div>
        <a-button type="dark" @click="searchHandle(false)"><i class="iconfont">&#xe756;</i>{{ t('搜索') }}</a-button>
        <a-button type="dark-line" @click="searchHandle(true)"><i class="iconfont">&#xe757;</i>{{ t('重置') }}</a-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash';
import { useI18n } from 'vue-i18n';
import { useProjectsStore } from '@/store';
import { selectDateFormat } from '@/utils/tool';
import { DoubleRightOutlined } from '@ant-design/icons-vue';
const pageStore = useProjectsStore();

const emits = defineEmits(['search']);
const props = defineProps(['type']);

const { t } = useI18n();

const isExpand = ref(false);
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
  start_date: '',
  end_date: '',
  project_search_type: '',
  project_keyword: '',
  lm_name: '',
  min_loan_money: '',
  max_loan_money: ''
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
}
</style>
