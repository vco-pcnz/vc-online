<template>
  <div class="flex">
    <a-input readonly class="input-label" value="LM" />
    <a-select v-model:value="value" mode="multiple" style="width: 180px" :maxTagCount="1" :placeholder="t('请选择')" :options="options" :filter-option="customFilter" :fieldNames="{ label: 'user_name', value: 'uuid' }" @change="onChange()">
    </a-select>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
import { managerList } from '@/api/project/forecast';
const emits = defineEmits(['change']);

const value = ref();

const props = defineProps({
  //   value: {
  //     type: [String, Number]
  //   }
});

const options = ref([]);

const loading = ref(true);
const loadData = () => {
  managerList()
    .then((res) => {
      options.value = res.data;
    })
    .finally(() => {
      loading.value = false;
    });
};

const customFilter = (input, option) => {
  // 根据自定义字段名 'name' 进行筛选
  return option.user_name.toLowerCase().includes(input.toLowerCase());
};

const onChange = () => {
  emits('change', { lm_uuids: value.value.join() });
};

onMounted(() => {
  loadData();
});
</script>
<style lang="less" scoped></style>
