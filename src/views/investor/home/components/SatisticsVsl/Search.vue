<template>
  <div>
    <vco-page-search @keyup.enter="searchHandle(false)">
      <vco-page-search-item :title="t('开始日期1')" width="266">
        <div class="flex items-center gap-2">
          <a-date-picker v-model:value="searchForm.start_date_s" :format="selectDateFormat()" :placeholder="t('开始日期2')" @change="searchForm.start_date_e = ''" />
          <p>-</p>
          <a-date-picker v-model:value="searchForm.start_date_e" :format="selectDateFormat()" :disabledDate="disabledDateFormatAfter" :placeholder="t('结束日期2')" />
        </div>
      </vco-page-search-item>
      <vco-page-search-item :title="t('关账日期')" width="266">
        <div class="flex items-center gap-2">
          <a-date-picker v-model:value="searchForm.close_date_s" :format="selectDateFormat()" :placeholder="t('开始日期2')" @change="searchForm.close_date_e = ''" />
          <p>-</p>
          <a-date-picker v-model:value="searchForm.close_date_e" :format="selectDateFormat()" :disabledDate="disabledDateFormatAfter2" :placeholder="t('结束日期2')" />
        </div>
      </vco-page-search-item>
      <vco-page-search-item   width="180">
        <div class="flex justify-between items-end gap-2">
          <a-button type="dark" @click="searchHandle(false)"><i class="iconfont">&#xe756;</i>{{ t('搜索') }}</a-button>
          <a-button type="dark-line" @click="searchHandle(true)"><i class="iconfont">&#xe757;</i>{{ t('重置')}}</a-button>
        </div>
      </vco-page-search-item>
    </vco-page-search>


  </div>
</template>

<script setup>
import { ref } from 'vue';
import dayjs from 'dayjs';
import { useI18n } from 'vue-i18n';
import { selectDateFormat } from '@/utils/tool';
import { cloneDeep } from 'lodash';

const emits = defineEmits(['search']);

const { t } = useI18n();

const searchForm = ref({
  start_date_s: '',
  start_date_e: '',
  close_date_s: '',
  close_date_e: ''
});

const disabledDateFormatAfter = (current) => {
  const targetDate = new Date(searchForm.value.start_date_s).setHours(0, 0, 0, 0);
  return current && current < targetDate;
};

const disabledDateFormatAfter2 = (current) => {
  const targetDate = new Date(searchForm.value.close_date_s).setHours(0, 0, 0, 0);
  return current && current < targetDate;
};
const searchHandle = (flag) => {
  if (flag) {
    searchForm.value.start_date_s = '';
    searchForm.value.start_date_e = '';
    searchForm.value.close_date_s = '';
    searchForm.value.close_date_e = '';
  }
  const data = cloneDeep(searchForm.value);
  if (data.start_date_s) {
    data.start_date_s = dayjs(data.start_date_s).format('YYYY-MM-DD');
  }
  if (data.start_date_e) {
    data.start_date_e = dayjs(data.start_date_e).format('YYYY-MM-DD');
  }
  if (data.close_date_s) {
    data.close_date_s = dayjs(data.close_date_s).format('YYYY-MM-DD');
  }
  if (data.close_date_e) {
    data.close_date_e = dayjs(data.close_date_e).format('YYYY-MM-DD');
  }
  emits('search', data);
};

</script>

<style lang="less" scoped></style>
