<template>
  <vco-page-search>
    <vco-page-search-item :title="t('项目周期')" width="266">
      <div class="flex items-center gap-2">
        <a-date-picker v-model:value="searchForm.start_date" :format="selectDateFormat()" :placeholder="t('开放日期')" @change="searchForm.end_date = ''" />
        <p>-</p>
        <a-date-picker v-model:value="searchForm.end_date" :format="selectDateFormat()" :disabledDate="disabledDateFormatAfter" :placeholder="t('到期日期')" />
      </div>
    </vco-page-search-item>
    <vco-page-search-item width="150" :title="t('项目经理')">
      <a-input v-model:value="searchForm.lm_name" :placeholder="t('请输入')" />
    </vco-page-search-item>
    <vco-page-search-item width="150" :title="t('项目名称')">
      <a-input v-model:value="searchForm.project_name" :placeholder="t('请输入')" />
    </vco-page-search-item>
    <vco-page-search-item width="150" :title="t('借款人')">
      <a-input v-model:value="searchForm.borrower_name" :placeholder="t('请输入')" />
    </vco-page-search-item>

    <vco-page-search-item width="100%">
      <div class="flex items-center gap-2">
        <a-button type="dark" @click="searchHandle(false)"><i class="iconfont">&#xe756;</i>{{ t('搜索') }}</a-button>
        <a-button type="dark-line" @click="searchHandle(true)"><i class="iconfont">&#xe757;</i>{{ t('重置') }}</a-button>
      </div>
    </vco-page-search-item>
  </vco-page-search>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { selectDateFormat } from '@/utils/tool';
import dayjs from "dayjs";
import { cloneDeep } from "lodash";

const emits = defineEmits(['search']);
const { t } = useI18n();

const disabledDateFormatAfter = (current) => {
  const targetDate = new Date(searchForm.value.start_date).setHours(0, 0, 0, 0);
  return current && current < targetDate;
};

const searchForm = ref({
  lm_name: '',
  project_name: '',
  borrower_name: '',
  start_date: '',
  end_date: ''
});

// 搜索
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
</script>
