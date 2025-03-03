<template>
  <a-modal
    :open="visible"
    :title="t('明细表')"
    :width="1000"
    :footer="null"
    :keyboard="false"
    :maskClosable="false"
    @cancel="updateVisible(false)"
  >
    <schedule
      v-if="uuid && showData && detailData.id"
      :currentId="uuid"
      :item-id="detailData.id"
    ></schedule>

    <div class="mt-10 mb-5 flex justify-end">
      <a-button
        type="grey" class="big shadow bold uppercase mb-5 mt-5"
        @click="updateVisible(false)"
      >{{ t('关闭') }}</a-button>
    </div>
    
  </a-modal>
</template>

<script setup>
  import { ref, watch, computed } from "vue";
  import { useI18n } from "vue-i18n";
  import schedule from '@/components/schedule/index.vue';
  import tool from '@/utils/tool';

  const emits = defineEmits(['update:visible'])

  const props = defineProps({
    visible: {
      type: Boolean,
      default: false
    },
    uuid: {
      type: String,
      default: ''
    },
    detailData: {
      type: Object,
      default: () => {}
    }
  });

  const showData = ref(false)

  const { t } = useI18n();

  /* 更新visible */
  const updateVisible = (value) => {
    emits('update:visible', value);
  };

  watch(
    () => props.visible,
    (val) => {
      if (val) {
        showData.value = true
      } else {
        showData.value = false
      }
    }
  )
</script>

<style lang="less" scoped>

</style>