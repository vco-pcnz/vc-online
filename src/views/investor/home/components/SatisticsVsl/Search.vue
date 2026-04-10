<template>
  <div>
    <vco-page-search @keyup.enter="searchHandle(false)">
      <vco-page-search-item :title="t('日期')" width="280">
        <a-range-picker
          v-model:value="searchForm.range"
          style="width: 100%"
          :format="selectDateFormat()"
          :disabled-date="disabledDateAfterToday"
          :placeholder="[t('开始日期'), t('结束日期')]"
        />
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

const emits = defineEmits(['search']);

const { t } = useI18n();

const searchForm = ref({
  range: null
});

/** 仅允许选择今天及之前的日期 */
const disabledDateAfterToday = (current) => current && current.isAfter(dayjs(), 'day');

const searchHandle = (flag) => {
  if (flag) {
    searchForm.value.range = null;
  }
  const [start, end] = searchForm.value.range || [];
  const sday = start ? dayjs(start).format('YYYY-MM-DD') : '';
  const eday = end ? dayjs(end).format('YYYY-MM-DD') : '';
  emits('search', { sday, eday });
};

</script>

<style lang="less" scoped></style>
