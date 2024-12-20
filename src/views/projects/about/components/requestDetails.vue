<template>
  <div class="RequestDetails">
    <p class="RequestDetails-amount">Requested $1,000,000,000.00</p>
    <p class="RequestDetails-date">Est. 30 Nov 2024 ⇢ Est. 6 Dec 2025</p>
    <p class="RequestDetails-label">Created by</p>

    <div class="flex items-center gap-2 mb-7">
      <vco-avatar src="" :radius="true" :round="true" :size="18" />
      <span class="name black"> Borrower's</span>
    </div>

    <div class="flex mb-7">
      <div class="RequestDetails_member-info__jErzI">
        <p class="RequestDetails-label">{{ t('借款人信息2') }}</p>
        <div>test</div>
        <div>renee@vincentcapital.cn</div>
        <div>188888888</div>
      </div>
      <div>
        <p class="RequestDetails-label">{{ t('经纪人信息') }}</p>
      </div>
    </div>

    <div>
      <p class="RequestDetails-label">{{ t('项目详情') }}</p>
      <div class="mb-7">xxxx</div>
    </div>

    <div class="flex mb-7">
      <div class="flex-1">
        <p class="RequestDetails-label">{{ t('项目文件') }}</p>
        <a-button type="brown" shape="round" size="small" class="mt-5">{{ t('查看文件') }}</a-button>
      </div>
      <div class="VerticalDivider"></div>
      <div class="RequestDetails-units">
        <p class="RequestDetails-label">{{ t('数量') }}</p>
        <div>1</div>
      </div>
    </div>

    <div>
      <p class="RequestDetails-label">{{ t('借款背景') }}</p>
      <div>xxx</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps([]);
</script>

<style scoped lang="less">
@import '@/styles/variables.less';
.VerticalDivider {
  align-self: stretch;
  background-color: #e2e5e2;
  flex-shrink: 0;
  width: 1px;
  margin-left: 16px;
  margin-right: 16px;
}
.RequestDetails {
  font-size: @fs_xs;
  line-height: 1.4;
  p {
    margin-bottom: 6px;
  }
  &-amount {
    font-size: @fs_md;
  }
  &-date {
    color: @color_grey;
    margin-bottom: 24px !important;
  }
  &-label {
    font-size: @fs_2xs;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  &-units {
    text-align: center;
    font-size: @fs_4xl;
  }
}
</style>
