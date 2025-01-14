<template>
  <div class="title">
    <slot></slot>
    <div class="upload-btn" v-if="visible">
      <vco-upload-modal v-model:list="list" v-model:value="uuids">
        <a-button type="brown" shape="round" size="small"> {{ t('上传') }}</a-button>
      </vco-upload-modal>
    </div>
  </div>
  <template v-if="list.length && visible">
    <div v-for="(item, index) in list" :key="index" class="file-item">
      <vco-file-item :file="item" :showClose="true" @remove="removeItem(index)"></vco-file-item>
    </div>
  </template>
</template>

<script setup>
import { ref,watch } from 'vue';
import { useI18n } from 'vue-i18n';

const emits = defineEmits(['update:visible','update:value', 'change']);
const { t } = useI18n();

const list = ref([]);
const uuids = ref([]);

const props = defineProps({
  value: {
    type: Array
  },
  visible: {
    type: Boolean,
    default: true
  }
});

const removeItem = (index) => {
  list.value.splice(index, 1);
};

watch(
  () => uuids.value,
  (val) => {
    emits('update:value',uuids.value)
  },
  {
    immediate: true
  }
);
watch(
  () => props.visible,
  (val) => {
    emits('update:value',val?uuids.value:[])
  },
  {
    immediate: true
  }
);
</script>

<style scoped lang="less">
@import '@/styles/variables.less';
.title {
  position: relative;
  .upload-btn {
    position: absolute;
    top: 6px;
    right: 0;
  }
}
</style>
