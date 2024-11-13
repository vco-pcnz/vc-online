<template>
  <auth-template>
    <template #header>
      <router-link to="/login">
        <a-button style="background-color: #b4f1db"> {{ t("登录") }} </a-button>
      </router-link>
    </template>
    <template #content>
      <section class="guid-content">
        <router-link to="/login" class="go-vco" tabindex="-1">
          <div class="go-vco-icon">
            {{ t("跳过,登录VCO") }}<i class="iconfont">&#xe791;</i>
          </div>
        </router-link>
        <h1 class="title">
          {{ t("成为中介") }}
        </h1>
        <a-form ref="formRef" :model="form" :rules="rules" layout="vertical">
          <a-form-item name="name" :label="t('名字')">
            <a-input
              v-model:value="form.name"
              class="input_content"
              :placeholder="t('名字')"
            />
          </a-form-item>
          <a-form-item :label="t('手机号')" name="mobile">
            <a-row>
              <a-col :span="6">
                <a-form-item-rest>
                  <a-input v-model:value="form.pre" class="input_content" />
                </a-form-item-rest>
              </a-col>
              <a-col :span="1" />
              <a-col :span="17">
                <a-form-item-rest>
                  <a-input
                    v-model:value="form.mobile"
                    class="input_content"
                    :placeholder="t('手机号')"
                  />
                </a-form-item-rest>
              </a-col>
            </a-row>
          </a-form-item>
          <a-form-item>
            <a-form-item name="acceptTerm" no-style>
              <a-checkbox v-model:checked="acceptTerm">
                {{ t("我接受") }}
              </a-checkbox>
              <a @click="termModalOpen = true" class="link">
                {{ t("条款与条件") }}
              </a>
            </a-form-item>
          </a-form-item>
          <a-form-item>
            <a-button
              size="large"
              :loading="loading"
              @click="submit"
              block
              class="submit"
            >
              {{ t("提交审核") }}
            </a-button>
          </a-form-item>
        </a-form>
      </section>
    </template>
  </auth-template>
  <term-modal v-model:open="termModalOpen" :type="termsType.broker" />
</template>

<script setup>
import { ref, reactive } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter, useRoute } from "vue-router";
import { roleApply } from "@/api/auth";
import TermModal from "./term-modal.vue";
import { termsType } from "@/constant";
import { message } from "ant-design-vue/es";

const { t } = useI18n();
const { replace } = useRouter();
const { params } = useRoute();

const loading = ref(false);
const formRef = ref();
const acceptTerm = ref(false);
const termModalOpen = ref(false);

// 表单数据
const form = reactive({
  name: "",
  pre: "64",
  mobile: "",
});

// 表单验证规则
const rules = reactive({
  name: [
    {
      required: true,
      message: t("请输入") + t("名字"),
      type: "string",
      trigger: "blur",
    },
  ],
  mobile: [
    {
      required: true,
      message: t("请输入") + t("手机号"),
      type: "string",
      trigger: "blur",
    },
  ],
});

const submit = () => {
  formRef.value.validate().then(() => {
    if (!acceptTerm.value) {
      message.warning(t("请先查阅并接受条款"));
      return;
    }
    loading.value = true;
    roleApply({
      ...form,
      email: params.email,
    })
      .then(() => {
        loading.value = false;
        replace("/login");
      })
      .catch(() => {
        loading.value = false;
      });
  });
};
</script>

<style scoped lang="less">
@import "@/styles/variables.less";

.guid-content {
  border-radius: 24px;
  background-color: @color_white;
  padding: 72px 84px;
  overflow-x: auto;
  position: relative;

  .input_content {
    box-sizing: border-box;
    width: 100%;
    padding: 14px 12px;
    border-radius: 10px;
    background-color: transparent;
    background: transparent;
  }

  .title {
    font-size: @fs_2xl;
    font-weight: 500;
    line-height: 1.1;
    margin-bottom: 40px;
    text-align: center;
  }

  .submit {
    background-color: @clr_charcoal;
    color: @clr_white;
    border: none;
    font-weight: 500;
  }

  .go-vco {
    position: absolute;
    top: 24px;
    right: 24px;
    color: @color_brown;
    &-icon {
      font-size: 14px;
    }
  }

  .go-vco:hover {
    color: @color_brown-light;
  }
}
</style>
