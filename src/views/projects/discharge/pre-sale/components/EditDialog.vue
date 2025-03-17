<template>
  <a-modal
    :open="visible"
    :title="t('编辑预售信息')"
    :width="900"
    :footer="null"
    :keyboard="false"
    :maskClosable="false"
    @cancel="updateVisible(false)"
  >

    <div class="sys-form-content mt-10">
      <a-form ref="formRef" layout="vertical" :model="formState" :rules="formRules">
        <a-row :gutter="24">
          <a-col :span="24">
            <a-alert
              type="info"
              class="mb-5"
            >
              <template #message>
                <a-row :gutter="24">
                  <a-col :span="8">
                    <a-form-item :label="t('名称')" class="info-txt">
                      <p>{{ infoData.security_name }}</p>
                    </a-form-item>
                  </a-col>
                  <a-col :span="8">
                    <a-form-item :label="t('产权编号')" class="info-txt">
                      <p>{{ infoData.card_no }}</p>
                    </a-form-item>
                  </a-col>
                  <a-col :span="8">
                    <a-form-item :label="t('类型')" class="info-txt">
                      <p>{{ infoData.type_name }}</p>
                    </a-form-item>
                  </a-col>
                </a-row>
              </template>
            </a-alert>
          </a-col>

          <a-col :span="8">
            <a-form-item :label="t('抵押物价值')">
              <a-input-number
                v-model:value="formState.amount"
                :max="99999999999"
                :disabled="true"
                :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item name="sales_price">
              <template #label>
                {{ t('销售价格') }}
                <a-form-item-rest>
                  <div class="gst-check-content">
                    (<a-checkbox v-model:checked="formState.is_gst" class="gst-check" @change="salesPriceInput">{{ t('含消费税') }}</a-checkbox>)
                  </div>
                </a-form-item-rest>
              </template>

              <a-input-number
                v-model:value="formState.sales_price"
                :max="99999999999"
                :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                @input="salesPriceInput"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item :label="t('预计收到的偿还 VC')" name="repayment_price">
              <a-input-number
                v-model:value="formState.repayment_price"
                :max="99999999999"
                :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item :label="t('合同日期（或无条件日期）')" name="contract_date">
              <a-date-picker v-model:value="formState.contract_date" :format="selectDateFormat()" valueFormat="YYYY-MM-DD" placeholder="" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item :label="t('预计结算日期')" name="settlement_date">
              <a-date-picker v-model:value="formState.settlement_date" :format="selectDateFormat()" valueFormat="YYYY-MM-DD" placeholder="" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item :label="t('日落日期')" name="sunset_date">
              <a-date-picker v-model:value="formState.sunset_date" :format="selectDateFormat()" valueFormat="YYYY-MM-DD" placeholder="" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item :label="t('请求：还款日期')" name="repayment_date">
              <a-date-picker v-model:value="formState.repayment_date" :format="selectDateFormat()" valueFormat="YYYY-MM-DD" placeholder="" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item :label="t('请求：净收益')" name="net_proceeds_price">
              <a-input-number
                v-model:value="formState.net_proceeds_price"
                :max="99999999999"
                :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                @input="netproceedsPriceInput"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item :label="t('变化比例')" name="variance">
              <a-input
                v-model:value="formState.variance"
                :disabled="true"
                suffix="%"
              />
            </a-form-item>
          </a-col>
          <a-col v-if="!subDisabled" :span="24">
            <a-form-item :label="t('说明')" name="reason">
              <a-input v-model:value="formState.reason" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <div class="mt-10 mb-5">
      <div class="flex justify-end gap-5">
        <a-button
          type="grey" class="big shadow bold uppercase mb-5 mt-5"
          @click="updateVisible(false)"
        >{{ t('取消') }}</a-button>
        <a-button
          type="dark" class="big shadow bold uppercase mb-5 mt-5"
          :disabled="subDisabled"
          :loading="subLoading"
          @click="submitHandle"
        >{{ t('确认') }}</a-button>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
  import { ref, watch, computed } from "vue";
  import { useI18n } from 'vue-i18n';
  import tool, { selectDateFormat } from '@/utils/tool';
  import { systemDictData } from "@/api/system"
  import { projectDischargeSalesSave } from '@/api/project/project';
  import { cloneDeep } from "lodash"

  const emits = defineEmits(['update:visible', 'refresh'])

  const props = defineProps({
    visible: {
      type: Boolean,
      default: false
    },
    uuid: {
      type: [Number, String],
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

  const formRef = ref()
  const formState = ref({
    amount: '',
    sales_price: "",
    is_gst: false,
    repayment_price: "",
    contract_date: "",
    settlement_date: "",
    sunset_date: "",
    repayment_date: "",
    net_proceeds_price: "",
    variance: "",
    reason: ""
  })

  const formRules = {
    sales_price: [{ required: true, message: t('请输入') + t('销售价格'), trigger: 'blur' }],
    repayment_price: [{ required: true, message: t('请输入') + t('预计收到的偿还 VC'), trigger: 'blur' }],
    contract_date: [{ required: true, message: t('请选择') + t('合同日期（或无条件日期）'), trigger: 'change' }],
    settlement_date: [{ required: true, message: t('请选择') + t('预计结算日期'), trigger: 'change' }],
    sunset_date: [{ required: true, message: t('请选择') + t('日落日期'), trigger: 'change' }],
    repayment_date: [{ required: true, message: t('请选择') + t('请求：还款日期'), trigger: 'blur' }],
    net_proceeds_price: [{ required: true, message: t('请输入') + t('请求：净收益'), trigger: 'blur' }]
  };

  const gstRate = ref(1.15)
  const getGstRate = () => {
    systemDictData('gst_rate').then(res => {
      const obj = res.find(item => item.name === 'gst_rate_value')
      gstRate.value = obj ? Number(obj.code) : 1.15
    })
  }

  const salesPriceInput = () => {
    if (formState.value.sales_price && Boolean(formState.value.is_gst)) {
      const num = tool.div(formState.value.sales_price, gstRate.value)
      const resNum = Math.floor(num * 100) / 100
      formState.value.repayment_price = resNum
    }
  }

  const netproceedsPriceInput = () => {
    if (formState.value.net_proceeds_price) {
      const num = tool.minus(formState.value.net_proceeds_price, formState.value.amount)
      const num1 = tool.div(num, formState.value.amount)
      const resNum = tool.times(num1, 100)
      const variance =  Math.ceil(resNum * 100) / 100
      formState.value.variance = variance
    } else {
      formState.value.variance = ''
    }
  }

  const subDisabled = computed(() => {
    const data = cloneDeep(formState.value);
    data.is_gst = data.is_gst ? 1 : 0
    delete data.reason

    for (const key in data) {
      const isNum = ['sales_price', 'repayment_price', 'net_proceeds_price', 'variance'].includes(key)
      const value1 = isNum ? Number(data[key]) : data[key]
      const value2 = isNum ? Number(props.infoData[key]) : props.infoData[key]
      if (value1 !== value2) {
        return false
      }
    }
    return true
  })

  const subLoading = ref(false)
  const submitHandle = () => {
    formRef.value
    .validate()
    .then(() => {
      const params = cloneDeep(formState.value);
      params.is_gst = params.is_gst ? 1 : 0
      params.p_uuid = props.uuid
      params.uuid = props.infoData.uuid

      subLoading.value = true
      projectDischargeSalesSave(params).then(() => {
        subLoading.value = false
        updateVisible(false)
        emits('refresh')
      }).catch(() => {
        subLoading.value = false
      })
    })
    .catch((error) => {
      console.log('error', error);
    });
  }

  watch(
    () => props.visible,
    (val) => {
      if (!val) {
        formRef.value.clearValidate();
        formRef.value.resetFields();
        Object.keys(formState.value).forEach((key) => {
          formState.value[key] = ''; // 清空每个字段
          if (['is_sales', 'is_gst'].includes(key)) {
            formState.value[key] = false;
          }
        });
      } else {
        getGstRate()

        if (props.infoData) {
          for (const key in formState.value) {
            formState.value[key] = props.infoData[key];
            if (['is_sales', 'is_gst'].includes(key)) {
              formState.value[key] = props.infoData[key] ? true : false;
            }
          }
        }
      }
    }
  );
</script>

<style lang="less" scoped>
.gst-check-content {
  padding-left: 10px;
  color: rgba(0, 0, 0, 0.88);;
}
.gst-check {
  font-size: 12px !important;
  padding-left: 5px;
  :deep(input[type="checkbox"]) {
    width: 14px !important;
    height: 14px !important;
  }
  :deep(.ant-checkbox-inner) {
    width: 14px !important;
    height: 14px !important;
  }
  :deep(.ant-checkbox) {
    +span {
      padding-inline-start: 4px !important;
      padding-inline-end: 4px !important;
    }
  }
}
</style>