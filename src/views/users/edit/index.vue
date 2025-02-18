<template>
  <div class="TabsPanel">
    <vco-page-panel :title="userInfo?.user_name + '` ' + t('用户中心')" :isBack="true"></vco-page-panel>
    <div class="profile-container">
      <div class="profile-info">
        <div class="profile-info-header">
          <div class="avatar">
            <vco-avatar :size="110" style="margin: auto" :src="userInfo?.avatar" />
          </div>
          <div class="info-detail">
            <p v-for="(info, index) in baseInfo" :key="index">
              <span class="label">
                <i :class="`iconfont ${info.isVerify ? 'iconfont_yellow' : ''}`" v-html="info.icon" v-if="info.icon" />
                {{ info.label }}:
              </span>
              <span class="value">{{ info.value }}</span>
            </p>
          </div>
        </div>
        <div class="profile-info-detail">
          <p v-for="(info, index) in extraInfo" :key="index">
            <span class="label">
              <i class="iconfont text-2xl" v-html="info.icon" v-if="info.icon" />
              &nbsp;
            </span>
            <span class="detail">
              {{ info.value }}
            </span>
          </p>
        </div>
      </div>
      <div class="profile-content sys-form-content">
        <a-form ref="formRef" :model="form" :rules="rules" layout="vertical">
          <a-row>
            <a-col :span="6" :offset="9">
              <a-form-item name="avatar" class="avatar-form-item">
                <vco-upload-image v-model:value="form.avatar" text="头像" :isAvatar="true"></vco-upload-image>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="8">
            <a-col :span="24">
              <a-form-item :label="t('类型')" name="type">
                <a-select v-model:value="form.type" :placeholder="t('类型')">
                  <a-select-option :value="0">
                    {{ t('个人') }}
                  </a-select-option>
                  <a-select-option :value="1">
                    {{ t('公司') }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>

            <template v-if="form.type">
              <a-col :span="24">
                <a-form-item name="user_name" :label="t('名称')">
                  <a-input v-model:value="form.user_name" :placeholder="t('名称')" />
                </a-form-item>
              </a-col>
            </template>
            <template v-else>
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
            </template>
          </a-row>
          <a-form-item name="email" :label="t('邮箱')">
            <a-input v-model:value="form.email" :placeholder="t('邮箱')" :disabled="true" />
          </a-form-item>
          <a-form-item :label="t('手机号')" name="mobile">
            <vco-mobile-input v-model:value="form.mobile" v-model:areaCode="form.pre" :disabled="true"></vco-mobile-input>
          </a-form-item>
          <a-row>
            <a-col :span="6" :offset="9">
              <a-button size="large" type="cyan" :loading="loading" class="register-btn big shadow bold" @click="save">
                {{ t('提交') }}
              </a-button>
            </a-col>
          </a-row>
        </a-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { getUserInfo, editUser } from '@/api/users';
import { useRoute } from 'vue-router';
import useFormData from '@/utils/use-form-data';
import { EMAIL_RULE } from '@/constant';
import { goBack } from '@/utils/tool';
import { message } from 'ant-design-vue';

const { t } = useI18n();
const route = useRoute();

const baseInfo = ref();
const extraInfo = ref();
const userInfo = ref();
const formRef = ref(null);
const loading = ref(false);

const { form, assignFields } = useFormData({
  uuid: '',
  avatar: '',
  firstName: '',
  middleName: '',
  lastName: '',
  email: '',
  pre: '64',
  mobile: '',
  type: 0,
  company: '',
  user_name: ''
});

// 表单验证规则
const rules = reactive({
  user_name: [
    {
      required: true,
      message: t('请输入') + t('名称'),
      type: 'string',
      trigger: 'blur'
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
  ],
  email: [
    {
      required: true,
      message: t('请输入') + t('邮箱'),
      type: 'string',
      trigger: 'blur'
    },
    {
      pattern: EMAIL_RULE,
      message: t('邮箱格式不正确')
    }
  ],
  mobile: [
    {
      required: true,
      message: t('请输入') + t('手机号'),
      type: 'string',
      trigger: 'blur'
    }
  ]
});

const setInfoCard = (data) => {
  const { username, email, email_ok, pre, mobile, mobile_ok, user_name, roles } = data;
  const _baseInfo = [
    {
      label: 'ID',
      value: username
    },
    {
      icon: '&#xe73b;',
      label: t('名字'),
      value: user_name
    },
    {
      icon: '&#xe66f;',
      label: t('邮箱'),
      value: email,
      isVerify: !!email_ok
    },
    {
      icon: '&#xe61d;',
      label: t('手机号'),
      value: `+${pre} ${mobile}`,
      isVerify: !!mobile_ok
    }
  ];
  const _extraInfo = [
    {
      icon: '&#xe8db;',
      value: roles.join(' ')
    }
  ];
  baseInfo.value = _baseInfo;
  extraInfo.value = _extraInfo;
};

const getUserDetail = (userId) => {
  const uuid = userId || route.query.uuid;
  if (uuid) {
    getUserInfo({ uuid }).then((res) => {
      userInfo.value = res;
      setInfoCard(res);
      !userId && assignFields(res);
    });
  }
};

onMounted(() => {
  getUserDetail();
});

const save = () => {
  formRef.value.validate().then(() => {
    loading.value = true;
    editUser({
      ...form,
      company: form.type ? form.user_name : '',
      user_name: form.type ? form.user_name : '',
      email: undefined,
      pre: undefined,
      mobile: undefined
    })
      .then(() => {
        loading.value = false;
        getUserDetail(form.uuid);
        message.success(t('修改成功'));
      })
      .catch(() => {
        loading.value = false;
      });
  });
};
</script>

<style scoped lang="less">
@import '@/styles/variables.less';

.TabsPanel {
  position: relative;
  .back-link {
    position: absolute;
    top: -30px;
    left: -15px;
    font-weight: 400;

    &-icon {
      transform: rotate(-135deg);
    }
    :deep(.iconfont) {
      font-size: 12px;
    }
  }
  .Panel {
    // display: grid;
    // grid-template-columns: 1fr auto;
    margin-bottom: 40px;
    padding-bottom: 16px;
    border-bottom: 1px solid grey;

    .Panel-Avatar {
      flex-shrink: 0;
    }

    .Panel-Title {
      font-size: @fs_2xl;
      font-weight: bold;
      width: 100%;
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 12px;
    }

    .Tag {
      display: inline-flex;
      align-items: center;
      gap: 6.8px;
      height: 30px;
      padding: 10.2px 20.4px;
      border-radius: 37.4px;

      font-weight: 500;
      font-size: 14px;
      line-height: 2;
      letter-spacing: 1px;
      text-transform: uppercase;
      white-space: nowrap;
      padding: 15px 30px;
      background-color: @clr_charcoal;
      color: @clr_white;

      border-radius: 0 16px 16px 0;
      overflow: hidden;
    }
  }

  .profile-container {
    position: relative;
    display: grid;
    grid-template-columns: 315px 1fr;
    gap: 24px;
    align-items: flex-start;

    .profile-info {
      overflow: hidden;
      background-color: #faf9f9;
      border-radius: 12px;

      &-header {
        padding: 30px;
        border-bottom: 1px solid @color_mist;

        .avatar {
          width: 100%;
        }

        .info-detail {
          margin-top: 16px;
        }
      }

      &-detail {
        padding: 30px;
      }

      .label {
        color: @color_grey;
        font-weight: 500;
      }

      .value {
        font-weight: 500;
      }

      .iconfont_yellow {
        color: @clr_yellow;
      }
    }

    .profile-content {
      background-color: #faf9f9;
      border-radius: 12px;
      padding: 30px;
    }
  }
}
</style>
