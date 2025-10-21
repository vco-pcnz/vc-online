<template>
  <a-modal
    :open="visible"
    :title="t('解押申请')"
    :width="1100"
    :footer="null"
    :keyboard="false"
    :maskClosable="false"
    @cancel="updateVisible(false)"
  >
    <div class="content sys-form-content mt-10">
      <a-form ref="formRef" layout="vertical" :model="formState" :rules="formRules">
        <a-row :gutter="24">
          <a-col :span="14">
            <a-form-item :label="t('文件夹名称')" name="dirname">
              <a-input v-model:value="formState.dirname" :placeholder="t('请输入')" :rows="3" />
            </a-form-item>
          </a-col>
          <a-col :span="10">
            <a-form-item :label="t('还款日期')">
              <a-date-picker class="datePicker" inputReadOnly v-model:value="formState.repayment_date" :format="selectDateFormat()" valueFormat="YYYY-MM-DD" placeholder="" :showToday="false" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item :label="t('抵押物信息')">
              <div class="table-content sys-table-content related-content no-top-line">
              <a-table
                rowKey="uuid"
                :columns="tableColumns"
                :data-source="tableData"
                :pagination="false"
                :scroll="{ x: 900, y: 250 }"
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
                    <a-input-number
                      v-model:value="record.real_amount"
                      :max="99999999999"
                      :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                      :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                      :controls="false"
                      class="mini"
                    />
                  </template>
                  <template v-if="column.dataIndex === 'net_proceeds_price'">
                    <a-input-number
                      v-model:value="record.net_proceeds_price"
                      :max="99999999999"
                      :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                      :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                      :controls="false"
                      class="mini"
                    />
                  </template>
                </template>
              </a-table>
            </div>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item :label="t('解押说明')" name="reason">
              <a-textarea v-model:value="formState.reason" :placeholder="t('请输入')" :rows="3" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <documents-upload v-model:value="formState.documents">
              <div class="upload-title">{{ t('文件') }}</div>
            </documents-upload>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <div class="flex gap-4 mb-5 mt-5 justify-end">
      <a-button type="grey" class="big shadow bold uppercase" @click="updateVisible(false)">{{ t('取消') }}</a-button>
      <a-button type="dark" class="big shadow bold uppercase" :loading="subLoading" @click="submitHandle">{{ t('提交') }}</a-button>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, watch, reactive } from 'vue';
import dayjs from 'dayjs';
import { message } from 'ant-design-vue/es';
import { useI18n } from 'vue-i18n';
import { cloneDeep } from 'lodash';
import tool, { selectDateFormat } from '@/utils/tool';
import DocumentsUpload from './../../components/form/DocumentsUpload.vue';
import { dischargeBatchEdit } from '@/api/project/loan';

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
  },
  projectDetail: {
    type: Object,
    default: () => {}
  }
});

const { t } = useI18n();

/* 更新visible */
const updateVisible = (value) => {
  emits('update:visible', value);
};

const formRef = ref()
const formState = ref({
  dirname: '',
  repayment_date: '',
  reason: '',
  documents: []
})

const formRules = ref({
  dirname: [{ required: true, message: t('请输入') + t('文件夹名称'), trigger: 'blur' }]
});

const tableColumns = reactive([
  { title: t('名称'), dataIndex: 'security_name', width: 100, ellipsis: true },
  { title: t('产权编号'), dataIndex: 'card_no', width: 90 },
  { title: t('类型'), dataIndex: 'type_name', width: 80, align: 'center' },
  { title: t('地址'), dataIndex: 'address', width: 120, align: 'center', ellipsis: true },
  { title: t('抵押物价值'), dataIndex: 'amount', width: 110, align: 'center' },
  { title: t('消费税'), dataIndex: 'is_gst', width: 100, align: 'center' },
  { title: t('当前抵押物价值'), dataIndex: 'real_amount', width: 160, align: 'center' },
  { title: t('净收益'), dataIndex: 'net_proceeds_price', width: 160, align: 'center' }
]);

const tableData = ref([])
const dataInit = () => {
  const todayStr = tool.showDate(dayjs().format('YYYY-MM-DD'))
  formState.value.dirname = `${todayStr} - ${props.projectDetail.base.project_name}`

  const data = cloneDeep(props.infoData)
  data.forEach(item => {
    item.address = item.card_no + ', ' + item.city
    item.real_amount = Number(item.real_amount) ? item.real_amount : item.amount
    item.net_proceeds_price = 0
  })
  tableData.value = data
}

const checkTableData = () => {
  for (let i = 0; i < tableData.value.length; i++) {
    const item = tableData.value[i]
    if (!item.real_amount && item.real_amount !== 0) {
      message.error(t('请设置第{0}行的当前抵押物价值', [i + 1]))
      return false
    }
  }
  return true
}

const subLoading = ref(false)
const submitHandle = () => {
  formRef.value
    .validate()
    .then(() => {
      if (!checkTableData()) {
        return false
      }
      const params = {
        process__info: {
          dirname: formState.value.dirname,
          document: formState.value.documents || []
        },
        p_uuid: props.uuid,
        repayment_date: formState.value.repayment_date || '',
        reason: formState.value.reason || '',
        list: tableData.value.map(item => ({
          uuid: item.uuid,
          real_amount: Number(item.real_amount || 0),
          net_proceeds_price: Number(item.net_proceeds_price || 0)
        }))
      }
      subLoading.value = true
      dischargeBatchEdit(params)
        .then(() => {
          subLoading.value = false;
          updateVisible(false);
          emits('done');
        })
        .catch(() => {
          subLoading.value = false;
        });
    })
    .catch((error) => {
      console.log('error', error);
    });
}

watch(
  () => props.visible,
  (val) => {
    if (val) {
      dataInit()
    } else {
      subLoading.value = false;

      formRef.value.clearValidate();
      formRef.value.resetFields();
      Object.keys(formState.value).forEach((key) => {
        if (key === 'documents') {
          formState.value[key] = [];
        } else {
          formState.value[key] = '';
        }
      });
    }
  }
);
</script>

<style lang="less" scoped>
.related-content {
  padding: 10px;
  border: 1px solid #272727 !important;
  border-radius: 10px !important;
  :deep(.ant-empty) {
    min-height: 50px !important;
    margin: 0 !important;
  }
}
</style>