<template>
  <div class="mt-5">
    <a-pagination
      size="small"
      :total="pagination.count"
      :pageSize="pagination.limit"
      :current="pagination.page"
      show-size-changer
      show-quick-jumper
      @change="change"
      :show-total="(total) => t('共{0}条', [total])"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";

const emits = defineEmits(["update:value", "change"]);

const props = defineProps({
  modelValue: {
    type: Object,
    default: {
      count: 0,
      page: 1,
      limit: 10,
    },
  },
});

const { t } = useI18n();

const change = (current, size) => {
  pagination.value.page = current;
  pagination.value.limit = size;
  emits("update:modelValue", pagination.value);
  emits("change");
};

const pagination = ref({
  count: 0,
  page: 1,
  limit: 10,
});

watch(
  () => props.modelValue,
  (val) => {
    Object.assign(pagination.value,props.modelValue) ;
  },
  { deep: true ,immediate: true}
);
</script>

<style lang="less" scoped>
@import "@/styles/variables.less";
.table-sort {
  display: flex;
  align-items: center;
  gap: 5px;
  > .iconfont {
    cursor: pointer;
    user-select: none;
    transition: all 0.3s ease;
    &:hover {
      color: @colorPrimary;
    }
    &.asc {
      transform: rotateX(180deg);
    }
  }
  > .flex {
    > p {
      font-size: 13px;
    }
    :deep(.ant-select) {
      width: 120px;
    }
    :deep(.ant-select-selector) {
      box-shadow: none !important;
      border-color: #000 !important;
      font-size: 13px;
    }
    :deep(.ant-select-open) .ant-select-selector {
      box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1) !important;
    }
    :deep(.ant-select-arrow) {
      color: #000 !important;
    }
  }
}
</style>
