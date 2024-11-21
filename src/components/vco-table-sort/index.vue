<template>
  <div class="table-sort">
    <i class="iconfont" :class="{'asc': !isDefault}" @click="typeChange">&#xe74d;</i>
    <div class="flex items-center gap-2">
      <p>{{ t('排序方式') }}</p>
      <a-select v-model:value="sortValue" size="small" class="input-select" @change="selectChange">
        <a-select-option v-for="(item, index) in typeData" :key="item.value || index" :value="item.value">{{ item.label }}</a-select-option>
      </a-select>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from "vue"
  import { useI18n } from "vue-i18n";

  const emits = defineEmits(['update:modelValue', 'update:value'])

  const props = defineProps({
    modelValue: {
      type: String,
      default: 'desc'
    },
    value: {
      type: String,
      default: ''
    },
    typeData: {
      type: Array,
      default: () => []
    }
  })

  const { t } = useI18n();
  const isDefault = ref(true)
  const sortValue = ref('')

  const typeChange = () => {
    isDefault.value = !isDefault.value
    const type = isDefault.value ? 'desc' : 'asc'
    emits('update:modelValue', type)
  }

  const selectChange = () => {
    emits('update:value', sortValue.value)
  }

  onMounted(() => {
    isDefault.value = props.modelValue === 'desc'
    sortValue.value = props.value
  })
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
        box-shadow: 0 0 0 2px rgba(0, 0, 0, .1) !important;
      }
      :deep(.ant-select-arrow) {
        color: #000 !important;
      }
    }
  }
</style>