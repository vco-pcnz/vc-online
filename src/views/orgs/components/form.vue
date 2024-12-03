<template>
  <div>
    <div class="sys-form-content mt-5">
      <a-form ref="formRef" :model="form" :rules="dynamicRules" layout="vertical">
        <a-row :gutter="24">
          <a-col :span="24" class="avatar-box">
            <div>
              <vco-upload v-model:value="form.avatar" text="上传头像"></vco-upload>
            </div>
          </a-col>
          <template v-if="!isAddMember">
            <a-col :span="24">
              <a-form-item :label="t('分类f')" name="cid">
                <a-checkbox-group v-model:value="form.cid">
                  <a-checkbox v-for="item in orgsStore.category" :key="item.id" :value="item.id">
                    {{ item.name }}
                  </a-checkbox>
                </a-checkbox-group>
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item :label="t('类型f')" name="type">
                <a-radio-group v-model:value="form.type">
                  <a-radio :value="item.code" :key="item.code" v-for="item in orgsStore.stakeholderTypet">
                    {{ item.name }}
                  </a-radio>
                </a-radio-group>
              </a-form-item>
            </a-col>
          </template>

          <!-- 个人相关信息 -->
          <template v-if="form.type == 4">
            <a-col :span="24">
              <a-form-item :label="t('选择用户')">
                <vco-choose-user ref="vcoChooseUserRef" :showRest="!!check_user_uuid" @change="checkUser"></vco-choose-user>
              </a-form-item>
            </a-col>
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
              <a-form-item :label="t('工作')" name="job">
                <a-radio-group v-model:value="form.job">
                  <a-radio :value="item.code" :key="item.code" v-for="item in jobs">
                    {{ item.name }}
                  </a-radio>
                </a-radio-group>
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item :label="t('身份证号码')" name="idcard">
                <a-input v-model:value="form.idcard" :placeholder="t('请输入')" />
              </a-form-item>
            </a-col>
          </template>
          <!-- 公司相关信息 -->
          <template v-else>
            <a-col :span="24">
              <a-form-item :label="t('公司名称f')" name="name">
                <a-input v-model:value="form.name" :placeholder="t('请输入')" />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item label="NZBZ" name="nzbz">
                <a-input v-model:value="form.nzbz" :placeholder="t('请输入')" />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item :label="t('联系人f')" name="contactName">
                <a-input v-model:value="form.contactName" :placeholder="t('请输入')" />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item :label="t('组织机构代码f')" name="idcard">
                <a-input v-model:value="form.idcard" :placeholder="t('请输入')" />
              </a-form-item>
            </a-col>
          </template>

          <!-- 公共 -->

          <!-- 邮箱 -->
          <a-col :span="20">
            <a-form-item name="email" :label="t('联系邮箱f')">
              <a-input v-model:value="form.email" :placeholder="t('请输入')" :disabled="!!email_ok" />
            </a-form-item>
          </a-col>
          <a-col :span="4" v-if="!verifyEmail.showCountdown">
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
          <a-col :span="4" v-else>
            <a-form-item label=" ">
              <countdown v-model:show="verifyEmail.showCountdown" />
            </a-form-item>
          </a-col>
          <a-col :span="24" v-if="verifyEmail.showCode">
            <a-form-item label="邮箱验证码" name="emailCode">
              <a-input v-model:value="form.emailCode" />
            </a-form-item>
          </a-col>
          <!-- ####################################### -->
          <!-- 电话 -->
          <a-col :span="20">
            <a-form-item :label="t('联系电话f')" name="mobile">
              <vco-mobile-input v-model:value="form.mobile" v-model:areaCode="form.pre" :disabled="!!mobile_ok"></vco-mobile-input>
            </a-form-item>
          </a-col>
          <a-col :span="4" v-if="!verifyMobile.showCountdown">
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
          <a-col :span="4" v-else>
            <a-form-item label=" ">
              <countdown v-model:show="verifyMobile.showCountdown" />
            </a-form-item>
          </a-col>
          <a-col :span="24" v-if="verifyMobile.showCode">
            <a-form-item label="手机验证码" name="mobileCode">
              <a-input v-model:value="form.mobileCode" />
            </a-form-item>
          </a-col>
          <!-- ####################################### -->
          <template v-if="form.type != 4">
            <a-col :span="12">
              <a-form-item :label="t('地址')" name="address">
                <a-input v-model:value="form.address" :placeholder="t('请输入')" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label=" " name="province_code">
                <vco-address-select v-model:value="region"></vco-address-select>
              </a-form-item>
            </a-col>
          </template>

          <a-col :span="24">
            <a-form-item :label="t('证件f')" name="document">
              <vco-upload-modal v-model:list="documentList" v-model:value="form.document"></vco-upload-modal>
              <div class="documents" v-for="(item, index) in documentList" :key="index">
                <vco-file-item :file="item" :showClose="true" @remove="remove(index)"></vco-file-item>
                <div>
                  <a-date-picker v-model:value="form.expire_time[index]" format="YYYY/MM/DD" valueFormat="YYYY-MM-DD" />
                </div>
              </div>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item :label="t('背景f')" name="note">
              <a-textarea v-model:value="form.note" :auto-size="{ minRows: 4, maxRows: 5 }" :placeholder="t('请输入')" />
            </a-form-item>
          </a-col>
          <!-- 邀请 -->
          <a-col :span="24">
            <a-form-item :label="t('邀请')" name="verifyMode" v-if="!isEdit && form.type == 4 && !check_user_uuid">
              <a-row>
                <a-col :span="12">
                  <a-form-item-rest>
                    <a-checkbox v-model:checked="form.sendEmail">
                      {{ t('发送邀请邮件') }}
                    </a-checkbox>
                  </a-form-item-rest>
                </a-col>
                <a-col :span="12">
                  <a-form-item-rest>
                    <a-checkbox v-model:checked="form.sendSms">
                      {{ t('发送邀请短信') }}
                    </a-checkbox>
                  </a-form-item-rest>
                </a-col>
              </a-row>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <div class="flex mt-5 items-end gap-20 justify-center">
      <a-button type="cyan" shape="round" class="big shadow bold uppercase" :loading="loading" @click="submit">
        {{ t('提交') }}
      </a-button>

      <change-email v-model:open="verifyEmail.open" :title="t('编辑邮箱')" :email="form.email" :uuid="form.uuid" />
      <change-mobile v-model:open="verifyMobile.open" :mobile="form.mobile" :pre="form.pre" :uuid="form.uuid" :title="t('编辑手机号')" />
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted, ref, computed, watch } from 'vue';
import useFormData from '@/utils/use-form-data';
import { preMobileOpts, EMAIL_RULE, VERIFY_KEY } from '@/constant';
import { useI18n } from 'vue-i18n';
import { sendUnauthECode, sendUnauthCodeM, getStakeholderJob, stakeAdd, stakeEdit } from '@/api/orgs/form';

import countdown from './countdown.vue';
import changeEmail from './change-email.vue';
import changeMobile from './change-mobile.vue';
import dayjs from 'dayjs';
import { useOrgsStore, useOrgsDetailStore } from '@/store';
import { pick, trim, cloneDeep } from 'lodash';
import { useRoute, useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { useOrgsFormStore } from '@/store';
const orgsFormStore = useOrgsFormStore();
const route = useRoute();
const router = useRouter();

const { t } = useI18n();
const orgsStore = useOrgsStore();
const orgsDetailStore = useOrgsDetailStore();
const formRef = ref();
const jobs = ref([]);
const region = ref();
const loading = ref(false);
const documentList = ref([]);
const isAddMember = ref(false);
const isEdit = ref(false);
const check_user_uuid = ref('');
// 表单数据
const { form, assignFields } = useFormData({
  //公司
  name: '',
  nzbz: '',
  contactName: '',
  // 个人
  user_uuid: '',
  firstName: '',
  middleName: '',
  lastName: '',
  sendEmail: false, //发送邮箱邀请
  sendSms: false, //发送手机邀请
  job: '', //详情添加才会有
  //公共
  uuid: '', //编辑独有
  p_uuid: '', //上级uuid  详情添加必传
  cid: [], //分类ID
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
  address: '',
  document: [], //证件
  expire_time: [], //证件有效期
  note: ''
});

const mobile_ok = ref(0);
const email_ok = ref(0);

// 表单验证规则
const rules = reactive({
  // 公共验证
  idcard: [
    {
      required: true,
      message: t('请输入') + t('组织机构代码f')
    }
    // {
    //   pattern: /^[A-Z0-9]+$/,
    //   message: t('组织机构代码f') + t('格式不正确'),
    //   trigger: 'blur',
    // },
  ],
  mobile: [
    {
      pattern: /^\+?[1-9]\d{1,14}$|^\(?\d+\)?[-.\s]?\d+([-.\s]?\d+)*$/,
      message: t('手机号') + t('格式不正确'),
      trigger: 'blur'
    }
  ],
  // email: [
  //   {
  //     pattern: /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/,
  //     message: t('邮箱') + t('格式不正确'),
  //     trigger: 'blur'
  //   }
  // ],
  type: [
    {
      required: true,
      message: t('请选择') + t('类型f')
    }
  ]
});

// 根据条件动态生成的规则
const dynamicRules = computed(() => {
  // 个人相关验证
  if (form.type == 4) {
    return {
      ...rules,
      idcard: [
        {
          required: true,
          message: t('请输入') + t('身份证号码')
        }
        // {
        //   pattern: /^[A-Z0-9]+$/,
        //   message: t('身份证号码') + t('格式不正确'),
        //   trigger: 'blur'
        // }
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
      nzbz: [
        {
          required: true,
          message: t('请输入') + 'NZBZ'
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
    sendUnauthECode({ email: form.email });
    verifyEmail.showCode = true;
    verifyEmail.showCountdown = true;
  } else if (key === VERIFY_KEY.MOBILE) {
    sendUnauthCodeM({
      pre: form.pre,
      mobile: form.mobile
    });
    verifyMobile.showCode = true;
    verifyMobile.showCountdown = true;
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
// 选择用户
const checkUser = (val) => {
  let keys = ['avatar', 'idcard', 'email', 'emailCode', 'pre', 'mobile', 'mobileCode', 'province_code', 'city_code', 'district_code', 'address', 'document', 'expire_time', 'note', 'firstName', 'middleName', 'lastName'];
  const newData = pick(val, keys);

  check_user_uuid.value = val.uuid;
  Object.assign(form, newData);
  mobile_ok.value = val.mobile_ok;
  email_ok.value = val.email_ok;
};

// 提交
const submit = () => {
  // if (!trim(form.avatar)) {
  //   message.warning(t('请上传头像'));
  //   return;
  // }
  formRef.value.validate().then(() => {
    let keys = ['cid', 'type', 'avatar', 'idcard', 'email', 'emailCode', 'pre', 'mobile', 'mobileCode', 'document', 'expire_time', 'note'];
    if (form.type == 4) {
      keys = keys.concat(['firstName', 'middleName', 'lastName', 'job', 'sendEmail', 'sendSms', 'user_uuid']);
    } else {
      keys = keys.concat(['name', 'nzbz', 'contactName', 'province_code', 'city_code', 'district_code', 'address']);
    }
    const newData = pick(form, keys);
    if (form.type == 4) {
      newData.user_uuid = check_user_uuid.value || form.user_uuid;

      newData.sendEmail = newData.sendEmail ? 1 : 0;
      newData.sendSms = newData.sendSms ? 1 : 0;
    }
    loading.value = true;
    if (!form.uuid) {
      newData['p_uuid'] = orgsFormStore.p_uuid;
      stakeAdd(newData)
        .then(() => {
          loading.value = false;
          message.success(t('添加成功'));
          router.back();
        })
        .catch(() => {
          loading.value = false;
        });
    } else {
      newData['uuid'] = form.uuid;
      stakeEdit(newData)
        .then(() => {
          orgsDetailStore.setDetail(orgsFormStore.uuid);
          loading.value = false;
          message.success(t('修改成功'));
        })
        .catch(() => {
          loading.value = false;
        });
    }
  });
};
onMounted(() => {
  // 加载分类
  orgsStore.getCategory();
  // 加载分类
  orgsStore.getStakeholderTypet();
  // 加载工作
  getStakeholderJob().then((res) => {
    jobs.value = res;
  });
  isAddMember.value = orgsFormStore.isAddMember;
  if (isAddMember.value) {
    form.type = 4;
  }
});

// 监听重置idcard 公用字段
watch(
  () => form.type,
  (val, old) => {
    if (old) {
      if ((old == 4 && val < 4) || (old !== 4 && val == 4)) {
        form.idcard = '';
      }
    }
  }
);

// 监听地址选择组件赋值
watch(
  () => region.value,
  (val) => {
    let arr = region.value.split(',');
    form.province_code = arr[0] || '';
    form.city_code = arr[1] || '';
    form.district_code = arr[2] || '';
  }
);
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
watch(
  () => orgsDetailStore.detail,
  (val) => {
    if (val) {
      const data = cloneDeep(val);
      if (orgsFormStore.isEdit && data) {
        isEdit.value = true;
        form.uuid = orgsFormStore.uuid;
        documentList.value = data.document ? data.documen : [];
        if (!hasData(data.expire_time)) {
          data.expire_time = [];
        } else if (typeof data.expire_time === 'string') {
          data.expire_time = data.expire_time.split(',');
        }

        data.province_code += '';
        data.city_code += '';
        data.district_code += '';
        data.sendEmail = data.sendEmail ? true : false;
        data.sendSms = data.sendSms ? true : false;
        assignFields({
          ...data
        });
        region.value = [data.province_code, data.city_code, data.district_code].filter((item) => item).join(',');
        mobile_ok.value = val.mobile_ok;
        email_ok.value = val.email_ok;
      }
    }
  },
  { immediate: true, deep: true }
);
</script>

<style scoped lang="less">
@import '@/styles/variables.less';
.verify-btn {
  min-width: 100%;
}

.ant-checkbox-group > .ant-checkbox-wrapper:not(:last-child) {
  margin-bottom: 0;
}

// 头像上传样式重置
.avatar-box {
  display: flex;
  justify-content: center;
  padding: 20px 0 50px;

  :deep(.images-uploader) {
    .ant-upload {
      width: 128px !important;
      height: 128px !important;
      border-color: #282828 !important;
      border-radius: 50%;

      &:hover {
        border-color: @colorPrimary !important;
      }

      img {
        width: 100% !important;
        height: 100% !important;
      }
    }

    .delete-img {
      display: none !important;
    }
  }
}

.documents {
  margin-top: 20px;
  .document-name {
    margin: 15px 0 10px;
  }
}
</style>
