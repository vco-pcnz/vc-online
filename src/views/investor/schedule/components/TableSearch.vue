<template>
  <div>
    <vco-page-search @keyup.enter="searchHandle(false)">
      <vco-page-search-item width="220" :title="t('')">
        <a-range-picker style="width: 230px" :allowClear="false" inputReadOnly v-model:value="date" :format="selectDateFormat()" valueFormat="YYYY-MM-DD" :showToday="false" @change="onChange" />
      </vco-page-search-item>

      <vco-page-search-item>
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
import { cloneDeep } from 'lodash';
import { useI18n } from 'vue-i18n';
import tool, { selectDateFormat } from '@/utils/tool';

const emits = defineEmits(['search']);

const { t } = useI18n();
const date = ref([]);
const searchForm = ref({ start_date: '', end_date: '' });

const onChange = (dates) => {
  console.log(dates);
  if (!dates || dates.length !== 2) {
    searchForm.value.start_date = '';
    searchForm.value.end_date = '';
  } else {
    searchForm.value.start_date = dates[0];
    searchForm.value.end_date = dates[1];
  }
};

const searchHandle = (flag) => {
  if (flag) {
    for (const key in searchForm.value) {
      searchForm.value[key] = '';
    }
    date.value = [];
  }
  const data = cloneDeep(searchForm.value);
  emits('search', data);
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
