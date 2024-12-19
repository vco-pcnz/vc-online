<template>
  <vco-page-search>
    <vco-page-search-item title="" width="300">
      <a-input v-model:value="searchForm.keywords" :placeholder="t('请输入')" />
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
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCloseProjectsStore } from '@/store';

const { t } = useI18n();
const pageStore = useCloseProjectsStore();

const searchForm = ref({
  keywords: ''
});

// 搜索
const searchHandle = (reset) => {
  if (reset) {
    searchForm.value.keywords = '';
  }
  pageStore.setSearchParams(searchForm.value);
};
</script>
