<template>
  <div v-if="showEntry" class="update-forecast-entry ml-3">
    <p v-if="summary" class="entry-caption fs_xs color_grey">
      {{ lastReview }} ·
      <a @click="navigationTo('/dashboard/update-forecast?review_status=not_reviewed')">{{ summary.not_reviewed }} not reviewed</a>
    </p>
    <a-button type="cyan" @click="navigationTo('/dashboard/update-forecast')">Update forecast</a-button>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import dayjs from 'dayjs';
import { navigationTo } from '@/utils/tool';
import { hasPermission } from '@/directives/permission/index';
import useProductStore from '@/store/modules/product';
import { forecastUpdSummary } from '@/api/project/forecast-upd';

const productStore = useProductStore();

// 有按钮权限且当前产品不是lendr才显示
const showEntry = computed(() => {
  const product = productStore.productData.find((item) => item.uuid === productStore.currentProduct);
  return hasPermission('home:update_forecast') && !!product && String(product.code).toLowerCase() !== 'lendr';
});

const summary = ref(null);

// 最近一次review的日期和操作人
const lastReview = computed(() => {
  const review = summary.value?.last_review;
  return review ? `Last reviewed ${dayjs(review.time).format("D MMM 'YY")} by ${review.user_name}` : 'No review yet';
});

// 加载序号：快速切换产品时，只采用最新一次请求的结果
let loadSeq = 0;
const loadData = () => {
  const seq = ++loadSeq;
  summary.value = null;
  if (!showEntry.value) return;
  forecastUpdSummary({ product_uuid: productStore.currentProduct }).then((res) => {
    if (seq === loadSeq) summary.value = res;
  });
};

// 切换产品时重新加载
watch(() => productStore.currentProduct, loadData, { immediate: true });
</script>

<style scoped lang="less">
.update-forecast-entry {
  position: relative;
  // 说明文字放在按钮上方，不占标题行的宽度（标题行在1440px下已经很挤）
  .entry-caption {
    position: absolute;
    right: 0;
    bottom: 100%;
    margin-bottom: 4px;
    line-height: 1.2;
    white-space: nowrap;
  }
}
</style>
