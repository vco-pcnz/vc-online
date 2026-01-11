<template>
  <div>
    <!-- 删除确认弹窗 -->
    <vco-confirm-alert ref="delAlertRef" :confirmTxt="t('确定删除吗？')" v-model:visible="delVisible" @submit="sureHandle"></vco-confirm-alert>

    <!-- 提示弹窗 -->
    <a-modal :open="tipsVisible" :title="t('修改方式')" :width="460" :footer="null" :keyboard="false" :maskClosable="false" @cancel="tipsVisible = false">
      <div class="tips-content">
        <a-radio-group v-model:value="changeType">
          <a-radio :value="2" class="mt-4"
            ><p class="tips-txt">{{ t('保持所有未来预测不变。') }}</p></a-radio
          >
          <a-radio :value="1" class="mt-4"
            ><p class="tips-txt">{{ t('保持手动编辑的预测不变，并按比例调整剩余预测。') }}</p></a-radio
          >
          <a-radio :value="0" class="mt-4"
            ><p class="tips-txt">{{ t('按比例调整所有未来预测，并覆盖所有手动输入。') }}</p></a-radio
          >
        </a-radio-group>

        <div class="mt-5 flex justify-between gap-5">
          <a-button type="grey" class="big shadow bold uppercase w-full mb-5 mt-5" @click="tipsVisible = false">{{ t('取消') }}</a-button>

          <a-button type="dark" class="big shadow bold uppercase w-full mb-5 mt-5" :loading="subLoading" @click="sureHandle">{{ t('提交') }}</a-button>
        </div>
      </div>
    </a-modal>

    <div class="table-content">
      <div class="col-item th">
        <div class="item uppercase"></div>
        <div class="item uppercase">{{ t('月份') }}</div>
        <div class="item uppercase">{{ t('预测类型') }}</div>
        <div class="item uppercase" v-if="projectDetail?.product?.code === 'vsl'">{{ t('贷款方') }}</div>
        <div class="item uppercase" v-else v-show="false">{{ t('客户经理') }}</div>
        <div class="item uppercase">{{ t('实时预报') }}</div>
        <div class="item uppercase">{{ t('日期') }}</div>
        <div class="item uppercase">{{ t('借记/贷记') }}</div>
        <div v-if="!itemId && false" class="item uppercase">{{ t('绩效指标预测') }}</div>
        <div class="item uppercase">{{ t('说明') }}</div>
        <div v-if="!itemId" class="item uppercase history">{{ t('历史') }}</div>
        <div v-else-if="Boolean(!projectDetail?.base?.is_close)" class="item uppercase opt text-right">{{ t('操作') }}</div>
      </div>

      <div class="col-content">
        <template v-for="(_item, key) in data?.list">
          <div
            v-for="(item, index) in data?.list[key]"
            :key="item.id"
            class="col-item"
            :class="{ passed: item.status != 0 || item.first, yellow: item.type == 4 && item.first, red: item.is_hide, item: itemId, grace: item.is_grace }"
            @click="showLog(item)"
          >
            <div class="item flex items-center"><span class="circle" :style="{ background: item.status != 0 || item.first ? '#181818' : '#b4d8d8' }"></span></div>
            <div class="item">
              <template v-if="!index"> {{ tool.monthYear(item.ym) }}</template>
            </div>
            <div class="item">{{ item.name }}</div>
            <div class="item" v-if="projectDetail?.product?.code === 'vsl'">{{ item.source ? 'BOC' : 'VS' }}</div>
            <div class="item flex items-center" v-else v-show="false"><vco-avatar :size="30"></vco-avatar></div>
            <div class="item">
              <div class="flex items-center justify-between" v-if="item?.forecast_log?.length && item.status != 0">
                <span class="mr-3 color_grey fs_xs">{{ tool.showDate(item.forecast_log[item.forecast_log.length - 1].create_time, 'DD/MM') }}</span>
                <vco-number :value="item.forecast_log[item.forecast_log.length - 1].amount" :precision="2" size="fs_md" prefix="" suffix=""></vco-number>
              </div>

              <div class="flex items-center justify-between" v-else>
                <span class="mr-3 color_grey fs_xs">{{ tool.showDate(item.date, 'DD/MM') }}</span>
                <template v-if="item.status != 0 || item.first">
                  <vco-number :value="item.amount" color="#181818" :bold="false" :precision="2" size="fs_md" prefix="" suffix=""></vco-number>
                </template>
                <template v-else-if="item.type == 2">
                  <vco-number :value="item.amount" color="#569695" :bold="true" :precision="2" size="fs_md" prefix="" suffix=""></vco-number>
                </template>
                <template v-else>
                  <vco-number :value="item.amount" color="#d6a91f" :bold="true" :precision="2" size="fs_md" prefix="" suffix=""></vco-number>
                </template>
                <!-- <vco-number :value="item.amount" :color="item.status != 0 || item.first ? '#181818' : '#569695'" :bold="item.status != 0 || item.first ? false : true" :precision="2" size="fs_md" prefix="" suffix=""></vco-number> -->
              </div>
            </div>
            <div class="item">
              <div v-if="item.status != 0 || item.first" style="color: #181818">
                {{ tool.showDate(item.date) }}
              </div>
              <div v-else-if="item.type == 2" style="color: #569695">
                {{ tool.showDate(item.date) }}
              </div>
              <div v-else style="color: #d6a91f">
                {{ tool.showDate(item.date) }}
              </div>
            </div>
            <div class="item">
              <vco-number v-if="item.status != 0 || item.first" :value="item.amount" :bold="true" :precision="2" size="fs_md" prefix="" suffix=""></vco-number>
            </div>
            <div v-if="!itemId && false" class="item">
              <template v-if="item.kpi !== null">{{ item.kpi }}%</template>
            </div>
            <div class="item">
              <p class="bold black text-ellipsis overflow-hidden text-nowrap" :title="item.note" style="width: 220px">{{ item.note }}</p>
            </div>
            <div v-if="!itemId" class="item history">
              <i class="iconfont nav-icon" v-if="!item.first">&#xe794;</i>
              <i class="iconfont grace-icon" v-if="(item.is_grace && hasPermission('projects:forecast:grace')) || (item.status == 0 && hasPermission('projects:forecast:delete'))" @click.stop="removeHandle(item, item.is_grace)">&#xe8c1;</i>
            </div>
            <div v-else-if="Boolean(!projectDetail?.base?.is_close)" class="item opt">
              <i v-if="item.first || item.status != 0" class="iconfont disabled">&#xe8cf;</i>
              <Add v-else :uuid="uuid" :item-id="itemId" :projectDetail="projectDetail" :item-date="item" @update="update">
                <i class="iconfont">&#xe8cf;</i>
              </Add>
              <i class="iconfont" :class="{ disabled: item.first || item.status != 0 }" @click="removeHandle(item)">&#xe8c1;</i>
            </div>
          </div>
        </template>
      </div>
    </div>
    <a-empty v-if="data?.list.constructor === Array && !data?.list.length" />
    <div class="flex justify-center pb-8 gap-5" v-if="!projectDetail?.base?.is_close">
      <Add :uuid="uuid" :item-id="itemId" :projectDetail="projectDetail" @update="update">
        <a-button type="brown" shape="round" size="small">add forecast</a-button>
      </Add>
      <GracePeriod :uuid="uuid" :table-data="data?.list" :projectDetail="projectDetail" @update="update" v-if="!itemId && hasPermission('projects:forecast:grace')">
        <a-button type="brown" shape="round" size="small">{{ t('宽限期') }}</a-button>
      </GracePeriod>
    </div>
    <div class="static-block">
      <div class="item">
        <p>period</p>
        <h3>{{ data?.period1 }} months</h3>
        <div class="info">{{ data?.period2 }} months</div>
      </div>
      <div class="item sec-item ml-10">
        <p class="item-title">drawdowns</p>
        <h3>{{ data?.drawdowns1 }} drawdowns</h3>
        <div class="info">{{ data?.drawdowns2 }} drawdowns</div>
      </div>
      <div class="item sec-item mr-5">
        <p class="item-title">estimated available draw amount</p>
        <div class="flex justify-end items-center gap-1">
          <!-- <i class="iconfont" style="color: #7dc1c1">&#xe78b;</i> -->
          <vco-number :value="data?.estimated || 0" color="#7dc1c1" size="fs_xl" :precision="2"></vco-number>
        </div>
        <!-- <div class="info flex items-center justify-end"><vco-number :value="data?.estimated2 || 0" color="#fff" size="fs_xs" :precision="2" class="mr-3"></vco-number> available</div> -->
      </div>
      <div class="item sec-item mr-5">
        <p class="item-title">estimated repayments</p>
        <div class="flex justify-end items-center gap-1">
          <!-- <i class="iconfont" style="color: #7dc1c1">&#xe78b;</i> -->
          <vco-number :value="Math.abs(data?.payment) || 0" color="#d6a91f" size="fs_xl" :precision="2"></vco-number>
        </div>
        <!-- <div class="info flex items-center justify-end"><vco-number :value="data?.estimated2 || 0" color="#fff" size="fs_xs" :precision="2" class="mr-3"></vco-number> available</div> -->
      </div>
      <div class="item sec-item mr-5">
        <p class="item-title">Estimated Loan drawdowns</p>
        <div class="flex justify-end items-center gap-1">
          <!-- <i class="iconfont" style="color: #7dc1c1">&#xe78b;</i> -->
          <vco-number :value="data?.est || 0" color="#fff" size="fs_xl" :precision="2"></vco-number>
        </div>
      </div>
      <div class="item sec-item">
        <p class="item-title">actual loan withdrawn</p>
        <vco-number :value="data?.withdrawn1 || 0" color="#ffffff" size="fs_xl" :precision="2"></vco-number>
        <div class="info">{{ data?.withdrawn2 || 0 }}% from loan</div>
      </div>
      <!-- <div class="item sec-item">
        <p class="item-title">forecasted withdrawn</p>
        <vco-number :value="data?.withdrawn1 || 0" color="#ffffff" size="fs_xl" :precision="2"></vco-number>
        <div class="info">forecasted {{ data?.withdrawn2 || 0 }}% loan</div>
      </div> -->

      <div class="item">
        <p>variance</p>
        <!-- <div class="fs_xl" style="color: hsla(0, 0%, 100%, 0.5)">{{ data?.period1 || 0 }}%</div> -->
      </div>

      <div class="item ml-2">
        <p>points</p>
        <!-- <div class="fs_xl">{{ data?.period2 || 0 }}%</div> -->
      </div>
    </div>
  </div>

  <Log :uuid="uuid" :projectDetail="projectDetail" :logList="logList" :itemDate="itemDate" ref="logRef" @update="update"></Log>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue/es';
import { DownOutlined } from '@ant-design/icons-vue';
import dayjs from 'dayjs';
import tool from '@/utils/tool';
import GracePeriod from './GracePeriod.vue';
import Add from './add.vue';
import Log from './log.vue';
import { projectVariationDeletef } from '@/api/project/variation';
import { forecastDelete } from '@/api/project/loan';
import { hasPermission } from '@/directives/permission/index';

const props = defineProps({
  uuid: {
    type: [String, Number],
    default: ''
  },
  itemId: {
    type: [String, Number],
    default: ''
  },
  data: {
    type: Object
  },
  projectDetail: {
    type: Object
  }
});

const emits = defineEmits(['update']);
const { t } = useI18n();

const logRef = ref();
const logList = ref([]);
const itemDate = ref();
const showLog = (val) => {
  if (val.first || props.itemId) return;
  logList.value = val.forecast_log;
  itemDate.value = val;
  logRef.value.init();
};

const changeType = ref(undefined);
const tipsVisible = ref(false);
const handleType = ref(0);
const currentParams = ref();

const delAlertRef = ref();
const delVisible = ref(false);

const removeHandle = (data, is_grace) => {
  handleType.value = is_grace;
  const { id, date, type } = data;
  const params = {
    apply_uuid: props.uuid,
    id: [id],
    date
  };

  currentParams.value = params;
  if (is_grace) {
    delVisible.value = true;
  } else {
    if (type === 4 || data.amount == '0.00') {
      changeType.value = 2;
      delVisible.value = true;
    } else {
      tipsVisible.value = true;
    }
  }
};

const subLoading = ref(false);
const sureHandle = () => {
  if (!handleType.value) {
    if (changeType.value === undefined) {
      message.error(t('请选择') + t('修改方式'));
      return false;
    }
  }
  if (!props.itemId) {
    // 当前页面删除 宽限期的固定为2 其他的需要选择修改方式
    subLoading.value = true;
    forecastDelete({ id: currentParams.value.id, apply_uuid: props.uuid, change: handleType.value ? 2 : changeType.value })
      .then(() => {
        subLoading.value = false;
        tipsVisible.value = false;

        emits('update');
        if (delAlertRef.value) {
          delVisible.value = false;
          delAlertRef.value.changeLoading(false);
        }
      })
      .catch(() => {
        subLoading.value = false;
        if (delAlertRef.value) {
          delAlertRef.value.changeLoading(false);
        }
      });
  } else {
    // 变更的删除
    const params = {
      ...currentParams.value,
      change: changeType.value,
      variation_id: props.itemId
    };

    subLoading.value = true;
    projectVariationDeletef(params)
      .then(() => {
        subLoading.value = false;
        tipsVisible.value = false;

        emits('update');
        if (delAlertRef.value) {
          delVisible.value = false;
          delAlertRef.value.changeLoading(false);
        }
      })
      .catch(() => {
        subLoading.value = false;
        if (delAlertRef.value) {
          delAlertRef.value.changeLoading(false);
        }
      });
  }
};

const update = () => {
  emits('update');
};
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.table-content {
  margin-bottom: 20px;
  min-height: 150px;
  padding-top: 15px;
  .col-item {
    width: 100%;
    display: flex;
    margin: 5px 0;
    &.th {
      font-weight: bold;
      color: @color_grey;
      font-size: 10px;
    }
    > .item {
      padding: 0 15px;
      flex: 1;
      &:nth-child(1) {
        flex: 0 0 60px;
      }
      &:nth-child(2) {
        flex: 0 0 100px;
      }
      &:nth-child(4) {
        flex: 0 0 80px;
        text-align: center;
      }
      &:nth-child(6) {
        flex: 0 0 110px;
        text-align: center;
      }
      &:nth-child(5),
      &:nth-child(7) {
        text-align: center;
      }
      &:nth-child(8) {
        flex: 0 0 250px;
        text-align: center;
      }
      &:nth-child(9) {
        flex: 0 0 150px;
      }
      &:nth-child(10),
      &.history {
        flex: 0 0 100px;
        text-align: right;
      }
      &:nth-child(2) {
        text-align: left;
      }
      .note {
        font-size: 12px;
        color: #666;
      }
      .iconfont {
        font-size: 14px;
        margin-right: 5px;
      }
      &.opt {
        flex: 0 0 100px;
        align-items: center;
        flex-direction: row !important;
        justify-content: flex-end !important;
        i {
          cursor: pointer;
          color: @colorPrimary;
          display: inline-block;
          &.disabled {
            pointer-events: none;
            color: #999 !important;
          }
          &:hover {
            opacity: 0.8;
          }
          &:last-child {
            margin-left: 5px;
          }
        }
      }
    }
  }
  .col-content {
    margin-top: 10px;
    .col-item {
      padding: 6px 0;
      border-bottom: 1px solid #e2e5e2;
      cursor: pointer;
      &.item {
        cursor: default;
      }
      .item {
        &:nth-child(6) {
          color: #569695;
          position: relative;
          &::after {
            display: inline-block;
            content: '';
            position: absolute;
            left: 0;
            // top: 8px;
            height: 15px;
            border-left: 1px solid #888;
          }
        }
      }
      &.passed {
        background-color: #f0f0f0 !important;
        border-radius: 10px;
        border-bottom: none;
        cursor: auto;
        .item {
          &:nth-child(6) {
            color: #181818;
          }
        }
      }
      &.yellow {
        background-color: #f19915 !important;
      }

      &.red {
        background-color: #ffa7a7 !important;
      }

      &.grace {
        background-color: #f1dde4 !important;
      }

      > .item {
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
    }
  }
}

.static-block {
  background-color: #181818;
  color: #fff;
  align-items: flex-start;
  display: flex;
  padding: 20px 15px;
  border-radius: 12px;
  margin-top: 10px;
  font-weight: 500;
  > .item {
    text-align: right;

    &:nth-child(1),
    &:nth-child(2) {
      text-align: left;
    }
    &:nth-child(3) {
      flex: 1;
    }
    &:nth-child(4),
    &:nth-child(5),
    &:nth-child(6) {
      width: 200px;
    }
    &:nth-child(7) {
      width: 100px;
    }
    > p {
      color: hsla(0, 0%, 100%, 0.5);
      font-size: 12px;
      font-weight: 400;
      margin-bottom: 6px;
      > span {
        padding-left: 5px;
      }
    }
    > h3 {
      font-size: 18px;
      line-height: 1.2;
    }
    > .info {
      font-size: 12px;
      > span {
        padding-left: 5px;
      }
    }
  }
  .sec-item {
    text-align: right;
  }
  .line {
    width: 1px;
    background-color: hsla(200, 9%, 66%, 0.3);
    margin: 0 8px;
  }
}

.nav-icon {
  transform: rotate(-45deg);
  color: #bf9425;
  font-size: 10px !important;
  top: 20px;
  position: relative;
}

.circle {
  background-color: #b4d8d8;
  border: 1px solid;
  border-radius: 4px;
  display: inline-block;
  height: 8px;
  width: 8px;
}

.grace-icon {
  position: absolute;
  right: 4px;
  color: red;
}
</style>
