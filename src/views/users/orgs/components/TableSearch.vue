<template>
  <vco-page-search>
    <vco-page-search-item width="100" :title="t('类型')">
      <a-select :placeholder="t('请选择')" v-model:value="searchForm.role_id">
        <a-select-option v-for="item in typeData" :key="item.value" :value="item.value">
          {{ item.label }}
        </a-select-option>
      </a-select>
    </vco-page-search-item>

    <vco-page-search-item width="320" :title="t('关键字')">
      <vco-type-input v-model="searchForm.keywords" v-model:type="searchForm.key" :type-data="baseInfoData" :placeholder="t('请输入')"></vco-type-input>
    </vco-page-search-item>
    <!-- 
    <vco-page-search-item width="220" :title="t('组织名')">
      <a-input v-model:value="searchForm.org__name" :placeholder="t('请输入')" />
    </vco-page-search-item> -->

    <vco-page-search-item width="100%">
      <a-button type="dark-line" @click="searchHandle">
        <i class="iconfont">&#xe756;</i>
        {{ t('搜索') }}
      </a-button>
    </vco-page-search-item>
  </vco-page-search>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useOrgsStore } from '@/store';

const orgsStore = useOrgsStore();

const { t } = useI18n();

const emit = defineEmits(['search']);
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

const baseInfoData = [
  {
    label: t('全部'),
    value: 'all'
  },
  {
    label: t('姓名'),
    value: 'name'
  },
  {
    label: t('邮箱'),
    value: 'email'
  },
  {
    label: t('电话'),
    value: 'mobile'
  }
];

const orgNameData = [
  {
    label: t('组织名'),
    value: ''
  }
];

const searchForm = ref({
  role_id: '',
  key: 'all',
  keywords: '',
  org__name: ''
});

const searchHandle = () => {
  emit('search', searchForm.value);
};

onMounted(() => {
  orgsStore.getStakeholderType();
});
</script>
