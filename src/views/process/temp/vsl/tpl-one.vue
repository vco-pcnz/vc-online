<template>
  <div>
    <!-- 人员选择 -->
    <vco-choose-user ref="vcoChooseUserRef" :title="t('利益相关者')" url="stake/selStake" @change="choiceUserDone">
      <div></div>
    </vco-choose-user>

    <a-spin :spinning="pageLoading" size="large">
      <div class="block-container">
        <div class="left-content">
          <div class="block-item" :class="{ check: check }">
            <div v-if="!check" class="flex justify-end gap-5">
              <a-button v-permission="'process:one:tempImport'" type="primary-line" shape="round" size="small" @click="importStaHandle">{{ t('从利益相关者导入') }}</a-button>
              <a-button v-permission="'process:one:tempData'" type="primary-line" shape="round" size="small" class="flex items-center justify-center" :loading="tempLoading" @click="tempDataHandle">
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

                  <!-- <a-col :span="24">
                    <a-form-item :label="t('证件照片')" name="borrower_images">
                      <vco-upload-list v-model:value="formState.borrower_images" v-model:list="formState.borrower_images_list" :limit="9 - formState.borrower_images.length"></vco-upload-list>
                    </a-form-item>
                  </a-col> -->
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
                        <!-- <a-input v-model:value="formState.organization_name" /> -->
                        <vco-company-select :email="formState.borrower_email" v-model:name="formState.organization_name" v-model:nzbn="formState.company_number" :show_nzbn="true" @change="getCompanyInfo"></vco-company-select>
                      </a-form-item>
                    </a-col>
                  </template>
                  <a-col :span="!isNormalUser && !isOpen ? 16 : 24">
                    <a-form-item v-if="formState.borrower_type === 1" :label="t('身份证号码')" name="borrower_id_num">
                      <a-input v-model:value="formState.borrower_id_num" />
                    </a-form-item>

                    <a-form-item v-else :label="t('新西兰商业号码')" name="company_number">
                      <!-- <a-input v-model:value="formState.company_number" /> -->
                      <vco-company-select :email="formState.borrower_email" v-model:name="formState.organization_name" :placeholder="t('请输入')" v-model:nzbn="formState.company_number" :show_nzbn="true" @change="getCompanyInfo" :is_nzbn="true"></vco-company-select>
                    </a-form-item>
                  </a-col>
                  <a-col v-if="!isNormalUser && !isOpen" :span="8">
                    <a-form-item :label="t('是否存为利益相关者')">
                      <a-switch v-model:checked="formState.is_temp_borrower" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="12">
                    <a-form-item :label="t('邮箱')" name="borrower_email">
                      <a-input v-model:value="formState.borrower_email" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="12">
                    <a-form-item :label="t('手机号')" name="borrower_phone">
                      <vco-mobile-input v-model:value="formState.borrower_phone" v-model:areaCode="formState.borrower_phone_prefix" :formRef="formRef" validateField="borrower_phone"> </vco-mobile-input>
                    </a-form-item>
                  </a-col>
                  <a-col :span="24" v-show="show_addr || formState.borrower_type === 1">
                    <vco-address :config="addressConfig" ref="vcoAddressRef" @change="setAddressInfo"></vco-address>
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
import { reactive, ref, watch, onMounted, computed, createVNode, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router'
import { Modal } from 'ant-design-vue';
import { cloneDeep } from 'lodash';
import { QuestionCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { projectApplySaveBorrowerInfo, projectAuditSaveMode, projectSaveSaveDraft } from '@/api/process';
import tool from '@/utils/tool';
import { message } from 'ant-design-vue/es';
import { projectApplyBorrowerInfo, projectDraftInfo, getApproveTemp } from '@/api/process';
import { projectDetailSaveBorrower } from '@/api/project/project';
import TempFooter from './components/TempFooter.vue';
import BindUsers from './../../components/BindUsers.vue';
import AdsContent from './../../components/AdsContent.vue';
import emitter from '@/event';
import { useUserStore } from '@/store';
import { hasPermission } from '@/directives/permission/index';
import useAppStore from '@/store/modules/app';
import useProductStore from '@/store/modules/product'

const appStore = useAppStore();
const productStore = useProductStore();

const route = useRoute()

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
  currentStep: {
    type: Object
  },
  nextStep: {
    type: Object
  },
  previousStep: {
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
  isOpen: {
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
const vcoChooseUserRef = ref();
const bindUsersRef = ref();

const userStore = useUserStore();

const isNormalUser = computed(() => userStore.isNormalUser);

const bindUserPermission = computed(() => {
  return hasPermission('requests:loan:bind:vcTeam') || hasPermission('requests:loan:bind:broker') || hasPermission('requests:loan:bind:user');
});

const vcoAddressRef = ref();
const addressConfig = ref({
  addr: 'borrower_address_short',
  address: 'borrower_address',
  suburb: 'borrower_suburb',
  postal: 'borrower_postcode',
  con_id: 'borrower_con_id',
  region: 'borrower_region',
  province_code_name: 'borrower_region_one_name',
  province_code: 'borrower_region_one_id',
  city_code: 'borrower_region_two_id',
  district_code: 'borrower_region_three_id'
});

const setAddressInfo = (e) => {
  for (const key in e) {
    formState[key] = e[key];
  }
};

const markInfo = computed(() => (props.currentStep ? props.currentStep.mark : ''));
const randomNumber = Math.floor(Math.random() * (10 ** 15 - 10 ** 14) + 10 ** 14);

const formState = reactive({
  borrower_type: 2,
  borrower_images: [],
  first_name: '',
  middle_name: '',
  last_name: '',
  organization_name: '',
  borrower_id_num: `${randomNumber}temp`,
  company_number: '',
  borrower_email: '',
  borrower_phone_prefix: '',
  borrower_phone: '',
  borrower_postcode: '',
  borrower_region: '',
  borrower_address: '',
  borrower_address_short: '',
  borrower_about: '',

  borrower_region_one_id: '',
  borrower_region_two_id: '',
  borrower_region_three_id: '',

  borrower_region_one_name: '',
  borrower_region_one_id: '',
  borrower_suburb: '',
  borrower_con_id: '',

  is_temp_borrower: false
});

const formRules = {
  borrower_images: [
    // { required: true, message: t('请上传') + t('证件照片'), trigger: 'change' }
  ],
  first_name: [{ required: true, message: t('请输入') + t('名'), trigger: 'blur' }],
  last_name: [{ required: true, message: t('请输入') + t('姓'), trigger: 'blur' }],
  organization_name: [{ required: true, message: t('请输入') + t('机构名称'), trigger: 'blur' }],
  borrower_id_num: [
    { required: true, message: t('请输入') + t('身份证号码'), trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9]+$/,
      message: t('身份证号码') + t('格式不正确'),
      trigger: 'blur'
    }
  ],
  company_number: [
    { required: true, message: t('请输入') + t('新西兰商业号码'), trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9]+$/,
      message: t('新西兰商业号码') + t('格式不正确'),
      trigger: 'blur'
    }
  ],
  borrower_email: [
    { required: true, message: t('请输入') + t('邮箱'), trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      message: t('邮箱格式不正确'),
      trigger: 'blur'
    }
  ],
  // borrower_postcode: [
  //   { required: true, message: t('请输入') + t('邮编'), trigger: 'blur' },
  //   {
  //     pattern: /^[A-Za-z0-9\s\-]+$/,
  //     message: t('邮编') + t('格式不正确'),
  //     trigger: 'blur'
  //   }
  // ],
  // borrower_region: [{ required: true, message: t('请选择') + t('借款人地址'), trigger: 'change' }],
  // borrower_address_short: [{ required: true, message: t('请输入') + t('地址1'), trigger: 'blur' }],
  // borrower_region_one_name: [{ required: true, message: t('请输入') + t('城市/州'), trigger: 'blur' }],
  borrower_about: [{ required: true, message: t('请输入') + t('借款人背景信息'), trigger: 'blur' }]
};

const tempLoading = ref(false);
const getTempData = async () => {
  tempLoading.value = true;
  getApproveTemp({
    type: Number(formState.borrower_type) - 1
  })
    .then((res) => {
      for (const key in res) {
        if (key === 'code') {
          if (Number(formState.borrower_type) === 1) {
            formState.borrower_id_num = res.code;
          } else {
            formState.company_number = res.code;
          }
        } else {
          formState[key] = res[key];
        }
      }
      // formState.borrower_region_one_id = res.borrower_region_one_id;
      // formState.borrower_region_two_id = res.borrower_region_two_id;
      // formState.borrower_region_three_id = res.borrower_region_three_id;
      formState.borrower_phone_prefix = '64';

      nextTick(() => {
        vcoAddressRef.value.init(formState);
      });
      tempLoading.value = false;
    })
    .catch(() => {
      tempLoading.value = false;
    });
};

const tempDataHandle = () => {
  const dataObj = cloneDeep(formState);
  delete dataObj.borrower_type;
  delete dataObj.borrower_phone_prefix;
  delete dataObj.borrower_region_one_id;
  delete dataObj.borrower_region_two_id;
  delete dataObj.borrower_region_three_id;
  delete dataObj.is_temp_borrower;
  delete dataObj.borrower_id_num;
  if (tool.isAllValuesEmpty(dataObj)) {
    getTempData();
  } else {
    Modal.confirm({
      title: t('提示'),
      icon: createVNode(ExclamationCircleOutlined),
      content: t('已存在数据，确定生成吗?'),
      onOk() {
        getTempData();
      }
    });
  }
};

const importStaHandle = () => {
  vcoChooseUserRef.value.init();
};

const choiceUserDone = (data) => {
  // 个人
  if (data.type === 20) {
    formState.borrower_type = 1;
    formState.first_name = data.firstName;
    formState.middle_name = data.middleName;
    formState.last_name = data.lastName;
    formState.borrower_id_num = data.idcard;
  } else {
    formState.borrower_type = 2;
    formState.organization_name = data.name;
    formState.company_number = data.nzbn;
  }
  formState.borrower_images = [];
  formState.borrower_email = data.email;
  formState.borrower_phone_prefix = data.pre;
  formState.borrower_phone = data.mobile;
  formState.borrower_postcode = data.postal;
  formState.borrower_region = data.postal;
  formState.borrower_address_short = data.addr;
  formState.borrower_address = data.address;
  formState.borrower_about = data.note;
  formState.borrower_suburb = data.suburb;

  formState.borrower_region_one_id = data.province_code;
  formState.borrower_region_two_id = data.city_code;
  formState.borrower_region_three_id = data.district_code;

  const areaArr = [data.province_code, data.city_code, data.district_code];
  const areaStr = areaArr.filter((item) => item).join(',');
  formState.borrower_region = areaStr;

  // 利益相关者导入地址数据
  vcoAddressRef.value.init(formState);
};

const getParams = () => {
  const params = cloneDeep(formState);

  if (params.borrower_images && params.borrower_images.length) {
    params.borrower_images = params.borrower_images.join(',');
  }

  if (params.borrower_type === 2) {
    params.borrower_id_num = params.company_number;
  }

  params.is_temp_borrower = params.is_temp_borrower ? 1 : 0;

  delete params.company_number;

  return params;
};

const subLoading = ref(false);

const submitHandle = () => {
  formRef.value
    .validate()
    .then(() => {
      const params = getParams();
      // 图片传数组
      params.borrower_images = params.borrower_images.length ? params.borrower_images.split(',') : [];

      let ajaxFn = projectApplySaveBorrowerInfo;

      if (props.check) {
        if (props.isOpen) {
          ajaxFn = projectDetailSaveBorrower;
        } else {
          params.borrower_info_status = props.infoData.check_status;
          params.code = props.code;
          ajaxFn = projectAuditSaveMode;
        }
      } else {
        params.draft_step = markInfo.value;
      }

      if ((props.infoData && props.infoData.uuid) || props.currentId) {
        params.uuid = props.infoData?.uuid || props.currentId;
      }

      const product_uuid = productStore.getProductUuid(props.currentRequest)

      if (product_uuid) {
        params.product_uuid = product_uuid
      }

      subLoading.value = true;
      ajaxFn(params)
        .then(async (res) => {
          if (props.check) {
            if (!props.isOpen) {
              emitter.emit('refreshAuditHisList');
            }

            emits('checkDone');
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
  delete dataObj.borrower_type;
  delete dataObj.borrower_phone_prefix;
  delete dataObj.borrower_region_one_id;
  delete dataObj.borrower_region_two_id;
  delete dataObj.borrower_region_three_id;

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

const dataInit = (infoMsg = {}, draftMsg = {}) => {
  const data = cloneDeep({ ...infoMsg, ...props.infoData });
  const draftData = cloneDeep({ ...draftMsg, ...props.draftData });

  let useData = data;
  if (draftData && Object.keys(draftData).length) {
    useData = draftData;
    hasDraftData.value = true;
  }

  for (const key in formState) {
    if (key === 'company_number') {
      formState[key] = useData.borrower_type === 2 ? useData.borrower_id_num : '';
    } else if (key === 'is_temp_borrower') {
      formState[key] = useData[key] ? Boolean(Number(useData[key])) : false;
    } else {
      formState[key] = useData[key] || formState[key];
    }
  }

  nextTick(() => {
    vcoAddressRef.value.init(formState);
  });
  emits('dataDone', data.project_apply_sn || '');
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
      data.borrower_images = data.borrower_images_list;
      draftData = data;
    }
  });

  if (props.currentId) {
    await projectApplyBorrowerInfo({
      uuid: props.currentId
    }).then((res) => {
      infoData = res;
    });
  }

  pageLoading.value = false;

  dataInit(infoData, draftData);
};

const getCompanyInfo = (val) => {
  formState.borrower_address_short = val.addr;
  formState.borrower_address = val.address;
  formState.borrower_suburb = val.suburb;
  formState.borrower_postcode = val.postal;
  formState.borrower_con_id = val.con_id;
  formState.borrower_region_one_name = val.province_code_name;
  formState.borrower_email = val.email;
  formState.borrower_phone_prefix = val.pre;
  formState.borrower_phone = val.mobile;

  vcoAddressRef.value.init(formState);
};

const needBindUser = ref(false);

const show_addr = computed(() => {
  return appStore.config?.show_addr === '2';
});

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
