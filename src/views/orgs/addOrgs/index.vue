<template>
  <div class="addOrgsWrapper">
    <div class="addOrgsWrapper-left"></div>
    <div class="addOrgsWrapper-right">
      <div class="sys-form-content mt-5">
        <a-form ref="formRef" :model="form" :rules="rules" layout="vertical">
          <a-row :gutter="24">
            <a-col :span="24" class="avatar-box">
              <vco-upload-image v-model="form.avatar" :text="t('上传头像')"></vco-upload-image>
            </a-col>
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
                <a-radio-group v-model:value="form.type" name="type">
                  <a-radio :value="item.code" :key="item.code" v-for="item in orgsStore.stakeholderTypet">{{ item.name }}</a-radio>
                </a-radio-group>
              </a-form-item>
            </a-col>
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
              <a-form-item :label="t('组织机构代码f')" name="idcard">
                <a-input v-model:value="form.idcard" :placeholder="t('请输入')" />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item :label="t('联系人f')" name="contactName">
                <a-input v-model:value="form.contactName" :placeholder="t('请输入')" />
              </a-form-item>
            </a-col>

            <a-col :span="20">
              <a-form-item name="email" :label="t('联系邮箱f')">
                <a-input v-model:value="form.email" :placeholder="t('请输入')" :disabled="false" />
              </a-form-item>
            </a-col>
            <a-col :span="4" v-if="!verifyEmail.showCountdown">
              <a-form-item label=" ">
                <a-button v-if="true" @click="handleVerify(VERIFY_KEY.EMAIL)" type="dark" class="big verify-btn">
                  {{ t('验证') }}
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
            <a-col :span="20">
              <a-form-item :label="t('联系电话f')" name="mobile">
                <vco-mobile-input v-model:value="form.mobile" v-model:areaCode="form.pre" :disabled="false"> </vco-mobile-input>
              </a-form-item>
            </a-col>
            <a-col :span="4" v-if="!verifyMobile.showCountdown">
              <a-form-item label=" ">
                <a-button v-if="true" @click="handleVerify(VERIFY_KEY.MOBILE)" type="dark" class="big verify-btn">
                  {{ t('验证') }}
                </a-button>
                <a-button v-else @click="handleChange(VERIFY_KEY.MOBILE)" type="dark" class="big verify-btn">
                  {{ t('变更') }}
                </a-button>
              </a-form-item>
            </a-col>
            <a-col :span="4" v-else>
              <a-form-item-rest>
                <countdown v-model:show="verifyMobile.showCountdown" />
              </a-form-item-rest>
            </a-col>
            <a-col :span="24" v-if="verifyMobile.showCode">
              <a-form-item label="手机验证码" name="mobileCode">
                <a-input v-model:value="form.mobileCode" />
              </a-form-item>
            </a-col>
            <a-col :span="4">
              <a-form-item label="province" name="province_code">
                <a-input v-model:value="form.province_code" />
              </a-form-item>
            </a-col>
            <a-col :span="4">
              <a-form-item label="city" name="city_code">
                <a-input v-model:value="form.city_code" />
              </a-form-item>
            </a-col>
            <a-col :span="4">
              <a-form-item label="district" name="district_code">
                <a-input v-model:value="form.district_code" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="Address" name="address">
                <a-input v-model:value="form.address" :placeholder="t('请输入')" />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item :label="t('证件f')" name="document">
                <a-input v-model:value="form.document" />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item :label="t('证件有效期f')" name="expire_time">
                <a-date-picker v-model:value="form.expire_time" format="YYYY/MM/DD" valueFormat="YYYY-MM-DD" />
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
      <div class="flex mt-5 items-end gap-20 justify-between">
        <a-button type="dark" shape="round" class="big shadow bold uppercase" @click="submit">{{ t('提交') }}</a-button>
      </div>
    </div>

    <change-email v-model:open="verifyEmail.open" :title="t('编辑邮箱')" :email="form.email" />
    <change-mobile v-model:open="verifyMobile.open" :title="t('编辑手机号')" />
  </div>
</template>

<script setup>
import { reactive, onMounted, ref } from 'vue';
import useFormData from '@/utils/use-form-data';
import { preMobileOpts, EMAIL_RULE, VERIFY_KEY } from '@/constant';
import { useI18n } from 'vue-i18n';
import { useOrgsStore } from '@/store';
import { sendUnauthECode, sendUnauthCodeM } from '@/api/orgs/form';
import countdown from './components/countdown.vue';
import changeEmail from './components/change-email.vue';
import changeMobile from './components/change-mobile.vue';
import dayjs from 'dayjs';

const { t } = useI18n();
const orgsStore = useOrgsStore();
const formRef = ref();

// 表单数据
const { form, assignFields } = useFormData({
  avatar: '',
  cid: [], //分类ID
  p_uuid: '', //上级uuid
  type: '', //类型
  name: '',
  nzbz: '',
  idcard: '', //组织机构代码
  contactName: '',
  email: '',
  emailCode: '',
  pre: '',
  mobile: '',
  mobileCode: '',
  province_code: '2066',
  city_code: '2091',
  district_code: '2100',
  address: '',
  document: ['http://vco.com/uploads/temp/20240914/66e53267d2cce.png'], //证件
  expire_time: '', //证件有效期
  note: '',
});

// 表单验证规则
const rules = reactive({
  cid: [
    {
      required: true,
      message: t('请选择') + t('分类f'),
    },
  ],
  type: [
    {
      required: true,
      message: t('请选择') + t('类型f'),
    },
  ],
  name: [
    {
      required: true,
      message: t('请输入') + t('公司名称f'),
    },
  ],
  nzbz: [
    {
      required: true,
      message: t('请输入') + t('NZBZ'),
    },
  ],
  idcard: [
    {
      required: true,
      message: t('请输入') + t('组织机构代码f'),
    },
  ],
  contactName: [
    {
      required: true,
      message: t('请输入') + t('联系人f'),
    },
  ],
  document: [
    {
      required: true,
      message: t('请上传') + t('证件f'),
    },
  ],
  expire_time: [
    {
      required: true,
      message: t('请选择') + t('证件有效期f'),
    },
  ],
});

const verifyEmail = reactive({
  showCode: false,
  showCountdown: false,
  open: false,
});

const verifyMobile = reactive({
  showCode: false,
  showCountdown: false,
  open: false,
});

// 获取验证码
const handleVerify = key => {
  if (key === VERIFY_KEY.EMAIL) {
    sendUnauthECode({ email: form.email });
    verifyEmail.showCode = true;
    verifyEmail.showCountdown = true;
  } else if (key === VERIFY_KEY.MOBILE) {
    sendUnauthCodeM({
      pre: form.pre,
      mobile: form.mobile,
    });
    verifyMobile.showCode = true;
    verifyMobile.showCountdown = true;
  }
};

// 显示变更弹窗
const handleChange = key => {
  if (key === VERIFY_KEY.EMAIL) {
    verifyEmail.open = true;
  } else if (key === VERIFY_KEY.MOBILE) {
    verifyMobile.open = true;
  }
};
// 提交
const submit = () => {
  console.log(form);
  formRef.value.validate().then(() => {
    console.log(form);
    // loading.value = true;
    // const newData = {
    //   ...form,
    //   now_email: form.email,
    //   now_pre: form.pre,
    //   now_mobile: form.mobile,
    //   email: undefined,
    //   pre: undefined,
    //   mobile: undefined,
    // };
    // modifyUserInfo(newData)
    //   .then(() => {
    //     loading.value = false;
    //     message.success(t("修改成功"));
    //     userDetailStore.getUserInfo();
    //     reset();
    //   })
    //   .catch(() => {
    //     loading.value = false;
    //   });
  });
};
onMounted(() => {
  // 加载分类
  orgsStore.getCategory();
  // 加载分类
  orgsStore.getStakeholderTypet();
});
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';
.verify-btn {
  min-width: 100%;
}
.addOrgsWrapper {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  .addOrgsWrapper-left {
    flex: 0 0 400px;
    background-color: #faf9f9;
    border-radius: 12px;
  }
  .addOrgsWrapper-right {
    flex: 1;
    background-color: #faf9f9;
    border-radius: 12px;
    padding: 30px;
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
      }
      .delete-img {
        display: none !important;
      }
    }
  }
}
</style>
