<template>
  <div class="block-container">
    <div class="left-content">
      <div class="block-item">
        <div class="sys-form-content mt-5">
          <a-form ref="formRef" layout="vertical" :model="formState" :rules="formRules">
            <a-row :gutter="24">
              <a-col :span="24">
                <div class="form-item-col">
                  <div class="title">
                    <p>{{ t('资源许可') }}</p>
                    <vco-upload-modal v-model:list="resourceConsentList">
                      <div class="upload-btn"><i class="iconfont">&#xe734;</i>{{ t('上传文件') }}</div>
                    </vco-upload-modal>
                  </div>
                  <div class="file-content">
                    <template v-if="resourceConsentList.length">
                      <div v-for="(item, index) in resourceConsentList" :key="index" class="file-item">
                        <vco-file-item :file="item" :showClose="true" @remove="removeItem(1, index)"></vco-file-item>
                      </div>
                    </template>
                    <p v-else>{{ t('暂无数据，请上传') }}</p>
                  </div>
                </div>
              </a-col>
              <a-col :span="24">
                <div class="form-item-col">
                  <div class="title">
                    <p>{{ t('工程计划批准') }}</p>
                    <vco-upload-modal v-model:list="engineeringConsentList">
                      <div class="upload-btn"><i class="iconfont">&#xe734;</i>{{ t('上传文件') }}</div>
                    </vco-upload-modal>
                  </div>
                  <div class="file-content">
                    <template v-if="engineeringConsentList.length">
                      <div v-for="(item, index) in engineeringConsentList" :key="index" class="file-item">
                        <vco-file-item :file="item" :showClose="true" @remove="removeItem(2, index)"></vco-file-item>
                      </div>
                    </template>
                    <p v-else>{{ t('暂无数据，请上传') }}</p>
                  </div>
                </div>
              </a-col>
              <a-col :span="24">
                <div class="form-item-col">
                  <div class="title">
                    <p>{{ t('建筑许可') }}</p>
                    <vco-upload-modal v-model:list="buildingList">
                      <div class="upload-btn"><i class="iconfont">&#xe734;</i>{{ t('上传文件') }}</div>
                    </vco-upload-modal>
                  </div>
                  <div class="file-content">
                    <template v-if="buildingList.length">
                      <div v-for="(item, index) in buildingList" :key="index" class="file-item">
                        <vco-file-item :file="item" :showClose="true" @remove="removeItem(3, index)"></vco-file-item>
                      </div>
                    </template>
                    <p v-else>{{ t('暂无数据，请上传') }}</p>
                  </div>
                </div>
              </a-col>
              <a-col :span="24">
                <div class="form-item-col">
                  <div class="title">
                    <p>{{ t('可行性研究') }}</p>
                    <vco-upload-modal v-model:list="feasibilityList">
                      <div class="upload-btn"><i class="iconfont">&#xe734;</i>{{ t('上传文件') }}</div>
                    </vco-upload-modal>
                  </div>
                  <div class="file-content">
                    <template v-if="feasibilityList.length">
                      <div v-for="(item, index) in feasibilityList" :key="index" class="file-item">
                        <vco-file-item :file="item" :showClose="true" @remove="removeItem(4, index)"></vco-file-item>
                      </div>
                    </template>
                    <p v-else>{{ t('暂无数据，请上传') }}</p>
                  </div>
                </div>
              </a-col>
              <a-col :span="24">
                <div class="form-item-col">
                  <div class="title">
                    <p>{{ t('其他') }}</p>
                    <vco-upload-modal v-model:list="othersList">
                      <div class="upload-btn"><i class="iconfont">&#xe734;</i>{{ t('上传文件') }}</div>
                    </vco-upload-modal>
                  </div>
                  <div class="file-content">
                    <template v-if="othersList.length">
                      <div v-for="(item, index) in othersList" :key="index" class="file-item">
                        <vco-file-item :file="item" :showClose="true" @remove="removeItem(5, index)"></vco-file-item>
                      </div>
                    </template>
                    <p v-else>{{ t('暂无数据，请上传') }}</p>
                  </div>
                </div>
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
          <div class="flex gap-5">
            <a-button
              type="primary" shape="round" class="big shadow bold uppercase"
              @click="previousHandle"
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
  import { projectApplySaveProjectCert, projectSaveSaveDraft } from "@/api/process";
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

  const resourceConsentList = ref([])
  const engineeringConsentList = ref([])
  const buildingList = ref([])
  const feasibilityList = ref([])
  const othersList = ref([])

  const removeItem = (type, index) => {
    let list = null
    if (type === 1) {
      list = resourceConsentList.value
    } else if (type === 2) {
      list = engineeringConsentList.value
    } else if (type === 3) {
      list = buildingList.value
    } else if (type === 4) {
      list = feasibilityList.value
    } else if (type === 5) {
      list = othersList.value
    }

    list.splice(index, 1)
  }

  const formState = reactive({
    resource_consent_files: '',
    engineering_plan_approval_files: '',
    building_consent_files: '',
    feasibility_files: '',
    others_files: '',
    cert_images: '',
  })

  const formRules = {
    cert_images: [
      { required: true, message: t('请上传') + t('项目照片'), trigger: 'change' }
    ],
  }

  const getParams = () => {
    const params = cloneDeep(formState)
    params.uuid = props.infoData.uuid
    params.draft_step = 'three'

    // 资源许可
    if (resourceConsentList.value.length) {
      params.resource_consent_files = resourceConsentList.value.map(item => item.uuid).join(',')
    }
    // 工程计划批准
    if (engineeringConsentList.value.length) {
      params.engineering_plan_approval_files = engineeringConsentList.value.map(item => item.uuid).join(',')
    }
    // 建筑许可
    if (buildingList.value.length) {
      params.building_consent_files = buildingList.value.map(item => item.uuid).join(',')
    }
    // 可行性研究
    if (feasibilityList.value.length) {
      params.feasibility_files = feasibilityList.value.map(item => item.uuid).join(',')
    }
    // 其他
    if (othersList.value.length) {
      params.others_files = othersList.value.map(item => item.uuid).join(',')
    }

    return params
  }

  const subLoading = ref(false)
  const submitHandle = () => {
    formRef.value
    .validate()
    .then(() => {
      const params = getParams()
      subLoading.value = true

      projectApplySaveProjectCert(params).then(res => {
        subLoading.value = false
        navigationTo(`/process/four?uuid_info=${res.uuid}`)
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
    const data = {
      resourceConsentList: resourceConsentList.value || [],
      engineeringConsentList: engineeringConsentList.value || [],
      buildingList: buildingList.value || [],
      feasibilityList: feasibilityList.value || [],
      othersList: othersList.value || []
    }

    const paramsObj = tool.filterEmptyValues(data)

    if (tool.isAllValuesEmpty(paramsObj)) {
      message.error(t('暂无数据，无需保存'))
    } else {
      const params = {
        uuid: props.infoData.uuid,
        draft_step: 'three',
        draft: JSON.stringify(tool.filterEmptyValues(paramsObj))
      }

      draftLoading.value = true
      projectSaveSaveDraft(params).then(res => {
        message.success(t('保存成功'))
        draftLoading.value = false
        hasDrafData.value = true
      }).catch(() => {
        draftLoading.value = false
      })
    }
  }

  const previousHandle = () => {
    navigationTo(`/process/two?uuid_info=${props.infoData.uuid}`)
  }

  const dataInit = () => {
    const data = cloneDeep(props.infoData)
    const draftData = cloneDeep(props.draftData)

    if (draftData && Object.keys(draftData).length) {
      resourceConsentList.value = draftData.resourceConsentList || []
      engineeringConsentList.value = draftData.engineeringConsentList || []
      buildingList.value = draftData.buildingList || []
      feasibilityList.value = draftData.feasibilityList || []
      othersList.value = draftData.othersList || []

      hasDrafData.value = true
    } else {
      resourceConsentList.value = data.resource_consent_files.map(item => {
        return {
          ...item,
          name: item.real_name
        }
      })

      engineeringConsentList.value = data.engineering_plan_approval_files.map(item => {
        return {
          ...item,
          name: item.real_name
        }
      })

      buildingList.value = data.building_consent_files.map(item => {
        return {
          ...item,
          name: item.real_name
        }
      })

      feasibilityList.value = data.feasibility_files.map(item => {
        return {
          ...item,
          name: item.real_name
        }
      })

      othersList.value = data.others_files.map(item => {
        return {
          ...item,
          name: item.real_name
        }
      })
    }
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