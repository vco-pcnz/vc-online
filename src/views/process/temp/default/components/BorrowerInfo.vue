<template>
  <div>
    <a-row :gutter="24">
      <a-col :span="12">
        <div class="info-content">
          <p class="name">{{ t('借款人类型') }}</p>
          <p class="txt">{{ Number(data.borrower_type) === 1 ? t('个人') : t('机构') }}</p>
        </div>
      </a-col>
      <a-col :span="12" v-if="Number(data.borrower_type) === 1">
        <div class="info-content">
          <p class="name">{{ t('借款人姓名') }}</p>
          <p class="txt">{{ data.first_name + ' ' + data.middle_name + ' ' + data.last_name }}</p>
        </div>
      </a-col>
      <a-col :span="12" v-if="Number(data.borrower_type) === 2">
        <div class="info-content">
          <p class="name">{{ t('机构名称') }}</p>
          <p class="txt">{{ data.organization_name }}</p>
        </div>
      </a-col>
      <a-col :span="12">
        <div class="info-content">
          <p class="name">{{ Number(data.borrower_type) === 1 ? t('身份证号码') : t('公司编码') }}</p>
          <p class="txt">{{ data.borrower_id_num }}</p>
        </div>
      </a-col>
      <a-col :span="12">
        <div class="info-content">
          <p class="name">{{ t('邮箱') }}</p>
          <p class="txt">{{ data.borrower_email }}</p>
        </div>
      </a-col>
      <a-col :span="12">
        <div class="info-content">
          <p class="name">{{ t('手机号') }}</p>
          <p class="txt">{{ '+' + data.borrower_phone_prefix + ' ' + data.borrower_phone }}</p>
        </div>
      </a-col>
      <a-col :span="12">
        <div class="info-content">
          <p class="name">{{ t('邮编') }}</p>
          <p class="txt">{{ data.borrower_postcode }}</p>
        </div>
      </a-col>
      <a-col :span="24">
        <div class="info-content">
          <p class="name">{{ t('借款人地址') }}</p>
          <p class="txt">{{ addressInfo }}</p>
        </div>
      </a-col>
      <a-col :span="24">
        <div class="info-content">
          <p class="name">{{ t('借款人背景信息') }}</p>
          <p class="txt">{{ data.borrower_about }}</p>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
  import { computed } from "vue"
  import { useI18n } from "vue-i18n";

  const props = defineProps({
    data: {
      type: Object,
      default: () => {}
    }
  })

  const { t, locale } = useI18n();

  const addressInfo = computed(() => {
    if (locale.value === 'en') {
      return `${props.data.borrower_address} ${props.data.borrower_region_three_name} ${props.data.borrower_region_two_name} ${props.data.borrower_region_one_name}`
    } else {
      return `${props.data.borrower_region_one_name} ${props.data.borrower_region_two_name} ${props.data.borrower_region_three_name} ${props.data.borrower_address}`
    }
  })
</script>

<style lang="less" scoped>
  .info-content {
    margin-top: 15px;
    .name {
      font-size: 12px;
      color: #666;
    }
    .txt {
      font-size: 13px;
      font-weight: 500;
      margin-top: 2px;
    }
  }
</style>