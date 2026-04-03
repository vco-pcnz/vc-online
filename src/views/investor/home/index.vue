<template>
  <Satistics v-if="!isVslProduct" :invest_id="invest_id" :product_uuid="product_uuid"></Satistics>
  <SatisticsVsl v-else :invest_id="invest_id" :product_uuid="product_uuid"></SatisticsVsl>
  <div v-if="!isVslProduct" class="my-12">
    <AmountLog :invest_id="invest_id" :product_uuid="product_uuid"></AmountLog>
  </div>
  <div class="my-12">
    <ProjectDashboard :invest_id="invest_id" :product_uuid="product_uuid"></ProjectDashboard>
  </div>
  <CashflowForecast v-if="invest_id" :invest_id="invest_id" :product_uuid="product_uuid" :isNav="false"></CashflowForecast>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { hasPermission } from '@/directives/permission/index';
import Satistics from './components/Satistics/index.vue';
import SatisticsVsl from './components/SatisticsVsl/index.vue';
import AmountLog from './components/AmountLog/index.vue';
import ProjectDashboard from './components/ProjectDashboard/index.vue';
import CashflowForecast from './components/CashflowForecast/index.vue';
import { userProject } from '@/api/invest';
import { useRoute } from 'vue-router';
import useProductStore from '@/store/modules/product';

const { t } = useI18n();

const productStore = useProductStore();
const isVslProduct = computed(() => {
  const p = productStore.productData.find((item) => item.uuid === productStore.currentProduct);
  return String(p?.code || '').toLowerCase() === 'vsl';
});

const invest_id = ref('');
const route = useRoute();

const product_uuid = computed(() => productStore.currentProduct || '');

const resolveInvestId = () => {
  if (route.query.uuid) {
    invest_id.value = route.query.uuid;
    return;
  }
  const params = productStore.currentProduct ? { product_uuid: productStore.currentProduct } : {};
  userProject(params).then((res) => {
    if (res && res.length) {
      const current = productStore.currentProduct;
      const matched = current
        ? res.find((item) => item.product_uuid === current)
        : null;
      invest_id.value = matched?.uuid ?? '';
    } else {
      invest_id.value = '';
    }
  });
};

onMounted(() => {
  resolveInvestId();
});

watch(
  () => productStore.currentProduct,
  () => {
    resolveInvestId();
  }
);

watch(
  () => route.query.uuid,
  () => {
    resolveInvestId();
  }
);
</script>

<style scoped lang="less">
:deep(.fs_2xl) {
  font-weight: 700;
}

:deep(.title) {
  border-bottom: 1px solid #e2e5e2;
  padding-bottom: 12px;
  padding-top: 12px;
  line-height: 1.2;
  align-items: center;
  gap: 10px;

  .fs_2xl {
    font-weight: 700;
  }
  .iconfont {
    font-weight: 200;
    font-size: 12px;
    bottom: 1px;
    position: relative;
  }
}
</style>
