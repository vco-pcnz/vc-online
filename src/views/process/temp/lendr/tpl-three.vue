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
                        <p>{{ t('辅助文件') }}</p>
                        <vco-upload-modal v-model:list="supportingDocsList">
                          <div class="upload-btn">
                            <i class="iconfont">&#xe734;</i>
                            {{ t('上传文件') }}
                          </div>
                        </vco-upload-modal>
                      </div>
                      <div class="file-content">
                        <template v-if="supportingDocsList.length">
                          <div v-for="(item, index) in supportingDocsList" :key="index" class="file-item">
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
                        <p>{{ t('贷款文件') }}</p>
                        <vco-upload-modal v-model:list="loanDocsList">
                          <div class="upload-btn">
                            <i class="iconfont">&#xe734;</i>
                            {{ t('上传文件') }}
                          </div>
                        </vco-upload-modal>
                      </div>
                      <div class="file-content">
                        <template v-if="loanDocsList.length">
                          <div v-for="(item, index) in loanDocsList" :key="index" class="file-item">
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

const supportingDocsList = ref([]);
const loanDocsList = ref([]);
const othersList = ref([]);

const removeItem = (type, index) => {
  let list = null;
  if (type === 1) {
    list = supportingDocsList.value;
  } else if (type === 2) {
    list = loanDocsList.value;
  } else if (type === 3) {
    list = othersList.value;
  }

  list.splice(index, 1);
};

const formState = reactive({
  supporting_docs_files: [],
  loan_docs_files: [],
  others_files: [],
  resource_consent_files: [],
  engineering_plan_approval_files: [],
  building_consent_files: [],
  feasibility_files: []
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

  // 支持文档
  if (supportingDocsList.value.length) {
    params.supporting_docs_files = supportingDocsList.value.map((item) => item.uuid);
  }
  // 贷款文件
  if (loanDocsList.value.length) {
    params.loan_docs_files = loanDocsList.value.map((item) => item.uuid);
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
    supportingDocsList: supportingDocsList.value || [],
    loanDocsList: loanDocsList.value || [],
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
    supportingDocsList.value = draftData.supportingDocsList || [];
    loanDocsList.value = draftData.loanDocsList || [];
    othersList.value = draftData.othersList || [];

    hasDraftData.value = true;
  } else {
    if (data.supporting_docs_files) {
      supportingDocsList.value = data.supporting_docs_files.map((item) => {
        return {
          ...item,
          url: item.value || '',
        };
      });
    }

    if (data.loan_docs_files) {
      loanDocsList.value = data.loan_docs_files.map((item) => {
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

  emits('dataDone', data);
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
