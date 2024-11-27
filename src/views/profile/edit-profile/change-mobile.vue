<template>
  <a-modal :width="480" :open="open" :title="title" @cancel="closeModal">
    <a-form ref="formRef" :model="form" :rules="rules" layout="vertical">
      <a-form-item name="mobile" :label="t('验证手机号')">
        <a-row :gutter="8">
          <a-col :span="6">
            <a-form-item-rest>
              <a-select
                v-model:value="form.pre"
                :options="preMobileOpts"
                disabled
              />
            </a-form-item-rest>
          </a-col>
          <a-col :span="14">
            <a-input
              v-model:value="form.mobile"
              :placeholder="t('验证手机号')"
              disabled
            />
          </a-col>
          <a-col :span="4" v-if="!verifyMobile.showCountdown">
            <a-form-item-rest>
              <a-button @click="handleVerify(false)" block class="verify-btn">
                {{ t("验证") }}
              </a-button>
            </a-form-item-rest>
          </a-col>
          <a-col :span="4" v-else>
            <a-form-item-rest>
              <countdown v-model:show="verifyMobile.showCountdown" />
            </a-form-item-rest>
          </a-col>
        </a-row>
      </a-form-item>
      <a-form-item
        name="code"
        :label="t('验证码V')"
        v-show="verifyMobile.showCode"
      >
        <a-input v-model:value="form.code" :placeholder="t('验证码V')" />
      </a-form-item>
      <a-form-item name="newMobile" :label="t('新手机号')">
        <a-row :gutter="8">
          <a-col :span="6">
            <a-form-item-rest>
              <a-select v-model:value="form.newPre" :options="preMobileOpts" />
            </a-form-item-rest>
          </a-col>
          <a-col :span="14">
            <a-input
              v-model:value="form.newMobile"
              :placeholder="t('新手机号')"
            />
          </a-col>
          <a-col :span="4" v-if="!verifyMobile.showCountdownNew">
            <a-form-item-rest>
              <a-button @click="handleVerify(true)" block class="verify-btn">
                {{ t("验证") }}
              </a-button>
            </a-form-item-rest>
          </a-col>
          <a-col :span="4" v-else>
            <a-form-item-rest>
              <countdown v-model:show="verifyMobile.showCountdownNew" />
            </a-form-item-rest>
          </a-col>
        </a-row>
      </a-form-item>
      <a-form-item
        name="newCode"
        :label="t('验证码V')"
        v-show="verifyMobile.showCodeNew"
      >
        <a-input v-model:value="form.newCode" :placeholder="t('验证码V')" />
      </a-form-item>
    </a-form>
    <template #footer>
      <div class="modal-footer">
        <a-button
          @click="save"
          size="large"
          type="primary"
          style="width: 40%"
          :loading="loading"
        >
          {{ t("提交") }}
        </a-button>
      </div>
    </template>
  </a-modal>
</template>

<script setup>
import { ref, watch, reactive } from "vue";
import { useI18n } from "vue-i18n";
import { sendCodeOldM, sendCodeNewM, changeMobile } from "@/api/profile";
import countdown from "../components/countdown.vue";
import useFormData from "@/utils/use-form-data";
import { message } from "ant-design-vue";
import { trim } from "lodash";
import { useUserDetailStore } from "@/store";
import { preMobileOpts } from "@/constant";

const { t } = useI18n();
const loading = ref(false);
const formRef = ref(null);
const userDetailStore = useUserDetailStore();

const props = defineProps(["open", "title"]);
const emit = defineEmits(["update:open"]);

const verifyMobile = reactive({
  showCode: false,
  showCountdown: false,
  showCodeNew: false,
  showCountdownNew: false,
  open: false,
});

// 表单数据
const { form, assignFields } = useFormData({
  pre: "",
  mobile: "",
  code: "",
  newPre: "64",
  newMobile: "",
  newCode: "",
});

// 表单验证规则
const rules = reactive({
  newMobile: [
    {
      required: true,
      message: t("请输入") + t("手机号"),
      type: "string",
      trigger: "blur",
    },
  ],
  code: [
    {
      required: true,
      message: t("请输入") + t("验证码V"),
    },
  ],
  newCode: [
    {
      required: true,
      message: t("请输入") + t("验证码V"),
    },
  ],
});
const closeModal = () => {
  emit("update:open", false);
  Object.keys(verifyMobile).forEach((key) => {
    verifyMobile[key] = false;
  });
};

const handleVerify = (isNew) => {
  if (isNew) {
    formRef.value.validate(["newMobile"]).then(() => {
      sendCodeNewM({ pre: form.newPre, mobile: form.newMobile }).then(() => {
        verifyMobile.showCountdownNew = true;
        verifyMobile.showCodeNew = true;
      });
    });
  } else {
    sendCodeOldM({ pre: form.pre, mobile: form.mobile }).then(() => {
      verifyMobile.showCountdown = true;
      verifyMobile.showCode = true;
    });
  }
};

const save = () => {
  formRef.value.validate(["newMobile"]).then(() => {
    if (!trim(form.code) || !trim(form.newCode)) {
      message.warning(t("请先做手机号验证"));
      return;
    }
    changeMobile({
      ...form,
      type: 2, // 手机号
      mobile: form.newMobile,
      newMobile: undefined,
    })
      .then(() => {
        loading.value = false;
        message.success(t("修改成功"));
        userDetailStore.getUserInfo();
        closeModal();
      })
      .catch(() => {
        loading.value = false;
      });
  });
};

watch(
  () => props.open,
  (val) => {
    if (val) {
      assignFields({
        ...form,
        mobile: userDetailStore.userDetail.mobile,
        pre: userDetailStore.userDetail.pre,
      });
    }
  }
);
</script>

<style scoped lang="less">
@import "@/styles/variables.less";
.submit-btn:hover {
  color: @clr_white;
}

.modal-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 0;
}

.modal-content {
  height: 70vh;
  overflow-y: auto;
}
</style>
