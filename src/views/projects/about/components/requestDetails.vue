<template>
  <div class="RequestDetails">
    <a-modal :open="borrowerVisible" :title="t('修改借款人信息')" :width="900" :footer="null" :keyboard="false" @update:open="borrowerVisible = false">
      <borrower-info-form v-if="borrowerVisible" :check="true" :is-open="true" :info-data="data?.borrower" :current-id="currentId" @checkDone="saveDone"></borrower-info-form>
    </a-modal>

    <a-modal :open="securityVisible" :title="t('其他安全信息')" :width="900" :footer="null" :keyboard="false" @update:open="securityVisible = false">
      <guarantor-info-form v-if="securityVisible" :current-id="currentId" :is-open="true" :guarantor-info="data?.warranty" @refresh="saveDone"></guarantor-info-form>
    </a-modal>

    <p class="RequestDetails-amount flex items-center">Requested <vco-number :value="data?.base.loan_money" size="fs_xl" class="ml-3" :bold="true" :precision="2"></vco-number></p>
    <p class="RequestDetails-date">Est. {{ tool.showDate(data?.date.start_date) }} ⇢ Est. {{ tool.showDate(data?.date.end_date) }}</p>
    <p class="RequestDetails-label">Created by</p>

    <div class="flex items-center gap-2 mb-7">
      <vco-avatar :src="data?.base.avatar" :radius="true" :round="true" :size="18" />
      <span class="name black"> {{ data?.base.user_name }}</span>
    </div>

    <div class="flex mb-7">
      <div class="RequestDetails_member-info__jErzI">
        <div class="RequestDetails-label flex items-center">
          <span>{{ t('借款人信息2') }}</span>
          <i v-if="hasPermission('projects:detail:editBorrower')" class="iconfont" @click="openBorrower">&#xe743;</i>
        </div>
        <div>{{ data?.base.borrower_user_name }}</div>
        <div style="word-break: break-all">{{ data?.base.borrower_email }}</div>
        <div>
          <span v-if="data?.base.borrower_phone_prefix">+{{ data?.base.borrower_phone_prefix }}</span> {{ data?.base.borrower_phone }}
        </div>
      </div>
      <!-- <div>
        <p class="RequestDetails-label">{{ t('经纪人信息') }}</p>
      </div> -->
    </div>

    <div v-if="hasPermission('projects:detail:editGuarantor')" class="RequestDetails-label flex items-center add">
      <i v-if="showWarrantyTips" class="iconfont iconfont-tips">&#xe60e;</i>
      <span>{{ t('其他安全信息') }}</span>
      <i class="iconfont" v-if="!data?.base?.is_close" @click="securityVisible = true">&#xe743;</i>
    </div>

    <div>
      <p class="RequestDetails-label">{{ t('项目详情') }}</p>
      <div class="mb-7">{{ data?.base.project_about }}</div>
    </div>

    <div class="flex mb-7">
      <div class="flex-1">
        <p class="RequestDetails-label">{{ t('项目文件') }}</p>
        <a-button type="brown" shape="round" size="small" class="mt-5" @click="navigationTo(`${mode}/projects/documents?uuid=` + currentId)">{{ t('查看文件') }}</a-button>
      </div>
      <div class="VerticalDivider"></div>
      <div class="RequestDetails-units">
        <p class="RequestDetails-label">{{ t('数量') }}</p>
        <div>{{ data?.base.building_num }}</div>
      </div>
    </div>

    <div>
      <p class="RequestDetails-label">{{ t('借款背景') }}</p>
      <div>{{ data?.base.borrower_about }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import tool from '@/utils/tool';
import { navigationTo } from '@/utils/tool';
import { hasPermission } from '@/directives/permission/index';
import { useI18n } from 'vue-i18n';
import BorrowerInfoForm from '@/views/process/temp/default/tpl-one.vue';
import GuarantorInfoForm from '@/views/process/temp/default/components/GuarantorInfo.vue';
import { useUserStore } from '@/store';

const pageRole = computed(() => useUserStore().pageRole);
const mode = pageRole.value ? '/' + pageRole.value.toLowerCase() : '';

const { t } = useI18n();

const props = defineProps(['data', 'currentId']);
const emits = defineEmits(['update']);

const showWarrantyTips = computed(() => {
  return hasPermission('projects:detail:editGuarantor') && !props.data?.warranty?.main_contractor && !props.data?.warranty?.security_package.length;
});

const borrowerVisible = ref(false);
const securityVisible = ref(false);
const openBorrower = () => {
  borrowerVisible.value = true;
};

const saveDone = () => {
  securityVisible.value = false;
  borrowerVisible.value = false;
  emits('update');
};
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
  .RequestDetails-label.flex,
  p {
    margin-bottom: 6px;
  }
  .RequestDetails-label.flex {
    &.add {
      margin-bottom: 1.75rem;
    }
    .iconfont {
      font-size: 12px;
      margin-left: 10px;
      color: #bf9425;
      cursor: pointer;
      &:hover {
        color: #e6b53b;
      }
    }
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

.iconfont-tips {
  font-size: 12px !important;
  margin-right: 5px;
  margin-left: 0 !important;
  color: #c1430c !important;
}
</style>
