<template>
  <div class="nav-content">
    <div v-for="item in productData" :key="item.uuid" class="nav-link" :class="{ active: item.uuid === currentProduct }" @click="productChange(item)">
      {{ item.name }}
    </div>
    <slot></slot>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import useProductStore from '@/store/modules/product';

const emits = defineEmits(['update:current', 'change']);
const productStore = useProductStore();
const productData = computed(() => productStore.productData);
const currentProduct = ref(productData.value.length ? productData.value[0].uuid : '');

const productChange = (data) => {
  currentProduct.value = data.uuid;
};

watch(
  () => currentProduct.value,
  (val) => {
    emits('update:current', currentProduct.value);
    emits('change');
  },
  { immediate: true, deep: true }
);
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';
.nav-content {
  display: flex;
  align-items: center;
  gap: 20px;
  border-bottom: 1px solid #808080;
  padding-bottom: 20px;
  .nav-link {
    display: block;
    background-color: #f3ede5;
    padding: 12px 20px;
    font-size: 14px;
    font-weight: 500;
    color: #272727;
    border-radius: 40px;
    transition: all 0.3s ease;
    cursor: pointer;
    &.active {
      background-color: #272727;
      color: #fff;
    }
    &:hover {
      background-color: #272727;
      color: #fff;
    }
  }
}
</style>
