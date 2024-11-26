<template>
  <div class="block-container">
    <div class="left-content">
      <div class="block-item">
        <div class="flex justify-end gap-5">
          <a-button type="primary-line" shape="round" size="small">{{ t('从利益相关者导入') }}</a-button>
          <a-button type="primary-line" shape="round" size="small">{{ t('添加临时数据') }}</a-button>
        </div>

        <div class="sys-form-content mt-5">
          <a-form ref="formRef" layout="vertical" :model="formState">
            <a-row :gutter="24">
              <a-col :span="24">
                <a-form-item label="借款人类型" name="borrower_type">
                  <a-radio-group v-model:value="formState.borrower_type" name="borrower_type">
                    <a-radio :value="1">个人</a-radio>
                    <a-radio :value="2">机构</a-radio>
                  </a-radio-group>
                </a-form-item>
              </a-col>
              <a-col :span="24">
                <a-form-item label="证件照片" name="borrower_images">
                  <!-- <a-radio-group v-model:value="formState.borrower_images" name="borrower_images">
                    <a-radio :value="1">个人</a-radio>
                    <a-radio :value="2">机构</a-radio>
                  </a-radio-group> -->
                  <vco-upload-image v-model="formState.borrower_images"></vco-upload-image>
                </a-form-item>
              </a-col>
              <template v-if="formState.borrower_type === 1">
                <a-col :span="8">
                  <a-form-item label="姓" name="first_name">
                    <a-input v-model:value="formState.first_name" />
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item label="中间名" name="middle_name">
                    <a-input v-model:value="formState.middle_name" />
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item label="名" name="last_name">
                    <a-input v-model:value="formState.last_name" />
                  </a-form-item>
                </a-col>
              </template>
              <template v-else>
                <a-col :span="24">
                  <a-form-item label="机构名称" name="organization_name">
                    <a-input v-model:value="formState.organization_name" />
                  </a-form-item>
                </a-col>
              </template>
              <a-col :span="24">
                <a-form-item label="证件号码" name="borrower_id_num">
                  <a-input v-model:value="formState.borrower_id_num" />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="邮箱" name="borrower_email">
                  <a-input v-model:value="formState.borrower_email" />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="手机号" name="borrower_phone">
                  <vco-mobile-input
                    v-model:value="formState.borrower_phone"
                    v-model:areaCode="formState.borrower_phone_prefix"
                  >
                  </vco-mobile-input>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="邮编号码" name="borrower_postcode">
                  <a-input v-model:value="formState.borrower_postcode" />
                </a-form-item>
              </a-col>
              <a-col :span="24">
                <a-form-item label="借款人背景信息" name="borrower_about">
                  <a-textarea v-model:value="formState.borrower_about" :auto-size="{ minRows: 4, maxRows: 5 }" />
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </div>
        <div class="flex mt-5 items-end gap-20 justify-between">
          <a-button type="grey" shape="round" class="weight">保存草稿</a-button>
          <a-button type="dark" shape="round" class="big shadow bold uppercase">下一步</a-button>
        </div>
      </div>
    </div>
    <div class="right-content">
      2
    </div>
  </div>
</template>

<script setup>
  import { reactive } from "vue";
  import { useI18n } from "vue-i18n";

  const { t } = useI18n();

  const formState = reactive({
    borrower_type: 1,
    borrower_images: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    organization_name: '',
    borrower_id_num: '',
    borrower_email: '',
    borrower_phone_prefix: '',
    borrower_phone: '',
    borrower_postcode: '',
    borrower_about: ''
  })
</script>

<style lang="less" scoped>
  @import '././styles/common.less';
</style>