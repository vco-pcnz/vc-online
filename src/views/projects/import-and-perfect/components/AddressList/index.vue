<template>
  <div>
    <template v-for="(item, index) in list" :key="index">
      <div :class="[{ other: list.length > 1 }]">
        <div style="position: absolute; top: 15px; right: 15px; z-index: 2">
          <a-popconfirm :title="t('确定删除吗？')" :ok-text="t('确定')" :cancel-text="t('取消')" @confirm="remove(index)" v-if="list.length > 1">
            <i class="iconfont" style="cursor: pointer">&#xe8c1;</i>
          </a-popconfirm>
        </div>
        <Address ref="AddressRef" v-model:value="list[index]" :config="config" :data="item" @change="change"></Address>
      </div>
    </template>
    <div class="flex justify-end">
      <a-button type="brown" shape="round" size="small" @click="add()">{{ t('其他地址') }}</a-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';
import Address from './Address.vue';
import { cloneDeep } from 'lodash';

const { t } = useI18n();
const emits = defineEmits(['update:value', 'change']);

const props = defineProps({
  value: {
    type: Array
  },
  config: {
    type: Object
  }
});

const list = ref([]);
const add = () => {
  list.value.push({
    project_address_short: '',
    project_address: '',
    project_suburb: '',
    project_postcode: '',
    project_con_id: '',
    project_region: '',
    region_one_name: '',
    region_one_id: '',
    region_two_id: '',
    region_three_id: ''
  });
};

const change = (e) => {
  emits('update:value', list.value);
  emits('change', list.value);
};

watch(
  () => props.value,
  (val) => {
    list.value = cloneDeep(props.value);
  },
  { deep: true, immediate: true }
);

const AddressRef = ref(null);
const validate = async () => {
  let allValid = true;
  for (const form of AddressRef.value) {
    try {
      await form.validate();
    } catch (error) {
      allValid = false;
    }
  }
  return allValid;
};

const remove = (index) => {
  list.value.splice(index, 1);
  change();
};
// 暴露方法给父组件
defineExpose({
  validate
});
</script>

<style lang="less" scoped>
.other {
  position: relative;
  background: #f1f1f1;
  padding: 24px;
  border-radius: 8px;
  margin-bottom: 15px;
}
</style>
