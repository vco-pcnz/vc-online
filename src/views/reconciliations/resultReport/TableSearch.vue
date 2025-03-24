<template>
  <vco-page-search>
    <vco-page-search-item width="220" :title="t('项目经理')">
      <a-input v-model:value="searchForm.lm_name" :placeholder="t('请输入')" />
    </vco-page-search-item>
    <vco-page-search-item width="220" :title="t('项目名称')">
      <a-input v-model:value="searchForm.project_name" :placeholder="t('请输入')" />
    </vco-page-search-item>
    <vco-page-search-item width="220" :title="t('借款人')">
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

const emits = defineEmits(['search']);
const { t } = useI18n();

const typeData = computed(() => {
  return [
    {
      label: t('全部'),
      value: ''
    },
    {
      label: t('支出'),
      value: 'SPEND'
    },
    {
      label: t('已收到'),
      value: 'RECEIVE'
    }
  ];
});

const statusData = computed(() => {
  return [
    {
      label: t('全部'),
      value: ''
    },
    {
      label: t('未对账'),
      value: '0'
    },
    {
      label: t('已对账'),
      value: '1'
    },
    {
      label: t('已取消'),
      value: '-1'
    }
  ];
});

const searchForm = ref({
  lm_name: '',
  project_name: '',
  borrower_name: ''
});

// 搜索
const searchHandle = (flag) => {
  if (flag) {
    for (const key in searchForm.value) {
      searchForm.value[key] = '';
    }
  }
  emits('search', searchForm.value);
};
</script>
