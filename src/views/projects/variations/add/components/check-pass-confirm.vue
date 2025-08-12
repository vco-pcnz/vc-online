<template>
  <a-modal
    :width="500"
    :open="visible"
    :title="t('提示')"
    :maskClosable="false"
    :footer="false"
    getContainer="body"
    @cancel="updateVisible(false)"
  >
    <div class="mt-10 text-center">{{ t('当前项目是否已完成了所有对账操作？') }}</div>
    <div class="flex justify-center gap-5 mt-10 mb-1">
      <a-button type="grey" class="big shadow bold uppercase" @click="updateVisible(false)">{{ t('取消') }}</a-button>
      <a-button
        type="dark"
        class="big shadow bold uppercase"
        :loading="submitLoading"
        @click="submitHandle"
      >{{ t('确认') }}</a-button>
    </div>
  </a-modal>
</template>

<script scoped setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { projectVariationEdit } from '@/api/project/loan';
import { navigationTo } from '@/utils/tool';

const { t } = useI18n();
const emits = defineEmits(['update:visible']);

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  currentId: {
    type: [String, Number],
    default: ''
  }
});

/* 更新visible */
const updateVisible = (value) => {
  emits('update:visible', value);
};

const setVariationIdStore = (id) => {
  const obj = JSON.parse(localStorage.getItem('variationId') || '{}');
  obj[props.currentId] = id;
  localStorage.setItem('variationId', JSON.stringify(obj));
}

const submitLoading = ref(false);
const submitHandle = () => {
  submitLoading.value = true;
  projectVariationEdit({ uuid: props.currentId, build_log: [] }).then(res => {
    setVariationIdStore(res.id)
    submitLoading.value = false;
    updateVisible(false);
    navigationTo(`/projects/variations/add/?uuid=${props.currentId}`)
  }).catch(() => {
    submitLoading.value = false;
  })
};
</script>