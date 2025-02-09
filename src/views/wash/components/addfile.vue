<template>
  <div class="my-3">
    <UploadBtn v-model:list="list" :defaultUploadType="2" controller="/wash" :params="{ code: code }" @change="update">
      <a-button size="small" shape="round" type="brown">{{ t('添加文件') }}</a-button>
    </UploadBtn>
    <template v-if="list.length">
      <div v-for="(item, index) in list" :key="index" class="file-item">
        <vco-file-item :file="item" :showClose="true" @remove="removeItem(index)"></vco-file-item>
      </div>
    </template>
  </div>
</template>
<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import UploadBtn from '@/components/vco-upload-modal/upload-btn.vue';
const emits = defineEmits(['update:value', 'update:document', 'change']);

const props = defineProps({
  code: {
    type: String
  },
  document: {
    type: Array
  }
});
const { t } = useI18n();
const list = ref([]);

const removeItem = (index) => {
    list.value.splice(index, 1);
    update()
};

const update = () => {
  emits('update:document', list.value);
  emits('change', list.value);
};

watch(
  () => props.document,
  (val) => {
      if (!props.document.length) {
      list.value = [];
    }
  },
  {
    immediate: true,
    deep: true
  }
);
</script>
