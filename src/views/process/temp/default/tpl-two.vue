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
                    <a-form-item :label="t('项目名称')" name="project_name">
                      <a-input v-model:value="formState.project_name" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="10">
                    <a-form-item :label="t('项目类型')" name="project_type">
                      <a-select v-model:value="formState.project_type" :options="projectTypeData"></a-select>
                    </a-form-item>
                  </a-col>
                  <a-col :span="10">
                    <a-form-item :label="t('开发成本')" name="devCost">
                      <DevCostDetail v-model:value="formState.devCost" :disabled="check" v-model:dataJson="formState.devCostDetail">
                        <a-input-number
                          v-model:value="formState.devCost"
                          :max="99999999999"
                          :disabled="check"
                          readonly
                          :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                          :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                        />
                      </DevCostDetail>
                    </a-form-item>
                  </a-col>
                  <a-col :span="4">
                    <a-form-item :label="t('楼栋数')" name="building_num">
                      <a-input-number min="1" max="200" v-model:value="formState.building_num" />
                    </a-form-item>
                  </a-col>

                  <a-col :span="24">
                    <a-form-item :label="t('项目照片')" name="project_images">
                      <!-- <vco-upload-image v-model:value="formState.project_images" :isMultiple="true" :limit="9"></vco-upload-image> -->
                      <vco-upload-list v-model:value="formState.project_images" v-model:list="formState.project_images_list" :limit="9 - formState.project_images.length"></vco-upload-list>
                    </a-form-item>
                  </a-col>

                  <a-col :span="24">
                    <AddressList ref="addressListRef" :config="addressConfig" v-model:value="formState.project_address_other"></AddressList>
                  </a-col>
                  <a-col :span="24">
                    <a-form-item :label="t('项目介绍')" name="project_about">
                      <a-textarea v-model:value="formState.project_about" :auto-size="{ minRows: 4, maxRows: 5 }" />
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
          <bind-users ref="bindUsersRef" v-if="bindUserPermission" :current-id="currentId"></bind-users>

          <ads-content></ads-content>
        </div>
      </div>
    </a-spin>
  </div>
</template>

<script setup>
import { reactive, ref, watch, onMounted, computed, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { cloneDeep } from 'lodash';
import { projectSelectList, projectApplySaveProjectInfo, projectAuditSaveMode, projectApplyProjectInfo, projectSaveSaveDraft, projectDraftInfo } from '@/api/process';

import tool from '@/utils/tool';
import { message } from 'ant-design-vue/es';
import TempFooter from './components/TempFooter.vue';
import BindUsers from './../../components/BindUsers.vue';
import AdsContent from './../../components/AdsContent.vue';
import emitter from '@/event';
import { hasPermission } from '@/directives/permission/index';
import DevCostDetail from './components/DevCostDetail.vue';
import AddressList from './components/AddressList/index.vue';
import useProductStore from '@/store/modules/product';

const productStore = useProductStore();
const route = useRoute();

const emits = defineEmits(['checkDone', 'dataDone']);

const props = defineProps({
  infoData: {
    type: Object,
    default: () => {}
  },
  draftData: {
    type: Object,
    default: () => {}
  },
  previousStep: {
    type: Object
  },
  currentStep: {
    type: Object
  },
  nextStep: {
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
  code: {
    type: String,
    default: ''
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
  return hasPermission('requests:loan:bind:vcTeam') || hasPermission('requests:loan:bind:broker') || hasPermission('requests:loan:bind:user');
});

const markInfo = computed(() => (props.currentStep ? props.currentStep.mark : ''));

const formState = reactive({
  project_name: '',
  project_type: undefined,
  project_images: [],
  project_region: '',
  project_address_short: '',
  project_address: '',
  project_postcode: '',
  building_num: '',
  project_about: '',
  region_one_id: '',
  region_two_id: '',
  region_three_id: '',
  region_one_name: '',
  project_suburb: '',
  project_con_id: '',
  devCost: '',
  devCostDetail: '',
  project_address_other: [
    {
      project_address_short: '',
      project_address: '',
      project_suburb: '',
      project_postcode: '',
      project_con_id: '',
      project_region: '',
      region_one_name: '',
      region_one_id: '',
      region_two_id: '',
      region_three_id: ''
    }
  ]
});

const addressConfig = ref({
  addr: 'project_address_short',
  address: 'project_address',
  suburb: 'project_suburb',
  postal: 'project_postcode',
  con_id: 'project_con_id',
  region: 'project_region',
  province_code_name: 'region_one_name',
  province_code: 'region_one_id',
  city_code: 'region_two_id',
  district_code: 'region_three_id'
});

const formRules = {
  project_type: [{ required: true, message: t('请选择') + t('项目类型'), trigger: 'change' }],
  project_images: [{ required: true, message: t('请上传') + t('项目照片'), trigger: 'change' }],
  building_num: [{ required: true, message: t('请输入') + t('楼栋数'), trigger: 'blur' }],
  project_about: [{ required: true, message: t('请输入') + t('项目介绍'), trigger: 'blur' }]
};

const getParams = () => {
  const params = cloneDeep(formState);
  if (params.project_images && params.project_images.length) {
    params.project_images = params.project_images.join(',');
  }

  delete params.project_region;

  if ((props.infoData && props.infoData.uuid) || props.currentId) {
    params.uuid = props.infoData?.uuid || props.currentId;
  }

  return params;
};

const needBindUser = ref(false);
const addressListRef = ref(null);
const subLoading = ref(false);
const submitHandle = async () => {
  for (const key in formState.project_address_other[0]) {
    formState[key] = formState.project_address_other[0][key] || '';
  }
  const validate = await addressListRef.value.validate();
  if (!validate) return;
  formRef.value
    .validate()
    .then(async () => {
      const params = getParams();
      // 图片传数组
      params.project_images = params.project_images.length ? params.project_images.split(',') : [];

      let ajaxFn = projectApplySaveProjectInfo;

      if (props.check) {
        params.project_info_status = props.infoData.check_status;
        params.code = props.code;
        ajaxFn = projectAuditSaveMode;
      } else {
        params.draft_step = markInfo.value;
      }

      const product_uuid = productStore.getProductUuid(props.currentRequest);

      if (product_uuid) {
        params.product_uuid = product_uuid;
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
  const data = getParams();
  const dataObj = cloneDeep(data);
  delete dataObj.uuid;
  delete dataObj.region_one_id;
  delete dataObj.region_two_id;
  delete dataObj.region_three_id;

  if (tool.isAllValuesEmpty(dataObj)) {
    message.error(t('暂无数据，无需保存'));
  } else {
    const params = {
      draft_step: markInfo.value,
      draft: JSON.stringify(tool.filterEmptyValues(data))
    };

    if ((props.infoData && props.infoData.uuid) || props.currentId) {
      params.uuid = props.infoData?.uuid || props.currentId;
    }

    draftLoading.value = true;
    projectSaveSaveDraft(params)
      .then((res) => {
        message.success(t('保存成功'));
        hasDraftData.value = true;
        draftLoading.value = false;
      })
      .catch(() => {
        draftLoading.value = false;
      });
  }
};

const projectTypeData = ref([]);
const getTypeData = () => {
  projectSelectList().then((res) => {
    const data = res.project_type || [];
    projectTypeData.value = data.map((item) => {
      return {
        label: item.title,
        value: item.id
      };
    });
  });
};

const dataInit = (infoMsg = {}, draftMsg = {}) => {
  const data = cloneDeep({ ...infoMsg, ...props.infoData });
  const draftData = cloneDeep({ ...draftMsg, ...props.draftData });

  let useData = data;
  if (draftData && Object.keys(draftData).length) {
    useData = draftData;
    hasDraftData.value = true;
  }

  for (const key in formState) {
    formState[key] = useData[key] || formState[key] || '';
    if (key === 'project_type') {
      formState[key] = useData[key] || undefined;
    }
  }
  const areaArr = [useData.region_one_id, useData.region_two_id, useData.region_three_id];
  const areaStr = areaArr.filter((item) => item).join(',');
  formState.project_region = areaStr || '';

  emits('dataDone', data);
};

const pageLoading = ref(false);
const getDataInit = async () => {
  pageLoading.value = true;

  let draftData = {};
  let infoData = {};

  // 草稿数据
  const params = {
    draft_step: markInfo.value
  };
  if (props.currentId) {
    params.uuid = props.currentId;
  }
  await projectDraftInfo(params).then((res) => {
    if (res.draft) {
      const data = JSON.parse(res.draft);
      data.project_images = data.project_images_list;
      draftData = data;
    }
  });

  if (props.currentId) {
    await projectApplyProjectInfo({
      uuid: props.currentId
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
    immediate: true
  }
);

onMounted(() => {
  getTypeData();
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
