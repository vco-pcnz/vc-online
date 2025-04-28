<template>
  <div>
    <vco-page-panel :title="pageTitleRef" w="400px" :isBack="true">
      <div class="TabsPanel-Tab">
        <a-button v-for="item in panes" :key="item.key" @click="activeTab = item.key" :class="`tab-button ${item.key === activeTab ? 'active-tab' : ''}`">
          {{ item.title }}
        </a-button>
      </div>
    </vco-page-panel>
    <a-spin :spinning="pageLoading" size="large">
      <template v-if="uuid">
        <LoanPage v-if="activeTab === '1'" :currentId="uuid" :projectDetail="projectDetail" @reload="getProjectDetail"></LoanPage>
        <Forecast v-if="activeTab === '2'" :currentId="uuid" :projectDetail="projectDetail"></Forecast>
      </template>
      <a-empty v-else />
    </a-spin>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import LoanPage from './components/LoanPage.vue';
import Forecast from './components/Forecast.vue';
import { useRoute } from 'vue-router';
import { toolsDetail } from '@/api/import';

const { t } = useI18n();
const route = useRoute();

const uuid = ref(route.query.uuid);

const pageLoading = ref(false);
const projectDetail = ref();
const getProjectDetail = () => {
  pageLoading.value = true;
  toolsDetail({
    uuid: uuid.value
  })
    .then((res) => {
      projectDetail.value = res;
      pageLoading.value = false;
    })
    .catch(() => {
      pageLoading.value = false;
    });
};

const pageTitleRef = computed(() => {
  const pageName = t('进入补充信息');
  const name = projectDetail.value?.borrower_type == 2 ? projectDetail.value?.organization_name : projectDetail.value?.user_name;
  return pageName ? `${pageName} - ${name}` : name;
});

const activeTab = ref('1');
const panes = ref([
  {
    title: t('借款'),
    key: '1'
  },
  {
    title: t('放款'),
    key: '2'
  }
]);

onMounted(() => {
  if (uuid) {
    getProjectDetail();
  }
});
</script>

<style scoped lang="less">
@import '@/styles/variables.less';
.TabsPanel-Tab {
  list-style: none;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;
}
.tab-button {
  color: @clr_charcoal;
  background-color: transparent;
  border: 1px solid @clr_charcoal;
  padding: 4px 20px;
  border-radius: 55px;
}

.active-tab {
  color: @clr_yellow;
  border: 1px solid @clr_yellow;
}
</style>
