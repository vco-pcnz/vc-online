<template>
  <div>
    <!-- 对账弹窗 -->
    <a-modal v-model:open="showReconcileModal" :title="t('对账')" :width="500" :footer="null">
      <div class="sys-form-content mt-10">
        <a-form ref="reconcileFormRef" :model="reconcileFormState" layout="vertical" :rules="reconcileFormRules">
          <a-form-item :label="t('对账方式')" name="from">
            <a-select v-model:value="reconcileFormState.from" :disabled="true">
              <a-select-option value="other">{{ t('其他') }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item :label="t('单号')" name="bank_sn">
            <a-input v-model:value="reconcileFormState.bank_sn" />
          </a-form-item>
        </a-form>
        <div class="mt-10">
          <a-button type="dark" class="save big uppercase shadow bold w-full" @click="reconcileSubmit">
            {{ t('确定') }}
          </a-button>
        </div>
      </div>
      
    </a-modal>
    
    <a-spin :spinning="pageLoading" size="large">
      <vco-page-panel w="200px" @back="backHandle">
        <template #title>
          <div class="page-title-content">
            <div class="tag">{{ pageTitleRef }}</div>
            <div class="tag uppercase">{{ t('重置预测表') }}</div>
          </div>
        </template>
      </vco-page-panel>
      <div v-if="pageLoading" style="height: 300px;"></div>
      <a-empty v-if="showError" />
      <div v-if="showContent">
        <div class="sys-form-content mt-5">
          <a-form ref="formRef" layout="vertical" :model="formState" :rules="formRules">
            <a-row :gutter="24">
              <a-col :span="6">
                <a-form-item :label="t('项目周期')" name="time_date">
                  <a-range-picker
                    v-model:value="formState.time_date"
                    :format="selectDateFormat()"
                    :disabled="Boolean(tableData.length)"
                    :placeholder="[t('开放日期'), t('到期日期')]"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="4">
                <a-form-item :label="t('真实变更开始日期')" name="real_start_date">
                  <a-date-picker v-model:value="formState.real_start_date" :disabled="Boolean(tableData.length)" />
                </a-form-item>
              </a-col>
              <a-col :span="4">
                <a-form-item :label="t('关账日期')" name="close_date">
                  <a-date-picker v-model:value="formState.close_date" :disabled="Boolean(tableData.length)" />
                </a-form-item>
              </a-col>
              <a-col :span="10">
                <a-form-item :label="t('变更开始日期')" name="var_start_date">
                  <a-input v-model:value="formState.var_start_date" :disabled="Boolean(tableData.length)" :placeholder="t('多个以英文逗号分隔')" />
                </a-form-item>
              </a-col>
              <a-col :span="4">
                <a-form-item :label="t('借款金额')" name="loan_money">
                  <a-input-number
                    v-model:value="formState.loan_money"
                    :disabled="Boolean(tableData.length)"
                    :formatter="
                      (value) =>
                        `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    "
                    :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="4">
                <a-form-item :label="t('预计FC2')" name="fc2">
                  <a-input-number
                    v-model:value="formState.fc2"
                    :disabled="Boolean(tableData.length)"
                    :formatter="
                      (value) =>
                        `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    "
                    :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="4">
                <a-form-item label="Line Fee" name="linefee">
                  <a-input-number
                    v-model:value="formState.linefee"
                    :disabled="Boolean(tableData.length)"
                    :formatter="
                      (value) =>
                        `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    "
                    :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="4">
                <a-form-item :label="t('Line Fee 费率')" name="LineFeeRate">
                  <a-input-number
                    v-model:value="formState.LineFeeRate"
                    :disabled="Boolean(tableData.length)"
                    :formatter="
                      (value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    "
                    :parser="(value) => value.replace(/%\s?|(,*)/g, '')"
                    addon-after="%"
                    :controls="false"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="4">
                <a-form-item :label="t('建立费率')" name="estabRate">
                  <a-input-number
                    v-model:value="formState.estabRate"
                    :disabled="Boolean(tableData.length)"
                    :formatter="
                      (value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    "
                    :parser="(value) => value.replace(/%\s?|(,*)/g, '')"
                    addon-after="%"
                    :controls="false"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="4">
                <a-form-item :label="t('利率')" name="interestRate">
                  <a-input-number
                    v-model:value="formState.interestRate"
                    :disabled="Boolean(tableData.length)"
                    :formatter="
                      (value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    "
                    :parser="(value) => value.replace(/%\s?|(,*)/g, '')"
                    addon-after="%"
                    :controls="false"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item :label="t('覆盖文件')" name="file">
                  <div class="flex flex-start gap-10">
                    <a-upload
                      v-model:file-list="formState.file"
                      accept=".xlsx, .xls"
                      :disabled="Boolean(tableData.length)"
                      :customRequest="onUpload"
                    >
                      <a-button>
                        <upload-outlined></upload-outlined>
                        {{ t('上传文件') }}
                      </a-button>
                    </a-upload>
                    <div class="flex flex-start gap-4">
                      <a-button type="dark" class="uppercase" :loading="generateLoading" @click="generateSchedule">{{ t('生成预测表') }}</a-button>
                      <a-button v-if="tableData.length" class="uppercase" @click="tableData = []">{{ t('重新生成') }}</a-button>
                    </div>
                  </div>
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </div>
      </div>

      <div v-if="tableData.length" class="table-container">
        <div class="col-item th">
          <div class="item uppercase about"></div>
          <div class="item uppercase">{{ t('日期') }}</div>
          <div class="item uppercase">{{ t('类型') }}</div>
          <div class="item uppercase">{{ t('说明') }}</div>
          <div class="item uppercase">{{ t('利息、费用') }}</div>
          <div class="item uppercase">{{ t('放款') }}</div>
          <div class="item uppercase">{{ t('还款') }}</div>
          <div class="item uppercase">{{ t('平账数据') }}</div>
          <div class="item uppercase">{{ t('余额') }}</div>
          <div class="item uppercase">{{ t('对账') }}</div>
        </div>

        <div class="col-content">
          <div v-for="(item, index) in tableData" :key="index" class="col-block" :class="{ passed: item.passed }">
            <div v-for="(_item, _index) in item.list" :key="_item.date" class="col-item" :class="{'error': _item.is_error}">
              <div class="item about flex items-center justify-start gap-2">
                <a-tooltip v-if="_item.is_error">
                  <template #title>
                    <span>{{ t('可能为错误数据') }}</span>
                  </template>
                  <ExclamationCircleOutlined class="text-red-500" />
                </a-tooltip>
                <span class="circle" :style="{ background: _item.status > 1 || (_item.passed && _item.is_fee) ? '#181818' : '#b4d8d8' }"></span>
              </div>
              <div class="item">{{ tool.showDate(_item.date) }}</div>
              <div class="item type">
                <div v-if="[2, 4].includes(_item.type)">
                  <i v-if="_item.type === 2" class="iconfont">&#xe755;</i>
                  <i v-if="_item.type === 4" class="iconfont">&#xe757;</i>
                  <span>{{ _item.nameStr || _item.name }}</span>
                </div>
                <p v-else>{{ _item.nameStr || _item.name }}</p>
              </div>
              <div class="item">
                <p class="note">{{ _item.note }}</p>
              </div>
              <div class="item">{{ _item.fee }}</div>
              <div class="item drawdown">{{ _item.drawdown }}</div>
              <div class="item">{{ _item.repayment }}</div>
              <div class="item flex items-center justify-center">
                <a-tag v-if="_item.type === 5" color="green">{{ t('平账数据') }}</a-tag>
              </div>
              <div class="item">
                <vco-number :value="_item.balance" :precision="2" :end="true"></vco-number>
              </div>
              <div class="item flex items-center justify-center">
                <a-popconfirm
                  v-if="_item.showCancel && _item.is_irr === 1 && _item.bank_sn"
                  :title="t('当前数据已匹配有对账数据，是否取消匹配的对账数据？')"
                  @confirm="cancelReconcile(_item)"
                >
                  <a-button type="link" danger>{{ t('取消对账')}}</a-button>
                </a-popconfirm>
                <a-button
                  v-if="_item.showCancel && _item.is_irr === 1 && !_item.bank_sn"
                  type="link"
                  @click="undoReconcile(_item)"
                >{{ t('撤销操作')}}</a-button>
                <div v-if="_item.showReconcile" class="flex items-center justify-center gap-2">
                  <a-popconfirm
                    v-if="_item.showDelete"
                    :title="t('是否删除该数据？')"
                    @confirm="deleteItem(index, _index)"
                  >
                    <a-button
                      type="link"
                      danger
                    >{{ t('删除')}}</a-button>
                  </a-popconfirm>
                  <a-button
                    type="link"
                    @click="reconcileHandle(_item)"
                  >{{ t('对账')}}</a-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end mt-7">
          <a-button
            type="dark"
            class="shadow big uppercase"
            :loading="subLoading"
            @click="subHandle"
          >{{ t('提交') }}</a-button>
        </div>
      </div>
    </a-spin>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { UploadOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue/es';
import { projectDetail, scheduleSaveTemp, projectDownSchedule } from '@/api/project/project';
import { hasPermission } from '@/directives/permission';
import { useI18n } from 'vue-i18n';
import { cloneDeep } from 'lodash';
import tool, { navigationTo, selectDateFormat } from '@/utils/tool';
import dayjs from 'dayjs';

const { t } = useI18n();
const route = useRoute();
const uuid = ref(route.query.uuid);
const pageLoading = ref(false);


const projectDetailInfo = ref({});
const pageTitleRef = computed(() => {
  return projectDetailInfo.value?.base?.project_name || '';
});

const showError = ref(false);
const showContent = ref(false);

// 获取项目详情
const getProjectDetail = async () => {
  pageLoading.value = true;
  const res = await projectDetail({ uuid: uuid.value });

  if (res.base.is_close === 1) {
    showError.value = true;
  } else {
    if (hasPermission('projects:schedule:reset')) {
      showContent.value = true;
    } else {
      showError.value = true;
    }
  }

  formState.value.time_date = [dayjs(res.date.start_date), dayjs(res.date.end_date)];
  formState.value.loan_money = res.base.loan_money;
  formState.value.fc2 = res.credit.credit_fc2;
  formState.value.linefee = res.credit.linefee;
  formState.value.LineFeeRate = res.credit.left.lineFeeRate;
  formState.value.estabRate = res.credit.left.estabFeeRate;
  formState.value.interestRate = res.credit.left.interestRate;

  projectDetailInfo.value = res;
  pageLoading.value = false;
};

const formRef = ref();

const formState = ref({
  time_date: [],
  real_start_date: undefined,
  close_date: undefined,
  var_start_date: '',
  loan_money: undefined,
  fc2: undefined,
  estabRate: undefined,
  interestRate: undefined,
  linefee: undefined,
  LineFeeRate: undefined,
  file: []
});

const formRules = {
  time_date: [
    { required: true, message: t('请选择'), trigger: 'change' }
  ],
  loan_money: [
    { required: true, message: t('请输入'), trigger: 'blur' }
  ],
  fc2: [
    { required: true, message: t('请输入'), trigger: 'blur' }
  ],
  linefee: [
    { required: true, message: t('请输入'), trigger: 'blur' }
  ],
  LineFeeRate: [
    { required: true, message: t('请输入'), trigger: 'blur' }
  ],
  estabRate: [
    { required: true, message: t('请输入'), trigger: 'blur' }
  ],
  interestRate: [
    { required: true, message: t('请输入'), trigger: 'blur' }
  ],
  file: [
    { required: true, message: t('请选择'), trigger: 'change' }
  ]
}

const onUpload = ({file}) => {
  const obj = {
    file: file,
    name: file.name,
    uid: file.uid,
    status: 'done'
  }
  formState.value.file = [obj]
}

const tableData = ref([]);
const setTableData = (resData) => {
  const data = resData.data;
  const errorDate = resData.error_date;
  const dataArr = [];
  const currentMonth = dayjs();
  if (Object.keys(data).length) {
    for (const key in data) {
      const targetDate = dayjs(key);

      const itemData = data[key];
      itemData.forEach((item, index) => {
        const currentTargetDate = dayjs(item.date);

        item.store_is_irr = item.is_irr;
        item.store_status = item.status;
        item.store_bank_sn = item.bank_sn;

        // 是否显示取消对账按钮
        item.showCancel = false
        item.showReconcile = false
        if ([0, 2, 4, 5].includes(item.type)) {
          item.showCancel = item.store_is_irr === 1 && item.store_bank_sn;
          item.showReconcile = item.store_is_irr === 1 && !item.store_bank_sn && item.status !== 2;

          if (item.type === 5) {
            item.showReconcile = item.showReconcile && item.is_duration === 1;
          }
        }

        item.showDelete = errorDate.includes(item.date) || item.is_error;
        
        item.passed = currentTargetDate.isBefore(currentMonth, 'day') || currentTargetDate.isSame(currentMonth, 'day');

        if (item.type === 4 && Number(item.balance) === 0 && item.note === 'FINAL REPAYMENT' && index === itemData.length - 1) {
          item.passed = false
        }

        if (item.type === 2) {
          item.drawdown = tool.formatMoney(item.amount);
        } else if (item.type === 4) {
          item.repayment = tool.formatMoney(item.amount);
          if (item.first === 1) {
            item.nameStr = `${item.name}(${t('全额还款')})`;
          }
        } else {
          if (item.is_fee) {
            item.fee = tool.formatMoney(item.amount);
          } else {
            if (Number(item.amount) > 0) {
              item.drawdown = tool.formatMoney(item.amount);
            } else {
              item.repayment = tool.formatMoney(item.amount);
            }
          }
        }
      });

      const obj = {
        list: itemData,
        passed: targetDate.isBefore(currentMonth, 'month') || targetDate.isSame(currentMonth, 'month')
      };

      dataArr.push(obj);
    }
  }

  tableData.value = dataArr;
}

const generateLoading = ref(false);
const generateSchedule = () => {
  formRef.value.validate().then(() => {
    const data = cloneDeep(formState.value);
    data.start_date = data.time_date[0].format('YYYY-MM-DD');
    data.end_date = data.time_date[1].format('YYYY-MM-DD');

    if (data.real_start_date) {
      data.real_start_date = data.real_start_date.format('YYYY-MM-DD');
    }

    if (data.close_date) {
      data.close_date = data.close_date.format('YYYY-MM-DD');
    }

    delete data.time_date;

    const formData = new FormData();
    formData.append('file', data.file[0].file);
    formData.append('uuid', uuid.value);
    formData.append('start_date', data.start_date);
    formData.append('close_date', data.close_date || '');
    formData.append('end_date', data.end_date);
    formData.append('real_start_date', data.real_start_date || '');
    formData.append('var_start_date', data.var_start_date || '');
    formData.append('loan_money', data.loan_money || '');
    formData.append('fc2', data.fc2 || '');
    formData.append('estabRate', data.estabRate || '');
    formData.append('interestRate', data.interestRate || '');
    formData.append('linefee', data.linefee || '');
    formData.append('LineFeeRate', data.LineFeeRate || '');

    generateLoading.value = true;
    scheduleSaveTemp(formData).then(res => {
      setTableData(res);
      generateLoading.value = false;
    }).catch(() => {
      generateLoading.value = false;
    });
  });
}

const backHandle = () => {
  if (uuid.value) {
    navigationTo(`/projects/schedule?uuid=${uuid.value}`);
  } else {
    navigationTo('/');
  }
};

const cancelReconcile = (item) => {
  item.bank_sn = '';
  item.status = 1;
}

const undoReconcile = (item) => {
  item.bank_sn = item.store_bank_sn;
  item.status = item.store_status;
}

const deleteItem = (index, _index) => {
  tableData.value[index].list.splice(_index, 1);
}

const subLoading = ref(false);
const subHandle = () => {
  const data = cloneDeep(tableData.value);
  const schedule = data.map(item => item.list || []).flat();
  schedule.forEach(item => {
    delete item.store_is_irr;
    delete item.store_status;
    delete item.store_bank_sn;
    delete item.showCancel;
    delete item.showReconcile;
    delete item.passed;
    delete item.nameStr;
    delete item.fee;
    delete item.drawdown;
    delete item.repayment;
    delete item.showDelete;
  });

  const formData = cloneDeep(formState.value);
  formData.start_date = formData.time_date[0].format('YYYY-MM-DD');
  formData.end_date = formData.time_date[1].format('YYYY-MM-DD');

  if (formData.real_start_date) {
    formData.real_start_date = formData.real_start_date.format('YYYY-MM-DD');
  }

  if (formData.close_date) {
    formData.close_date = formData.close_date.format('YYYY-MM-DD');
  }

  delete formData.time_date;
  delete formData.file;

  for (const key in formData) {
    formData[key] = formData[key] || '';
  }

  const params = {
    ...formData,
    schedule,
    uuid: uuid.value
  }

  subLoading.value = true;
  projectDownSchedule(params).then(() => {
    message.success(t('提交成功'));
    subLoading.value = false;
    backHandle();
  }).catch(() => {
    subLoading.value = false;
  });
}

const reconcileItem = ref({});
const showReconcileModal = ref(false);
const reconcileFormRef = ref();
const reconcileFormState = ref({
  from: 'other',
  bank_sn: ''
});
const reconcileFormRules = {
  from: [
    { required: true, message: t('请选择'), trigger: 'change' }
  ],
  bank_sn: [
    { required: true, message: t('请输入'), trigger: 'blur' }
  ]
}

const reconcileHandle = (item) => {
  reconcileItem.value = item;
  showReconcileModal.value = true;

  setTimeout(() => {
    reconcileFormState.value.from = item.from || 'other';
    reconcileFormState.value.bank_sn = item.bank_sn || '';
  }, 100);
}

const reconcileSubmit = () => {
  reconcileFormRef.value
    .validate()
    .then(() => {
      reconcileItem.value.from = reconcileFormState.value.from;
      reconcileItem.value.bank_sn = reconcileFormState.value.bank_sn;
      reconcileItem.value.status = 3;
      showReconcileModal.value = false;
    })
    .catch((error) => {
      console.log('error', error);
    });
}

watch(showReconcileModal, (newVal) => {
  if (!newVal) {
    reconcileFormRef.value.clearValidate();
    reconcileFormRef.value.resetFields();
  }
});

onMounted(() => {
  if (uuid.value) {
    getProjectDetail();
  }
});
</script>

<style scoped lang="less">
@import '@/styles/variables.less';
.page-title-content {
  display: flex;
  align-items: center;
  gap: 15px;
  > .tag {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 32px;
    font-weight: 500;
    font-size: 14px;
    letter-spacing: 1px;
    text-transform: uppercase;
    white-space: nowrap;
    background-color: @clr_charcoal;
    color: @clr_white;
    border-radius: 16px;
    padding: 0 30px;
    &:first-child {
      border-radius: 0 16px 16px 0 !important;
    }
    &.uppercase {
      padding: 0 20px;
      background-color: @colorPrimary;
    }
  }
}

.table-container {
  margin-bottom: 20px;
  min-height: 300px;
  border-top: 1px solid #808080;
  padding-top: 15px;
  .col-item {
    width: 100%;
    display: flex;
    &.error {
      background-color: #fad3c2 !important;
      border-radius: 10px;
    }
    &.th {
      font-weight: bold;
      font-size: 10px;
      color: #282828;
    }
    > .item {
      padding: 0 15px;
      &:nth-child(1) {
        width: 0;
        &.about {
          width: 60px;
          flex-direction: row;
        }
      }
      &:nth-child(2) {
        width: 110px;
      }
      &:nth-child(3) {
        width: 140px;
        word-break: break-all;
      }
      &:nth-child(4) {
        width: 180px;
      }
      &:nth-child(5),
      &:nth-child(6),
      &:nth-child(7) {
        width: 140px;
        text-align: center;
      }
      &:nth-child(8) {
        width: 120px;
        text-align: center;
      }
      &:nth-child(9) {
        flex: 1;
        text-align: center;
      }
      &:nth-child(10) {
        width: 145px;
        text-align: center;
      }
      .note {
        font-size: 12px;
        color: #666;
      }
      .iconfont {
        font-size: 14px;
        margin-right: 5px;
      }
    }
  }
  .col-content {
    margin-top: 10px;
    .col-block {
      border-bottom: 1px solid #e2e5e2;
      padding: 5px 0;
      margin-top: 5px;
      &:last-child {
        border-bottom: none;
      }
      &.passed {
        background-color: #f0f0f0 !important;
        border: 1px solid #e2e5e2 !important;
        border-radius: 10px;
        .drawdown {
          color: #282828;
        }
      }
      .drawdown {
        color: @colorPrimary;
      }
      .type {
        span,
        p {
          font-weight: 500;
        }
      }
    }
    .col-item {
      padding: 6px 0;
      > .item {
        display: flex;
        flex-direction: column;
        justify-content: center;
        &:nth-child(9) {
          :deep(.ant-statistic-content) {
            font-weight: 500 !important;
            font-size: 16px !important;
            line-height: 26px;
          }
        }
      }
    }
  }
}

.circle {
  background-color: #b4d8d8;
  border: 1px solid;
  border-radius: 4px;
  display: inline-block;
  height: 8px;
  width: 8px;
}
</style>