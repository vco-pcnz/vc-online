<template>
  <vco-page-search @keyup.enter="searchHandle(false)">
    <vco-page-search-item width="100" :title="t('类型')">
      <a-select :placeholder="t('请选择')" v-model:value="searchForm.type">
        <a-select-option v-for="item in typeData" :key="item.value" :value="item.value">
          {{ item.label }}
        </a-select-option>
      </a-select>
    </vco-page-search-item>

    <vco-page-search-item width="220" :title="t('名称')">
      <a-input v-model:value="searchForm.name" :placeholder="t('请输入')" />
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

const searchForm = ref({
  type: '',
  name: ''
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
