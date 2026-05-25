<template>
  <a-modal
    :open="visible"
    :title="t('安全验证')"
    :width="460"
    :footer="null"
    :closable="false"
    :keyboard="false"
    :maskClosable="false"
    wrapClassName="session-password-lock-modal"
  >
    <div class="lock-content">
      <div class="lock-icon">
        <LockOutlined />
      </div>
      <h3>{{ t('验证当前用户的登录密码') }}</h3>
      <p>{{ t('页面长时间未操作，为保障账户安全，请输入当前登录密码后继续使用。') }}</p>

      <a-form ref="formRef" :model="formState" :rules="rules" layout="vertical" class="sys-form-content">
        <a-form-item name="password" :label="t('登录密码')">
          <a-input-password
            ref="passwordInputRef"
            v-model:value="formState.password"
            :placeholder="t('请输入登录密码')"
            autocomplete="current-password"
            @keyup.enter="submit"
          />
        </a-form-item>
      </a-form>

      <a-button type="dark" class="big shadow bold uppercase w-full mt-2" :loading="loading" @click="submit">
        {{ t('确认验证') }}
      </a-button>
    </div>
  </a-modal>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { LockOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue/es';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { getToken } from '@/utils/token-util';
import {
  getSessionIdleRemainingTime,
  getSessionLastActiveTime,
  isSessionPasswordLocked,
  isSessionIdleTimedOut,
  recordSessionActivity,
  removeSessionPasswordLocked,
  setSessionPasswordLocked
} from '@/utils/session-lock';
import { userTimePwd } from '@/api/auth'
import { systemConfigData } from "@/api/system/index"

const minutes = ref(30);
const isIdleLockEnabled = ref(false);
const IDLE_TIMEOUT = computed(() => minutes.value * 60 * 1000);
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

const { t } = useI18n();
const route = useRoute();

const visible = ref(false);
const loading = ref(false);
const timer = ref(null);
const configToken = ref('');
const formRef = ref();
const passwordInputRef = ref();

const formState = reactive({
  password: ''
});

const rules = computed(() => ({
  password: [
    {
      required: true,
      message: t('请输入登录密码'),
      trigger: 'blur'
    }
  ]
}));

const clearIdleTimer = () => {
  if (timer.value) {
    window.clearTimeout(timer.value);
    timer.value = null;
  }
};

const isLoggedIn = () => Boolean(getToken());

const lock = () => {
  if (!isIdleLockEnabled.value || !isLoggedIn()) return;
  setSessionPasswordLocked();
  visible.value = true;
  clearIdleTimer();
  nextTick(() => {
    passwordInputRef.value?.focus?.();
  });
};

const checkIdleTimeout = () => {
  if (!isIdleLockEnabled.value || !isLoggedIn()) return;
  if (isSessionIdleTimedOut(IDLE_TIMEOUT.value)) {
    lock();
    return;
  }
  resetIdleTimer();
};

const resetIdleTimer = () => {
  if (!isIdleLockEnabled.value || visible.value || !isLoggedIn()) return;
  clearIdleTimer();
  const remainingTime = getSessionIdleRemainingTime(IDLE_TIMEOUT.value);
  timer.value = window.setTimeout(checkIdleTimeout, remainingTime);
};

const handleActivity = () => {
  if (visible.value || !isLoggedIn()) return;
  recordSessionActivity();
  if (!isIdleLockEnabled.value) return;
  resetIdleTimer();
};

const unlock = () => {
  visible.value = false;
  loading.value = false;
  formState.password = '';
  formRef.value?.clearValidate?.();
  removeSessionPasswordLocked();
  recordSessionActivity();
  resetIdleTimer();
};

const getTimeoutTime = () => {
  const token = getToken();
  if (!token) {
    isIdleLockEnabled.value = false;
    configToken.value = '';
    return Promise.resolve();
  }
  return systemConfigData({ pcode: 'web_config', code: 'idle_timeout,open_idle' }).then((res) => {
    minutes.value = Number(res.idle_timeout || 30);
    isIdleLockEnabled.value = Number(res.open_idle) === 1;
    configToken.value = token;
  });
}

const submit = () => {
  if (loading.value) return;

  formRef.value
    ?.validate()
    .then(() => {
      loading.value = true;
      userTimePwd({
        password: formState.password
      }).then(() => {
        message.success(t('验证成功'));
        unlock();
      }).catch(() => {
        loading.value = false;
      })
    })
    .catch(() => {});
};

watch(visible, (value) => {
  if (value) {
    nextTick(() => {
      passwordInputRef.value?.focus?.();
    });
  }
});

const initSessionLock = () => {
  const loggedIn = isLoggedIn();

  if (!isIdleLockEnabled.value || !loggedIn) {
    visible.value = false;
    clearIdleTimer();
    removeSessionPasswordLocked();
    if (loggedIn) {
      recordSessionActivity();
    }
    return;
  }
  if (isSessionPasswordLocked()) {
    lock();
    return;
  }
  if (!getSessionLastActiveTime()) {
    recordSessionActivity();
  }
  checkIdleTimeout();
};

const syncSessionLockConfig = () => {
  const token = getToken();
  if (!token) {
    configToken.value = '';
    isIdleLockEnabled.value = false;
    initSessionLock();
    return;
  }

  if (configToken.value === token) {
    initSessionLock();
    return;
  }

  getTimeoutTime()
    .catch(() => {
      isIdleLockEnabled.value = false;
    })
    .finally(() => {
      initSessionLock();
    });
};

onMounted(() => {
  ACTIVITY_EVENTS.forEach((eventName) => {
    window.addEventListener(eventName, handleActivity, true);
  });
  syncSessionLockConfig();
});

watch(
  () => route.fullPath,
  () => {
    syncSessionLockConfig();
  }
);

onUnmounted(() => {
  clearIdleTimer();
  ACTIVITY_EVENTS.forEach((eventName) => {
    window.removeEventListener(eventName, handleActivity, true);
  });
});
</script>

<style scoped lang="less">
@import '@/styles/variables.less';

.lock-content {
  padding: 10px 0 4px;
  text-align: center;

  .lock-icon {
    width: 64px;
    height: 64px;
    margin: 0 auto 18px;
    border-radius: 50%;
    background: @color_brown-light_20;
    color: @colorPrimary;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
  }

  h3 {
    margin-bottom: 8px;
    color: @color_coal;
    font-size: 20px;
    font-weight: 600;
  }

  p {
    margin: 0 auto 22px;
    max-width: 340px;
    color: @color_grey;
    line-height: 1.6;
  }

  :deep(.ant-form-item) {
    margin-bottom: 18px;
    text-align: left;
  }
}
</style>

<style lang="less">
.session-password-lock-modal {
  .ant-modal-mask {
    cursor: not-allowed;
  }
}
</style>
