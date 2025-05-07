<template>
  <div class="inline" @click="init"><slot></slot></div>

  <a-modal :open="visible" :title="t('申请中介')" :width="800" :footer="null" :keyboard="false" :maskClosable="false" @cancel="visible = false">
    <div class="content sys-form-content" style="padding-top: 20px">
      <a-form ref="formRef" :model="form" :rules="dynamicRules" layout="vertical">
        <a-row :gutter="24">
          <a-col :span="24" class="avatar-box">
            <div class="flex justify-center pb-3" style="font-size: 0">
              <vco-upload-modal v-model:value="form.avatar" :isAvatar="true" :uploadType="1" :limit="1">
                <div class="avatarBox">
                  <template v-if="form.avatar">
                    <vco-avatar :src="form.avatar" :size="128"></vco-avatar>
                    <div class="delete-img" @click="deleteImg" @click.stop="form.avatar = ''">
                      <DeleteOutlined />
                      <p>{{ t('删除') }}</p>
                    </div>
                  </template>
                  <template v-else>
                    <div class="default">
                      <plus-outlined />
                      <div class="ant-upload-text">{{ t('头像') }}</div>
                    </div>
                  </template>
                </div>
              </vco-upload-modal>
            </div>
          </a-col>
          <a-col :span="24">
            <a-form-item :label="t('类型f')" name="type">
              <a-radio-group v-model:value="form.type">
                <a-radio :value="item.code" :key="item.code" v-for="item in orgsStore.stakeholderType">
                  {{ item.name }}
                </a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>

          <!-- 工作 -->
          <a-col :span="24" v-if="form.type">
            <a-form-item :label="t('工作')" name="job">
              <a-checkbox-group v-model:value="form.job">
                <a-checkbox :value="item.code" :key="item.code" v-for="item in orgsStore.jobs">
                  {{ item.name }}
                </a-checkbox>
              </a-checkbox-group>
            </a-form-item>
          </a-col>
          <!-- 个人相关信息 -->
          <template v-if="form.type == 20">
            <a-col :span="8">
              <a-form-item name="firstName" :label="t('名')">
                <a-input v-model:value="form.firstName" :placeholder="t('名')" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="middleName" :label="t('中间名')">
                <a-input v-model:value="form.middleName" :placeholder="t('中间名')" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="lastName" :label="t('姓')">
                <a-input v-model:value="form.lastName" :placeholder="t('姓')" />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item :label="t('身份证号码')" name="idcard">
                <a-input v-model:value="form.idcard" :placeholder="t('请输入')" />
              </a-form-item>
            </a-col>
          </template>

          <!-- 公司相关信息 -->
          <template v-if="form.type !== 20">
            <a-col :span="24">
              <a-form-item :label="t('公司名称f')" name="name">
                <vco-company-select v-model:name="form.name" :placeholder="t('请输入')" v-model:nzbn="form.nzbn" :show_nzbn="true" @change="getCompanyInfo"></vco-company-select>
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item :label="t('新西兰商业号码')" name="nzbn">
                <vco-company-select v-model:name="form.name" :placeholder="t('请输入')" v-model:nzbn="form.nzbn" :show_nzbn="true" @change="getCompanyInfo" :is_nzbn="true"></vco-company-select>
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item :label="t('联系人f')" name="contactName">
                <a-input v-model:value="form.contactName" :placeholder="t('请输入')" />
              </a-form-item>
            </a-col>
          </template>

          <!-- 公共 -->

          <!-- 邮箱 -->
          <a-col :span="18">
            <a-form-item name="email" :label="t('联系邮箱f')">
              <a-input v-model:value="form.email" :placeholder="t('请输入')" :disabled="!!email_ok" />
            </a-form-item>
          </a-col>
          <a-col :span="6" v-if="!verifyEmail.showCountdown">
            <a-form-item label=" ">
              <a-button v-if="!email_ok" @click="handleVerify(VERIFY_KEY.EMAIL)" type="dark" class="big verify-btn">
                {{ t('验证') }}
              </a-button>
              <a-button v-else-if="form.user_uuid !== check_user_uuid" @click="email_ok = false" type="dark" class="big verify-btn">
                {{ t('变更') }}
              </a-button>
              <a-button v-else @click="handleChange(VERIFY_KEY.EMAIL)" type="dark" class="big verify-btn">
                {{ t('变更') }}
              </a-button>
            </a-form-item>
          </a-col>
          <a-col :span="6" v-else>
            <a-form-item label=" ">
              <countdown v-model:show="verifyEmail.showCountdown" />
            </a-form-item>
          </a-col>
          <a-col :span="24" v-if="verifyEmail.showCode">
            <a-form-item :label="t('验证码V')" name="emailCode">
              <a-input v-model:value="form.emailCode" />
            </a-form-item>
          </a-col>
          <!-- ####################################### -->
          <!-- 电话 -->
          <a-col :span="18">
            <a-form-item :label="t('联系电话f')" name="mobile">
              <vco-mobile-input v-model:value="form.mobile" v-model:areaCode="form.pre" :disabled="!!mobile_ok"></vco-mobile-input>
            </a-form-item>
          </a-col>
          <a-col :span="6" v-if="!verifyMobile.showCountdown">
            <a-form-item label=" ">
              <a-button v-if="!mobile_ok" @click="handleVerify(VERIFY_KEY.MOBILE)" type="dark" class="big verify-btn">
                {{ t('验证') }}
              </a-button>
              <a-button v-else-if="form.user_uuid !== check_user_uuid" @click="mobile_ok = false" type="dark" class="big verify-btn">
                {{ t('变更') }}
              </a-button>
              <a-button v-else @click="handleChange(VERIFY_KEY.MOBILE)" type="dark" class="big verify-btn">
                {{ t('变更') }}
              </a-button>
            </a-form-item>
          </a-col>
          <a-col :span="6" v-else>
            <a-form-item label=" ">
              <countdown v-model:show="verifyMobile.showCountdown" />
            </a-form-item>
          </a-col>
          <a-col :span="24" v-if="verifyMobile.showCode">
            <a-form-item :label="t('验证码V')" name="mobileCode">
              <a-input v-model:value="form.mobileCode" />
            </a-form-item>
          </a-col>
          <!-- ####################################### -->
          <a-col :span="24" v-if="form.type != 20">
            <vco-address ref="vcoAddressRef" @change="setAddressInfo"></vco-address>
          </a-col>

          <a-col :span="24">
            <a-form-item :label="t('证件f')" name="document">
              <vco-upload-modal v-model:list="documentList" v-model:value="form.document"></vco-upload-modal>
              <div class="documents" v-for="(item, index) in documentList" :key="index">
                <vco-file-item :file="item" :showClose="true" @remove="remove(index)"></vco-file-item>
                <div>
                  <a-date-picker v-model:value="form.expire_time[index]" :format="selectDateFormat()" valueFormat="YYYY-MM-DD" />
                </div>
              </div>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item :label="t('背景f')" name="note">
              <a-textarea v-model:value="form.note" :auto-size="{ minRows: 4, maxRows: 5 }" :placeholder="t('请输入')" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <div class="mt-5 flex justify-end gap-5">
      <a-button type="grey" class="big shadow bold uppercase mb-5 mt-5" @click="visible = false">{{ t('取消') }}</a-button>

      <a-button type="dark" class="big shadow bold uppercase mb-5 mt-5" :loading="loading" @click="submit">{{ t('提交') }}</a-button>
    </div>
  </a-modal>

  <change-email v-model:open="verifyEmail.open" :title="t('编辑邮箱')" :email="form.email" :uuid="form.uuid" />
  <change-mobile v-model:open="verifyMobile.open" :mobile="form.mobile" :pre="form.pre" :uuid="form.uuid" :title="t('编辑手机号')" />
</template>

<script setup>
import { reactive, onMounted, ref, computed, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue';
import { useRouter } from 'vue-router';
import { useOrgsStore } from '@/store';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue';
import tool, { selectDateFormat, expireTimeDefault } from '@/utils/tool';
import { pick, trim, cloneDeep } from 'lodash';
import { VERIFY_KEY } from '@/constant';
import dayjs from 'dayjs';
import useFormData from '@/utils/use-form-data';
import countdown from '@/views/orgs/components/countdown.vue';
import changeEmail from '@/views/orgs/components/change-email.vue';
import changeMobile from '@/views/orgs/components/change-mobile.vue';
import { sendUnauthECode, sendUnauthCodeM, stakeAdd, stakeEdit } from '@/api/orgs/form';
import { applyBroker } from '@/api/tasks';
import { systemConfigData } from '@/api/system';

const router = useRouter();
const orgsStore = useOrgsStore();

const { t } = useI18n();

const visible = ref(false);
const formRef = ref();
const loading = ref(false);
const documentList = ref([]);
const isEdit = ref(false);
const check_user_uuid = ref('');
const vcoAddressRef = ref();
const emit = defineEmits(['update']);

const props = defineProps({
  detail: {
    type: Object
  },
  process__id: {
    type: [Number, String]
  }
});
// 表单数据
const { form, assignFields } = useFormData({
  //公司
  name: '',
  nzbn: '',
  contactName: '',
  // 个人
  user_uuid: '',
  firstName: '',
  middleName: '',
  lastName: '',
  job: [], //详情添加才会有
  //公共
  process__id: '', //编辑独有
  cid: [3], //分类ID
  type: '', //类型
  avatar: '',
  idcard: '', // 公司组织机构代码  人员 身份证
  email: '',
  emailCode: '',
  pre: '',
  mobile: '',
  mobileCode: '',
  province_code: '',
  city_code: '',
  district_code: '',
  addr: '',
  address: '',
  postal: '',
  document: [], //证件
  expire_time: [], //证件有效期
  note: '',
  suburb: '',
  province_code_name: '',
  con_id: ''
});

const mobile_ok = ref(0);
const email_ok = ref(0);

// 表单验证规则
const rules = reactive({
  // 公共验证
  mobile: [
    {
      pattern: /^\+?\d{1,15}$|^\(?\d+\)?[-.\s]?\d+([-.\s]?\d+)*$/,
      message: t('手机号') + t('格式不正确'),
      trigger: 'blur'
    }
  ],
  type: [
    {
      required: true,
      message: t('请选择') + t('类型f')
    }
  ],
  addr: [
    {
      required: true,
      message: t('请输入'),
      trigger: 'blur'
    }
  ]
});

// 根据条件动态生成的规则
const dynamicRules = computed(() => {
  // 个人相关验证
  if (form.type == 20) {
    return {
      ...rules,
      idcard: [
        {
          required: true,
          message: t('请输入') + t('身份证号码')
        }
      ],
      firstName: [
        {
          required: true,
          message: t('请输入') + t('名'),
          type: 'string',
          trigger: 'blur'
        }
      ],
      lastName: [
        {
          required: true,
          message: t('请输入') + t('姓'),
          type: 'string',
          trigger: 'blur'
        }
      ]
    };
  } else {
    return {
      ...rules,
      // 公司相关验证
      name: [
        {
          required: true,
          message: t('请输入') + t('公司名称f')
        }
      ],
      nzbn: [
        { required: true, message: t('请输入') + t('新西兰商业号码'), trigger: 'blur' },
        {
          pattern: /^[a-zA-Z0-9]+$/,
          message: t('新西兰商业号码') + t('格式不正确'),
          trigger: 'blur'
        }
      ],
      contactName: [
        {
          required: true,
          message: t('请输入') + t('联系人f')
        }
      ]
    };
  }
});

const verifyEmail = reactive({
  showCode: false,
  showCountdown: false,
  open: false
});

const verifyMobile = reactive({
  showCode: false,
  showCountdown: false,
  open: false
});

// 获取验证码
const handleVerify = (key) => {
  if (key === VERIFY_KEY.EMAIL) {
    if (!Boolean(form.email)) {
      message.warning(t('请输入') + t('邮箱'));
      return;
    }
    sendUnauthECode({ email: form.email }).then((res) => {
      verifyEmail.showCode = true;
      verifyEmail.showCountdown = true;
    });
  } else if (key === VERIFY_KEY.MOBILE) {
    if (!Boolean(form.mobile)) {
      message.warning(t('请输入') + t('手机号'));
      return;
    }
    sendUnauthCodeM({
      pre: form.pre,
      mobile: form.mobile
    }).then((res) => {
      verifyMobile.showCode = true;
      verifyMobile.showCountdown = true;
    });
  }
};

// 显示变更弹窗
const handleChange = (key) => {
  if (key === VERIFY_KEY.EMAIL) {
    verifyEmail.open = true;
  } else if (key === VERIFY_KEY.MOBILE) {
    verifyMobile.open = true;
  }
};

// 删除文件
const remove = (index) => {
  documentList.value.splice(index, 1);
  form.expire_time.splice(index, 1);
};

// 跟新地址信息
const setAddressInfo = (val) => {
  assignFields({ ...form, ...val });
};

// 提交
const submit = () => {
  formRef.value.validate().then(() => {
    let keys = ['cid', 'type', 'avatar', 'email', 'emailCode', 'pre', 'mobile', 'mobileCode', 'document', 'expire_time', 'note', 'job'];
    if (form.type == 20) {
      keys = keys.concat(['firstName', 'middleName', 'lastName', 'sendEmail', 'sendSms', 'user_uuid', 'idcard']);
    } else {
      keys = keys.concat(['name', 'nzbn', 'contactName', 'province_code', 'city_code', 'district_code', 'address', 'addr', 'postal', 'suburb', 'province_code_name', 'con_id']);
    }
    const newData = pick(form, keys);
    newData.user_uuid = check_user_uuid.value || form.user_uuid;

    newData.sendEmail = newData.sendEmail ? 1 : 0;
    newData.sendSms = newData.sendSms ? 1 : 0;
    if (form.type == 2 || form.type == 3) newData.idcard = '';
    newData.process__id = props.process__id;
    loading.value = true;
    applyBroker(newData)
      .then(() => {
        loading.value = false;
        message.success(t('添加成功'));
        visible.value = false;
        emit('update');
      })
      .catch(() => {
        loading.value = false;
      });
  });
};
const hasData = (data) => {
  if (data) {
    if (typeof data === 'string') {
      return !!data;
    } else if (data instanceof Array) {
      return data.length;
    } else {
      return Object.keys(data).length;
    }
  } else {
    return false;
  }
};

const getCompanyInfo = (val) => {
  form.email = val.email;
  form.pre = val.pre;
  form.mobile = val.mobile;
  vcoAddressRef.value.init(val);
};

onMounted(() => {
  // 加载分类
  orgsStore.getStakeholderType();
  systemConfigData({ pcode: 'web_config', code: 'broker_value' }).then((res) => {
    form.cid = res.broker_value ? [res.broker_value] : [3];
  });
});

const initJob = (val) => {
  switch (val) {
    case 20:
      orgsStore.getJob('stakeholder_job2');
      break;
    case 1:
    case 2:
    case 4:
      orgsStore.getJob('stakeholder_job');
      break;
    case 3:
      orgsStore.getJob('stakeholder_job1');
      break;
  }
};
// 监听重置idcard 公用字段  获取job 选项
watch(
  () => form.type, // getter 函数返回一个数组
  (val, old) => {
    if (old) {
      if ((old == 20 && val < 20) || (old !== 20 && val == 20)) {
        form.idcard = '';
      }
      form.job = [];
    }
    initJob(val);

    if (val != 20) {
      nextTick(() => {
        if (vcoAddressRef.value) {
          vcoAddressRef.value.init(form);
        }
      });
    }
  },
  { immediate: true }
);

watch(
  () => props.detail,
  (val) => {
    if (trim(val)) {
      const data = cloneDeep(val);
      isEdit.value = true;
      if (!hasData(data.expire_time)) {
        data.expire_time = [];
      } else if (typeof data.expire_time === 'string') {
        data.expire_time = data.expire_time.split(',');
      }
      data.province_code += '';
      data.city_code += '';
      data.district_code += '';
      data.document = data.document ? data.document : [];
      data.job = data.job ? data.job : [];
      documentList.value = data.document;
      assignFields({
        ...data
      });
      if (form.type != 20) {
        nextTick(() => {
          vcoAddressRef.value.init(form);
        });
      }
      mobile_ok.value = val.mobile_ok;
      email_ok.value = val.email_ok;
    }
  },
  { immediate: true, deep: true }
);

watch(
  () => documentList.value,
  (val) => {
    form.expire_time = expireTimeDefault(documentList.value.length, form.expire_time);
  },
  { immediate: true, deep: true }
);

const init = () => {
  visible.value = true;
};
</script>

<style scoped lang="less">
@import '@/styles/variables.less';
.verify-btn {
  min-width: 100%;
}

.ant-checkbox-group > .ant-checkbox-wrapper:not(:last-child) {
  margin-bottom: 0;
}

.documents {
  margin-top: 20px;
  .document-name {
    margin: 15px 0 10px;
  }
}

.avatarBox {
  position: relative;
  width: 128px;
  height: 128px;
  cursor: pointer;
  .default {
    width: 100%;
    height: 100%;
    border: 1px dashed #282828;
    box-sizing: border-box;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-size: 14px;
    &:hover {
      border-color: @colorPrimary !important;
    }
  }
  .anticon-loading,
  .anticon-plus {
    font-size: 18px;
  }
  .delete-img {
    background-color: rgba(0, 0, 0, 0.45);
    position: absolute;
    top: 1px;
    left: 1px;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: rgba(255, 255, 255, 0.7);
    &:hover {
      color: rgba(255, 255, 255, 1);
      .anticon-delete {
        color: rgba(255, 255, 255, 1);
      }
    }
    .anticon-delete {
      font-size: 17px;
      color: rgba(255, 255, 255, 0.8);
    }
    p {
      font-size: 13px;
      margin-top: 5px;
    }
  }
}
</style>
