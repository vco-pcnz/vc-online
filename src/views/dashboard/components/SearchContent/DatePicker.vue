<template>
  <div class="flex">
    <a-input readonly class="input-label" value="Date" />
    <a-date-picker style="width: 120px" v-model:value="value" :format="selectDateFormat()" valueFormat="YYYY-MM-DD" :allowClear="false" @change="onChange" />
  </div>
  <!-- :disabledDate="disabledDateFormat" -->
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { selectDateFormat } from '@/utils/tool';
import { cloneDeep } from 'lodash';

const { t } = useI18n();
const emits = defineEmits(['change']);

const value = ref();
const props = defineProps({
  data: {
    type: String
  }
});

const onChange = () => {
  emits('change', { date: value.value });
};

const disabledDateFormat = (current) => {
  const endDate = new Date();
  if (current && current.isAfter(endDate, 'day')) {
    return true;
  }

  return false;
};

onMounted(() => {
  value.value = props.data;
});
</script>
<style lang="less" scoped></style>
