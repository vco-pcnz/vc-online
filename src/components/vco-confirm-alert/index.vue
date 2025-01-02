<template>
  <a-modal
    :open="visible"
    :title="t('提示')"
    :width="460"
    :footer="null"
    :keyboard="false"
    :maskClosable="false"
    @cancel="updateVisible(false)"
  >
    <div class="mt-5 text-center">
      <span v-if="props.check">{{ t('确定通过审核吗？') }}</span>
      <span>{{ t('确定修改吗？') }}</span>
    </div>

    <div class="mt-5 flex justify-between gap-5">
      <a-button
        type="grey" class="big shadow bold uppercase w-full mb-5 mt-5"
        @click="updateVisible(false)"
      >{{ t('取消') }}</a-button>

      <a-button
        type="dark" class="big shadow bold uppercase w-full mb-5 mt-5"
        :loading="subLoading"
        @click="submitHandle"
      >{{ t('确定') }}</a-button>
    </div>
  </a-modal>
</template>

<script setup>
  import { ref, watch } from "vue";
  import { useI18n } from "vue-i18n";

  const emits = defineEmits(['update:visible', 'submit'])

  const props = defineProps({
    visible: {
      type: Boolean,
      default: false
    },
    check: {
      type: Boolean,
      default: false
    }
  });

  const { t } = useI18n();

  const changeLoading = (flag) => {
    subLoading.value = flag
  }

  /* 更新visible */
  const updateVisible = (value) => {
    emits('update:visible', value);
  };

  const subLoading = ref(false)
  const submitHandle = () => {
    changeLoading(true)
    emits('submit')
  }

  watch(
    () => props.visible,
    (val) => {
      if (!val) {
        subLoading.value = false;
      }
    }
  )

  defineExpose({
    changeLoading
  })
</script>