<template>
  <div>
    <vco-page-search>
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

      <vco-page-search-item :title="t('借款金额')" width="264">
        <div class="flex items-center gap-2">
          <a-input-number v-model:value="searchForm.min_loan_money" :min="1" :placeholder="t('最小值')" />
          <p>-</p>
          <a-input-number v-model:value="searchForm.max_loan_money" :min="searchForm.min_loan_money" :placeholder="t('最大值')" />
        </div>
      </vco-page-search-item>
    </vco-page-search>

    <div class="flex justify-between mt-5">
      <div>
        <vco-page-search-item width="250" :title="t('状态')" v-if="current < 3 && hasPermission('requests:search:status')">
          <a-select placeholder="t('请选择')" v-model:value="searchForm.status">
            <a-select-option value="">
              {{ t('全部') }}
            </a-select-option>
            <template v-for="item in stepArr">
              <a-select-option :key="item.stateCode" :value="item.stateCode" v-if="key[current].includes(item.mark)">
                {{ t(item.name) }}
              </a-select-option>
            </template>
          </a-select>
        </vco-page-search-item>
      </div>
      <vco-page-search-item width="100%">
        <div class="flex items-center gap-2">
          <a-button type="dark" @click="searchHandle(false)"><i class="iconfont">&#xe756;</i>{{ t('搜索') }}</a-button>
          <a-button type="dark-line" @click="searchHandle(true)"><i class="iconfont">&#xe757;</i>{{ t('重置') }}</a-button>
        </div>
      </vco-page-search-item>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import dayjs from 'dayjs';
import { selectDateFormat } from '@/utils/tool';
import { cloneDeep } from 'lodash';
import { useI18n } from 'vue-i18n';
import { projectApproveStep } from '@/api/process';
import { hasPermission } from '@/directives/permission/index';

const emits = defineEmits(['search']);

const { t } = useI18n();

const props = defineProps({
  current: {
    type: [Number, String],
    default: ''
  }
});
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
  max_loan_money: '',
  status: ''
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
  emits('search', data);
};

const stepArr = ref([]);

const key = ref({
  1: ['step_lm_audit', 'step_fc_audit', 'step_director_audit'],
  2: ['step_lm_check', 'step_aml_audit', 'step_open']
});

onMounted(() => {
  projectApproveStep().then((res) => {
    stepArr.value = res.step;
  });
});

watch(
  () => props.current,
  () => {
    searchForm.value.status = '';
    // searchHandle(true);
  },
  {
    immediate: true,
    deep: true
  }
);
</script>
