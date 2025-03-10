<template>
  <!-- 提示弹窗 -->
  <a-modal :open="visible" :title="t('提示')" :width="460" :footer="null" :keyboard="false" :maskClosable="false" @cancel="updateVisible(false)">
    <div class="tips-content">
      <p class="tips-txt" v-if="tip1">{{ t(tip1) }}</p>
      <p class="tips-txt" v-if="tip2">{{ t(tip2) }}</p>

      <div class="mt-5 flex justify-between gap-5">
        <a-button type="grey" class="big shadow bold uppercase w-full mb-5 mt-5" @click="updateVisible(false)">{{ t('取消') }}</a-button>

        <a-button type="dark" class="big shadow bold uppercase w-full mb-5 mt-5" :loading="loading" @click="confirm">{{ t('确认') }}</a-button>
      </div>
    </div>
  </a-modal>
</template>

<script scoped setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const emits = defineEmits(['update:visible', 'confirm']);

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  tip1: {
    type: String,
    default: '此操作会影响forecast,是否要继续?'
  },
  tip2: {
    type: String,
    default: ''
  }
});

const updateVisible = (value) => {
  emits('update:visible', value);
};
const confirm = () => {
  updateVisible(false);
  emits('confirm');
};
</script>
<style scoped lang="less">
.tips-txt {
  font-size: 16px;
  font-weight: 500;
  padding-top: 15px;
}
</style>
