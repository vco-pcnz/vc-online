<template>
  <div class="info-content">
    <security-dialog
      v-model:visible="securityDialogVisible"
      :current-id="uuid"
      :security-data="securityData"
      :is-view="true"
    ></security-dialog>

    <!-- 首次放款选择弹窗 -->
    <a-modal
      :open="selectVisible"
      :title="t('进度付款阶段')"
      :width="1500"
      :footer="null"
      :keyboard="false"
      :maskClosable="false"
      class="middle-position"
      @cancel="selectVisible = false"
    >
      <view-content
        v-if="selectVisible"
        :is-view="true"
        :variation-id="id"
        :selected-data="hasSetData ? selectedData : []"
      ></view-content>
    </a-modal>

    <div class="variation-type" :class="{ 'late': Number(variationsInfo.is_late) === 1 }">{{ Number(variationsInfo.is_late) === 1 ? t('延迟变更') : t('正常变更') }}</div>

    <div class="title-content">
      <div class="title">
        <i class="iconfont">&#xe73a;</i>
        <span>{{ t('变更请求详情') }}</span>
      </div>
      <a-button
        v-if="variationsInfo.state === 0 && hasPermission('projects:variations:edit')"
        type="primary"
        size="small"
        shape="round"
        class="uppercase mb-2"
        @click="openEdit"
        >{{ t('编辑') }}</a-button
      >
    </div>

    <a-alert v-if="variationsInfo?.cancel_reason" :message="t('退回原因')" :description="variationsInfo?.cancel_reason" type="error" class="cancel-reason" />

    <a-row v-if="Object.keys(variationsInfo).length" :gutter="24" class="mt-5">
      <a-col :span="24" class="item-txt">
        <p class="name">{{ t('变更类型') }}</p>
        <p class="txt">{{ variationsInfo.type_name }}</p>
      </a-col>
      <a-col :span="6" class="item-txt">
        <p class="name">{{ t('变更开始日期') }}</p>
        <p class="txt">{{ variationsInfo.start_date ? tool.showDate(variationsInfo.start_date) : '--' }}</p>
      </a-col>
      <a-col :span="6" class="item-txt" v-if="variationsInfo.old_start_date">
        <p class="name">{{ t('上次变更开始日期') }}</p>
        <p class="txt">{{ variationsInfo.old_start_date ? tool.showDate(variationsInfo.old_start_date) : '--' }}</p>
      </a-col>
      <a-col :span="6" class="item-txt">
        <p class="name">{{ t('变更后结束日期') }}</p>
        <p v-if="variationsInfo.end_date" class="txt">{{ tool.showDate(variationsInfo.end_date) }}</p>
        <p v-else class="txt">{{ tool.showDate(detail?.date?.end_date) }}</p>
      </a-col>
      <template v-if="creditItemsData.length">
        <a-col v-for="(item, index) in creditItemsData" :span="6" class="item-txt" :key="index">
          <p class="name">{{ item.credit_name }}</p>
          <p v-if="item.is_ratio" class="txt">{{ variationsInfo.credit[item.credit_table] }}%</p>
          <vco-number v-else :value="variationsInfo.credit[item.credit_table]" :precision="2"></vco-number>
        </a-col>
      </template>

      <a-col v-if="Number(securityAmount)" :span="24" class="item-txt">
        <p class="name">{{ t('抵押物总价值') }}</p>
        <div class="txt-box line-info-box">
          <vco-number :value="statistics.all_money" :precision="2"></vco-number>
          <i class="iconfont" style="color: #31bd65">&#xe712;</i>
          <div class="flex items-center gap-2">
            <vco-number :value="securityAmount" color="#31bd65" :precision="2"></vco-number>
            <i class="iconfont view-icon" @click="securityDialogVisible = true">&#xe63e;</i>
          </div>
          <i class="iconfont">&#xe609;</i>
          <vco-number :value="changeSecurityAfter" color="#31bd65" :precision="2"></vco-number>
        </div>
      </a-col>

      <a-col :span="24" class="item-txt">
        <p class="name">{{ t('开发成本') }}</p>
        <div class="txt-box line-info-box">
          <vco-number :value="props.detail?.credit?.right?.devCost" :precision="2"></vco-number>
          <i class="iconfont" v-if="[1, 4].includes(Number(variationsInfo.type))" style="color: #31bd65">&#xe712;</i>
          <i class="iconfont" v-else style="color: #eb4b6d">&#xe711;</i>

          <DevCostDetail
            :dataJson="devCostJsonData"
            :disabledGST="true"
            :disabledLoan="true"
            :disabledModel="true"
            :is-variation="true"
            :uuid="uuid"
            :remain-land-amount="Number(props.detail?.base?.remain_land_amount) || 0"
            :is-plus="[1, 4].includes(Number(variationsInfo.type))"
            :edit="false"
          >
            <div class="flex items-center gap-2">
              <vco-number :value="changeCost" :color="numberColor" :precision="2"></vco-number>
              <i class="iconfont view-icon">&#xe63e;</i>
            </div>
          </DevCostDetail>

          <i class="iconfont">&#xe609;</i>
          <vco-number :value="changeCostAfter" :color="numberColor" :precision="2"></vco-number>
        </div>
      </a-col>

      <a-col :span="24" class="item-txt">
        <p class="name">{{ t('变更金额') }}</p>
        <div class="txt-box line-info-box">
          <div class="flex items-center gap-2">
            <vco-number :value="landChangeNum" :precision="2"></vco-number>
            <p class="text-xs text-gray-500">({{ t('土地贷款总额') }})</p>
          </div>
          <i class="iconfont">&#xe712;</i>
          <div class="flex items-center gap-2">
            <vco-number :value="buildChangeNum" :precision="2"></vco-number>
            <i v-if="Number(variationsInfo.amount) && variationsInfo?.build?.data" class="iconfont view-icon" @click="showSelectData(false)">&#xe63e;</i>
            <p class="text-xs text-gray-500">({{ t('建筑贷款总额') }})</p>
          </div>
          <i class="iconfont">&#xe609;</i>
          <div v-if="Number(variationsInfo.amount)" class="flex items-center gap-2">
            <i class="iconfont" v-if="[1, 4].includes(Number(variationsInfo.type))" style="color: #31bd65">&#xe712;</i>
            <i class="iconfont" v-else style="color: #eb4b6d">&#xe711;</i>
            <vco-number :value="Number(variationsInfo.amount)" :color="numberColor" :precision="2"></vco-number>
          </div>
          <vco-number v-else :value="0" :precision="2"></vco-number>
        </div>
      </a-col>
      <a-col :span="24" class="item-txt">
        <p class="name">{{ t('变更后首次放款') }}</p>
        <div class="txt-box line-info-box">
          <div class="flex items-center gap-2">
            <vco-number :value="Number(variationsInfo.initial_land_amount || 0)" :precision="2"></vco-number>
            <p class="text-xs text-gray-500">({{ t('首次土地贷款放款额') }})</p>
          </div>
          <i class="iconfont">&#xe712;</i>
          <div class="flex items-center gap-2">
            <vco-number :value="Number(variationsInfo.initial_build_amount || 0)" :precision="2"></vco-number>
            <i v-if="variationsInfo.build_log && variationsInfo.build_log?.length" class="iconfont view-icon" @click="showSelectData(true)">&#xe63e;</i>
            <p class="text-xs text-gray-500">({{ t('首次建筑贷款放款额') }})</p>
          </div>
          <i class="iconfont">&#xe609;</i>
          <div v-if="Number(variationsInfo.initial_amount)" class="flex items-center gap-2">
            <vco-number :value="Number(variationsInfo.initial_amount)" :precision="2"></vco-number>
          </div>
          <vco-number v-else :value="0" :precision="2"></vco-number>
        </div>
      </a-col>
      <a-col :span="24" class="item-txt">
        <p class="name">{{ t('说明') }}</p>
        <p class="txt">{{ variationsInfo.note || '--' }}</p>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import tool, { navigationTo } from '@/utils/tool';
import { dischargeStatistics } from '@/api/project/loan';
import { hasPermission } from '@/directives/permission/index';
import securityDialog from '@/views/projects/variations/add/components/security-dialog.vue';
import ViewContent from '@/views/projects/variations/add/components/view-content.vue';
import DevCostDetail from '@/views/process/temp/default/components/DevCostDetail.vue';

import { cloneDeep } from 'lodash';

const { t } = useI18n();

const props = defineProps({
  uuid: {
    type: [String, Number],
    default: ''
  },
  id: {
    type: [String, Number],
    default: ''
  },
  detail: {
    type: Object,
    default: () => {}
  },
  creditItemsData: {
    type: Array,
    default: () => []
  }
});

const variationsInfo = computed(() => {
  return props.detail?.variationInfo || {};
});

const securityData = computed(() => {
  return variationsInfo.value.security || [];
})

const numberColor = computed(() => {
  let color = '282828';
  if (Number(variationsInfo.value.amount)) {
    if ([1, 4].includes(Number(variationsInfo.value.type))) {
      color = '#31bd65';
    } else {
      color = '#eb4b6d';
    }
  }
  return color;
});

const openEdit = () => {
  navigationTo(`/projects/variations/add?uuid=${props.uuid}&id=${variationsInfo.value.id}`);
};

const statistics = ref({
  all_money: 0
})

const getsecurityInfo = () => {
  dischargeStatistics({ uuid: props.uuid }).then((res) => {
    statistics.value = res
  });
}

const securityAmount = computed(() => {
  const security = variationsInfo.value.security || []
  if (security.length) {
    return security.reduce((acc, item) => tool.plus(acc, item.amount), 0);
  } else {
    return 0;
  }
})

const changeSecurityAfter = computed(() => {
  return tool.plus(statistics.value.all_money, securityAmount.value);
})

const securityDialogVisible = ref(false)

const devCostJsonData = computed(() => {
  return variationsInfo.value.devCostDetail || []
})

const changeCost = computed(() => {
  const data = cloneDeep(devCostJsonData.value);
  let num = 0;
  if (data.length) {
    const itemData = data[0].data[0].list || []
    // 平铺itemData 并计算change_value 的合
    const flatData = itemData.flatMap((item) => item.list || []);
    const mergeData = [...itemData, ...flatData];
    const changeValue = mergeData.reduce((acc, item) => tool.plus(acc, item.change_value || 0), 0);
    num = changeValue;
  }
  return num;
});

const changeCostAfter = computed(() => {
  let changeNum = changeCost.value || 0
  let resNum = 0
  if ([1, 4].includes(Number(variationsInfo.value.type))) {
    resNum = tool.plus(props.detail?.credit?.right?.devCost || 0, changeNum)
  }
  if ([2, 5].includes(Number(variationsInfo.value.type))) {
    resNum = tool.minus(props.detail?.credit?.right?.devCost || 0, changeNum)
  }

  if ([3].includes(Number(variationsInfo.value.type))) {
    resNum = props.detail?.credit?.right?.devCost || 0
  }
  return resNum;
});

const landChangeNum = computed(() => {
  const data = cloneDeep(devCostJsonData.value);
  if (data.length) {
    const itemData = data[0].data[0].list || []
    const land = itemData.find(item => item.name === 'Land')
    if (land) {
      return land.change_value || 0
    }
  } else {
    return 0;
  }
})

const buildChangeNum = computed(() => {
  const data = cloneDeep(devCostJsonData.value);
  if (data.length) {
    const itemData = data[0].data[0].list || []
    const flatData = itemData.flatMap((item) => item.list || []);
    const mergeData = [...itemData, ...flatData];
    const buildList = mergeData.filter(item => !['Land', 'Land GST'].includes(item.name) && !item.list)
    
    const changeValue = buildList.reduce((acc, item) => tool.plus(acc, item.change_value || 0), 0);
    return changeValue
  } else {
    return 0;
  }
})

const selectVisible = ref(false)
const selectedData = computed(() => {
  return variationsInfo.value.build_log || []
})

const hasSetData = ref(false)
const showSelectData = (type) => {
  hasSetData.value = type
  selectVisible.value = true
}

onMounted(() => {
  getsecurityInfo()
})
</script>

<style lang="less" scoped>
.info-content {
  background-color: #fbfbfb;
  border: 1px solid #fbfbfb;
  border-radius: 10px;
  box-shadow: 0 0 8px 0 rgba(0, 0, 0, 0.1);
  padding: 30px;
  position: relative;
  overflow: hidden;
  > .variation-type {
    color: #389e0d;
    background: #f6ffed;
    border: 1px solid #b7eb8f;
    padding: 2px 30px;
    position: absolute;
    border-top-left-radius: 10px;
    border-bottom-right-radius: 10px;
    top: 0;
    left: 0;
    font-weight: bold;
    &.late {
      color: #cf1322;
      background: #fff1f0;
      border: 1px solid #ffa39e;
    }
  }
  > .title-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    > .title {
      display: flex;
      align-items: center;
      gap: 8px;
      > span {
        font-weight: 500;
        font-size: 14px;
      }
    }
  }
}

.item-txt {
  margin-bottom: 20px;
  &:last-child {
    margin-bottom: 0;
  }
  > p {
    font-size: 13px;
    &.name {
      color: #999;
      margin-bottom: 3px;
    }
    &.txt {
      font-size: 18px;
      font-weight: 500;
      color: #181818;
    }
  }
  .txt-box {
    display: flex;
    align-items: center;
    gap: 2px;
    &.line-info-box {
      gap: 15px;
    }
  }
  :deep(.ant-statistic-content) {
    font-size: 18px !important;
    font-weight: 500 !important;
  }
}

.cancel-reason {
  padding: 10px !important;
  margin-bottom: 10px;
  margin-top: 10px;
  :deep(.ant-alert-description) {
    font-size: 12px !important;
  }
}

.view-icon {
  cursor: pointer;
  color: #f19915;
  &:hover {
    color: #ccab47;
  }
}
</style>
