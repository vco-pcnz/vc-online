<template>
  <div @click.stop ref="tipModalRef" class="tipModal">
    <a-modal :width="760" :open="visible" :getContainer="() => $refs.tipModalRef" :maskClosable="false" :footer="false" @cancel="updateVisible(false)">
      <div class="content sys-form-content">
        <p class="icon-box"><i class="iconfont">&#xe750;</i></p>
        <p class="title">Transaction Mismatch Detected</p>
        <p class="info">The system has identified a discrepancy in the recorded transaction dates. Do you want to proceed with the reconciliation?</p>
        <div class="flex justify-center" style="padding-bottom: 50px">
          <a-button @click="updateVisible(false)" class="save big uppercase">
            {{ t('取消') }}
          </a-button>
          <a-button @click="save" class="save big uppercase ml-8">
            {{ t('继续填写') }}
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script scoped setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const emits = defineEmits(['update:visible', 'submit']);

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
});

const updateVisible = (value) => {
  emits('update:visible', value);
};

const save = () => {
  updateVisible(false)
  emits('submit');
};
</script>
<style scoped lang="less">
@import '@/styles/variables.less';

.tipModal {
  text-align: center;
  .icon-box {
    text-align: center;
    padding-top: 20px;
    color: rgb(237, 204, 74);
    .iconfont {
      font-size: 64px;
    }
  }

  .title {
    color: #c1430c;
    font-weight: 500;
    font-size: 20px;
    line-height: 1.2;
    margin-top: -8px;
  }

  .info {
    margin-top: 32px;
    margin-bottom: 64px;
    font-weight: 500;
    font-size: 18px;
    line-height: 1.2;
    padding: 0 60px;
  }

  :deep(.ant-btn-default) {
    border: 1px solid #cfd2d4;
    border-radius: 3px;
    box-shadow: 0 0 0 0 hsla(0, 0%, 100%, 0.3);
    color: #999;
    &:hover {
      border-color: #e6d0ac;
      color: #e6d0ac;
    }
  }
}
</style>
