<template>
  <div class="inline" @click="init"><slot></slot></div>
  <div @click.stop ref="JournalRef" class="Journal">
    <a-modal :width="700" :open="visible" :title="t('编辑金额记录') + ' ' + tool.formatMoney(pData.amount)" :getContainer="() => $refs.JournalRef" :maskClosable="false" :footer="false" @cancel="updateVisible(false)">
      <div class="content">
        <div style="max-height: 500px; overflow-y: auto; padding: 0 10px">
          <ul class="list" v-for="(item, index) in logList" :key="index">
            <li>{{ tool.showDate(item.update_time, 'DD/MM/YY') }}</li>
            <li>
              {{ item.type ? t('减少') : t('增加') }}
            </li>
            <li>
              <p class="bold black text-ellipsis overflow-hidden text-nowrap" :title="item.remark" style="width: 130px">{{ item.remark || '--' }}</p>
            </li>
            <li class="flex items-center justify-end">
              <vco-number color="#569695" v-if="item.type == 0" :value="item.amount" :precision="2" size="fs_md" prefix="" suffix=""></vco-number>
              <vco-number color="#d6a91f" v-if="item.type == 1" :value="item.amount" :precision="2" size="fs_md" prefix="" suffix=""></vco-number>
            </li>
          </ul>
        </div>

        <a-empty v-if="!logList || !logList.length" />
        <!-- <div class="pt-5 flex justify-end">
          <EditAmount :data="pData" @update="update">
            <a-button type="dark" class="big uppercase fs_2xs">{{ t('编辑金额') }} </a-button>
          </EditAmount>
        </div> -->
      </div>
    </a-modal>
  </div>
</template>

<script scoped setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';
import EditAmount from './EditAmount.vue';

const { t } = useI18n();
const emits = defineEmits(['update']);

const props = defineProps({

});

const visible = ref(false);

const updateVisible = (value) => {
  visible.value = value;
};

const logList = ref([]);
const pData = ref({});
const init = (val) => {
  pData.value = val;
  logList.value = val.log || [];
  visible.value = true;
};

const update = () => {
  updateVisible(false);
  emits('update');
};
// 暴露方法给父组件
defineExpose({
  init
});
</script>
<style scoped lang="less">
@import '@/styles/variables.less';

.Journal {
  :deep(.ant-modal-content) {
    .ant-modal-header {
      padding: 72px 84px 0px;
      border-radius: 24px;
      .ant-modal-title {
        font-size: 20px;
        font-weight: 500;
      }
    }
    padding: 0px !important;

    .content {
      line-height: 1.33;
      padding: 24px 84px 72px;
      .list {
        padding: 16px 8px;
        &:hover {
          background: #fafafa;
        }
        &:not(:last-child) {
          border-bottom: 1px solid #e2e5e2;
        }
        display: flex;
        align-items: center;
        li {
          flex: 1;
          .dot {
            background-color: #b4d8d8;
            border-radius: 4px;
            display: inline-block;
            height: 8px;
            width: 8px;
          }

          &:nth-child(1) {
            flex: 0 0 100px;
          }
          &:nth-child(2) {
            flex: 0 0 100px;
          }
        }
        &.back li .dot {
          background: #181818;
        }
      }
    }
  }

  .input-item {
    margin-top: 20px;
  }
}
</style>
