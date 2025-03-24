<template>
  <div>
    <!-- 确认弹窗 -->
    <vco-confirm-alert
      ref="changeAlertRef"
      :confirm-txt="confirmTxt"
      v-model:visible="changeVisible"
      @submit="submitRquest"
    ></vco-confirm-alert>

    <div class="sys-form-content mt-5">
      <a-form ref="formRef" layout="vertical" :model="formState" :rules="formRules">
        <a-row :gutter="24">
          <a-col :span="16">
            <a-form-item :label="t('名称')" name="security_name">
              <a-input v-model:value="formState.security_name"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item :label="t('类型')" name="type">
              <a-select v-model:value="formState.type" :options="typeData"></a-select>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <div class="batch-table-title">
              <p>{{ t('物品信息') }}</p>
              <a-button type="primary" size="small" shape="round" @click="itemAdd">{{ t('添加') }}</a-button>
            </div>
            <div class="batch-table-content">
              <div class="col-content th">
                <div class="item one">{{ t('物品') }}</div>
                <div class="item two">
                  {{ t('类型1') }}
                  <a-popover v-model:open="thBatchVisible.typology" trigger="click">
                    <template #content>
                      <div>
                        <div class="th-batch-select">
                          <a-select
                            v-model:value="thBatch.typology.beds"
                          >
                            <a-select-option v-for="num in 21" :key="`thBatch_${num - 1}`" :value="num - 1">{{num - 1}}</a-select-option>
                          </a-select>
                          <p>beds</p>
                        </div>
                        <div class="th-batch-select">
                          <a-select
                            v-model:value="thBatch.typology.lounge"
                          >
                            <a-select-option v-for="num in 21" :key="`thBatch_${num - 1}`" :value="num - 1">{{num - 1}}</a-select-option>
                          </a-select>
                          <p>lounge</p>
                        </div>
                        <div class="th-batch-select">
                          <a-select
                            v-model:value="thBatch.typology.bath"
                          >
                            <a-select-option v-for="num in 21" :key="`thBatch_${num - 1}`" :value="num - 1">{{num - 1}}</a-select-option>
                          </a-select>
                          <p>bath</p>
                        </div>
                        <div class="th-batch-select">
                          <a-select
                            v-model:value="thBatch.typology.garage"
                          >
                            <a-select-option v-for="num in 21" :key="`thBatch_${num - 1}`" :value="num - 1">{{num - 1}}</a-select-option>
                          </a-select>
                          <p>garage</p>
                        </div>
                        <div class="th-batch-select">
                          <a-select
                            v-model:value="thBatch.typology.leve"
                          >
                            <a-select-option v-for="num in 21" :key="`thBatch_${num - 1}`" :value="num - 1">{{num - 1}}</a-select-option>
                          </a-select>
                          <p>leve</p>
                        </div>
                        <a-button type="dark" class="w-full mt-5" @click="allApplyHandle('typology')">{{ t('全部应用') }}</a-button>
                      </div>
                    </template>
                    <i class="iconfont batch-icon">&#xe66c;</i>
                  </a-popover>
                </div>
                <div class="item three">
                  SQM
                  <a-popover v-model:open="thBatchVisible.sqm" trigger="click">
                    <template #content>
                      <div class="sys-form-content">
                        <a-input v-model:value="thBatch.sqm" suffix="m²" />
                        <a-button type="dark" class="w-full mt-5" @click="allApplyHandle('sqm')">{{ t('全部应用') }}</a-button>
                      </div>
                    </template>
                    <i class="iconfont batch-icon">&#xe66c;</i>
                  </a-popover>
                </div>
                <div class="item four">
                  {{ t('销售价格') }}
                  <a-popover v-model:open="thBatchVisible.sales_price" trigger="click">
                    <template #content>
                      <div class="sys-form-content">
                        <a-input-number
                          v-model:value="thBatch.sales_price"
                          :max="99999999999"
                          :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                          :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                        />
                        <a-button type="dark" class="w-full mt-5" @click="allApplyHandle('sales_price')">{{ t('全部应用') }}</a-button>
                      </div>
                    </template>
                    <i class="iconfont batch-icon">&#xe66c;</i>
                  </a-popover>
                </div>
                <div class="item five">
                  {{ t('含消费税') }}
                  <a-popover v-model:open="thBatchVisible.is_gst" trigger="click">
                    <template #content>
                      <div class="flex items-center justify-center gap-2 w-full">
                        <span>{{ t('含消费税') }}</span>
                        <a-switch v-model:checked="thBatch.is_gst" size="small" />
                      </div>
                      <a-button type="dark" class="w-full mt-5" @click="allApplyHandle('is_gst')">{{ t('全部应用') }}</a-button>
                    </template>
                    <i class="iconfont batch-icon">&#xe66c;</i>
                  </a-popover>
                </div>
                <div class="item six">{{ t('担保价值') }}</div>
                <div class="item seven">{{ t('每单位债务') }}</div>
                <div class="item eight">{{ t('操作1') }}</div>
              </div>
              <div v-if="batchData.length" class="col-table-content">
                <div v-for="(item, index) in batchData" :key="index" class="col-content td">
                  <div class="item one">
                    <a-input v-model:value="item.card_no" class="text-center" />
                  </div>
                  <div class="item two">
                    <div class="stuff-item">
                      <a-select
                        v-model:value="item.typology.beds"
                      >
                        <a-select-option v-for="num in 21" :key="`${index}_${num - 1}`" :value="num - 1">{{num - 1}}</a-select-option>
                      </a-select>
                      <p>beds</p>
                    </div>
                    <div class="stuff-item">
                      <a-select
                        v-model:value="item.typology.lounge"
                      >
                        <a-select-option v-for="num in 21" :key="`${index}_${num - 1}`" :value="num - 1">{{num - 1}}</a-select-option>
                      </a-select>
                      <p>lounge</p>
                    </div>
                    <div class="stuff-item">
                      <a-select
                        v-model:value="item.typology.bath"
                      >
                        <a-select-option v-for="num in 21" :key="`${index}_${num - 1}`" :value="num - 1">{{num - 1}}</a-select-option>
                      </a-select>
                      <p>bath</p>
                    </div>
                    <div class="stuff-item">
                      <a-select
                        v-model:value="item.typology.garage"
                      >
                        <a-select-option v-for="num in 21" :key="`${index}_${num - 1}`" :value="num - 1">{{num - 1}}</a-select-option>
                      </a-select>
                      <p>garage</p>
                    </div>
                    <div class="stuff-item">
                      <a-select
                        v-model:value="item.typology.leve"
                      >
                        <a-select-option v-for="num in 21" :key="`${index}_${num - 1}`" :value="num - 1">{{num - 1}}</a-select-option>
                      </a-select>
                      <p>leve</p>
                    </div>
                  </div>
                  <div class="item three">
                    <a-input v-model:value="item.sqm" suffix="m²" />
                  </div>
                  <div class="item four">
                    <a-input-number
                      v-model:value="item.sales_price"
                      :max="99999999999"
                      :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                      :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                      @change="salesPriceInput(item)"
                    />
                  </div>
                  <div class="item five flex justify-center">
                    <a-switch v-model:checked="item.is_gst" size="small" class="mt-5" @change="salesPriceInput(item)" />
                  </div>
                  <div class="item six">
                    <a-input-number
                      v-model:value="item.repayment_price"
                      :max="99999999999"
                      :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                      :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                    />
                  </div>
                  <div class="item seven">
                    <vco-number
                      :value="item.dup"
                      :precision="2"
                      :end="true"
                      size="fs_md"
                      class="text-center mt-3"
                      style="font-weight: 500;"
                    ></vco-number>
                  </div>
                  <div class="item eight">
                    <a-popconfirm
                      :title="t('确定删除吗？')"
                      :ok-text="t('确定')"
                      :cancel-text="t('取消')"
                      @confirm="itemDelete(index)"
                    >
                      <a-button type="link" style="font-size: 12px;">{{ t('删除') }}</a-button>
                    </a-popconfirm>
                  </div>
                </div>
              </div>
              <div v-else class="col-table-content no">{{ t('暂无数据') }}</div>
            </div>
          </a-col>

          <a-col :span="24">
            <vco-address :config="addressConfig" ref="vcoAddressRef" @change="setAddressInfo"></vco-address>
          </a-col>
        </a-row>
      </a-form>

      <div class="flex gap-4 mb-5 mt-5 justify-end">
        <a-button
          type="grey" class="big shadow bold uppercase"
          @click="updateVisible(false)"
        >{{ t('取消') }}</a-button>
        <a-button type="dark" class="big shadow bold uppercase" :loading="subLoading" @click="submitHandle">{{ t('保存') }}</a-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, reactive, nextTick, onMounted } from 'vue';
import dayjs from 'dayjs';
import { useI18n } from 'vue-i18n';
import _, { cloneDeep } from 'lodash';
import { projectAuditSaveMode, projectDischargeAddEditSecurity } from '@/api/process';
import tool, { selectDateFormat } from '@/utils/tool';
import emitter from '@/event';
import { message } from 'ant-design-vue/es';
import { systemDictData } from "@/api/system"

const emits = defineEmits(['close', 'refresh']);

const props = defineProps({
  blockInfo: {
    type: Object,
    default: () => {}
  },
  typeData: {
    type: Object,
    default: () => []
  },
  projectInfo: {
    type: Object,
    default: () => {}
  },
  currentId: {
    type: [Number, String],
    required: true
  },
  infoData: {
    type: Object,
    default: () => {}
  },
  securityStatus: {
    type: [Number, String],
    default: 407
  },
  isOpen: {
    type: Boolean,
    default: false
  },
  gstRate: {
    type: [Number, String],
    default: 1.15
  },
  unitsNum: {
    type: [Number, String],
    default: 0
  }
});

const { t } = useI18n();

/* 更新visible */
const updateVisible = (value) => {
  emits('close', value);
};

const changeAlertRef = ref()
const changeVisible = ref(false)
const confirmTxt = ref('')

const formRef = ref();
const formState = ref({
  security_name: '',
  type: 1,
  card_no: '',
  insurance_value: '',
  insurance_company: '',
  mortgage_registration_date: '',
  insurance_expire_date: '',
  address_short: '',
  address: '',
  security_region: '',
  postcode: '',
  remark: '',
  region_one_id: '',
  region_two_id: '',
  region_three_id: '',
  region_one_name: '',
  suburb: '',
  con_id: '',
  build_amount: '',
  land_amount: '',
  amount: '',
  copy__num: "",
  is_sales: false,
  sales_price: "",
  is_gst: false,
  repayment_price: "",
  contract_date: "",
  settlement_date: "",
  sunset_date: "",
  repayment_date: "",
  net_proceeds_price: "",
  variance: ""
});

const vcoAddressRef = ref();
const addressConfig = ref({
  addr: 'address_short',
  address: 'address',
  suburb: 'suburb',
  postal: 'postcode',
  con_id: 'con_id',
  region: 'region',
  province_code_name: 'region_one_name',
  province_code: 'region_one_id',
  city_code: 'region_two_id',
  district_code: 'region_three_id'
});
const setAddressInfo = (e) => {
  for (const key in e) {
    formState.value[key] = e[key];
  }
};

const formRules = {
  security_name: [{ required: true, message: t('请输入') + t('名称'), trigger: 'blur' }],
  type: [{ required: true, message: t('请选择') + t('类型'), trigger: 'change' }],
  amount: [{ required: true, message: t('请输入') + t('总金额'), trigger: 'change' }],
  card_no: [{ required: true, message: t('请输入') + t('产权编号'), trigger: 'change' }],
  security_region: [{ required: true, message: t('请选择') + t('区域'), trigger: 'change' }],
  postcode: [{ required: true, message: t('请输入') + t('邮编'), trigger: 'blur' }],
  region_one_name: [{ required: true, message: t('请输入') + t('城市/州'), trigger: 'blur' }],
  address_short: [{ required: true, message: t('请输入') + t('地址1'), trigger: 'blur' }],
  sales_price: [{ required: true, message: t('请输入') + t('销售价格'), trigger: 'blur' }],
  repayment_price: [{ required: true, message: t('请输入') + t('预计收到的偿还 VC'), trigger: 'blur' }],
  contract_date: [{ required: true, message: t('请选择') + t('合同日期（或无条件日期）'), trigger: 'change' }],
  settlement_date: [{ required: true, message: t('请选择') + t('预计结算日期'), trigger: 'change' }],
  sunset_date: [{ required: true, message: t('请选择') + t('日落日期'), trigger: 'change' }],
  repayment_date: [{ required: true, message: t('请选择') + t('请求：还款日期'), trigger: 'blur' }],
  net_proceeds_price: [{ required: true, message: t('请输入') + t('请求：净收益'), trigger: 'blur' }]
};

const currentParams = ref(null)
const subLoading = ref(false);

const submitRquest = () => {
  return false
  if (currentParams.value) {

    subLoading.value = true;
    const params = {
      code: props.blockInfo?.code || '',
      uuid: props.currentId,
      security__data: currentParams.value
    }

    const ajaxFn = props.isOpen ? projectDischargeAddEditSecurity : projectAuditSaveMode
    ajaxFn(params)
      .then(() => {
        currentParams.value = null
        subLoading.value = false;
        changeVisible.value = false
        updateVisible(false);
        changeAlertRef.value.changeLoading(false)

        if (props.isOpen) {
          emits('refresh')
        } else {
          emitter.emit('refreshSecurityInfo');
          emitter.emit('refreshSecurityList');
          emitter.emit('refreshAuditHisList');
          emitter.emit('refreshIRR');
          emitter.emit('refreshIRR1');
        }
      })
      .catch(() => {
        changeAlertRef.value.changeLoading(false)
        subLoading.value = false;
      });
  }
}

const submitHandle = () => {
  formRef.value
    .validate()
    .then(() => {
      const params = cloneDeep(formState.value);
      params.security_status = props.securityStatus;

      params.insurance_expire_date = params.insurance_expire_date ? dayjs(params.insurance_expire_date).format('YYYY-MM-DD') : '';
      params.mortgage_registration_date = params.mortgage_registration_date ? dayjs(params.mortgage_registration_date).format('YYYY-MM-DD') : '';

      delete params.security_region;

      const amount = Number(formState.value.amount);

      if (amount <= 0) {
        message.error(t('总金额不正确'));
        return false;
      }

      if (props.infoData && props.infoData.uuid) {
        params.security_uuid = props.infoData.uuid;
      }

      if (!showCopy.value) {
        delete params.copy__num
      }

      if (params.is_sales) {
        params.is_sales = params.is_sales ? 1 : 0
        params.is_gst = params.is_gst ? 1 : 0
      }

      currentParams.value = params

      const {project_address_short, project_address, project_suburb, region_one_id, region_two_id, region_three_id, project_postcode, project_city} = props.projectInfo
      const {address_short, address, suburb, postcode} = formState.value
      const region_one_id1 = formState.value.region_one_id
      const region_two_id1 = formState.value.region_two_id
      const region_three_id1 = formState.value.region_three_id

      if (project_address_short !== address_short ||
        project_address !== address || 
        project_suburb !== suburb || 
        project_postcode !== postcode || 
        Number(region_one_id) !== Number(region_one_id1) || 
        Number(region_two_id) !== Number(region_two_id1) || 
        Number(region_three_id) !== Number(region_three_id1)
      ) {
        confirmTxt.value = t('当前项目地址为：{0}，抵押物地址与项目地址不一致，确定提交吗？', [project_city])
        changeVisible.value = true
      } else {
        submitRquest()
      }
    })
    .catch((error) => {
      console.log('error', error);
    });
};

const batchitem = {
  card_no: '',
  typology: {
    beds: 1,
    lounge: 1,
    bath: 1,
    garage: 1,
    leve: 1
  },
  sqm: '90',
  sales_price: '0',
  is_gst: false,
  repayment_price: '0',
  dup: '0'
}
const thBatch = ref({
  typology: {
    beds: 1,
    lounge: 1,
    bath: 1,
    garage: 1,
    leve: 1
  },
  sqm: '90',
  sales_price: '0',
  is_gst: false
})
const thBatchVisible = ref({
  typology: false,
  sqm: false,
  sales_price: false,
  is_gst: false
})

const batchData = ref([])

const tableDataInit = () => {
  const data = []
  for (let i = 0; i < Number(props.unitsNum); i++) {
    const item = cloneDeep(batchitem)
    item.card_no = `Lot ${i + 1}`
    data.push(item)
  }
  batchData.value = data
}

const salesPriceInput = (data) => {
  const price = data.sales_price || 0
  if (Boolean(data.is_gst)) {
    const num = tool.div(price, props.gstRate)
    const resNum = Math.floor(num * 100) / 100
    data.repayment_price = resNum
  }
}

const allApplyHandle = (key) => {
  const data = cloneDeep(thBatch.value[key])
  for (let i = 0; i < batchData.value.length; i++) {
    if (key === 'typology') {
      for (const _key in data) {
        batchData.value[i][key][_key] = data[_key]
      }
    } else {
      batchData.value[i][key] = data
    }
    
  }
  thBatchVisible.value[key] = false

  if (['sales_price', 'is_gst'].includes(key)) {
    for (let i = 0; i < batchData.value.length; i++) {
      salesPriceInput(batchData.value[i])
    }
  }
}

const itemDelete = (index) => {
  batchData.value.splice(index, 1)
}

const itemAdd = () => {
  const item = cloneDeep(batchitem)
  batchData.value.push(item)
}

onMounted(() => {
  if (props.infoData) {
    // for (const key in formState.value) {
    //   formState.value[key] = props.infoData[key];
    //   if (['insurance_expire_date', 'mortgage_registration_date'].includes(key)) {
    //     formState.value[key] = props.infoData[key] ? dayjs(props.infoData[key]) : '';
    //   }

    //   if (['is_sales', 'is_gst'].includes(key)) {
    //     formState.value[key] = props.infoData[key] ? true : false;
    //   }
    // }
  } else {
    if (Number(props.unitsNum)) {
      tableDataInit()
    }
    if (props.projectInfo) {
      const {project_address_short, project_address, project_suburb, region_one_id, region_two_id, region_three_id, project_postcode} = props.projectInfo
      formState.value.address_short = project_address_short || ''
      formState.value.address = project_address || ''
      formState.value.suburb = project_suburb || ''
      formState.value.region_one_id = region_one_id || 0
      formState.value.region_two_id = region_two_id || 0
      formState.value.region_three_id = region_three_id || 0
      formState.value.postcode = project_postcode || ''
    }
  }

  nextTick(() => {
    vcoAddressRef.value.init(formState.value);
  });
})
</script>

<style lang="less" scoped>
.batch-table-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  > p {
    font-size: 12px;
    color: #888;
  }
}
.batch-table-content {
  border: 1px solid #272727;
  border-radius: 10px;
  margin-bottom: 24px;
  margin-top: 8px;
  overflow: hidden;
  .col-table-content {
    .ant-picker,
    :deep(.ant-select-selector),
    .ant-input,
    .ant-input-affix-wrapper,
    .ant-input-number,
    .ant-input-password {
      height: auto !important;
      border: none !important;
      border-radius: 0 !important;
      background-color: transparent !important;
      box-shadow: none !important;
      padding: 0 !important;
      font-size: 12px;
    }
    :deep(.ant-input) {
      height: 38px !important;
      font-size: 14px;
      font-weight: 500;
      border-radius: 0 !important;
      background-color: transparent !important;
      text-align: center;
      border-bottom: 1px solid #999 !important;
    }
    :deep(.ant-select) {
      .ant-select-arrow {
        display: none !important;
      }
    }
    :deep(.ant-select-selector) {
      width: 50px !important;
      font-size: 14px;
      font-weight: 500;
      text-align: right;
      .ant-select-selection-search-input {
        display: none !important;
      }
      .ant-select-selection-item {
        height: auto !important;
        line-height: 30px !important;
        padding-inline-end: 5px !important;
        font-weight: 500;
      }
    }
    :deep(.ant-input-number) {
      .ant-input-number-handler-wrap {
        display: none !important;
      }
      .ant-input-number-input {
        padding: 0 !important;
        font-size: 14px;
        font-weight: 500;
        height: 38px !important;
        border-bottom: 1px solid #999 !important;
        border-radius: 0 !important;
      }
    }
    .stuff-item {
      width: 82px;
      float: left;
      display: flex;
      align-items: center;
    }
    &.no {
      border-top: 1px solid #ddd;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  .col-content {
    width: 100%;
    display: flex;
    &.th {
      background-color: #f7f9f8;
      > .item {
        border-top: none;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 500;
        gap: 5px;
        padding: 0 8px !important;
      }
    }
    > .item {
      border-top: 1px solid #ddd;
      border-right: 1px solid #ddd;
      padding: 8px;
      overflow: hidden;
      .batch-icon {
        font-size: 11px !important;
        cursor: pointer;
        color: #F19915;
        &:hover {
          color: #ef9f28;
        }
      }
      &:last-child {
        border-right: none;
      }
      &.one {
        width: 100px;
      }
      &.two {
        width: 200px;
      }
      &.three {
        width: 90px;
      }
      &.four {
        flex: 1;
      }
      &.five {
        width: 110px;
      }
      &.six {
        flex: 1;
      }
      &.seven {
        width: 120px;
      }
      &.eight {
        width: 60px;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
  }
}
.th-batch-select {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 10px;
  :deep(.ant-select-selector) {
    width: 60px !important;
  }
}
</style>
