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
            <div class="sys-form-content mt-5">
              <a-form ref="formRef" layout="vertical" :model="formState">
                <div v-for="(borrower, index) in formState.borrowers" :key="borrower._key" class="borrower-block">
                  <div class="flex justify-end gap-5">
                    <span v-if="formState.borrowers.length > 1" class="mr-auto borrower-index">{{ t('借款人信息') }} {{ index + 1 }}</span>
                    <template v-if="!check">
                      <a-button v-permission="'process:one:tempImport'" type="primary-line" shape="round" size="small" @click="importStaHandle(index)">{{ t('从利益相关者导入') }}</a-button>
                      <a-button v-permission="'process:one:tempData'" type="primary-line" shape="round" size="small" class="flex items-center justify-center" :loading="tempLoading && activeBorrowerIndex === index" @click="tempDataHandle(index)">
                        {{ t('生成临时借款人ID') }}
                        <a-tooltip>
                          <template #title>
                            <span>{{ t('仅限借款人公司尚未正式成立') }}</span>
                          </template>
                          <QuestionCircleOutlined />
                        </a-tooltip>
                      </a-button>
                    </template>
                    <a-button v-if="formState.borrowers.length > 1" type="primary-line" shape="round" size="small" html-type="button" @click="removeBorrower(index)">{{ t('删除') }}</a-button>
                  </div>
                  <a-row :gutter="24" class="mt-5">
                    <a-col :span="24">
                      <a-form-item :label="t('借款人类型')" :name="['borrowers', index, 'borrower_type']">
                        <a-radio-group v-model:value="borrower.borrower_type">
                          <a-radio :value="1">{{ t('个人') }}</a-radio>
                          <a-radio :value="2">{{ t('公司') }}</a-radio>
                          <a-radio :value="3">{{ t('信托') }}</a-radio>
                        </a-radio-group>
                      </a-form-item>
                    </a-col>
                    <template v-if="borrower.borrower_type === 1">
                      <a-col :span="8">
                        <a-form-item :label="t('名')" :name="['borrowers', index, 'first_name']" :rules="formRules.first_name">
                          <a-input v-model:value="borrower.first_name" />
                        </a-form-item>
                      </a-col>
                      <a-col :span="8">
                        <a-form-item :label="t('中间名')" :name="['borrowers', index, 'middle_name']">
                          <a-input v-model:value="borrower.middle_name" />
                        </a-form-item>
                      </a-col>
                      <a-col :span="8">
                        <a-form-item :label="t('姓')" :name="['borrowers', index, 'last_name']" :rules="formRules.last_name">
                          <a-input v-model:value="borrower.last_name" />
                        </a-form-item>
                      </a-col>
                    </template>
                    <template v-else>
                      <a-col :span="borrower.borrower_type === 3 ? 16 : 24">
                        <a-form-item :label="t('机构名称')" :name="['borrowers', index, 'organization_name']" :rules="formRules.organization_name">
                          <vco-company-select :email="borrower.borrower_email" v-model:name="borrower.organization_name" v-model:nzbn="borrower.company_number" :show_nzbn="true" @change="(val) => getCompanyInfo(val, index)"></vco-company-select>
                        </a-form-item>
                      </a-col>
                    </template>
                    <a-col v-if="[1, 2].includes(borrower.borrower_type)" :span="!isNormalUser && !isOpen ? 16 : 24">
                      <a-form-item v-if="borrower.borrower_type === 1" :label="t('身份证号码')" :name="['borrowers', index, 'borrower_id_num']" :rules="formRules.borrower_id_num">
                        <a-input v-model:value="borrower.borrower_id_num" />
                      </a-form-item>
                      <a-form-item v-if="borrower.borrower_type === 2" :label="t('新西兰商业号码')" :name="['borrowers', index, 'company_number']" :rules="formRules.company_number">
                        <vco-company-select :email="borrower.borrower_email" v-model:name="borrower.organization_name" :placeholder="t('请输入')" v-model:nzbn="borrower.company_number" :show_nzbn="true" @change="(val) => getCompanyInfo(val, index)" :is_nzbn="true"></vco-company-select>
                      </a-form-item>
                    </a-col>
                    <a-col v-if="!isNormalUser && !isOpen" :span="8">
                      <a-form-item :label="t('是否存为利益相关者')">
                        <a-switch v-model:checked="borrower.is_temp_borrower" />
                      </a-form-item>
                    </a-col>
                    <a-col :span="12">
                      <a-form-item :label="t('邮箱')" :name="['borrowers', index, 'borrower_email']" :rules="formRules.borrower_email">
                        <a-input v-model:value="borrower.borrower_email" />
                      </a-form-item>
                    </a-col>
                    <a-col :span="12">
                      <a-form-item :label="t('手机号')" :name="['borrowers', index, 'borrower_phone']">
                        <vco-mobile-input v-model:value="borrower.borrower_phone" v-model:areaCode="borrower.borrower_phone_prefix" :formRef="formRef" :validateField="['borrowers', index, 'borrower_phone']"> </vco-mobile-input>
                      </a-form-item>
                    </a-col>
                    <a-col :span="24" v-show="show_addr || borrower.borrower_type === 1">
                      <vco-address :config="addressConfig" :ref="(el) => setAddressRef(el, borrower._key)" @change="(e) => setAddressInfo(e, index)"></vco-address>
                    </a-col>
                    <a-col :span="24">
                      <a-form-item :label="t('借款人背景信息')" :name="['borrowers', index, 'borrower_about']" :rules="formRules.borrower_about">
                        <a-textarea v-model:value="borrower.borrower_about" :auto-size="{ minRows: 4, maxRows: 5 }" />
                      </a-form-item>
                    </a-col>
                  </a-row>
                </div>
                <a-button type="primary-line" shape="round" size="small" html-type="button" @click="addBorrower">{{ t('添加借款人') }}</a-button>
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
          <bind-users ref="bindUsersRef" type="default" v-if="bindUserPermission" :current-id="currentId"></bind-users>

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

const addressRefs = ref({});
const activeBorrowerIndex = ref(0);
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

const setAddressRef = (el, key) => {
  if (el) {
    addressRefs.value[key] = el;
  }
};

const setAddressInfo = (e, index) => {
  const borrower = formState.borrowers[index];
  if (!borrower) return;
  for (const key in e) {
    borrower[key] = e[key];
  }
};

const initAddresses = () => {
  nextTick(() => {
    formState.borrowers.forEach((item) => {
      addressRefs.value[item._key]?.init(item);
    });
  });
};

const markInfo = computed(() => (props.currentStep ? props.currentStep.mark : ''));
let borrowerSeed = 1;

const createBorrower = () => ({
  _key: borrowerSeed++,
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
  borrower_address_short: '',
  borrower_about: '',
  borrower_region_one_id: '',
  borrower_region_two_id: '',
  borrower_region_three_id: '',
  borrower_region_one_name: '',
  borrower_suburb: '',
  borrower_con_id: '',
  is_temp_borrower: false
});

const formState = reactive({
  borrowers: [createBorrower()]
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
const currentBorrower = () => formState.borrowers[activeBorrowerIndex.value];

const getTempData = async () => {
  const borrower = currentBorrower();
  if (!borrower) return;
  tempLoading.value = true;
  getApproveTemp({
    type: Number(borrower.borrower_type) - 1
  })
    .then((res) => {
      for (const key in res) {
        if (key === 'code') {
          if (Number(borrower.borrower_type) === 1) {
            borrower.borrower_id_num = res.code;
          } else {
            borrower.company_number = res.code;
          }
        } else if (key in borrower) {
          borrower[key] = res[key];
        }
      }
      borrower.borrower_phone_prefix = '64';
      initAddresses();
      tempLoading.value = false;
    })
    .catch(() => {
      tempLoading.value = false;
    });
};

const borrowerHasInput = (borrower) => {
  const dataObj = cloneDeep(borrower);
  delete dataObj._key;
  delete dataObj.borrower_type;
  delete dataObj.borrower_phone_prefix;
  delete dataObj.borrower_region_one_id;
  delete dataObj.borrower_region_two_id;
  delete dataObj.borrower_region_three_id;
  delete dataObj.is_temp_borrower;
  delete dataObj.borrower_id_num;
  return !tool.isAllValuesEmpty(dataObj);
};

const tempDataHandle = (index) => {
  activeBorrowerIndex.value = index;
  if (!borrowerHasInput(formState.borrowers[index])) {
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

const importStaHandle = (index) => {
  activeBorrowerIndex.value = index;
  vcoChooseUserRef.value.init();
};

const choiceUserDone = (data) => {
  const borrower = currentBorrower();
  if (!borrower) return;
  if (data.type === 20) {
    borrower.borrower_type = 1;
    borrower.first_name = data.firstName;
    borrower.middle_name = data.middleName;
    borrower.last_name = data.lastName;
    borrower.borrower_id_num = data.idcard;
  } else if (data.type === 3) {
    borrower.borrower_type = 3;
    borrower.organization_name = data.name;
  } else {
    borrower.borrower_type = 2;
    borrower.organization_name = data.name;
    borrower.company_number = data.nzbn;
  }
  borrower.borrower_images = [];
  borrower.borrower_email = data.email;
  borrower.borrower_phone_prefix = data.pre;
  borrower.borrower_phone = data.mobile;
  borrower.borrower_postcode = data.postal;
  borrower.borrower_address_short = data.addr;
  borrower.borrower_address = data.address;
  borrower.borrower_about = data.note;
  borrower.borrower_suburb = data.suburb;
  borrower.borrower_region_one_id = data.province_code;
  borrower.borrower_region_two_id = data.city_code;
  borrower.borrower_region_three_id = data.district_code;
  const areaArr = [data.province_code, data.city_code, data.district_code];
  borrower.borrower_region = areaArr.filter((item) => item).join(',');
  initAddresses();
};

const addBorrower = () => {
  formState.borrowers.push(createBorrower());
};

const removeBorrower = (index) => {
  if (formState.borrowers.length < 2) return;
  formState.borrowers.splice(index, 1);
  initAddresses();
};

const toFormBorrower = (raw = {}) => {
  const item = createBorrower();
  const data = { ...raw };
  if (Number(data.is_trust) === 1 || Number(data.borrower_type) === 3) {
    data.borrower_type = 3;
  }
  Object.keys(item).forEach((key) => {
    if (key === '_key') return;
    if (key === 'company_number') {
      item.company_number = Number(data.borrower_type) === 2 ? (data.borrower_id_num || data.company_number || '') : '';
      return;
    }
    if (key === 'is_temp_borrower') {
      item.is_temp_borrower = data.is_temp_borrower ? Boolean(Number(data.is_temp_borrower)) : false;
      return;
    }
    if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
      item[key] = data[key];
    }
  });
  return item;
};

const toApiBorrower = (item) => {
  const params = cloneDeep(item);
  delete params._key;
  if (params.borrower_images && params.borrower_images.length) {
    params.borrower_images = params.borrower_images.join(',');
  }
  if (Number(params.borrower_type) === 2) {
    params.borrower_id_num = params.company_number;
  }
  if (!props.isOpen) {
    params.is_temp_borrower = params.is_temp_borrower ? 1 : 0;
  } else {
    delete params.is_temp_borrower;
  }
  delete params.company_number;
  if (Number(params.borrower_type) === 3) {
    params.borrower_type = 2;
    params.is_trust = 1;
    params.borrower_id_num = '';
  } else {
    params.is_trust = 0;
  }
  params.borrower_images = params.borrower_images && params.borrower_images.length ? String(params.borrower_images).split(',') : [];
  return params;
};

const getParams = () => ({
  borrowers: formState.borrowers.map(toApiBorrower)
});

const subLoading = ref(false);

const submitHandle = () => {
  formRef.value
    .validate()
    .then(() => {
      const params = getParams();

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

          emitter.emit('refreshBindUsers');
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
  const hasInput = formState.borrowers.some((item) => borrowerHasInput(item));

  if (!hasInput) {
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

  const rows = Array.isArray(useData.borrowers) && useData.borrowers.length ? useData.borrowers : [useData];
  formState.borrowers = rows.map((row) => toFormBorrower(row));
  initAddresses();
  emits('dataDone', data );
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
      if (res.is_trust) {
        res.borrower_type = 3;
      }
      infoData = res;
    });
  }

  pageLoading.value = false;

  dataInit(infoData, draftData);
};

const getCompanyInfo = (val, index) => {
  const borrower = formState.borrowers[index];
  if (!borrower) return;
  borrower.borrower_address_short = val.addr;
  borrower.borrower_address = val.address;
  borrower.borrower_suburb = val.suburb;
  borrower.borrower_postcode = val.postal;
  borrower.borrower_con_id = val.con_id;
  borrower.borrower_region_one_name = val.province_code_name;
  borrower.borrower_email = val.email;
  borrower.borrower_phone_prefix = val.pre;
  borrower.borrower_phone = val.mobile;
  initAddresses();
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

.borrower-block + .borrower-block {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
}

.borrower-index {
  line-height: 32px;
  font-weight: 600;
}
</style>
