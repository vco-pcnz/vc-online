<template>
  <div class="block-container">
    <div class="left-content">
      <div class="block-item">
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
                    mode="multiple"
                  ></a-select>
                </a-form-item>
              </a-col>
              <a-col :span="24">
                <a-form-item :label="t('项目照片')" name="project_images">
                  <vco-upload-image v-model:value="formState.project_images" :isMultiple="true" :limit="9"></vco-upload-image>
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
              <a-col :span="24">
                <a-form-item :label="t('详细地址')" name="borrower_address">
                  <a-input v-model:value="formState.borrower_address" />
                </a-form-item>
              </a-col>
              <a-col :span="24">
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
          <a-button type="grey" shape="round" class="weight">{{ t('保存草稿') }}</a-button>
          <div class="flex gap-5">
            <a-button
              type="primary" shape="round" class="big shadow bold uppercase"
              @click="submitHandle"
              :loading="subLoading"
            >{{ t('上一步') }}</a-button>
            <a-button
              type="dark" shape="round" class="big shadow bold uppercase"
              @click="submitHandle"
              :loading="subLoading"
            >{{ t('下一步') }}</a-button>
          </div>
          
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
  import { projectApplySaveBorrowerInfo } from "@/api/process"

  const props = defineProps({
    infoData: {
      type: Object,
      default: () => {}
    }
  })

  const projectTypeData = ref([
    {
      label: "Construction",
      value: 1
    },
    {
      label: "Buying land",
      value: 2
    },
    {
      label: "Refinancing",
      value: 3
    },
    {
      label: "Bridging",
      value: 4
    },
    {
      label: "Land subdivision",
      value: 5
    },
    {
      label: "Land banking",
      value: 6
    }
  ])

  const { t } = useI18n();
  const formRef = ref()

  const formState = reactive({
    project_name: '',
    project_type: undefined,
    project_images: [],
    project_region: '',
    borrower_address: '',
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
    borrower_address: [
      { required: true, message: t('请输入') + t('详细地址'), trigger: 'blur' }
    ],
    building_num: [
      { required: true, message: t('请输入') + t('楼栋数'), trigger: 'blur' }
    ],
    project_about: [
      { required: true, message: t('请输入') + t('项目介绍'), trigger: 'blur' }
    ]
  }

  const subLoading = ref(false)

  const submitHandle = () => {
    formRef.value
    .validate()
    .then(() => {
      const params = cloneDeep(formState)
      if (params.project_images && params.project_images.length) {
        params.project_images = params.project_images.join(',')
      }

      const regionArr = params.project_region.split(',')
      params.project_region_one_id = Number(regionArr[0])
      params.project_region_two_id = regionArr[1] ? Number(regionArr[1]) : 0
      params.project_region_three_id = regionArr[2] ? Number(regionArr[2]) : 0

      if (params.borrower_type === 2) {
        params.borrower_id_num = params.company_number
      }

      delete params.company_number
      delete params.project_region

      if (props.infoData && props.infoData.project_apply_sn) {
        params.project_apply_sn = props.infoData.project_apply_sn
      }

      subLoading.value = true
      projectApplySaveBorrowerInfo(params).then(() => {
        subLoading.value = false
      }).catch(() => {
        subLoading.value = false
      })
    })
    .catch(error => {
      console.log('error', error);
    });
  }

  const dataInit = () => {
    const data = cloneDeep(props.infoData)

    for (const key in formState) {
      if (key === 'project_images') {
        if (data.project_images && data.project_images.length) {
          formState[key] = data.project_images.map(item => item.url)
        }
      } else if (key === 'company_number') {
        formState[key] = data.borrower_type === 2 ? data.borrower_id_num : ''
      } else {
        formState[key] = data[key]
      }
    }
    console.log('formState', formState)
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