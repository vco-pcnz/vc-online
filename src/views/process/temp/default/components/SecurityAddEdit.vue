<template>
  <a-modal :open="visible" :title="t('抵押物信息')" :width="700" :footer="null" :keyboard="false" :maskClosable="false" @update:open="updateVisible">
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
          <template v-if="formState.type == 1">
            <a-col :span="7">
              <a-form-item :label="t('土地价值')" name="land_amount">
                <a-input-number
                  v-model:value="formState.land_amount"
                  :max="99999999999"
                  :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                  :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                />
              </a-form-item>
            </a-col>
            <a-col :span="1" class="plus-txt"><i class="iconfont">&#xe889;</i></a-col>
            <a-col :span="7">
              <a-form-item :label="t('建筑价值')" name="build_amount">
                <a-input-number
                  v-model:value="formState.build_amount"
                  :max="99999999999"
                  :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                  :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                />
              </a-form-item>
            </a-col>
            <a-col :span="1" class="plus-txt"><i class="iconfont">=</i></a-col>
            <a-col :span="8" class="total-amount-info">
              <a-form-item :label="t('总价值')">
                <vco-number :value="totalAmountRef" :precision="2" :end="true"></vco-number>
              </a-form-item>
            </a-col>
          </template>
          <template v-else>
            <a-col :span="24">
              <a-form-item :label="t('抵押物价值')" name="amount">
                <a-input-number
                  v-model:value="formState.amount"
                  :max="99999999999"
                  :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                  :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                />
              </a-form-item>
            </a-col>
          </template>

          <a-col :span="16">
            <a-form-item :label="t('产权编号')" name="card_no">
              <a-input v-model:value="formState.card_no"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item :label="t('抵押登记日期')" name="mortgage_registration_date">
              <a-date-picker v-model:value="formState.mortgage_registration_date" :format="selectDateFormat()" :disabledDate="disabledDateFormatAfter" placeholder="" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item :label="t('担保公司')" name="insurance_company">
              <a-input v-model:value="formState.insurance_company" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('保险价值')" name="insurance_value">
              <a-input-number
                v-model:value="formState.insurance_value"
                :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('保险到期日')" name="insurance_expire_date">
              <a-date-picker v-model:value="formState.insurance_expire_date" placeholder="" :format="selectDateFormat()" :disabledDate="disabledDateFormatBefore" />
            </a-form-item>
          </a-col>

          <a-col :span="24">
            <vco-address :config="addressConfig" ref="vcoAddressRef" @change="setAddressInfo"></vco-address>
          </a-col>
          <a-col :span="24">
            <a-form-item :label="t('备注')" name="remark">
              <a-input v-model:value="formState.remark" />
            </a-form-item>
          </a-col>
          <a-col v-if="!props.infoData || (props.infoData && !props.infoData.uuid)" :span="24">
            <a-form-item label="" name="copy__num">
              <a-form-item-rest>
                <div class="flex justify-end items-center gap-4">
                  <p>{{ t('是否复制以上信息') }}</p>
                  <a-switch v-model:checked="showCopy" />

                  <template v-if="showCopy">
                    <p class="ml-5">{{ t('复制条数') }}</p>
                    <a-input-number v-model:value="formState.copy__num" :min="1" style="width: 100px;" />
                  </template>
                </div>
              </a-form-item-rest>
            </a-form-item>
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
  </a-modal>
</template>

<script setup>
import { watch, computed, ref, nextTick } from 'vue';
import dayjs from 'dayjs';
import { useI18n } from 'vue-i18n';
import { cloneDeep } from 'lodash';
import { projectAuditSaveMode, projectDetailAddSecurity } from '@/api/process';
import tool, { selectDateFormat } from '@/utils/tool';
import emitter from '@/event';
import { message } from 'ant-design-vue/es';
import { systemDictData } from "@/api/system"

const emits = defineEmits(['update:visible', 'refresh']);

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  blockInfo: {
    type: Object,
    default: () => {}
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
  }
});

const { t } = useI18n();

/* 更新visible */
const updateVisible = (value) => {
  emits('update:visible', value);
};

const typeData = ref([])

const getTypeData = () => {
  systemDictData('security_type').then(res => {
    const data = res.map(item => {
      return {
        label: item.name,
        value: Number(item.code)
      }
    })
    typeData.value = data
  })
}

const totalValue = computed(() => {
  const land = formState.value.insurance_value || 0;
  const improvement = formState.value.improvement_value || 0;
  return tool.formatMoney(tool.plus(land, improvement));
});

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
  copy__num: ""
});
const showCopy = ref(false)

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
  // build_amount: [{ required: true, message: t('请输入') + t('建筑总额'), trigger: 'change' }],
  amount: [{ required: true, message: t('请输入') + t('总金额'), trigger: 'change' }],
  card_no: [{ required: true, message: t('请输入') + t('产权编号'), trigger: 'change' }],
  security_region: [{ required: true, message: t('请选择') + t('区域'), trigger: 'change' }],
  postcode: [{ required: true, message: t('请输入') + t('邮编'), trigger: 'blur' }],
  region_one_name: [{ required: true, message: t('请输入') + t('城市/州'), trigger: 'blur' }],
  address_short: [{ required: true, message: t('请输入') + t('地址1'), trigger: 'blur' }]
};

const totalAmountRef = computed(() => {
  const build_amount = formState.value.build_amount || 0;
  const land_amount = formState.value.land_amount || 0;
  formState.value.amount = tool.plus(build_amount, land_amount);
  return tool.plus(build_amount, land_amount);
});

const disabledDateFormatBefore = (current) => {
  const endDate = new Date();
  if (current && current.isBefore(endDate, 'day')) {
    return true;
  }

  return false;
};

const disabledDateFormatAfter = (current) => {
  const endDate = new Date();
  if (current && current.isAfter(endDate, 'day')) {
    return true;
  }

  return false;
};

const currentParams = ref(null)
const subLoading = ref(false);

const submitRquest = () => {
  if (currentParams.value) {

    subLoading.value = true;
    const params = {
      code: props.blockInfo?.code || '',
      uuid: props.currentId,
      security__data: currentParams.value
    }

    const ajaxFn = props.isOpen ? projectDetailAddSecurity : projectAuditSaveMode
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

const changeAlertRef = ref()
const changeVisible = ref(false)
const confirmTxt = ref('')

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

watch(
  () => props.visible,
  (val) => {
    if (!val) {
      formRef.value.clearValidate();
      formRef.value.resetFields();
      Object.keys(formState.value).forEach((key) => {
        formState.value[key] = ''; // 清空每个字段
        if (key === 'type') {
          formState.value[key] = 1
        }
      });
      showCopy.value = false
    } else {
      getTypeData()

      if (props.infoData) {
        for (const key in formState.value) {
          formState.value[key] = props.infoData[key];
          if (['insurance_expire_date', 'mortgage_registration_date'].includes(key)) {
            formState.value[key] = props.infoData[key] ? dayjs(props.infoData[key]) : '';
          }

          showCopy.value = Boolean(Number(formState.value.copy__num))
        }
      } else {
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
    }

    nextTick(() => {
      vcoAddressRef.value.init(formState.value);
    });
  }
);
</script>
<style lang="less" scoped>
.total-amount-info {
  :deep(.ant-statistic-content) {
    font-size: 24px !important;
    line-height: 48px !important;
  }
}
.plus-txt {
  position: relative;
  .iconfont {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #282828;
    font-weight: bold;
    font-size: 18px;
  }
}
</style>
