<template>
  <div>
    <template v-for="(item, index) in borrowerList" :key="index">
    <p v-if="borrowerList.length > 1" class="borrower-index">{{ t('借款人信息') }} {{ index + 1 }}</p>
    <a-row :gutter="24">
      <a-col :span="8">
        <div class="info-content">
          <p class="name">{{ t('借款人类型') }}</p>
          <p class="txt">{{ Number(item.borrower_type) === 1 ? t('个人') : Number(item.is_trust) === 1 ? t('信托') : t('公司') }}</p>
        </div>
      </a-col>
      <a-col :span="8" v-if="Number(item.borrower_type) === 1">
        <div class="info-content">
          <p class="name">{{ t('借款人姓名') }}</p>
          <p class="txt">{{ item.first_name + ' ' + item.middle_name + ' ' + item.last_name }}</p>
        </div>
      </a-col>
      <a-col :span="8" v-if="Number(item.borrower_type) === 2">
        <div class="info-content">
          <p class="name">{{ t('机构名称') }}</p>
          <p class="txt">{{ item.organization_name }}</p>
        </div>
      </a-col>
      <a-col v-if="item.is_trust !== 1" :span="8">
        <div class="info-content">
          <p class="name">{{ Number(item.borrower_type) === 1 ? t('身份证号码') : t('新西兰商业号码') }}</p>
          <p class="txt">{{ item.borrower_id_num }}</p>
        </div>
      </a-col>
      <a-col :span="8">
        <div class="info-content">
          <p class="name">{{ t('邮箱') }}</p>
          <p class="txt">{{ item.borrower_email }}</p>
        </div>
      </a-col>
      <a-col :span="8">
        <div class="info-content">
          <p class="name">{{ t('手机号') }}</p>
          <p class="txt">{{item.borrower_phone? '+' + item.borrower_phone_prefix + ' ' + item.borrower_phone :'--'}}</p>
        </div>
      </a-col>
      <a-col :span="8" v-if="Number(item.borrower_type) === 1">
        <div class="info-content">
          <p class="name">{{ t('邮编') }}</p>
          <p class="txt">{{ item.borrower_postcode }}</p>
        </div>
      </a-col>
      <!-- <a-col :span="24">
        <div class="info-content">
          <p class="name">{{ t('证件照片') }}</p>
          <div v-if="item.borrower_images && item.borrower_images.length">
            <a-image-preview-group>
              <div class="images-box-content">
                <div
                  v-for="(item, index) in item.borrower_images"
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
      <a-col :span="24" v-if="appStore.config?.show_addr === '2' && Number(item.borrower_type) === 1">
        <div class="info-content">
          <p class="name">{{ t('借款人地址') }}</p>
          <p class="txt">{{ item.borrower_city }}</p>
        </div>
      </a-col>
      <a-col :span="24">
        <div class="info-content">
          <p class="name">{{ t('借款人背景信息') }}</p>
          <p class="txt">{{ item.borrower_about }}</p>
        </div>
      </a-col>
    </a-row>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue';
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

const borrowerList = computed(() => {
  const list = props.data?.borrowers;
  if (Array.isArray(list) && list.length) {
    return list;
  }
  return props.data ? [props.data] : [];
});
</script>

<style lang="less" scoped>
@import './style.less';

.borrower-index {
  margin: 8px 0 12px;
  font-weight: 600;
}
</style>
