<template>
  <div>
    <!-- 预售详情 -->
    <pre-sale-info
      v-model:visible="infoVisible"
      :detail-data="detail"
    ></pre-sale-info>

    <!-- 添加预售数据 -->
    <edit-dialog
      v-model:visible="editVisible"
      :info-data="detail"
      :uuid="uuid"
      :is-add="true"
      @refresh="update()"
    ></edit-dialog>
    
    <div class="color_grey fs_2xs text-center py-3 text-uppercase uppercase" style="letter-spacing: 1px">{{ t('详情') }}</div>

    <div class="detail">
      <a-alert
        v-if="Boolean(detail?.cancel_reason) || Boolean(detail?.state2_decline_reason)"
        :message="detail?.state2_decline_reason ? t('拒绝原因') : t('退回原因')"
        :description="detail?.state2_decline_reason || detail?.cancel_reason"
        type="error"
        class="cancel-reason"
      />
      <a-alert
        v-if="['discharge_fc', 'discharge_director'].includes(detail.mark) && detail.reason"
        :message="t('解押说明')"
        :description="detail.reason"
        type="info"
        class="success-reason"
      />
      <a-alert
        v-if="detail.relieve_time"
        type="success"
        class="success-reason"
      >
        <template #message>
          <a-row :gutter="24">
            <a-col :span="24" class="item-txt no">
              <p>{{ t('解押时间') }}</p>
              <p>{{ detail.relieve_time ? tool.showDate(detail.relieve_time) : '--' }}</p>
            </a-col>
            <a-col :span="24" class="item-txt">
              <p>{{ t('解押说明') }}</p>
              <p>{{ detail.reason || '--' }}</p>
            </a-col>
          </a-row>
        </template>
      </a-alert>

      <div class="item-header flex justify-between">
        <p class="flex-1">
          <span>{{ detail.type_name }}</span
          >{{ detail.card_no }}
        </p>
        <!-- <div v-if="!projectDetail?.base?.is_close && detail.state === 0 && hasPermission('projects:securities:aer')" class="flex">
          <i class="iconfont" @click="editHandle">&#xe8cf;</i>
          <a-popconfirm :title="t('确定删除吗？')" :ok-text="t('确定')" :cancel-text="t('取消')" @confirm="deleteHandle">
            <i class="iconfont">&#xe8c1;</i>
          </a-popconfirm>
        </div> -->
      </div>

      <div class="flex gap-4">
        <a-button type="brown" shape="round" size="small" @click="navigationTo('/projects/documents?uuid=' + uuid + '&annex_id=' + detail?.annex_id)">{{ t('查看文件') }}</a-button>
        <a-button v-if="detail.is_sales" type="brown" shape="round" size="small" @click="infoVisible = true">{{ t('预售数据') }}</a-button>
        <a-button v-if="hasPermission('projects:discharge:preSale') && !detail.is_sales" type="primary" shape="round" size="small" @click="editVisible = true">{{ t('添加预售数据') }}</a-button>
      </div>
      
      <a-row :gutter="24">
        <a-col :span="12" class="item-txt">
          <p>{{ t('抵押物价值') }}</p>
          <vco-number :value="detail.amount" :precision="2" :end="true"></vco-number>
        </a-col>
        <a-col :span="12" class="item-txt">
          <p>{{ t('保险价值') }}</p>
          <vco-number :value="detail.insurance_value" :precision="2" :end="true"></vco-number>
        </a-col>
        <a-col :span="12" class="item-txt">
          <p>{{ t('土地总额') }}</p>
          <vco-number :value="detail.land_amount" :precision="2" :end="true"></vco-number>
        </a-col>
        <a-col :span="12" class="item-txt">
          <p>{{ t('建筑总额') }}</p>
          <vco-number :value="detail.build_amount" :precision="2" :end="true"></vco-number>
        </a-col>
        <a-col :span="12" class="item-txt">
          <p>{{ t('抵押登记日期') }}</p>
          <p>{{ detail.mortgage_registration_date ? tool.showDate(detail.mortgage_registration_date) : '--' }}</p>
        </a-col>
        <a-col :span="12" class="item-txt">
          <p>{{ t('保险到期日') }}</p>
          <p>{{ detail.insurance_expire_date ? tool.showDate(detail.insurance_expire_date) : '--' }}</p>
        </a-col>
        <a-col :span="24" class="item-txt">
          <p>{{ t('担保公司') }}</p>
          <p>{{ detail.insurance_company || '--' }}</p>
        </a-col>
        <a-col :span="24" class="item-txt">
          <p>{{ t('地址') }}</p>
          <p>{{ addressInfo(detail) }}</p>
        </a-col>
        <a-col v-if="detail.remark" :span="24" class="item-txt">
          <p>{{ t('备注') }}</p>
          <p>{{ detail.remark }}</p>
        </a-col>
      </a-row>

      <template v-if="!Boolean(detail?.is_repayment)">
        <drawdownre-quest 
          v-if="!projectDetail?.base?.is_close && detail.state === 0 && hasPermission('projects:discharge:review') && !isAdd"
          :detail="detail" :p-uuid="uuid"
          @change="update">
          <a-button type="dark" class="big uppercase mt-5" style="width: 100%">{{ t('解押申请') }}</a-button>
        </drawdownre-quest>

        <div v-if="detail?.prev_permission && !isAdd"  class="mt-10">
          <a-popconfirm :title="t('您确实要撤回该请求吗？')" @confirm="recall">
            <a-button type="dark" class="big uppercase" style="width: 100%">{{ t('撤回申请') }}</a-button>
          </a-popconfirm>
        </div>

        <div v-if="detail.has_permission"  class="mt-10">
          <a-popconfirm :title="t('您确定要接受该请求吗？')" @confirm="accept">
            <a-button type="dark" class="big uppercase" style="width: 100%">{{ t('接受请求') }}</a-button>
          </a-popconfirm>
          <div class="mt-4" v-if="!isAdd">
            <p class="text-center color_grey fs_xs my-3">{{ t('您可以点击下面的按钮来退回解押请求。') }}</p>
            <DrawdownBack :uuid="uuid" :detail="detail" @change="update">
              <div class="flex justify-center">
                <a-button type="danger" size="small" shape="round">{{ t('退回请求') }}</a-button>
              </div>
            </DrawdownBack>
          </div>
          <div class="mt-4" v-else>
            <p class="text-center color_grey fs_xs my-3">{{ t('您可以点击下面的按钮来拒绝请求。') }}</p>
            <DrawdownBack :uuid="uuid" :detail="detail" :is-add="isAdd" @change="update">
              <div class="flex justify-center">
                <a-button type="danger" size="small" shape="round">{{ t('拒绝请求') }}</a-button>
              </div>
            </DrawdownBack>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';
import { navigationTo } from '@/utils/tool';
import { hasPermission } from '@/directives/permission/index';
import DrawdownreQuest from './form/DrawdownRequest.vue';
import DrawdownBack from './form/DrawdownBack.vue';
import PreSaleInfo from './PreSaleInfo.vue';
import { dischargeSaveStep, dischargeSaveDStep, dischargeRecall } from '@/api/project/loan';
import { projectDetailDeleteSecurity } from '@/api/process';
import EditDialog from './../pre-sale/components/EditDialog.vue';

const { t } = useI18n();
const emits = defineEmits(['update', 'itemEdit']);

const props = defineProps({
  uuid: {
    type: String
  },
  detail: {
    type: Object
  },
  projectDetail: {
    type: Object
  },
  isAdd: {
    type: Boolean,
    default: false
  }
});

// 同意
const accept = async () => {
  const ajaxFn = props.isAdd ? dischargeSaveDStep : dischargeSaveStep
  await ajaxFn({ p_uuid: props.uuid, uuid: props.detail?.uuid })
    .then((res) => {
      update();
      return true
    })
    .catch(() => {
      return false
    })
};

// 召回
const recall = async () => {
  await dischargeRecall({ p_uuid: props.uuid, uuid: props.detail?.uuid })
    .then((res) => {
      update();
      return true
    })
    .catch(() => {
      return false
    })
};

const update = () => {
  emits('update');
};

const addressInfo = (data) => {
  return `${data.address_short} ${data.address} ${data.suburb} ${data.region_one_name} ${data.country_name}`
}

const editHandle = () => {
  emits('itemEdit')
}

const deleteHandle = async () => {
  await projectDetailDeleteSecurity({
    security_uuid: props.detail.uuid,
    uuid: props.uuid
  })
    .then(() => {
      update()
      return true;
    })
    .catch(() => {
      return false;
    });
}

const infoVisible = ref(false)
const editVisible = ref(false)
</script>

<style scoped lang="less">
@import '@/styles/variables.less';
.detail {
  border: 1px solid #e2e5e2;
  box-shadow: 2px 2px 4px 0 hsla(120, 5%, 89%, 0.15), 5px 5px 7px 0 hsla(0, 0%, 53%, 0.1);
  border-radius: 12px;
  padding: 20px;
  min-height: 340px;

  .title-no {
    font-size: 16px;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    span {
      background-color: @colorPrimary;
      font-size: 10px;
      padding: 4px 5px;
      border-radius: 3px;
      color: #fff;
      margin-right: 5px;
    }
  }
}

.cancel-reason {
  padding: 10px !important;
  margin-bottom: 10px;
  :deep(.ant-alert-message) {
    color: #c1430c !important;
  }
  :deep(.ant-alert-description) {
    font-size: 12px !important;
  }
}

.success-reason {
  padding: 10px !important;
  margin-bottom: 10px;
  :deep(.ant-alert-description) {
    font-size: 12px !important;
  }
}

.item-txt {
  margin-top: 10px;
  &.no {
    margin-top: 0;
  }
  &.total {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }
  p {
    font-size: 12px;
    &:first-child {
      color: #999;
    }
  }
  :deep(.ant-statistic-content) {
    font-size: 13px !important;
  }
}

.item-header {
  border-bottom: 1px solid #e2e5e2;
  padding-bottom: 5px;
  margin-bottom: 10px;
  p {
    span {
      background-color: @colorPrimary;
      font-size: 10px;
      padding: 4px 5px;
      border-radius: 3px;
      color: #fff;
      margin-right: 5px;
    }
  }
  > .flex {
    gap: 10px;
    > .iconfont {
      cursor: pointer;
      color: @colorPrimary;
      &:hover {
        opacity: 0.8;
      }
    }
  }
}
</style>
