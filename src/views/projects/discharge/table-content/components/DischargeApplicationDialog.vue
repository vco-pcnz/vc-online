<template>
  <div>
    <discharge-reject-dialog
      v-model:visible="rejectVisible"
      :p_uuid="uuid"
      :id="infoData?.id"
      @done="handleDone"
    />

    <a-modal
      :open="visible"
      :title="t('审核抵押物解押申请')"
      :width="950"
      :footer="null"
      :keyboard="false"
      :maskClosable="false"
      @cancel="updateVisible(false)"
    >
      <div class="project-content">
        <a-row :gutter="24">
          <a-col :span="14" class="item-txt">
            <p class="name">{{ t('文件夹名称') }}</p>
            <p class="txt">{{ infoData?.info?.dirname || '--' }}</p>
          </a-col>
          <a-col :span="5" class="item-txt">
            <p class="name">{{ t('还款日期') }}</p>
            <p class="txt">{{ infoData?.data?.repayment_date ? tool.showDate(infoData?.data?.repayment_date) : '--' }}</p>
          </a-col>
          <a-col :span="5" class="item-txt">
            <p class="name">{{ t('还款金额') }}</p>
            <vco-number class="number" :value="infoData?.repayment_amount || 0" :precision="2"></vco-number>
          </a-col>
          <a-col :span="24" class="item-txt">
            <p class="name">{{ t('解押说明') }}</p>
            <p class="txt">{{ infoData?.data?.reason || '--' }}</p>
          </a-col>
          <a-col v-if="tableData.length" :span="24" class="item-txt">
            <p class="name">{{ t('抵押物信息') }}</p>
            <div class="table-content sys-table-content info-content no-top-line">
              <a-table
                rowKey="uuid"
                :columns="tableColumns"
                :data-source="tableData"
                :pagination="false"
                table-layout="fixed"
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.dataIndex === 'amount'">
                    <vco-number size="fs_md" :value="record.amount" :precision="2"></vco-number>
                  </template>
                  <template v-if="column.dataIndex === 'is_gst'">
                    <span v-if="Number(record.is_gst) === 1">{{ t('包含') }}</span>
                    <span v-else>{{ t('不包含') }}</span>
                  </template>
                  <template v-if="column.dataIndex === 'real_amount'">
                    <vco-number size="fs_md" :value="record.real_amount" :precision="2"></vco-number>
                  </template>
                  <template v-if="column.dataIndex === 'net_proceeds_price'">
                    <vco-number size="fs_md" :value="record.net_proceeds_price" :precision="2"></vco-number>
                  </template>
                </template>
              </a-table>
            </div>
          </a-col>
          <a-col v-if="infoData?.info?.document?.length" :span="24" class="item-txt">
            <p class="name">{{ t('文件') }}</p>
            <div class="info-content">
              <div v-for="(item, index) in infoData?.info?.document" :key="index" class="file-item">
                <vco-file-item :file="item" :bg="true"></vco-file-item>
              </div>
            </div>
          </a-col>
        </a-row>
      </div>

      <div class="mt-10 mb-5">
        <div class="flex justify-end gap-5">
          <a-button type="grey" class="big shadow bold uppercase" @click="updateVisible(false)">{{ t('关闭') }}</a-button>
          <a-popconfirm :title="t('您确定要接受该请求吗？')" @confirm="accept">
            <a-button type="dark" class="big shadow bold uppercase">{{ t('审核') }}</a-button>
          </a-popconfirm>
        </div>

        <div class="flex flex-col justify-end items-end">
          <p class="color_grey fs_xs my-3">{{ t('您可以点击下面的按钮来拒绝请求。') }}</p>
          <div class="flex justify-center">
            <a-button type="danger" size="small" shape="round" @click="rejectVisible = true">{{ t('拒绝请求') }}</a-button>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';
import { dischargeSaveNStep } from '@/api/project/loan';
import DischargeRejectDialog from './DischargeRejectDialog.vue';

const emits = defineEmits(['update:visible', 'done']);
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  uuid: {
    type: String,
    default: ''
  },
  infoData: {
    type: Object,
    default: () => {}
  }
});

const { t } = useI18n();

/* 更新visible */
const updateVisible = (value) => {
  emits('update:visible', value);
};

const tableColumns = reactive([
  { title: t('名称'), dataIndex: 'security_name', width: 100, ellipsis: true },
  { title: t('产权编号'), dataIndex: 'card_no', width: 90 },
  { title: t('类型'), dataIndex: 'type_name', width: 80, align: 'center' },
  { title: t('地址'), dataIndex: 'city', width: 120, align: 'center', ellipsis: true },
  { title: t('抵押物价值'), dataIndex: 'amount', width: 110, align: 'center' },
  { title: t('消费税'), dataIndex: 'is_gst', width: 100, align: 'center' },
  { title: t('当前抵押物价值'), dataIndex: 'real_amount', width: 120, align: 'center' },
  { title: t('净收益'), dataIndex: 'net_proceeds_price', width: 120, align: 'center' }
]);

const tableData = computed(() => {
  const data = props.infoData?.data?.list || []
  return data
})

const handleDone = () => {
  updateVisible(false)
  emits('done')
}

const accept = async () => {
  await dischargeSaveNStep({ uuid: props.uuid, id: props.infoData?.id })
    .then(() => {
      handleDone()
      return true;
    })
    .catch(() => {
      return false;
    });
};

const rejectVisible = ref(false)
</script>

<style lang="less" scoped>
.project-content {
  position: relative;
  margin-top: 20px;
  .item-txt {
    margin-bottom: 20px;
    &:last-child {
      margin-bottom: 0;
    }
    > p {
      font-size: 13px;
      &.name {
        color: #999;
        margin-bottom: 3px;
      }
      &.txt {
        font-size: 18px;
        font-weight: 500;
        color: #181818;
      }
    }
    :deep(.number .ant-statistic-content) {
      font-size: 18px !important;
      font-weight: 500 !important;
    }
    .txt-box {
      display: flex;
      align-items: center;
      gap: 2px;
      &.line-info-box {
        gap: 15px;
      }
    }
    > .content {
      margin-top: 10px;
      display: flex;
      flex-wrap: wrap;
      gap: 25px;
      .item {
        display: flex;
        align-items: center;
        gap: 3px;
        font-size: 16px;
      }
    }
    > .info-content {
      border: 1px solid #282828;
      border-radius: 10px;
      padding: 10px 15px;
      margin-top: 10px;
    }
  }
}
</style>