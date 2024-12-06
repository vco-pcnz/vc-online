<template>
  <div class="block-container">
    <div class="left-content">
      <div class="block-item" :class="{'check': check}">
        <div class="sys-form-content mt-5">
          <a-form ref="formRef" layout="vertical" :model="formState" :rules="formRules">
            <a-row :gutter="24">
              <a-col :span="24">
                <a-form-item :label="t('项目名称')" name="project_name">
                  <a-input v-model:value="formState.project_name" />
                </a-form-item>
              </a-col>
              <a-col :span="24">
                <a-form-item :label="t('项目类型')" name="project_type">
                  <a-select
                    v-model:value="formState.project_type"
                    :options="projectTypeData"
                  ></a-select>
                </a-form-item>
              </a-col>
              <a-col :span="24">
                <a-form-item :label="t('项目照片')" name="project_images">
                  <vco-upload-image v-model:value="formState.project_images" :isMultiple="true" :limit="9"></vco-upload-image>
                </a-form-item>
              </a-col>
              <a-col :span="24">
                <a-form-item :label="t('详细地址')" name="project_address">
                  <a-input v-model:value="formState.project_address" />
                </a-form-item>
              </a-col>
              <a-col :span="24">
                <a-form-item :label="t('项目地址')" name="project_region">
                  <vco-address-select
                    v-model:value="formState.project_region"
                    :formRef="formRef"
                    validateField="project_region"
                  ></vco-address-select>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item :label="t('邮编')" name="project_postcode">
                  <a-input v-model:value="formState.project_postcode" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item :label="t('楼栋数')" name="building_num">
                  <a-input v-model:value="formState.building_num" />
                </a-form-item>
              </a-col>
              <a-col :span="24">
                <a-form-item :label="t('项目介绍')" name="project_about">
                  <a-textarea v-model:value="formState.project_about" :auto-size="{ minRows: 4, maxRows: 5 }" />
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </div>
        <div class="flex mt-5 items-end gap-20 justify-between">
          <div v-if="!check">
            <a-button
              type="grey"
              shape="round"
              class="weight uppercase"
              :loading="draftLoading"
              @click="draftHandle"
            >{{ t('保存草稿') }}</a-button>
            <p v-if="hasDrafData" class="mt-2 text-sm pl-1 form-tips-color">{{ t('* 存在草稿数据，请点击{0}保存', [`"${t('下一步')}"`]) }}</p>
          </div>
          <p v-else></p>
          <div class="flex gap-5">
            <a-button
              v-if="!check"
              type="primary" shape="round" class="big shadow bold uppercase"
              @click="previousHandle"
            >{{ t('上一步') }}</a-button>
            <a-button
              type="dark" shape="round" class="big shadow bold uppercase"
              @click="submitHandle"
              :loading="subLoading"
            >{{ check ? t('保存') : t('下一步') }}</a-button>
          </div>
          
        </div>
      </div>
    </div>
    <div v-if="!check" class="right-content">
      2
    </div>
  </div>
</template>

<script setup>
  import { reactive, ref, watch } from "vue";
  import { useI18n } from "vue-i18n";
  import { cloneDeep } from "lodash";
  import { projectSelectList, projectApplySaveProjectInfo, projectAuditSaveProjectInfo, projectSaveSaveDraft, projectDraftInfo } from "@/api/process";
  import tool, { navigationTo } from "@/utils/tool";
  import { message } from "ant-design-vue/es";

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
    check: {
      type: Boolean,
      default: false
    }
  })

  const { t } = useI18n();
  const formRef = ref()

  const formState = reactive({
    project_name: '',
    project_type: undefined,
    project_images: [],
    project_region: '',
    project_address: '',
    project_postcode: '',
    building_num: '',
    project_about: ''
  })

  const formRules = {
    project_name: [
      { required: true, message: t('请输入') + t('项目名称'), trigger: 'blur' }
    ],
    project_type: [
      { required: true, message: t('请选择') + t('项目类型'), trigger: 'change' }
    ],
    project_images: [
      { required: true, message: t('请上传') + t('项目照片'), trigger: 'change' }
    ],
    project_region: [
      { required: true, message: t('请选择') + t('项目地址'), trigger: 'change' }
    ],
    project_address: [
      { required: true, message: t('请输入') + t('详细地址'), trigger: 'blur' }
    ],
    project_postcode: [
      { required: true, message: t('请输入') + t('邮编'), trigger: 'blur' },
      {
        pattern: /^[A-Za-z0-9\s\-]+$/,
        message: t('邮编') + t("格式不正确"),
        trigger: 'blur'
      }
    ],
    building_num: [
      { required: true, message: t('请输入') + t('楼栋数'), trigger: 'blur' }
    ],
    project_about: [
      { required: true, message: t('请输入') + t('项目介绍'), trigger: 'blur' }
    ]
  }

  const projectTypeStatic = ref('')

  const getParams = () => {
    const params = cloneDeep(formState)
    if (params.project_images && params.project_images.length) {
      params.project_images = params.project_images.join(',')
    }

    const regionArr = params.project_region.split(',')
    params.region_one_id = regionArr[0] ? Number(regionArr[0]) : 0
    params.region_two_id = regionArr[1] ? Number(regionArr[1]) : 0
    params.region_three_id = regionArr[2] ? Number(regionArr[2]) : 0

    delete params.project_region
    params.uuid = props.infoData.uuid

    return params
  }

  const handleDarfFour = async () => {
    const data = await projectDraftInfo({
      draft_step: 'four',
      uuid: props.infoData.uuid
    })

    if (data && data.draft) {
      const dataObj = JSON.parse(data.draft)

      dataObj.loan_type = []
      const params = {
        uuid: props.infoData.uuid,
        draft_step: 'four',
        draft: JSON.stringify(tool.filterEmptyValues(dataObj))
      }
      await projectSaveSaveDraft(params)
    }
  }

  const subLoading = ref(false)
  const submitHandle = () => {
    formRef.value
    .validate()
    .then(async () => {
      const params = getParams()
      let ajaxFn = projectApplySaveProjectInfo

      if (props.check) {
        params.project_info_status = props.infoData.check_status
        ajaxFn = projectAuditSaveProjectInfo
      } else {
        params.draft_step = 'two'
      }

      if (props.infoData && props.infoData.uuid) {
        params.uuid = props.infoData.uuid
      }

      subLoading.value = true

      if (Number(projectTypeStatic.value) !== params.project_type && !props.check) {
        await handleDarfFour()
      }
      
      ajaxFn(params).then(res => {
        subLoading.value = false
        if (props.check) {
          emits('checkDone')
        } else {
          navigationTo(`/process/three?uuid_info=${res.uuid}`)
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
  const hasDrafData = ref(false)
  const draftHandle = () => {
    const data = getParams()
    const dataObj = cloneDeep(data)
    delete dataObj.uuid
    delete dataObj.region_one_id
    delete dataObj.region_two_id
    delete dataObj.region_three_id

    if (tool.isAllValuesEmpty(dataObj)) {
      message.error(t('暂无数据，无需保存'))
    } else {
      const params = {
        uuid: props.infoData.uuid,
        draft_step: 'two',
        draft: JSON.stringify(tool.filterEmptyValues(data))
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

  const previousHandle = () => {
    navigationTo(`/process/one?uuid_info=${props.infoData.uuid}`)
  }

  const projectTypeData = ref([])
  const getTypeData = () => {
    projectSelectList().then(res => {
      const data = res.project_type || []
      projectTypeData.value = data.map(item => {
        return {
          label: item.title,
          value: item.id
        }
      })
    })
  }

  const dataInit = () => {
    const data = cloneDeep(props.infoData)
    const draftData = cloneDeep(props.draftData)

    let useData = data
    if (draftData && Object.keys(draftData).length) {
      useData = draftData
      hasDrafData.value = true
    }

    for (const key in formState) {
      formState[key] = useData[key] || formState[key] || ''
      if (key === 'project_type') {
        formState[key] = useData[key] || undefined
      }
    }
    const areaArr = [useData.region_one_id, useData.region_two_id, useData.region_three_id]
    const areaStr = areaArr.filter(item => item).join(',')
    formState.project_region = areaStr || ''

    if (useData.project_type) {
      projectTypeStatic.value = useData.project_type
    }
  }

  watch(
    () => props.infoData,
    (val) => {
      if (val) {
        getTypeData()
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