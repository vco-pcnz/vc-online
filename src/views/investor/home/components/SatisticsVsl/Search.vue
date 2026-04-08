<template>
  <div>
    <vco-page-search @keyup.enter="searchHandle(false)">
      <vco-page-search-item :title="t('日期')" width="200">
        <a-date-picker
          v-model:value="searchForm.day"
          :format="selectDateFormat()"
          :disabled-date="disabledDateAfterToday"
          :placeholder="t('请选择')"
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

const defaultDay = () => dayjs().subtract(1, 'day');

const searchForm = ref({
  day: defaultDay()
});

/** 仅允许选择今天及之前的日期 */
const disabledDateAfterToday = (current) => current && current.isAfter(dayjs(), 'day');

const searchHandle = (flag) => {
  if (flag) {
    searchForm.value.day = defaultDay();
  }
  const dayVal = searchForm.value.day ? dayjs(searchForm.value.day).format('YYYY-MM-DD') : '';
  emits('search', { day: dayVal });
};

</script>

<style lang="less" scoped></style>
