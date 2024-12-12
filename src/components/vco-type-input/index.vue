<template>
  <div class="type-input-content">
    <a-select v-model:value="typeValue" class="input-select" @change="selectChange">
      <a-select-option v-for="(item, index) in typeData" :key="item.value || index" :value="item.value">{{ item.label }}</a-select-option>
    </a-select>
    <a-input v-model:value="value" :placeholder="placeholder" @input="inputChange" />
  </div>
</template>

<script setup lang="js">
import { ref,watch } from "vue"

const emits = defineEmits(['update:modelValue', 'update:type', 'change'])
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  typeData: {
    type: Array,
    default: () => []
  }
})

const value = ref('')
const typeValue = ref('')

const selectChange = (type) => {
  emits('update:type', type)
  emits('change')
}

const inputChange = () => {
  emits('update:modelValue', value.value)
}

watch(
  () => [props.modelValue,props.type],
  () => {
    value.value = props.modelValue
    typeValue.value = props.type
  },
  {
    immediate: true,
    deep: true
  }
);
</script>

<style lang="less" scoped>
.type-input-content {
  position: relative;

  :deep(.ant-select) {
    position: absolute !important;
    width: 100px !important;
    z-index: 9;
    top: 1px;
    left: 1px;
    .ant-select-selector {
      height: 30px;
      border: none !important;
      box-shadow: none !important;
      border-right: 1px solid #000 !important;
      border-top-right-radius: 0 !important;
      border-bottom-right-radius: 0 !important;
      background-color: transparent !important;
    }
  }
  :deep(.input-select.ant-select-open) .ant-select-selector {
    box-shadow: none !important;
  }
  :deep(.ant-input) {
    padding-left: 110px;
  }
}
</style>
