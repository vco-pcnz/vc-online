<template>
  <div class="title">
    <slot></slot>
    <div class="upload-btn" v-if="visible">
      <vco-upload-modal v-model:list="list" v-model:value="uuids">
        <a-button type="brown" shape="round" size="small"> {{ t('上传') }}</a-button>
      </vco-upload-modal>
    </div>
  </div>
  <div class="file-content">
    <template v-if="list.length && visible">
      <div v-for="(item, index) in list" :key="index" class="file-item">
        <vco-file-item :file="item" :showClose="true" @remove="removeItem(index)"></vco-file-item>
      </div>
    </template>
    <p v-if="!list.length">{{ t('暂无数据，请上传') }}</p>
  </div>
</template>

<script setup>
import { ref,watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { cloneDeep } from 'lodash';

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
    emits('update:value', uuids.value)
  },
  {
    immediate: true
  }
);
watch(
  () => props.visible,
  (val) => {
    if (val) {
      const data = cloneDeep(props.value)
      if (data && data.length) {
        uuids.value = data.map(item => item.att_dir)
        list.value = data.map(item => {
          return {
            value: item.att_dir,
            name: item.name,
            size: item.att_size,
            type: item.type,
            uuid: item.uuid
          }
        })
      }
    } else {
      uuids.value = []
      list.value = []
    }
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
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.file-content {
  border: 1px solid #272727 !important;
  border-radius: 10px !important;
  background-color: #f7f9f8;
  padding: 15px;
  margin-top: 15px;
  > p {
    text-align: center;
    font-size: 14px;
    color: #999;
  }
}
</style>
