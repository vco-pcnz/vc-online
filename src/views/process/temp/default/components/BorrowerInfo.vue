<template>
  <div>
    <a-row :gutter="24">
      <a-col :span="8">
        <div class="info-content">
          <p class="name">{{ t('借款人类型') }}</p>
          <p class="txt">{{ Number(data.borrower_type) === 1 ? t('个人') : t('机构') }}</p>
        </div>
      </a-col>
      <a-col :span="8" v-if="Number(data.borrower_type) === 1">
        <div class="info-content">
          <p class="name">{{ t('借款人姓名') }}</p>
          <p class="txt">{{ data.first_name + ' ' + data.middle_name + ' ' + data.last_name }}</p>
        </div>
      </a-col>
      <a-col :span="8" v-if="Number(data.borrower_type) === 2">
        <div class="info-content">
          <p class="name">{{ t('机构名称') }}</p>
          <p class="txt">{{ data.organization_name }}</p>
        </div>
      </a-col>
      <a-col :span="8">
        <div class="info-content">
          <p class="name">{{ Number(data.borrower_type) === 1 ? t('身份证号码') : t('新西兰商业号码') }}</p>
          <p class="txt">{{ data.borrower_id_num }}</p>
        </div>
      </a-col>
      <a-col :span="8">
        <div class="info-content">
          <p class="name">{{ t('邮箱') }}</p>
          <p class="txt">{{ data.borrower_email }}</p>
        </div>
      </a-col>
      <a-col :span="8">
        <div class="info-content">
          <p class="name">{{ t('手机号') }}</p>
          <p class="txt">{{data.borrower_phone? '+' + data.borrower_phone_prefix + ' ' + data.borrower_phone :'--'}}</p>
        </div>
      </a-col>
      <a-col :span="8" v-if="Number(data.borrower_type) === 1">
        <div class="info-content">
          <p class="name">{{ t('邮编') }}</p>
          <p class="txt">{{ data.borrower_postcode }}</p>
        </div>
      </a-col>
      <!-- <a-col :span="24">
        <div class="info-content">
          <p class="name">{{ t('证件照片') }}</p>
          <div v-if="data.borrower_images && data.borrower_images.length">
            <a-image-preview-group>
              <div class="images-box-content">
                <div
                  v-for="(item, index) in data.borrower_images"
                  :key="index"
                  class="item"
                >
                  <a-image
                    :width="50"
                    :src="item.value"
                  />
                </div>
              </div>
            </a-image-preview-group>
          </div>
          <p v-else class="txt">--</p>
        </div>
      </a-col> -->
      <a-col :span="24" v-if="appStore.config?.show_addr === '2' && Number(data.borrower_type) === 1">
        <div class="info-content">
          <p class="name">{{ t('借款人地址') }}</p>
          <p class="txt">{{ data.borrower_city }}</p>
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
import { useI18n } from 'vue-i18n';
import useAppStore from '@/store/modules/app';

const appStore = useAppStore();

const props = defineProps({
  data: {
    type: Object,
    default: () => {}
  }
});

const { t } = useI18n();
</script>

<style lang="less" scoped>
@import './style.less';
</style>
