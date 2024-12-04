<template>
  <div class="block-container">
    <div class="left-content">
      <div class="block-item">
        <div class="flex justify-end gap-5">
          <a-button type="primary-line" shape="round" size="small">{{ t('从利益相关者导入') }}</a-button>
          <a-button type="primary-line" shape="round" size="small" class="flex items-center justify-center">
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
                  <a-form-item :label="t('名')" name="last_name">
                    <a-input v-model:value="formState.last_name" />
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item :label="t('中间名')" name="middle_name">
                    <a-input v-model:value="formState.middle_name" />
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item :label="t('姓')" name="first_name">
                    <a-input v-model:value="formState.first_name" />
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
        <div class="flex mt-5 items-end gap-20 justify-between">
          <div>
            <a-button
              type="grey"
              shape="round"
              class="weight"
              :loading="draftLoading"
              @click="draftHandle"
            >{{ t('保存草稿') }}</a-button>
            <p v-if="hasDrafData" class="mt-2 text-sm pl-1 form-tips-color">{{ t('* 存在草稿数据，请点击{0}保存', [`"${t('下一步')}"`]) }}</p>
          </div>
          
          <a-button
            type="dark" shape="round" class="big shadow bold uppercase"
            @click="submitHandle"
            :loading="subLoading"
          >{{ t('下一步') }}</a-button>
        </div>
      </div>
    </div>
    <div class="right-content">
      2
    </div>
  </div>
</template>

<script setup>
  import { reactive, ref, watch } from "vue";
  import { useI18n } from "vue-i18n";
  import { cloneDeep } from "lodash";
  import { QuestionCircleOutlined } from '@ant-design/icons-vue';
  import { projectApplySaveBorrowerInfo, projectSaveSaveDraft } from "@/api/process"
  import tool, { navigationTo } from "@/utils/tool";
  import { message } from "ant-design-vue/es";

  const props = defineProps({
    infoData: {
      type: Object,
      default: () => {}
    },
    draftData: {
      type: Object,
      default: () => {}
    }
  })

  const { t } = useI18n();
  const formRef = ref()

  const formState = reactive({
    borrower_type: 1,
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
      { required: true, message: t('请上传') + t('证件照片'), trigger: 'change' }
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
      params.draft_step = 'one'

      if (props.infoData && props.infoData.uuid) {
        params.uuid = props.infoData.uuid
      }

      subLoading.value = true
      projectApplySaveBorrowerInfo(params).then(res => {
        subLoading.value = false
        navigationTo(`/process/two?uuid_info=${res.uuid}`)
      }).catch(() => {
        subLoading.value = false
      })
    })
    .catch(error => {
      console.log('error', error);
    });
  }

  const draftLoading = ref(false)
  const hasDrafData = ref(false)
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
        draft_step: 'one',
        draft: JSON.stringify(tool.filterEmptyValues(data))
      }

      if (props.infoData && props.infoData.uuid) {
        params.uuid = props.infoData.uuid
      }

      draftLoading.value = true
      projectSaveSaveDraft(params).then(res => {
        message.success(t('保存成功'))
        hasDrafData.value = true
        draftLoading.value = false
      }).catch(() => {
        draftLoading.value = false
      })
    }
  }

  const dataInit = () => {
    const data = cloneDeep(props.infoData)
    const draftData = cloneDeep(props.draftData)

    let useData = data
    if (draftData && Object.keys(draftData).length) {
      useData = draftData
      hasDrafData.value = props.infoData.uuid
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
</script>

<style lang="less" scoped>
  @import '././styles/common.less';
</style>