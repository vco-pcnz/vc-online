<template>
  <div>
    <!-- 人员选择 -->
    <vco-choose-user
      ref="vcoChooseUserRef"
      url="stake/selStake"
      @change="choiceUserDone"
    >
      <div></div>
    </vco-choose-user>

    <a-spin :spinning="pageLoading" size="large">
      <div class="block-container">
        <div class="left-content">
        <div class="block-item" :class="{'check': check}">
          <div v-if="!check" class="flex justify-end gap-5">
            <a-button
              type="primary-line"
              shape="round"
              size="small"
              @click="importStaHandle"
            >{{ t('从利益相关者导入') }}</a-button>
            <a-button
              v-if="!currentId"
              v-permission="'process:one:tempData'"
              type="primary-line" shape="round" size="small"
              class="flex items-center justify-center"
              :loading="tempLoading"
              @click="tempDataHandle">
              {{ t('生成临时借款人ID') }}
              <a-tooltip>
                <template #title>
                  <span>{{ t('仅限借款人公司尚未正式成立') }}</span>
                </template>
                <QuestionCircleOutlined />
              </a-tooltip>
            </a-button>
          </div>

          <div class="sys-form-content mt-5">
            <a-form ref="formRef" layout="vertical" :model="formState" :rules="formRules">
              <a-row :gutter="24">
                <a-col :span="24">
                  <a-form-item :label="t('借款人类型')" name="borrower_type">
                    <a-radio-group v-model:value="formState.borrower_type" name="borrower_type">
                      <a-radio :value="1">{{ t('个人') }}</a-radio>
                      <a-radio :value="2">{{ t('机构') }}</a-radio>
                    </a-radio-group>
                  </a-form-item>
                </a-col>
                <a-col :span="24">
                  <a-form-item :label="t('证件照片')" name="borrower_images">
                    <vco-upload-image v-model:value="formState.borrower_images" :isMultiple="true" :limit="9"></vco-upload-image>
                  </a-form-item>
                </a-col>
                <template v-if="formState.borrower_type === 1">
                  <a-col :span="8">
                    <a-form-item :label="t('名')" name="first_name">
                      <a-input v-model:value="formState.first_name" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="8">
                    <a-form-item :label="t('中间名')" name="middle_name">
                      <a-input v-model:value="formState.middle_name" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="8">
                    <a-form-item :label="t('姓')" name="last_name">
                      <a-input v-model:value="formState.last_name" />
                    </a-form-item>
                  </a-col>
                </template>
                <template v-else>
                  <a-col :span="24">
                    <a-form-item :label="t('机构名称')" name="organization_name">
                      <a-input v-model:value="formState.organization_name" />
                    </a-form-item>
                  </a-col>
                </template>
                <a-col :span="24">
                  <a-form-item v-if="formState.borrower_type === 1" :label="t('身份证号码')" name="borrower_id_num">
                    <a-input v-model:value="formState.borrower_id_num" />
                  </a-form-item>

                  <a-form-item v-else :label="t('公司编码')" name="company_number">
                    <a-input v-model:value="formState.company_number" />
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item :label="t('邮箱')" name="borrower_email">
                    <a-input v-model:value="formState.borrower_email" />
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item :label="t('手机号')" name="borrower_phone">
                    <vco-mobile-input
                      v-model:value="formState.borrower_phone"
                      v-model:areaCode="formState.borrower_phone_prefix"
                      :formRef="formRef"
                      validateField="borrower_phone"
                    >
                    </vco-mobile-input>
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item :label="t('邮编')" name="borrower_postcode">
                    <a-input v-model:value="formState.borrower_postcode" />
                  </a-form-item>
                </a-col>
                <a-col :span="24">
                  <a-form-item :label="t('详细地址')" name="borrower_address">
                    <a-input v-model:value="formState.borrower_address" />
                  </a-form-item>
                </a-col>
                <a-col :span="24">
                  <a-form-item :label="t('借款人地址')" name="borrower_region">
                    <vco-address-select
                      v-model:value="formState.borrower_region"
                      :formRef="formRef"
                      validateField="borrower_region"
                    ></vco-address-select>
                  </a-form-item>
                </a-col>
                <a-col :span="24">
                  <a-form-item :label="t('借款人背景信息')" name="borrower_about">
                    <a-textarea v-model:value="formState.borrower_about" :auto-size="{ minRows: 4, maxRows: 5 }" />
                  </a-form-item>
                </a-col>
              </a-row>
            </a-form>
          </div>
          <temp-footer
            ref="footerRef"
            :check="check"
            :draft-loading="draftLoading"
            :sub-loading="subLoading"
            :has-draft="hasDraftData"
            :previous-page="previousPage"
            :next-page="nextPage"
            :can-next="canNext"
            :current-id="currentId"
            :current-step="currentStep"
            @draft="draftHandle"
            @submit="submitHandle"
          ></temp-footer>
        </div>
        </div>
        <div v-if="!check" class="right-content">
          <bind-users></bind-users>
        </div>
      </div>
    </a-spin>
  </div>
  
</template>

<script setup>
  import { reactive, ref, watch, onMounted, computed, createVNode } from "vue";
  import { useI18n } from "vue-i18n";
  import { Modal } from 'ant-design-vue';
  import { cloneDeep } from "lodash";
  import { QuestionCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import { projectApplySaveBorrowerInfo, projectAuditSaveBorrowerInfo, projectSaveSaveDraft } from "@/api/process"
  import tool from "@/utils/tool";
  import { message } from "ant-design-vue/es";
  import { projectApplyBorrowerInfo, projectDraftInfo, getApproveTemp } from "@/api/process"
  import TempFooter from "./components/TempFooter.vue";
  import BindUsers from "./../../components/BindUsers.vue";

  const emits = defineEmits(['checkDone'])

  const props = defineProps({
    infoData: {
      type: Object,
      default: () => {}
    },
    draftData: {
      type: Object,
      default: () => {}
    },
    currentStep: {
      type: Object
    },
    currentId: {
      type: [Number, String],
      default: ''
    },
    check: {
      type: Boolean,
      default: false
    },
    previousPage: {
      type: String,
      default: ''
    },
    nextPage: {
      type: String,
      default: ''
    },
    canNext: {
      type: Boolean,
      default: false
    }
  })

  const { t } = useI18n();
  const formRef = ref()
  const footerRef = ref()
  const vcoChooseUserRef = ref()

  const markInfo = computed(() => (props.currentStep ? props.currentStep.mark : ''))

  const formState = reactive({
    borrower_type: 2,
    borrower_images: [],
    first_name: '',
    middle_name: '',
    last_name: '',
    organization_name: '',
    borrower_id_num: '',
    company_number: '',
    borrower_email: '',
    borrower_phone_prefix: '',
    borrower_phone: '',
    borrower_postcode: '',
    borrower_region: '',
    borrower_address: '',
    borrower_about: ''
  })

  const formRules = {
    borrower_images: [
      // { required: true, message: t('请上传') + t('证件照片'), trigger: 'change' }
    ],
    first_name: [
      { required: true, message: t('请输入') + t('名'), trigger: 'blur' }
    ],
    last_name: [
      { required: true, message: t('请输入') + t('姓'), trigger: 'blur' }
    ],
    organization_name: [
      { required: true, message: t('请输入') + t('机构名称'), trigger: 'blur' }
    ],
    borrower_id_num: [
      { required: true, message: t('请输入') + t('身份证号码'), trigger: 'blur' },
      {
        pattern: /^[A-Z0-9]+$/,
        message: t('身份证号码') + t("格式不正确"),
        trigger: 'blur'
      }
    ],
    company_number: [
      { required: true, message: t('请输入') + t('公司编码'), trigger: 'blur' },
      {
        pattern: /^[A-Z0-9]+$/,
        message: t('公司编码') + t("格式不正确"),
        trigger: 'blur'
      }
    ],
    borrower_email: [
      { required: true, message: t('请输入') + t('邮箱'), trigger: 'blur' },
      {
        pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        message: t("邮箱格式不正确"),
        trigger: 'blur'
      }
    ],
    borrower_phone: [
      { required: true, message: t('请输入') + t('手机号'), trigger: 'change' },
      {
        pattern: /^\+?[1-9]\d{1,14}$|^\(?\d+\)?[-.\s]?\d+([-.\s]?\d+)*$/,
        message: t('手机号') + t("格式不正确"),
        trigger: 'blur'
      }
    ],
    borrower_postcode: [
      { required: true, message: t('请输入') + t('邮编'), trigger: 'blur' },
      {
        pattern: /^[A-Za-z0-9\s\-]+$/,
        message: t('邮编') + t("格式不正确"),
        trigger: 'blur'
      }
    ],
    borrower_region: [
      { required: true, message: t('请选择') + t('借款人地址'), trigger: 'change' }
    ],
    borrower_address: [
      { required: true, message: t('请输入') + t('详细地址'), trigger: 'blur' }
    ],
    borrower_about: [
      { required: true, message: t('请输入') + t('借款人背景信息'), trigger: 'blur' }
    ]
  }

  const tempLoading = ref(false)
  const getTempData = async () => {
    tempLoading.value = true
    getApproveTemp({
      type: Number(formState.borrower_type) - 1
    }).then(res => {
      for (const key in res) {
        if (key === 'code') {
          if (Number(formState.borrower_type) === 1) {
            formState.borrower_id_num = res.code
          } else {
            formState.company_number = res.code
          }
        } else {
          formState[key] = res[key]
        }
      }
      formState.borrower_phone_prefix = '64'
      tempLoading.value = false
    }).catch(() => {
      tempLoading.value = false
    })
  }

  const tempDataHandle = () => {
    const dataObj = cloneDeep(formState)
    delete dataObj.borrower_type
    delete dataObj.borrower_phone_prefix
    delete dataObj.borrower_region_one_id
    delete dataObj.borrower_region_two_id
    delete dataObj.borrower_region_three_id
    if (tool.isAllValuesEmpty(dataObj)) {
      getTempData()
    } else {
      Modal.confirm({
        title: '提示',
        icon: createVNode(ExclamationCircleOutlined),
        content: '已存在数据，确定生成吗?',
        onOk() {
          getTempData()
        }
      });
    }
  }

  const importStaHandle = () => {
    vcoChooseUserRef.value.init()
  }

  const choiceUserDone = (data) => {
    // 个人
    if (data.type === 20) {
      formState.borrower_type = 1
      formState.first_name = data.firstName
      formState.middle_name = data.middleName
      formState.last_name = data.lastName
      formState.borrower_id_num = data.idcard
    } else {
      formState.borrower_type = 2
      formState.organization_name = data.name
      formState.company_number = data.idcard
    }
    formState.borrower_images = data.avatar ? [data.avatar] : []
    formState.borrower_email = data.email
    formState.borrower_phone_prefix = data.pre
    formState.borrower_phone = data.mobile
    formState.borrower_postcode = data.postal
    formState.borrower_region = data.postal
    formState.borrower_address = data.address
    formState.borrower_about = data.note

    const areaArr = [data.province_code, data.city_code, data.district_code]
    const areaStr = areaArr.filter(item => item).join(',')
    formState.borrower_region = areaStr
  }

  const getParams = () => {
    const params = cloneDeep(formState)

    if (params.borrower_images && params.borrower_images.length) {
      params.borrower_images = params.borrower_images.join(',')
    }

    const regionArr = params.borrower_region.split(',')
    params.borrower_region_one_id = regionArr[0] ? Number(regionArr[0]) : 0
    params.borrower_region_two_id = regionArr[1] ? Number(regionArr[1]) : 0
    params.borrower_region_three_id = regionArr[2] ? Number(regionArr[2]) : 0

    if (params.borrower_type === 2) {
      params.borrower_id_num = params.company_number
    }

    delete params.company_number
    delete params.borrower_region

    return params
  }

  const subLoading = ref(false)

  const submitHandle = () => {
    formRef.value
    .validate()
    .then(() => {
      const params = getParams()
      let ajaxFn = projectApplySaveBorrowerInfo

      if (props.check) {
        params.borrower_info_status = props.infoData.check_status
        ajaxFn = projectAuditSaveBorrowerInfo
      } else {
        params.draft_step = markInfo.value
      }

      if ((props.infoData && props.infoData.uuid) || props.currentId) {
        params.uuid = props.infoData?.uuid || props.currentId
      }

      subLoading.value = true
      ajaxFn(params).then(res => {
        subLoading.value = false
        if (props.check) {
          emits('checkDone')
        } else {
          footerRef.value.nextHandle(res.uuid)
        }
      }).catch(() => {
        subLoading.value = false
      })
    })
    .catch(error => {
      console.log('error', error);
    });
  }

  const draftLoading = ref(false)
  const hasDraftData = ref(false)
  const draftHandle = () => {
    const data = getParams()
    const dataObj = cloneDeep(data)
    delete dataObj.borrower_type
    delete dataObj.borrower_phone_prefix
    delete dataObj.borrower_region_one_id
    delete dataObj.borrower_region_two_id
    delete dataObj.borrower_region_three_id

    if (tool.isAllValuesEmpty(dataObj)) {
      message.error(t('暂无数据，无需保存'))
    } else {
      const params = {
        draft_step: markInfo.value,
        draft: JSON.stringify(tool.filterEmptyValues(data))
      }

      if ((props.infoData && props.infoData.uuid) || props.currentId) {
        params.uuid = props.infoData?.uuid || props.currentId
      }

      draftLoading.value = true
      projectSaveSaveDraft(params).then(res => {
        message.success(t('保存成功'))
        hasDraftData.value = true
        draftLoading.value = false
      }).catch(() => {
        draftLoading.value = false
      })
    }
  }

  const dataInit = (infoMsg = {}, draftMsg = {}) => {
    const data = cloneDeep({...infoMsg, ...props.infoData})
    const draftData = cloneDeep({...draftMsg, ...props.draftData})

    let useData = data
    if (draftData && Object.keys(draftData).length) {
      useData = draftData
      hasDraftData.value = true
    }

    for (const key in formState) {
      if (key === 'company_number') {
        formState[key] = useData.borrower_type === 2 ? useData.borrower_id_num : ''
      } else {
        formState[key] = useData[key] || formState[key]
      }
    }
    const areaArr = [useData.borrower_region_one_id, useData.borrower_region_two_id, useData.borrower_region_three_id]
    const areaStr = areaArr.filter(item => item).join(',')
    formState.borrower_region = areaStr
  }

  const pageLoading = ref(false)
  const getDataInit = async () => {
    pageLoading.value = true

    let draftData = {}
    let infoData = {}
    
    // 草稿数据
    const params = {
      draft_step: markInfo.value
    }
    if (props.currentId) {
      params.uuid = props.currentId
    }
    await projectDraftInfo(params).then(res => {
      if (res.draft) {
        const data = JSON.parse(res.draft)
        if (data.borrower_images && data.borrower_images.length) {
          data.borrower_images = data.borrower_images.split(',')
        }
        draftData = data
      }
    })

    if (props.currentId) {
      await projectApplyBorrowerInfo({
        uuid: props.currentId
      }).then(res => {
        infoData = res
      })
    }

    pageLoading.value = false

    dataInit(infoData, draftData)
  }

  watch(
    () => props.infoData,
    (val) => {
      if (val) {
        dataInit()
      }
    }, {
      immediate: true
    }
  )

  onMounted(() => {
    if (!props.check) {
      getDataInit()
    }
  })
</script>

<style lang="less" scoped>
  @import './styles/common.less';
</style>