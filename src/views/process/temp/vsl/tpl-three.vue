<template>
  <div>
    <a-spin :spinning="pageLoading" size="large">
      <div class="block-container">
        <div class="left-content">
          <div class="block-item" :class="{ check: check }">
            <div class="sys-form-content mt-5">
              <a-form ref="formRef" layout="vertical" :model="formState" :rules="formRules">
                <a-row :gutter="24">
                  <a-col :span="24">
                    <div class="form-item-col">
                      <div class="title">
                        <p>{{ t('资源许可') }}</p>
                        <vco-upload-modal v-model:list="resourceConsentList">
                          <div class="upload-btn">
                            <i class="iconfont">&#xe734;</i>
                            {{ t('上传文件') }}
                          </div>
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
                          <div class="upload-btn">
                            <i class="iconfont">&#xe734;</i>
                            {{ t('上传文件') }}
                          </div>
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
                          <div class="upload-btn">
                            <i class="iconfont">&#xe734;</i>
                            {{ t('上传文件') }}
                          </div>
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
                          <div class="upload-btn">
                            <i class="iconfont">&#xe734;</i>
                            {{ t('上传文件') }}
                          </div>
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
                          <div class="upload-btn">
                            <i class="iconfont">&#xe734;</i>
                            {{ t('上传文件') }}
                          </div>
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
            <temp-footer
              ref="footerRef"
              :check="check"
              :draft-loading="draftLoading"
              :sub-loading="subLoading"
              :has-draft="hasDraftData"
              :previous-page="previousPage"
              :previous-step="previousStep"
              :next-page="nextPage"
              :can-next="canNext"
              :current-id="currentId"
              :current-step="currentStep"
              :next-step="nextStep"
              @draft="draftHandle"
              @submit="submitHandle"
            ></temp-footer>
          </div>
        </div>
        <div v-if="!check" class="right-content">
          <bind-users
            ref="bindUsersRef"
            v-if="bindUserPermission"
            :current-id="currentId"
          ></bind-users>

          <ads-content></ads-content>
        </div>
      </div>
    </a-spin>
  </div>
</template>

<script setup>
import { reactive, ref, watch, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router'
import { cloneDeep } from 'lodash';
import { projectApplySaveProjectCert, projectAuditSaveMode, projectSaveSaveDraft, projectApplyProjectCert, projectDraftInfo } from '@/api/process';
import tool from '@/utils/tool';
import { message } from 'ant-design-vue/es';
import TempFooter from './components/TempFooter.vue';
import BindUsers from './../../components/BindUsers.vue';
import AdsContent from './../../components/AdsContent.vue';
import emitter from '@/event';
import { hasPermission } from "@/directives/permission/index"
import useProductStore from '@/store/modules/product'

const productStore = useProductStore();
const route = useRoute()

const emits = defineEmits(['checkDone', 'dataDone']);

const props = defineProps({
  infoData: {
    type: Object,
    default: () => {},
  },
  draftData: {
    type: Object,
    default: () => {},
  },
  previousStep: {
    type: Object,
  },
  currentStep: {
    type: Object,
  },
  nextStep: {
    type: Object,
  },
  currentId: {
    type: [Number, String],
    default: '',
  },
  check: {
    type: Boolean,
    default: false,
  },
  code: {
    type: String,
    default: ''
  },
  previousPage: {
    type: String,
    default: '',
  },
  nextPage: {
    type: String,
    default: '',
  },
  canNext: {
    type: Boolean,
    default: false,
  },
  currentRequest: {
    type: String,
    default: ''
  }
});

const { t } = useI18n();
const formRef = ref();
const footerRef = ref();
const bindUsersRef = ref();

const bindUserPermission = computed(() => {
  return hasPermission('requests:loan:bind:vcTeam') || hasPermission('requests:loan:bind:broker') || hasPermission('requests:loan:bind:user')
})

const resourceConsentList = ref([]);
const engineeringConsentList = ref([]);
const buildingList = ref([]);
const feasibilityList = ref([]);
const othersList = ref([]);

const removeItem = (type, index) => {
  let list = null;
  if (type === 1) {
    list = resourceConsentList.value;
  } else if (type === 2) {
    list = engineeringConsentList.value;
  } else if (type === 3) {
    list = buildingList.value;
  } else if (type === 4) {
    list = feasibilityList.value;
  } else if (type === 5) {
    list = othersList.value;
  }

  list.splice(index, 1);
};

const formState = reactive({
  resource_consent_files: [],
  engineering_plan_approval_files: [],
  building_consent_files: [],
  feasibility_files: [],
  others_files: [],
});

const formRules = {
  // cert_images: [{ required: true, message: t('请上传') + t('项目照片'), trigger: 'change' }],
};

const markInfo = computed(() => (props.currentStep ? props.currentStep.mark : ''));

const getParams = () => {
  const params = cloneDeep(formState);

  if ((props.infoData && props.infoData.uuid) || props.currentId) {
    params.uuid = props.infoData?.uuid || props.currentId;
  }

  // 资源许可
  if (resourceConsentList.value.length) {
    params.resource_consent_files = resourceConsentList.value.map((item) => item.uuid);
  }
  // 工程计划批准
  if (engineeringConsentList.value.length) {
    params.engineering_plan_approval_files = engineeringConsentList.value.map((item) => item.uuid);
  }
  // 建筑许可
  if (buildingList.value.length) {
    params.building_consent_files = buildingList.value.map((item) => item.uuid);
  }
  // 可行性研究
  if (feasibilityList.value.length) {
    params.feasibility_files = feasibilityList.value.map((item) => item.uuid);
  }
  // 其他
  if (othersList.value.length) {
    params.others_files = othersList.value.map((item) => item.uuid);
  }

  return params;
};

const needBindUser = ref(false);

const subLoading = ref(false);
const submitHandle = () => {
  formRef.value
    .validate()
    .then(() => {
      const params = getParams();
      let ajaxFn = projectApplySaveProjectCert;

      if (props.check) {
        params.project_cert_status = props.infoData.check_status;
        params.code = props.code
        ajaxFn = projectAuditSaveMode;
      } else {
        params.draft_step = markInfo.value;
      }

      const product_uuid = productStore.getProductUuid(props.currentRequest)

      if (product_uuid) {
        params.product_uuid = product_uuid
      }

      subLoading.value = true;

      ajaxFn(params)
        .then(async (res) => {
          if (props.check) {
            emits('checkDone');
            emitter.emit('refreshAuditHisList');
          } else {
            if (needBindUser.value) {
              await bindUsersRef.value.bindUsersRequest(res.uuid);
              needBindUser.value = false;
            }
            // 触发列表数据刷新
            emitter.emit('refreshRequestsList');
            footerRef.value.nextHandle(res);
          }

          subLoading.value = false;
        })
        .catch(() => {
          subLoading.value = false;
        });
    })
    .catch((error) => {
      console.log('error', error);
    });
};

const draftLoading = ref(false);
const hasDraftData = ref(false);
const draftHandle = () => {
  const data = {
    resourceConsentList: resourceConsentList.value || [],
    engineeringConsentList: engineeringConsentList.value || [],
    buildingList: buildingList.value || [],
    feasibilityList: feasibilityList.value || [],
    othersList: othersList.value || [],
  };

  const paramsObj = tool.filterEmptyValues(data);

  if (tool.isAllValuesEmpty(paramsObj)) {
    message.error(t('暂无数据，无需保存'));
  } else {
    const params = {
      draft_step: markInfo.value,
      draft: JSON.stringify(tool.filterEmptyValues(paramsObj)),
    };

    if ((props.infoData && props.infoData.uuid) || props.currentId) {
      params.uuid = props.infoData?.uuid || props.currentId;
    }

    draftLoading.value = true;
    projectSaveSaveDraft(params)
      .then((res) => {
        message.success(t('保存成功'));
        draftLoading.value = false;
        hasDraftData.value = true;
      })
      .catch(() => {
        draftLoading.value = false;
      });
  }
};

const dataInit = (infoMsg = {}, draftMsg = {}) => {
  const data = cloneDeep({ ...infoMsg, ...props.infoData });
  const draftData = cloneDeep({ ...draftMsg, ...props.draftData });

  if (draftData && Object.keys(draftData).length) {
    resourceConsentList.value = draftData.resourceConsentList || [];
    engineeringConsentList.value = draftData.engineeringConsentList || [];
    buildingList.value = draftData.buildingList || [];
    feasibilityList.value = draftData.feasibilityList || [];
    othersList.value = draftData.othersList || [];

    hasDraftData.value = true;
  } else {
    if (data.resource_consent_files) {
      resourceConsentList.value = data.resource_consent_files.map((item) => {
        return {
          ...item,
          url: item.value || '',
        };
      });
    }

    if (data.engineering_plan_approval_files) {
      engineeringConsentList.value = data.engineering_plan_approval_files.map((item) => {
        return {
          ...item,
          url: item.value || '',
        };
      });
    }

    if (data.building_consent_files) {
      buildingList.value = data.building_consent_files.map((item) => {
        return {
          ...item,
          url: item.value || '',
        };
      });
    }

    if (data.feasibility_files) {
      feasibilityList.value = data.feasibility_files.map((item) => {
        return {
          ...item,
          url: item.value || '',
        };
      });
    }

    if (data.others_files) {
      othersList.value = data.others_files.map((item) => {
        return {
          ...item,
          url: item.value || '',
        };
      });
    }
  }

  emits('dataDone', data.project_apply_sn);
};

const pageLoading = ref(false);
const getDataInit = async () => {
  pageLoading.value = true;

  let draftData = {};
  let infoData = {};

  // 草稿数据
  const params = {
    draft_step: markInfo.value,
  };
  if (props.currentId) {
    params.uuid = props.currentId;
  }
  await projectDraftInfo(params).then((res) => {
    if (res.draft) {
      const data = JSON.parse(res.draft);
      draftData = data;
    }
  });

  if (props.currentId) {
    await projectApplyProjectCert({
      uuid: props.currentId,
    }).then((res) => {
      infoData = res;
    });
  }

  pageLoading.value = false;

  dataInit(infoData, draftData);
};

watch(
  () => props.infoData,
  (val) => {
    if (val) {
      dataInit();
    }
  },
  {
    immediate: true,
  }
);

onMounted(() => {
  if (!props.check) {
    getDataInit();
  }

  emitter.on('stepOneBindUser', () => {
    needBindUser.value = true;
  });
});
</script>

<style lang="less" scoped>
@import './styles/common.less';
</style>
