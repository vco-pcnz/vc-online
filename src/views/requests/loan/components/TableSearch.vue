<template>
  <div>
    <vco-page-search @keyup.enter="searchHandle(false)">
      <vco-page-search-item :title="t('项目信息')" width="250">
        <vco-type-input v-model="searchForm.project_keyword" :typeWidth="135" v-model:type="searchForm.project_search_type" :type-data="projectsTypeData" :placeholder="t('请输入')"></vco-type-input>
      </vco-page-search-item>

      <!-- <vco-page-search-item :title="t('项目周期')" width="266">
        <div class="flex items-center gap-2">
          <a-date-picker v-model:value="searchForm.start_date" :format="selectDateFormat()" :placeholder="t('开放日期')" @change="searchForm.end_date = ''" />
          <p>-</p>
          <a-date-picker v-model:value="searchForm.end_date" :format="selectDateFormat()" :disabledDate="disabledDateFormatAfter" :placeholder="t('到期日期')" />
        </div>
      </vco-page-search-item> -->
      <vco-page-search-item :title="t('开始日期1')" width="266">
        <div class="flex items-center gap-2">
          <a-date-picker v-model:value="searchForm.start_date_s" :format="selectDateFormat()" :placeholder="t('开始日期2')" @change="searchForm.end_date = ''" />
          <p>-</p>
          <a-date-picker v-model:value="searchForm.start_date_e" :format="selectDateFormat()" :disabledDate="disabledDateFormatAfter" :placeholder="t('结束日期2')" />
        </div>
      </vco-page-search-item>
      <vco-page-search-item :title="t('结束日期1')" width="266">
        <div class="flex items-center gap-2">
          <a-date-picker v-model:value="searchForm.end_date_s" :format="selectDateFormat()" :placeholder="t('开始日期2')" @change="searchForm.end_date = ''" />
          <p>-</p>
          <a-date-picker v-model:value="searchForm.end_date_e" :format="selectDateFormat()" :disabledDate="disabledDateFormatAfter2" :placeholder="t('结束日期2')" />
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
      <vco-page-search-item v-if="!isExpand">
        <div class="flex items-center gap-2">
          <div class="search_expand" @click="isExpand = !isExpand">{{ t('展开') }}<DoubleRightOutlined class="icon" /></div>
          <a-button type="dark" @click="searchHandle(false)"><i class="iconfont">&#xe756;</i>{{ t('搜索') }}</a-button>
          <a-button type="dark-line" @click="searchHandle(true)"><i class="iconfont">&#xe757;</i>{{ t('重置') }}</a-button>
        </div>
      </vco-page-search-item>
    </vco-page-search>

    <div class="flex justify-between mt-5 items-end" v-if="isExpand">
      <div>
        <template v-if="isExpand">
          <vco-page-search-item width="140" :title="t('状态')" v-if="current < 3 && hasPermission('requests:search:status')">
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
        </template>
      </div>
      <div class="flex items-center gap-2">
        <div class="search_expand isExpand" @click="isExpand = !isExpand">{{ t('收起') }}<DoubleRightOutlined class="icon" /></div>
        <a-button type="dark" @click="searchHandle(false)"><i class="iconfont">&#xe756;</i>{{ t('搜索') }}</a-button>
        <a-button type="dark-line" @click="searchHandle(true)"><i class="iconfont">&#xe757;</i>{{ t('重置') }}</a-button>
      </div>
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
import { DoubleRightOutlined } from '@ant-design/icons-vue';

const emits = defineEmits(['search']);

const { t } = useI18n();

const props = defineProps({
  current: {
    type: [Number, String],
    default: ''
  }
});

const isExpand = ref(false);

const projectsTypeData = [
  {
    label: t('全部属性'),
    value: ''
  },
  {
    label: t('项目名称'),
    value: 'name'
  },
  {
    label: t('项目ID'),
    value: 'apply_sn'
  },
  {
    label: t('项目地址'),
    value: 'address'
  },

  {
    label: t('借款人姓名'),
    value: 'borrower_name'
  },
  {
    label: t('借款人电话'),
    value: 'borrower_phone'
  },
  {
    label: t('借款人邮箱'),
    value: 'borrower_email'
  }
];

const searchForm = ref({
  borrower_keyword: '',
  borrower_search_type: '',
  start_date_s: '',
  start_date_e: '',
  end_date_s: '',
  end_date_e: '',
  project_search_type: '',
  project_keyword: '',
  lm_name: '',
  min_loan_money: '',
  max_loan_money: '',
  status: ''
});

const disabledDateFormatAfter = (current) => {
  const targetDate = new Date(searchForm.value.start_date_s).setHours(0, 0, 0, 0);
  return current && current < targetDate;
};

const disabledDateFormatAfter2 = (current) => {
  const targetDate = new Date(searchForm.value.end_date_s).setHours(0, 0, 0, 0);
  return current && current < targetDate;
};

const searchHandle = (flag) => {
  if (flag) {
    for (const key in searchForm.value) {
      searchForm.value[key] = '';
    }
  }
  const data = cloneDeep(searchForm.value);
  if (data.start_date_s) {
    data.start_date_s = dayjs(data.start_date_s).format('YYYY-MM-DD');
  }
  if (data.start_date_e) {
    data.start_date_e = dayjs(data.start_date_e).format('YYYY-MM-DD');
  }
  if (data.end_date_s) {
    data.end_date_s = dayjs(data.end_date_s).format('YYYY-MM-DD');
  }
  if (data.end_date_e) {
    data.end_date_e = dayjs(data.end_date_e).format('YYYY-MM-DD');
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

defineExpose({
  searchHandle
});
</script>

<style lang="less" scoped>
.page-search-content {
  gap: 28px;
}
</style>
