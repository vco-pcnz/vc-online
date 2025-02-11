<template>
  <div class="RequestDetails">
    <p class="RequestDetails-amount flex items-center">Requested <vco-number :value="data?.base.loan_money" size="fs_xl" class="ml-3" :bold="true" :precision="2"></vco-number></p>
    <p class="RequestDetails-date">Est. {{ tool.showDate(data?.date.start_date) }} ⇢ Est. {{ tool.showDate(data?.date.end_date) }}</p>
    <p class="RequestDetails-label">Created by</p>

    <div class="flex items-center gap-2 mb-7">
      <vco-avatar :src="data?.base.avatar" :radius="true" :round="true" :size="18" />
      <span class="name black"> {{ data?.base.user_name }}</span>
    </div>

    <div class="flex mb-7">
      <div class="RequestDetails_member-info__jErzI">
        <p class="RequestDetails-label">{{ t('借款人信息2') }}</p>
        <div>{{ data?.base.borrower_user_name }}</div>
        <div style=" word-break: break-all;">{{ data?.base.borrower_email }}</div>
        <div>
          <span v-if="data?.base.borrower_phone_prefix">+{{ data?.base.borrower_phone_prefix }}</span> {{ data?.base.borrower_phone }}
        </div>
      </div>
      <!-- <div>
        <p class="RequestDetails-label">{{ t('经纪人信息') }}</p>
      </div> -->
    </div>

    <div>
      <p class="RequestDetails-label">{{ t('项目详情') }}</p>
      <div class="mb-7">{{ data?.base.project_about }}</div>
    </div>

    <div class="flex mb-7">
      <div class="flex-1">
        <p class="RequestDetails-label">{{ t('项目文件') }}</p>
        <a-button type="brown" shape="round" size="small" class="mt-5" @click="navigationTo('/projects/documents?uuid=' + currentId)">{{ t('查看文件') }}</a-button>
      </div>
      <div class="VerticalDivider"></div>
      <div class="RequestDetails-units">
        <p class="RequestDetails-label">{{ t('数量') }}</p>
        <div>{{data?.base.building_num}}</div>
      </div>
    </div>

    <div>
      <p class="RequestDetails-label">{{ t('借款背景') }}</p>
      <div>{{ data?.base.borrower_about }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import tool from '@/utils/tool';
import { navigationTo } from '@/utils/tool';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps(['data', 'currentId']);
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
