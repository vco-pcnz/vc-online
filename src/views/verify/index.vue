a
<template>
  <auth-template>
    <template #header>
      <router-link to="/login">
        <!-- <a-button type="cyan" shape="round">{{ t('登录') }}</a-button> -->
      </router-link>
    </template>
    <template #content>
      <div class="login_content">
        <div class="login_form_title"></div>
        <!-- <div style="color: #fff">{{ userStore.smsVerify }}</div> -->
        <a-spin size="large" :spinning="false" wrapperClassName="loginFormLoading">
          <div class="verification-code-container">
            <div class="verification-box">
              <router-link to="/login" class="back-link" tabindex="-1">
                <div class="back-link-icon">
                  <i class="iconfont">&#xe794;</i>
                </div>
              </router-link>
              <h2 class="title">{{ t('安全验证') }}</h2>
              <div>
                <p>{{ t('系统刚刚将4位的验证码发送到: {0}', [smsType == 1 ? userStore?.smsVerify?.mobile : userStore?.smsVerify?.email]) }}</p>
                <div class="flex justify-end" v-if="userStore?.smsVerify?.can_email && userStore?.smsVerify?.can_mobile">
                  <div @click="changeType">
                    <a href="javascript:void(0);">{{ smsType == 0 ? t('短信验证') : t('邮箱验证') }}</a>
                  </div>
                </div>
              </div>
              <!-- <div v-if="userStore?.smsVerify?.can_email && userStore?.smsVerify?.can_mobile">
                <div style="color: rgba(0, 0, 0, 0.5); font-size: 12px; margin-bottom: 3px">{{ t('验证方式') }}</div>
                <a-radio-group v-model:value="smsType" class="login_mode_radio" @change="changeType">
                  <a-radio v-if="userStore?.smsVerify?.can_email" :value="1">
                    {{ t('邮箱') }}
                  </a-radio>
                  <a-radio v-if="userStore?.smsVerify?.can_mobile" :value="2">
                    {{ t('手机') }}
                  </a-radio>
                </a-radio-group>
              </div> -->

              <!-- <a-select style="width: 100%" v-model:value="smsType" @change="changeType" v-if="userStore?.smsVerify?.can_email && userStore?.smsVerify?.can_mobile">
                <a-select-option :value="1"> {{ t('邮箱') }}</a-select-option>
                <a-select-option :value="2"> {{ t('手机') }}</a-select-option>
              </a-select> -->

              <!-- <a-button type="primary" class="mt-5" block :loading="loading" v-if="!userStore?.smsVerify?.mobile_do && !userStore?.smsVerify?.email_do">
                <a href="javascript:void(0);" v-if="!showCountdown" @click="resendCode">{{ t('发送验证码1') }}</a>
                <div v-else><vco-countdown v-model:show="showCountdown" class="login_countdown" /><a href="javascript:void(0);">s</a></div>
              </a-button> -->

              <template v-if="userStore?.smsVerify?.mobile_do || userStore?.smsVerify?.email_do">
                <div class="code-inputs">
                  <a-input
                    v-for="(digit, index) in code"
                    :key="index"
                    :ref="
                      (el) => {
                        if (el) inputs[index] = el;
                      }
                    "
                    class="code-input"
                    :value="digit"
                    :disabled="!userStore?.smsVerify?.mobile_do && !userStore?.smsVerify?.email_do"
                    @input="handleInput($event, index)"
                    @keydown="handleKeyDown($event, index)"
                    @paste="handlePaste($event, index)"
                    :maxlength="1"
                  />
                </div>
                <div class="footer">
                  <span> </span>
                  <template v-if="userStore?.smsVerify?.mobile_do || userStore?.smsVerify?.email_do">
                    <a href="javascript:void(0);" v-if="!showCountdown" @click="resendCode">{{ t('重新发送') }}</a>
                    <div v-show="showCountdown">
                      Resend in 
                      <vco-countdown v-model:show="showCountdown" :targetTimestamp="smsType == 0 ? userStore?.smsVerify?.email_time : userStore?.smsVerify?.mobile_time" class="login_countdown" /> 
                       seconds
                    </div>
                  </template>
                </div>
                <a-button type="primary" block @click="submitCode" :disabled="!userStore?.smsVerify?.mobile_do && !userStore?.smsVerify?.email_do" :loading="loading">{{ t('提交') }}</a-button>
              </template>
            </div>
          </div>
        </a-spin>
      </div>
    </template>
  </auth-template>
</template>

<script setup>
import { ref, reactive, watch, onMounted, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue/es';
import { useRoute } from 'vue-router';
import router from '@/router';
import { useUserStore } from '@/store';
import { getSmsCode } from '@/api/auth';
import dayjs from 'dayjs';

const { t } = useI18n();
const route = useRoute();

const showCountdown = ref(false);
const smsType = ref('');
function goHomeRoute() {
  const redirect = route.query.redirect || '/';
  router.replace(redirect);
}

const userStore = useUserStore();
const loading = ref(false);
const submit = (val) => {
  if (loading.value) return;
  loading.value = true;
  userStore
    .loginCode({
      uuid: userStore.smsVerify?.uuid,
      ucode: userStore.smsVerify?.ucode,
      code: val,
      type: smsType.value + ''
    })
    .then((res) => {
      goHomeRoute();
    })
    .catch(() => {
      loading.value = false;
    });
};

const inputs = ref([]);
const code = ref(['', '', '', '']);

// 处理输入
const handleInput = (e, index) => {
  // 只允许输入数字
  const value = e.target.value.replace(/[^0-9]/g, '');

  if (value) {
    code.value[index] = value.charAt(0); // 只取第一个数字

    // 自动聚焦到下一个输入框
    if (index < 3) {
      inputs.value[index + 1].focus();
    }
  } else {
    code.value[index] = '';
  }
};

// 处理退格键
const handleKeyDown = (e, index) => {
  if (e.key === 'Backspace' && !code.value[index] && index > 0) {
    // 如果当前输入框为空，按退格键时聚焦到前一个输入框
    inputs.value[index - 1].focus();
  }
};

// 处理粘贴事件
const handlePaste = (e, index) => {
  e.preventDefault();
  const pastedData = e.clipboardData.getData('text/plain').replace(/[^0-9]/g, '');

  if (pastedData.length >= 4) {
    // 如果粘贴的内容长度足够，填充所有输入框
    for (let i = 0; i < 4; i++) {
      code.value[i] = pastedData.charAt(i);
    }
    inputs.value[3].focus();
  } else if (pastedData.length > 0) {
    // 如果粘贴的内容长度不足，从当前光标位置开始填充
    for (let i = 0; i < pastedData.length && index + i < 4; i++) {
      code.value[index + i] = pastedData.charAt(i);
    }
    const nextFocusIndex = Math.min(index + pastedData.length, 3);
    inputs.value[nextFocusIndex].focus();
  }
};

// 提交验证码
const submitCode = () => {
  const fullCode = code.value.join('');
  if (fullCode.length === 4) {
    submit(fullCode);
    // 这里可以添加API调用
  } else {
    message.error(t('请输入完整的4位验证码'));
  }
};

// 重新发送验证码
const resendCode = () => {
  if (userStore?.smsVerify?.mobile_do || userStore?.smsVerify?.email_do) {
    // 清空所有输入框
    code.value = ['', '', '', ''];
    // 聚焦到第一个输入框
    inputs.value[0].focus();
  }
  getSmsCode({ uuid: userStore.smsVerify?.uuid, email_do: smsType.value == 0 ? 1 : 0, mobile_do: smsType.value == 1 ? 1 : 0 }).then((res) => {
    userStore.smsVerify = res.smsVerify;
    localStorage.setItem('smsVerify', JSON.stringify(res.smsVerify));
    message.success(t('验证码已发送'));
  });
};

const changeType = () => {
  smsType.value = smsType.value ? 0 : 1;
  nextTick(() => {
    if (!showCountdown.value) {
      resendCode();
    }
  });
};

onMounted(() => {
  // 初始化后聚焦第一个输入框
  if (inputs.value.length > 0) {
    inputs.value[0].focus();
  }
  if (localStorage.getItem('smsVerify')) {
    userStore.smsVerify = JSON.parse(localStorage.getItem('smsVerify'));
    if (userStore.smsVerify?.mobile_do) {
      smsType.value = 1;
    }
    if (userStore.smsVerify?.email_do) {
      smsType.value = 0;
    }
    if (userStore.smsVerify?.can_email && userStore.smsVerify?.can_mobile) {
      smsType.value = 1;
    }
  }
});
</script>

<style scoped lang="less">
@import '@/styles/variables.less';

.verification-code-container {
  display: flex;
  justify-content: center;
  padding: 30px;
  box-sizing: border-box;
}
.verification-box {
  position: relative;
  background: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 400px;
}
.title {
  text-align: center;
  margin-bottom: 24px;
  color: #262626;
  font-size: 20px;
  font-weight: 500;
}
.code-inputs {
  display: flex;
  justify-content: center;
  margin-bottom: 14px;
  gap: 20px;
  margin-top: 20px;
}
.code-input {
  width: 50px;
  height: 50px;
  text-align: center;
  font-size: 24px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  transition: all 0.3s;
}
.code-input:focus {
  border-color: #40a9ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  outline: none;
}
.hint {
  text-align: center;
  color: #8c8c8c;
  margin-top: 16px;
  font-size: 14px;
}
.footer {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  margin-bottom: 20px;
}

.login_countdown {
  background: transparent;
  color: #181818;
  width: auto;
  border: none;
  padding: 0;
  height: auto;
}
.back-link {
  position: absolute;
  top: 12px;
  left: 14px;
  color: @color_brown;
  &-icon {
    transform: rotate(-135deg);
    .iconfont {
      font-size: 14px;
    }
  }
}
</style>
