<template>
  <div class="addOrgsWrapper">
    <div class="addOrgsWrapper-left"></div>
    <div class="addOrgsWrapper-right">
      <div class="sys-form-content mt-5">
        <a-form ref="formRef" :model="form" :rules="rules" layout="vertical">
          <a-row :gutter="24">
            <a-col :span="24">
              <a-form-item label="Lable Type" name="cid">
                <a-checkbox-group v-model:value="form.cid">
                  <a-checkbox
                    v-for="item in orgsStore.category"
                    :key="item.id"
                    :value="item.id"
                  >
                    {{ item.name }}
                  </a-checkbox>
                </a-checkbox-group>
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item label="Entity Type" name="type">
                <a-radio-group v-model:value="form.type" name="type">
                  <a-radio
                    :value="item.code"
                    :key="item.code"
                    v-for="item in orgsStore.stakeholderTypet"
                    >{{ item.name }}</a-radio
                  >
                </a-radio-group>
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item label="Company Name" name="name">
                <a-input v-model:value="form.name" />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item label="NZBZ" name="nzbz">
                <a-input v-model:value="form.nzbz" />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item label="Company No." name="idcard">
                <a-input v-model:value="form.idcard" />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item label="Contact Name" name="contactName">
                <a-input v-model:value="form.contactName" />
              </a-form-item>
            </a-col>

            <a-col :span="20">
              <a-form-item name="email" :label="t('邮箱')">
                <a-input
                  v-model:value="form.email"
                  :placeholder="t('邮箱')"
                  :disabled="false"
                />
              </a-form-item>
            </a-col>
            <a-col :span="4" v-if="!verifyEmail.showCountdown">
              <a-form-item label=" ">
                <a-button
                  v-if="true"
                  @click="handleVerify(VERIFY_KEY.EMAIL)"
                  type="dark"
                  class="big verify-btn"
                >
                  {{ t("验证") }}
                </a-button>
                <a-button
                  v-else
                  @click="handleChange(VERIFY_KEY.EMAIL)"
                  class="big verify-btn"
                >
                  {{ t("变更") }}
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
              <a-form-item label="Contact Phone Number" name="mobile">
                <vco-mobile-input
                  v-model:value="form.mobile"
                  v-model:areaCode="form.pre"
                  :disabled="false"
                >
                </vco-mobile-input>
              </a-form-item>
            </a-col>
            <a-col :span="4" v-if="!verifyMobile.showCountdown">
              <a-form-item label=" ">
                <a-button
                  v-if="true"
                  @click="handleVerify(VERIFY_KEY.MOBILE)"
                  type="dark"
                  class="big verify-btn"
                >
                  {{ t("验证") }}
                </a-button>
                <a-button
                  v-else
                  @click="handleChange(VERIFY_KEY.MOBILE)"
                  class="big verify-btn"
                >
                  {{ t("变更") }}
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
                <a-input v-model:value="form.address" />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item label="Document validity period" name="document">
                <a-input v-model:value="form.document" />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item label="Background" name="note">
                <a-textarea
                  v-model:value="form.note"
                  :auto-size="{ minRows: 4, maxRows: 5 }"
                />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>
      <div class="flex mt-5 items-end gap-20 justify-between">
        <a-button type="dark" shape="round" class="big shadow bold uppercase"
          >下一步</a-button
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted, ref } from "vue";
import { preMobileOpts, EMAIL_RULE, VERIFY_KEY } from "@/constant";
import countdown from "./components/countdown.vue";
import useFormData from "@/utils/use-form-data";
import { useI18n } from "vue-i18n";
import { useOrgsStore } from "@/store";
import { sendUnauthECode, sendUnauthCodeM } from "@/api/orgs/form";

const { t } = useI18n();
const orgsStore = useOrgsStore();
const formRef = ref();

// 表单数据
const { form, assignFields } = useFormData({
  avatar: "",
  cid: [],
  p_uuid: "",
  type: 1,
  name: "牛皮公司",
  nzbz: "5126516wjwj",
  idcard: "asdlkajw",
  contactName: "小明",
  email: "425523255@qq.com",
  emailCode: "1213",
  pre: "86",
  mobile: "18780024520",
  mobileCode: "4432",
  province_code: "2066",
  city_code: "2091",
  district_code: "2100",
  address: "No.123, Example Street",
  document: ["http://vco.com/uploads/temp/20240914/66e53267d2cce.png"],
  expire_time: "2025-01-15",
  note: "This is my introduction.",
});

// 表单验证规则
const rules = reactive({
  cid: [
    {
      required: true,
      message: t("请输入") + t("名"),
      type: "string",
      trigger: "blur",
    },
  ],
  type: [
    {
      required: true,
      message: t("请输入") + t("中间名"),
      type: "string",
      trigger: "blur",
    },
  ],
  name: [
    {
      pattern: EMAIL_RULE,
      message: t("请输入") + t("中间名"),
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

const handleVerify = (key) => {
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

onMounted(() => {
  // 加载分类
  orgsStore.getCategory();
  // 加载分类
  orgsStore.getStakeholderTypet();
});
</script>

<style lang="less" scoped>
@import "@/styles/variables.less";
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
  }
}
</style>
