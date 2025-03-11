<template>
  <detail-layout active-tab="forecast" @getProjectDetail="getProjectDetail">
    <template #content>
      <a-spin :spinning="loading" size="large">
        <!-- <Cart :data="data"></Cart> -->
        <div class="flex items-center gap-3">
          <vco-number :value="projectDetail?.base?.est_loan_money" size="fs_xl" :precision="2"></vco-number>
          <vco-form-dialog :title="t('修改')" :initData="FormData" :formParams="{ uuid: uuid, estimated_loan: projectDetail?.base?.est_loan_money }" :showTip="true" url="projectDetail/closeCancel1231" @update="loadData">
            <a-button type="cyan" size="small" shape="round">{{ t('修改') }}</a-button>
          </vco-form-dialog>
        </div>

        <tableHook v-if="uuid" :uuid="uuid" :projectDetail="projectDetail" :data="data" @update="loadData"></tableHook>
      </a-spin>
    </template>
  </detail-layout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { size, template } from 'lodash';
import detailLayout from '../components/detailLayout.vue';
import Cart from './components/cart.vue';
import tableHook from './components/tableHook.vue';
import { useRoute } from 'vue-router';
import { darwdownLog } from '@/api/project/loan';

const route = useRoute();

const { t } = useI18n();

const uuid = ref('');

const data = ref();
const loading = ref(false);

const loadData = () => {
  loading.value = true;
  darwdownLog({ uuid: uuid.value })
    .then((res) => {
      data.value = res.data;
    })
    .finally(() => {
      loading.value = false;
    });
};

const projectDetail = ref();
const getProjectDetail = (val) => {
  projectDetail.value = val;
};

const FormData = ref([
  {
    type: 'amount',
    label: '预估贷款',
    key: 'estimated_loan',
    required: true
  }
]);

onMounted(() => {
  uuid.value = route.query.uuid;
  loadData();
});
</script>

<style scoped lang="less">
@import '@/styles/variables.less';
</style>
