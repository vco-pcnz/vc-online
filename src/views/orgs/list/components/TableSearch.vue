<template>
  <vco-page-search @keyup.enter="searchHandle(false)">
    <vco-page-search-item width="100" :title="t('类型')">
      <a-select :placeholder="t('请选择')" v-model:value="searchForm.type">
        <a-select-option v-for="item in typeData" :key="item.value" :value="item.value">
          {{ item.label }}
        </a-select-option>
      </a-select>
    </vco-page-search-item>

    <vco-page-search-item width="320" :title="t('关键字')">
      <vco-type-input v-model="searchForm.keywords" v-model:type="searchForm.key" :type-data="keys" :placeholder="t('请输入')"></vco-type-input>
    </vco-page-search-item>

    <vco-page-search-item width="220" :title="t('组织名')">
      <a-input v-model:value="searchForm.org__name" :placeholder="t('请输入')" />
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
import { useOrgsStore } from '@/store';

const { t } = useI18n();
const orgsStore = useOrgsStore();

const typeData = computed(() => {
  const data = orgsStore.stakeholderType.map((item) => ({
    label: item.name,
    value: item.code
  }));
  return [
    {
      label: t('全部'),
      value: ''
    },
    ...data
  ];
});

const keys = ref([
  {
    label: t('全部'),
    value: 'all'
  },
  {
    label: t('名称'),
    value: 'name'
  },
  {
    label: t('邮箱'),
    value: 'email'
  },
  {
    label: t('电话'),
    value: 'mobile'
  },
  {
    label: t('Id编码'),
    value: 'code'
  },
  {
    label: t('用户Id'),
    value: 'userId'
  }
]);

const searchForm = ref({
  type: '',
  key: 'all',
  org__name: '',
  keywords: ''
});

// 搜索
const searchHandle = (flag) => {
  if (flag) {
    for (const key in searchForm.value) {
      searchForm.value[key] = '';
    }
    searchForm.value.key = 'all';
  }
  orgsStore.setSearchParams(searchForm.value);
};

onMounted(() => {
  orgsStore.getStakeholderType();
});
</script>
