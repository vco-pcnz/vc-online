<template>
  <a-modal
    :open="visible"
    :title="t('抵押物信息')"
    :width="700"
    :footer="null"
    :keyboard="false"
    :maskClosable="false"
    @update:open="updateVisible"
  >
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
              <a-select v-model:value="formState.type">
                <a-select-option v-for="item in typeData" :key="item.id" :value="item.id">{{ item.title }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="16">
            <a-form-item :label="t('产权编号')" name="card_no">
              <a-input v-model:value="formState.card_no"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item :label="t('抵押登记日期')" name="mortgage_registration_date">
              <a-date-picker
                v-model:value="formState.mortgage_registration_date"
                placeholder=""
              />
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
                :formatter="value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                :parser="value => value.replace(/\$\s?|(,*)/g, '')"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('保险到期日')" name="insurance_expire_date">
              <a-date-picker
                v-model:value="formState.insurance_expire_date"
                placeholder=""
              />
            </a-form-item>
          </a-col>
          <!-- <a-col :span="12">
            <a-form-item :label="t('地址1')" name="address_short">
              <a-input v-model:value="formState.address_short" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('地址2')" name="address">
              <a-input v-model:value="formState.address" />
            </a-form-item>
          </a-col>
          <a-col :span="16">
            <a-form-item :label="t('区域')" name="security_region">
              <vco-address-select
                v-model:value="formState.security_region"
                :formRef="formRef"
                validateField="security_region"
              ></vco-address-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item :label="t('邮编')" name="postcode">
              <a-input v-model:value="formState.postcode" />
            </a-form-item>
          </a-col> -->
          
          <a-col :span="24">
            <vco-address :config="addressConfig" ref="vcoAddressRef" @change="setAddressInfo"></vco-address>
          </a-col>
          <a-col :span="24">
            <a-form-item :label="t('备注')" name="remark">
              <a-input v-model:value="formState.remark" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>

      <div class="flex gap-4 mb-5 mt-5 justify-between">
        <p></p>
        <a-button
          type="dark" class="big shadow bold uppercase"
          :loading="subLoading"
          @click="submitHandle"
        >{{ t('保存') }}</a-button>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
  import { watch, computed, ref, nextTick  } from "vue";
  import dayjs from "dayjs";
  import { useI18n } from "vue-i18n";
  import { cloneDeep } from "lodash";
  import { projectAuditAddSecurity, projectAuditEditSecurity } from "@/api/process"
  import tool from "@/utils/tool"
  import emitter from "@/event"

  const emits = defineEmits(['update:visible']);

  const props = defineProps({
    visible: {
      type: Boolean,
      default: false
    },
    currentId: {
      type: [Number, String],
      required: true
    },
    infoData: {
      type: Object,
      default: () => {}
    },
    typeData: {
      type: Array,
      default: () => []
    },
    securityStatus: {
      type: [Number, String],
      default: 407
    }
  })

  const { t } = useI18n();

  /* 更新visible */
  const updateVisible = (value) => {
    emits('update:visible', value);
  };

  const totalValue = computed(() => {
    const land = formState.value.insurance_value || 0
    const improvement = formState.value.improvement_value || 0
    return tool.formatMoney(tool.plus(land, improvement))
  })

  const formRef = ref()
  const formState = ref({
    security_name: '',
    type: 1,
    card_no: '',
    insurance_value: '',
    insurance_company: "",
    mortgage_registration_date: "",
    insurance_expire_date: "",
    address_short: '',
    address: '',
    security_region: '',
    postcode: '',
    remark: '',
    region_one_id:'',
    region_two_id:'',
    region_three_id:'',
    region_one_name:'',
    suburb:'',
    con_id:''
  })
  
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
    security_name: [
      { required: true, message: t('请输入') + t('名称'), trigger: 'blur' }
    ],
    type: [
      { required: true, message: t('请选择') + t('类型'), trigger: 'change' }
    ],
    card_no: [
      { required: true, message: t('请输入') + t('产权编号'), trigger: 'blur' }
    ],
    insurance_company: [
      { required: true, message: t('请输入') + t('担保公司'), trigger: 'blur' }
    ],
    insurance_value: [
      { required: true, message: t('请输入') + t('保险价值'), trigger: 'blur' }
    ],
    insurance_expire_date: [
      { required: true, message: t('请选择') + t('保险到期日'), trigger: 'change' }
    ],
    security_region: [
      { required: true, message: t('请选择') + t('区域'), trigger: 'change' }
    ],
    postcode: [
      { required: true, message: t('请输入') + t('邮编'), trigger: 'blur' }
    ],
    region_one_name: [{ required: true, message: t('请输入') + t('城市/州'), trigger: 'blur' }],
    address_short: [
      { required: true, message: t('请输入') + t('地址1'), trigger: 'blur' }
    ],
  }

  const subLoading = ref(false)
  const submitHandle = () => {
    formRef.value
    .validate()
    .then(() => {
      const params = cloneDeep(formState.value)
      params.uuid = props.currentId
      params.security_status = props.securityStatus

      params.insurance_expire_date = params.insurance_expire_date ? dayjs(params.insurance_expire_date).format('YYYY-MM-DD') : ''
      params.mortgage_registration_date = params.mortgage_registration_date ? dayjs(params.mortgage_registration_date).format('YYYY-MM-DD') : ''

      delete params.security_region

      let ajaxFn = projectAuditAddSecurity
      if (props.infoData && props.infoData.uuid) {
        params.security_uuid = props.infoData.uuid
        ajaxFn = projectAuditEditSecurity
      }

      subLoading.value = true
      ajaxFn(params).then(() => {
        subLoading.value = false
        updateVisible(false)

        emitter.emit('refreshSecurityInfo')
        emitter.emit('refreshSecurityList')
      }).catch(() => {
        subLoading.value = false
      })
    })
    .catch(error => {
      console.log('error', error);
    });
  }

  watch(
    () => props.visible,
    (val) => {
      if (!val) {
        formRef.value.clearValidate()
        formRef.value.resetFields()
      } else {
        if (props.infoData && props.infoData.uuid) {
          for (const key in formState.value) {
            formState.value[key] = props.infoData[key]
            if (['insurance_expire_date', 'mortgage_registration_date'].includes(key)) {
              formState.value[key] = props.infoData[key] ? dayjs(props.infoData[key]) : ''
            }
          }
        }
      }
      
      nextTick(()=>{
        vcoAddressRef.value.init(formState.value);
      })
    }
  );
</script>
