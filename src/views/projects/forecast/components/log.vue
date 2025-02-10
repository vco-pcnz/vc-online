<template>
  <div class="inline" @click="init"><slot></slot></div>
  <div @click.stop ref="JournalRef" class="Journal">
    <a-modal :width="700" :open="visible" :title="'Estimated drawdown ' + logList.length + ' forecast history'" :getContainer="() => $refs.JournalRef" :maskClosable="false" :footer="false" @cancel="updateVisible(false)">
      <div class="content">
        <ul class="list" v-for="(item, index) in logList" :key="index">
          <li>5/02/25</li>
          <li class="flex items-center"><vco-avatar :size="30"></vco-avatar> <span class="ml-3">renee lm</span></li>
          <li>{{ tool.showDate(item.date) }}</li>
          <li class="flex items-center justify-end"><span class="dot mr-3"></span> <vco-number color="#569695" :value="item.amount" :precision="2" size="fs_md"></vco-number></li>
        </ul>
        <template v-if="itemDate?.forecast_apply">
          
        <ul class="list back">
          <li>{{itemDate?.name}}</li>
          <li class="flex items-center"></li>
          <li>{{ tool.showDate(itemDate?.date) }}</li>
          <li class="flex items-center justify-end"><span class="dot mr-3"></span> <vco-number :value="itemDate?.amount" :precision="2" size="fs_md"></vco-number></li>
        </ul>
        </template>
        <div class="pt-5 flex justify-end" v-else>
          <Add :uuid="uuid" :projectDetail="projectDetail" :itemDate="itemDate" @update="update"> <a-button type="dark" class="big uppercase fs_2xs"> Edit forecast </a-button></Add>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script scoped setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue/es';
import tool from '@/utils/tool';
import { addf } from '@/api/project/loan';
import dayjs, { Dayjs } from 'dayjs';
import Add from './add.vue';

const { t } = useI18n();
const emits = defineEmits(['update']);

const props = defineProps({
  uuid: {
    type: String
  },
  projectDetail: {
    type: Object
  },
  logList: {
    type: Array
  },
  itemDate: {
    type: Object
  }
});

const visible = ref(false);
const loading = ref(false);
const validate = ref(false);
const formState = ref({
  id: 0,
  apply_uuid: 0,
  type: 2,
  date: '',
  amount: '',
  note: ''
});

const disabledDateFormat = (current) => {
  const startDate = props.projectDetail.loan.start_date;
  const endDate = props.projectDetail.loan.end_date;

  if (current && current.isBefore(startDate, 'day')) {
    return true;
  }

  if (current && current.isAfter(endDate, 'day')) {
    return true;
  }

  return false;
};

const updateVisible = (value) => {
  visible.value = value;
};

const save = () => {
  validate.value = true;
  if (!formState.value.amount || !formState.value.date) return;
  loading.value = true;
  let params = { ...formState.value, apply_uuid: props.uuid };
  addf(params)
    .then((res) => {
      message.success(t('保存成功'));
      update();
      updateVisible(false);
    })
    .finally((_) => {
      validate.value = false;
      loading.value = false;
    });
};

const init = () => {
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
