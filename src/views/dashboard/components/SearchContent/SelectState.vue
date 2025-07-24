<template>
  <div class="flex">
    <a-input readonly class="input-label" value="State" />
    <a-select v-model:value="value" style="width: 100px" :placeholder="t('请选择')" :allowClear="open_hidden" :options="options" @change="onChange"></a-select>
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
  },
  open_hidden: {
    type: Boolean,
    default: false
  }
});

const options = ref([
  {
    label: 'open',
    value: 'open',
    hidden: props.open_hidden
  },
  {
    label: 'approve',
    value: 'approve'
  }
]);

const onChange = () => {
  emits('change', { search: value.value });
};

onMounted(() => {
  value.value = props.data || null;
});
</script>
<style lang="less" scoped></style>
