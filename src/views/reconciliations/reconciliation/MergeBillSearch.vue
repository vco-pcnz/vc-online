<template>
  <vco-page-search @keyup.enter="searchHandle(false)">
    <vco-page-search-item width="120" :title="t('金额')">
      <a-input-number v-model:value="searchForm.amount" :max="99999999999" :min="0" :placeholder="t('请输入')" :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')" :parser="(value) => value.replace(/\$\s?|(,*)/g, '')" />
    </vco-page-search-item>
    <vco-page-search-item width="120" :title="t('名称')">
      <a-input v-model:value="searchForm.name" :placeholder="t('请输入')" />
    </vco-page-search-item>
    <vco-page-search-item width="120" :title="t('描述')">
      <a-input v-model:value="searchForm.description" :placeholder="t('请输入')" />
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

const emits = defineEmits(['search', 'update:value']);
const { t } = useI18n();

const searchForm = ref({
  amount: '',
  name: '',
  description: ''
});

// 搜索
const searchHandle = (flag) => {
  if (flag) {
    for (const key in searchForm.value) {
      searchForm.value[key] = '';
    }
  }
  emits('update:value', searchForm.value);
  emits('search', searchForm.value);
};
</script>
