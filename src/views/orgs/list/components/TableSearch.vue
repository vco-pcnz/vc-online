<template>
  <vco-page-search>
    <vco-page-search-item width="100" :title="t('类型')">
      <a-select :placeholder="t('请选择')" v-model:value="searchForm.type">
        <a-select-option v-for="item in typeData" :key="item.value" :value="item.value">
          {{ item.label }}
        </a-select-option>
      </a-select>
    </vco-page-search-item>

    <vco-page-search-item width="220" :title="t('属性')">
      <vco-type-input v-model="searchForm.org__name" v-model:type="searchForm.key" :type-data="keys" :placeholder="t('请输入')"></vco-type-input>
    </vco-page-search-item>

    <vco-page-search-item width="140" :title="t('组织名')">
      <a-input v-model:value="searchForm.keywords" :placeholder="t('请输入')" />
    </vco-page-search-item>

    <vco-page-search-item width="100%">
      <a-button type="dark-line" @click="searchHandle"><i class="iconfont">&#xe756;</i>{{ t('搜索') }}</a-button>
    </vco-page-search-item>
  </vco-page-search>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash';
import { useI18n } from 'vue-i18n';
import { useOrgsStore } from '@/store';

const { t } = useI18n();
const orgsStore = useOrgsStore();

const typeData = computed(() => {
  const data = orgsStore.stakeholderType.map(item => ({
    label: item.name,
    value: item.code,
  }));
  return [
    {
      label: t('全部'),
      value: '',
    },
    ...data,
  ];
});

const keys = ref([
  {
    label: t('全部属性'),
    value: 'all',
  },
  {
    label: t('名称'),
    value: 'name',
  },
  {
    label: t('邮箱'),
    value: 'email',
  },
  {
    label: t('电话'),
    value: 'mobile',
  },
  {
    label: t('Id编码'),
    value: 'code',
  },
  {
    label: t('用户Id'),
    value: 'userId',
  },
]);

const searchForm = ref({
  type: '',
  key: 'all',
  org__name: '',
  keywords: '',
});

// 搜索
const searchHandle = () => {
  orgsStore.setSearchParams(searchForm.value);
};

onMounted(() => {
  orgsStore.getStakeholderType();
});
</script>
