<template>
  <div class="flex">
    <a-input readonly class="input-label" value="Type" />
    <a-select v-model:value="value" style="width: 110px" :placeholder="t('请选择')" :allowClear="open_hidden" :options="options" @change="onChange"></a-select>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const emits = defineEmits(['change']);

const value = ref();

const props = defineProps({
  data: {
    type: String
  }
});

const options = ref([
  {
    label: 'drawdowns',
    value: '2'
  },
  {
    label: 'repayments',
    value: '4'
  }
]);

const onChange = () => {
  emits('change', { type: value.value });
};

onMounted(() => {
  value.value = props.data || null;
});
</script>
<style lang="less" scoped></style>
