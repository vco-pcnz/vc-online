<template>
  <div>
    <vco-page-tab :tabData="tabData" v-model:current="currentTab" :custom-actions="true" @change="tabChange"></vco-page-tab>
    <securities-table :uuid="uuid" :projectDetail="projectDetail" v-if="currentTab === 1" />
    <add-table :uuid="uuid" :projectDetail="projectDetail" v-if="currentTab === 2" />
    <edit-table :uuid="uuid" :projectDetail="projectDetail" v-if="currentTab === 3" />
    <discharge-table :uuid="uuid" :projectDetail="projectDetail" v-if="currentTab === 4" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import SecuritiesTable from './components/SecuritiesTable.vue';
import AddTable from './components/AddTable.vue';
import EditTable from './components/EditTable.vue';
import DischargeTable from './components/DischargeTable.vue';
import { navigationTo } from '@/utils/tool';

const { t } = useI18n();
const route = useRoute();

const props = defineProps({
  projectDetail: {
    type: Object,
    default: () => {}
  }
});

const uuid = ref('');
const currentTab = ref(0)
const tabData = ref([
  {
    label: t('抵押物'),
    value: 1
  },
  {
    label: t('新增申请'),
    value: 2
  },
  {
    label: t('编辑申请'),
    value: 3
  },
  {
    label: t('解押申请1'),
    value: 4
  }
])

const tabChange = (val) => {
  const { value } = val
  if (currentTab.value !== value) {
    currentTab.value = value
    navigationTo(`/projects/discharge?uuid=${uuid.value}&type=${value}`)
  }
}

onMounted(() => {
  uuid.value = route.query?.uuid || ''
  const type = route.query?.type
  const tabType = tabData.value.map(item => item.value)
  if (type && tabType.includes(Number(type))) {
    currentTab.value = Number(type)
  } else {
    currentTab.value = 1
  }
})
</script>