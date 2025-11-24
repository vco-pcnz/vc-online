<template>
  <div class="inline" @click="updateVisible(true)"><slot></slot></div>
  <div @click.stop>
    <a-modal :width="500" :open="visible" :title="t('买断')" :maskClosable="false" :footer="false" @cancel="updateVisible(false)">
      <div class="content sys-form-content">
        <a-row  :gutter="24" class="pl-10 pr-10">
          <a-col :span="12" class="item-txt">
            <p>{{ t('日期') }}</p>
            <p>{{ tool.showDate(data?.date) }}</p>
          </a-col>
          <a-col :span="12" class="item-txt">
            <p>{{ t('Boc总余额') }}</p>
            <p>{{ tool.formatMoney(data?.amount) }}</p>
          </a-col>
          <a-col :span="24" class="item-txt">
            <p>{{ t('说明') }}</p>
            <p>{{ data?.note || '--' }}</p>
          </a-col>

          <a-col :span="24" class="item-txt">
            <p class="mb-3">{{ t('项目文件') }}</p>
            <a-alert type="warning">
              <template #description>
                <div style="max-height: 300px; overflow-y: auto; padding-right: 10px">
                  <div class="documents" v-for="(item, index) in data?.document" :key="index">
                    <vco-file-item :file="item"></vco-file-item>
                  </div>
                </div>
                <p v-if="!data.document.length">--</p>
              </template>
            </a-alert>
          </a-col>
        </a-row>
      </div>
    </a-modal>
  </div>
</template>

<script scoped setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';
const { t } = useI18n();

const props = defineProps({
  data: {
    type: [Object, Array]
  }
});
const visible = ref(false);

const updateVisible = (value) => {
  visible.value = value;
};
</script>
<style scoped lang="less">
@import '@/styles/variables.less';

.item-txt {
  margin-top: 25px;
  > p {
    font-size: 13px;
    &:first-child {
      color: #999;
    }
    &:last-child {
      font-size: 14px;
      margin-top: 5px;
      word-break: break-all;
    }
  }
  :deep(.ant-statistic-content) {
    font-size: 16px !important;
  }
}

:deep(.ant-alert-warning) {
  background-color: #f5f5f5;
  border: 1px solid #dddddd;
}
</style>
