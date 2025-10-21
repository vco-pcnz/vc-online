<template>
  <div>
    <!-- 对账 -->
    <ReconciliationModal ref="reconciliationModalRef" :detail="itemDetail" :uuid="currentId" :type="ReconciliationType" :isSchedule="true" @update="getDataInfo"> </ReconciliationModal>
    <a-spin :spinning="pageLoading" size="large">
      <a-modal :open="visible" :title="t('增加存蓄费')" :width="500" :footer="null" :keyboard="false" :maskClosable="false" @cancel="visible = false">
        <div class="sys-form-content mt-5">
          <a-form ref="formRef" layout="vertical" :model="formState" :rules="formRules">
            <a-form-item :label="t('名称')" name="cate">
              <a-select v-model:value="formState.cate" style="width: 100%" :options="cateData"></a-select>
            </a-form-item>
            <a-form-item :label="t('日期')" name="date">
              <a-date-picker v-model:value="formState.date" :format="selectDateFormat()" :disabledDate="disabledDateFormat" placeholder="" />
            </a-form-item>
            <a-form-item :label="t('金额')" name="amount">
              <a-input-number v-model:value="formState.amount" :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')" :parser="(value) => value.replace(/\$\s?|(,*)/g, '')" />
            </a-form-item>
            <a-form-item :label="t('说明')" name="note">
              <a-textarea v-model:value="formState.note" />
            </a-form-item>
          </a-form>

          <a-button type="dark" class="big shadow bold uppercase w-full mb-5 mt-5" :loading="saveLoading" @click="submitHandle">{{ t('保存') }}</a-button>
        </div>
      </a-modal>

      <a-modal :open="adVisible" :title="t('账户详情')" :width="500" :footer="null" :keyboard="false" :maskClosable="false" @cancel="adVisible = false">
        <div class="sys-form-content mt-5">
          <a-form ref="adFormRef" layout="vertical" :model="adFormState" :rules="adFormRules">
            <a-form-item :label="t('项目周期')">
              <div class="flex items-center gap-2">
                <p>{{ tool.showDate(statisticsData.day.sday) }}</p>
                ～
                <p>{{ tool.showDate(statisticsData.day.eday) }}</p>
              </div>
            </a-form-item>
            <a-form-item :label="t('快捷选择')">
              <a-select v-model:value="quickDate" style="width: 100%" @change="quickDateChange">
                <a-select-option v-for="item in quickDateData" :key="item.value" :value="item.value">
                  <p>{{ item.label }}</p>
                  <div class="flex items-center gap-2 text-gray-500 mt-0.5">
                    <p>{{ tool.showDate(item.startDate) }}</p>
                    ～
                    <p>{{ tool.showDate(item.endDate) }}</p>
                  </div>
                </a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item :label="t('开始日期2')" name="s_date">
              <a-date-picker v-model:value="adFormState.s_date" :format="selectDateFormat()" :disabledDate="adDisabledSdateFormat" @change="quickDate = ''" />
            </a-form-item>
            <a-form-item :label="t('结束日期2')" name="date">
              <a-date-picker v-model:value="adFormState.date" :format="selectDateFormat()" :disabledDate="adDisabledDateFormat" @change="quickDate = ''" />
            </a-form-item>
          </a-form>

          <a-button type="dark" class="big shadow bold uppercase w-full mb-5 mt-5" :loading="adLoading" @click="adSubmitHandle">{{ t('下载') }}</a-button>
        </div>
      </a-modal>

      <div style="min-height: 200px">
        <div v-if="statisticsData && tabData.length" class="flex header-static" :class="{ 'mt-10': itemId }">
          <div class="item-content">
            <div class="item">
              <div class="line one"></div>
              <div class="info-content">
                <p>{{ t('当前余额') }}</p>
                <vco-number class="num" :value="statisticsData?.currentBalance" :precision="2" :end="true"></vco-number>
                <div>
                  <vco-number :value="statisticsData?.available" color="#666666" size="fs_xs" :precision="2" :end="true"></vco-number>
                  <span>{{ t('可用余额') }}</span>
                </div>
              </div>
            </div>
            <div class="item" v-if="!ptRole">
              <div class="line-content">
                <div class="round"></div>
                <div class="round"></div>
                <div class="round"></div>
                <div class="round"></div>
              </div>
              <div class="info-content">
                <p>{{ t('应计利息') }}</p>
                <vco-number class="num" :value="statisticsData?.accruedInterest" :precision="2" :end="true"></vco-number>
              </div>
            </div>
            <div class="chart-content">
              <v-chart :option="option" autoresize />
            </div>
            <div class="item">
              <div class="info-content">
                <p>{{ 'Facility limit 2' }}</p>
                <vco-number class="num" :value="statisticsData?.forecastFC2" :precision="2" :end="true"></vco-number>
                <div>
                  <span>{{ t('包括利息和费用') }}</span>
                </div>
              </div>
              <div class="line two"></div>
            </div>
            <div class="item">
              <div class="info-content">
                <p>{{ t('还款') }}</p>
                <vco-number class="num" :value="statisticsData?.repayments" :precision="2" :end="true"></vco-number>
                <div>
                  {{ statisticsData.repaid }}%
                  <span>{{ t('已偿还') }}</span>
                </div>
              </div>
              <div class="line three"></div>
            </div>
          </div>

          <div class="flex flex-col items-center gap-6">
            <a-button v-if="budget" :loading="downloading" type="dark" class="big shadow bold uppercase flex-button" @click="budgetExport">
              {{ t('创建报告') }}
            </a-button>
            <a-dropdown v-else :trigger="['click']">
              <a-button :loading="downloading" type="dark" class="big shadow bold uppercase flex-button">
                {{ t('创建报告') }}
                <DownOutlined />
              </a-button>
              <template #overlay>
                <a-menu>
                  <a-menu-item v-if="!ptRole && !hideForcast && !isOld && !hideLinefee">
                    <div class="pt-2 pb-2" @click="downLoadExcel(0)">{{ t('额度费用计算时间表') }}</div>
                  </a-menu-item>
                  <a-menu-item v-if="!ptRole && !hideForcast && !isOld">
                    <div class="pt-2 pb-2" @click="downLoadExcel(1)">{{ t('预测放款时间表') }}</div>
                  </a-menu-item>
                  <a-menu-item>
                    <div class="pt-2 pb-2" @click="downLoadExcel(2)">{{ t('放款时间表') }}</div>
                  </a-menu-item>
                  <a-menu-item v-if="!ptRole">
                    <div class="pt-2 pb-2" @click="downLoadExcel(3)">{{ t('预测表IRR') }}</div>
                  </a-menu-item>
                  <a-menu-item v-if="hasPermission('projects:repayments:adDownload') && !isProcess && !hideAccountDetails && !isVariation">
                    <div class="pt-2 pb-2" @click="downLoadExcel(4)">{{ t('账户详情') }}</div>
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>

            <!-- <a-button
              v-if="hasPermission('projects:about:add:savings') && isAbout && !isClose && !itemId && !budget"
              type="brown" shape="round" size="small"
              @click="visible = true"
            >
              {{ t('增加存蓄费') }}
            </a-button> -->

            <div class="flex flex-col items-center gap-3">
              <a-button
                v-if="isAbout && !isClose && !itemId && !budget && hasPermission('projects:schedule:reset')"
                type="brown"
                shape="round"
                size="small"
                class="flex items-center justify-center"
                @click="navigationTo(`/projects/schedule/reset?uuid=${currentId}`)"
              >
                {{ t('重置当前预测表') }}
                <RightOutlined :style="{ fontSize: '11px', 'margin-inline-start': '4px' }" />
              </a-button>
              <a-button v-if="itemId && variationInfo.state !== 1000" :loading="updateLoading" @click="updateHandle" type="brown" shape="round" size="small">{{ t('更新明细表') }}</a-button>
            </div>
          </div>
        </div>

        <a-tabs v-if="lateTable" v-model:activeKey="lateTabActiveKey" @change="lateTableChange">
          <a-tab-pane key="1" :tab="t('延迟变更')"></a-tab-pane>
          <a-tab-pane key="2" :tab="t('原本变更')"></a-tab-pane>
        </a-tabs>

        <div v-if="tabData.length" class="table-content">
          <div class="col-item th">
            <div class="item uppercase" :class="{ about: isAbout }"></div>
            <div class="item uppercase">{{ t('日期') }}</div>
            <div class="item uppercase">{{ t('类型') }}</div>
            <div class="item uppercase">{{ t('说明') }}</div>
            <div class="item uppercase">{{ t('利息、费用') }}</div>
            <div class="item uppercase">{{ t('放款') }}</div>
            <div class="item uppercase">{{ t('还款') }}</div>
            <div class="item uppercase balance">{{ t('余额') }}</div>
            <div class="item uppercase ops" v-if="isReconciliation">RC/NR</div>
          </div>

          <div class="col-content">
            <div v-for="(item, index) in tabData" :key="index" class="col-block" :class="{ passed: item.passed }">
              <div v-for="(_item, _index) in item.list" :key="_item.date" class="col-item">
                <div v-if="isAbout" class="item about flex items-center">
                  <span class="circle" :style="{ background: _item.status > 1 || (_item.passed && _item.is_fee) ? '#181818' : '#b4d8d8' }"></span>
                </div>
                <div v-else class="item"></div>
                <div class="item">{{ tool.showDate(_item.date) }}</div>
                <div class="item type">
                  <div v-if="[2, 4].includes(_item.type)">
                    <i v-if="_item.type === 2" class="iconfont">&#xe755;</i>
                    <i v-if="_item.type === 4" class="iconfont">&#xe757;</i>
                    <span>{{ _item.name }}</span>
                  </div>
                  <p v-else>{{ _item.name }}</p>
                </div>
                <div class="item">
                  <p class="note">{{ _item.note }}</p>
                </div>
                <div class="item">{{ _item.fee }}</div>
                <div class="item drawdown">{{ _item.drawdown }}</div>
                <div class="item">{{ _item.repayment }}</div>
                <div class="item balance">
                  <vco-number :value="_item.balance" :precision="2" :end="true"></vco-number>
                </div>
                <div class="item ops cursor-pointer" v-if="isReconciliation"><i v-if="_item.status == 1 && _item.is_irr" class="iconfont" @click="showReconciliationModal(_item)">&#xe601;</i></div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="statisticsData && tabData.length" class="static-block flex">
          <div class="item">
            <p>
              {{ t('目前总计') }}
              <span>{{ statisticsData.now.day }}</span>
            </p>
            <h3 v-if="statisticsData.isBegain">{{ t('{0}天', [statisticsData.now.days]) }}</h3>
            <h3 v-else>{{ t('还有{0}天开放', [statisticsData.now.days]) }}</h3>
          </div>
          <div class="item">
            <p>{{ t('利息及费用') }}</p>
            <vco-number :value="statisticsData.now.interestFees" color="#ffffff" size="fs_md" :precision="2" :end="true"></vco-number>
          </div>
          <div class="item">
            <p>{{ t('提现') }}</p>
            <vco-number :value="statisticsData.now.withdrawn" color="#ffffff" size="fs_md" :precision="2" :end="true"></vco-number>
          </div>
          <div class="item">
            <p>{{ t('已偿还') }}</p>
            <vco-number :value="statisticsData.now.repaid" color="#ffffff" size="fs_md" :precision="2" :end="true"></vco-number>
          </div>
          <div class="item">
            <p>{{ t('余额') }}</p>
            <div class="flex justify-end items-center gap-1">
              <i class="iconfont" style="color: #a9ad57">&#xe767;</i>
              <vco-number :value="statisticsData.now.balance" color="#ffffff" size="fs_xl" :precision="2" :end="true"></vco-number>
            </div>
          </div>
        </div>

        <div v-if="statisticsData && tabData.length && !ptRole" class="static-block flex">
          <div class="item flex">
            <div class="day-box">
              <p>{{ t('估计总数') }}</p>
              <h3>{{ t('{0}天', [statisticsData.last.days]) }}</h3>
              <div class="info">
                {{ t('到期日') }}
                <span v-if="statisticsData.last.day">{{ dayjs(statisticsData.last.day).format('DD/MM/YYYY') }}</span>
              </div>
            </div>
            <div class="flex-1 flex gap-4 justify-end pr-2">
              <div class="sec-item mr-5">
                <p class="item-title">{{ t('总内部收益率') }}</p>
                <div class="flex justify-end items-center gap-1">
                  <i class="iconfont" style="color: #b8cdcc">&#xe761;</i>
                  <h3 class="white">{{ statisticsData.last.irr }}%</h3>
                </div>
              </div>
              <div class="sec-item">
                <p class="item-title">{{ t('利息') }}</p>
                <h3>{{ statisticsData.last.interestRate || 0 }}%</h3>
                <vco-number :value="statisticsData.last.interest || 0" color="#ffffff" size="fs_xs" :precision="2" :end="true"></vco-number>
              </div>
              <div class="line"></div>
              <div class="sec-item">
                <p class="item-title">{{ t('费率') }}</p>
                <h3>{{ statisticsData.last.feesRate || 0 }}%</h3>
                <vco-number :value="statisticsData.last.fees || 0" color="#ffffff" size="fs_xs" :precision="2" :end="true"></vco-number>
              </div>
            </div>
          </div>
          <div class="item">
            <p>{{ t('利息及费用') }}</p>
            <vco-number :value="statisticsData.last.interestFees || 0" color="#ffffff" size="fs_md" :precision="2" :end="true"></vco-number>
          </div>
          <div class="item">
            <p>{{ t('提现') }}</p>
            <vco-number :value="statisticsData.last.withdrawn" color="#ffffff" size="fs_md" :precision="2" :end="true"></vco-number>
            <div class="tips">
              <p>{{ t('facility limit {0}', [1]) }}</p>
              <vco-number :value="statisticsData.last.FC1 || 0" color="#ffffff" size="fs_xs" :precision="2" :end="true"></vco-number>
            </div>
          </div>
          <div class="item">
            <p>{{ t('已偿还') }}</p>
            <vco-number :value="statisticsData.last.repaid" color="#ffffff" size="fs_md" :precision="2" :end="true"></vco-number>
          </div>
          <div class="item">
            <p>{{ t('余额') }}</p>
            <div class="flex justify-end items-center gap-1">
              <i class="iconfont" style="color: #a9ad57">&#xe767;</i>
              <vco-number :value="statisticsData.last.balance || 0" :color="(statisticsData.last.balance || 0) > (statisticsData.last.FC2 || 0) ? '#c1430c' : '#ffffff'" size="fs_xl" :precision="2" :end="true"></vco-number>
            </div>
            <div class="tips">
              <p>{{ t('facility limit {0}', [2]) }}</p>
              <vco-number :value="statisticsData.last.FC2 || 0" color="#ffffff" size="fs_xs" :precision="2" :end="true"></vco-number>
            </div>
          </div>
        </div>

        <a-empty v-if="!statisticsData && !tabData.length && !pageLoading" />
      </div>
    </a-spin>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { DownOutlined, RightOutlined } from '@ant-design/icons-vue';
import dayjs from 'dayjs';
import tool, { selectDateFormat } from '@/utils/tool';
import { hasPermission } from '@/directives/permission';
import {
  projectForecastIndex,
  projectDetailForecastList,
  projectForecastExportExcel,
  projectForecastStatistics,
  projectDetailStatistics,
  projectForecastAddf,
  projectForecastEst,
  projectForecastStatisticsEst,
  projectForecastExportExcelEst
} from '@/api/process';
import { projectForecastVaiList, projectVariationStatisticsVai, projectVariationForecastUpd, projectVariationExportExcel } from '@/api/project/variation';
import { projectLoanAllRepayment } from '@/api/project/loan';
import { useUserStore } from '@/store';
import { navigationTo } from '@/utils/tool';
import ReconciliationModal from '@/views/projects/components/ReconciliationModal.vue';

const props = defineProps({
  currentId: {
    type: [String, Number],
    default: ''
  },
  isDetails: {
    type: Boolean,
    default: false
  },
  isProcess: {
    type: Boolean,
    default: false
  },
  isAbout: {
    type: Boolean,
    default: false
  },
  isClose: {
    type: Boolean,
    default: false
  },
  itemId: {
    type: [Number, String],
    default: ''
  },
  ptRole: {
    type: Boolean,
    default: false
  },
  budget: {
    type: Boolean,
    default: false
  },
  linefee: {
    type: Number,
    default: 1
  },
  currentProduct: {
    type: String,
    default: ''
  },
  lateTable: {
    type: Boolean,
    default: false
  },
  variationInfo: {
    type: Object,
    default: () => {}
  },
  isOld: {
    type: Boolean,
    default: false
  },
  isReconciliation: {
    type: Boolean,
    default: false
  },
  tab_id: {
    type: [Number, String],
    default: ''
  }
});

const { t } = useI18n();

const userStore = useUserStore();

const hideForcast = computed(() => {
  return ['lendr'].includes(props.currentProduct);
});

const hideLinefee = computed(() => {
  return ['lendr', 'vsl'].includes(props.currentProduct);
});

const hideAccountDetails = computed(() => {
  return ['vsl'].includes(props.currentProduct);
});
const isVariation = computed(() => {
  return Object.keys(props.variationInfo).length > 0
})

const pageLoading = ref(false);
const tabData = ref([]);
const currentMonth = dayjs();
const statisticsData = ref(null);

const getDataInfo = (isLate = false) => {
  tabData.value = [];
  pageLoading.value = true;

  const params = {
    uuid: props.currentId,
    lender: props.tab_id,
    limit: 5000
  };

  let ajaxFn = props.isDetails ? projectDetailForecastList : projectForecastIndex;

  if (props.budget) {
    ajaxFn = projectForecastEst;
    params.has_linefee = props.linefee;
  }

  if (props.itemId) {
    ajaxFn = projectForecastVaiList;
    params.id = props.itemId;
  }

  if (isLate) {
    params.vai = 1;
  }

  ajaxFn(params)
    .then((res) => {
      const dataArr = [];
      const data = res.data || {};

      if (Object.keys(data).length) {
        for (const key in data) {
          const targetDate = dayjs(key);

          const itemData = data[key];
          itemData.forEach((item, index) => {
            const currentTargetDate = dayjs(item.date);
            item.passed = currentTargetDate.isBefore(currentMonth, 'day') || currentTargetDate.isSame(currentMonth, 'day');

            if (item.type === 4 && Number(item.balance) === 0 && item.note === 'FINAL REPAYMENT' && index === itemData.length - 1) {
              item.passed = false;
            }

            if (item.type === 2) {
              item.drawdown = tool.formatMoney(item.amount);
            } else if (item.type === 4) {
              item.repayment = tool.formatMoney(item.amount);
              if (item.first === 1) {
                item.name = `${item.name} (${t('全额还款')})`;
              }
            } else {
              if (item.is_fee) {
                item.fee = tool.formatMoney(item.amount);
              } else {
                if (Number(item.amount) > 0) {
                  item.drawdown = tool.formatMoney(item.amount);
                } else {
                  item.repayment = tool.formatMoney(item.amount);
                }
              }
            }
          });

          const obj = {
            list: itemData,
            passed: targetDate.isBefore(currentMonth, 'month') || targetDate.isSame(currentMonth, 'month')
          };

          dataArr.push(obj);
        }
      }

      tabData.value = dataArr;
      pageLoading.value = false;
    })
    .catch(() => {
      pageLoading.value = false;
    });

  const staticParams = {
    uuid: props.currentId,
    lender: props.tab_id
  };

  let staticAjaxFn = props.isDetails ? projectDetailStatistics : projectForecastStatistics;

  if (props.budget) {
    staticAjaxFn = projectForecastStatisticsEst;
    staticParams.has_linefee = props.linefee;
  }

  if (props.itemId) {
    staticAjaxFn = projectVariationStatisticsVai;
    staticParams.id = props.itemId;
  }

  if (isLate) {
    staticParams.vai = 1;
  }

  staticAjaxFn(staticParams).then((res) => {
    if (res) {
      const repayments = res.repayments ? Math.abs(Number(res.repayments)) : 0;
      statisticsData.value = res;
      statisticsData.value.repayments = repayments;
      statisticsData.value.now.repaid = res.now.repaid ? Math.abs(Number(res.now.repaid)) : 0;
      statisticsData.value.last.repaid = res.last.repaid ? Math.abs(Number(res.last.repaid)) : 0;

      if (res.last.is_overtime) {
        statisticsData.value.last.days = tool.diffDate(res.day.sday, res.day.eday) + 1;
      }
      statisticsData.value.isBegain = dayjs().isAfter(dayjs(res.day.sday));

      option.value.series[0].data[0].value = repayments;
      option.value.series[0].data[1].value = res.pendingRepayment || 1;
    }
  });
};

const adVisible = ref(false);
const adFormRef = ref();
const adFormState = reactive({
  s_date: '',
  date: ''
});
const adFormRules = {
  date: [{ required: true, message: t('请选择') + t('结束日期2'), trigger: 'change' }]
};

const adLoading = ref(false);

const adSubmitRequest = () => {
  adLoading.value = true;
  const params = {
    uuid: props.currentId,
    pdf: props.isClose ? 3 : 2
  };
  if (!props.isClose) {
    params.s_date = adFormState.s_date ? dayjs(adFormState.s_date).format('YYYY-MM-DD') : '';
    params.date = adFormState.date ? dayjs(adFormState.date).format('YYYY-MM-DD') : '';
  }

  projectLoanAllRepayment(params)
    .then((res) => {
      adLoading.value = false;
      adVisible.value = false;
      window.open(res);
    })
    .catch(() => {
      adLoading.value = false;
    });
};

const adSubmitHandle = () => {
  adFormRef.value.validate().then(() => {
    adSubmitRequest();
  });
};

watch(
  () => adVisible.value,
  (val) => {
    if (!val) {
      adLoading.value = false;
      adFormRef.value.clearValidate();
      adFormRef.value.resetFields();
      adFormState.date = '';
      adFormState.s_date = '';
    }
  }
);

const downloading = ref(false);
const downLoadExcel = (type) => {
  if (type === 4) {
    if (props.isClose) {
      adSubmitRequest();
    } else {
      adFormState.date = dayjs(new Date());
      adFormState.s_date = '';
      adVisible.value = true;
    }
    return;
  }
  const ajaxFn = props.itemId ? projectVariationExportExcel : projectForecastExportExcel;
  const params = {
    type,
    lender: props.tab_id,
    uuid: props.currentId
  };
  if (props.itemId) {
    params.id = props.itemId;
  }

  downloading.value = true;
  ajaxFn(params)
    .then((res) => {
      downloading.value = false;
      window.open(res);
    })
    .catch(() => {
      downloading.value = false;
    });
};

const budgetExport = () => {
  downloading.value = true;
  projectForecastExportExcelEst({
    uuid: props.currentId,
    lender: props.tab_id
  })
    .then((res) => {
      downloading.value = false;
      window.open(res);
    })
    .catch(() => {
      downloading.value = false;
    });
};

const option = ref({
  series: [
    {
      type: 'pie',
      center: ['50%', '50%'],
      radius: '100%',
      color: ['#272727', '#f4eee8'],
      label: {
        show: false
      },
      silent: true,
      data: [{ value: 0 }, { value: 1 }],
      label: {
        show: true, // 显示标签
        position: 'inside', // 标签位置：扇区内部
        formatter: function (params) {
          // 仅显示第一个数据项的百分比
          return params.dataIndex === 0 ? `{d}%`.replace('{d}', params.percent) : '';
        },
        textStyle: {
          color: '#fff', // 文本颜色
          fontWeight: 'bold',
          fontSize: 14,
          textBorderWidth: 0 // 取消描边
        }
      }
    }
  ]
});

const disabledDateFormat = (current) => {
  const startDate = statisticsData.value?.day.sday;
  const endDate = statisticsData.value?.day.eday;

  if (current && current.isBefore(startDate, 'day')) {
    return true;
  }

  if (current && current.isAfter(endDate, 'day')) {
    return true;
  }

  return false;
};

const adDisabledSdateFormat = (current) => {
  const startDate = statisticsData.value?.day.sday;
  const endDate = adFormState.date ? dayjs(adFormState.date) : dayjs(new Date());

  if (current && current.isBefore(startDate, 'day')) {
    return true;
  }

  if (current && current.isAfter(endDate, 'day')) {
    return true;
  }

  return false;
};

const adDisabledDateFormat = (current) => {
  const startDate = adFormState.s_date ? dayjs(adFormState.s_date) : statisticsData.value?.day.sday;
  const endDate = dayjs(new Date());

  if (current && current.isBefore(startDate, 'day')) {
    return true;
  }

  if (current && current.isAfter(endDate, 'day')) {
    return true;
  }

  return false;
};

const visible = ref(false);

const formRef = ref();
const formState = reactive({
  cate: '',
  date: '',
  amount: '',
  note: ''
});

const formRules = {
  cate: [{ required: true, message: t('请选择') + t('名称'), trigger: 'change' }],
  date: [{ required: true, message: t('请选择') + t('日期'), trigger: 'change' }],
  amount: [{ required: true, message: t('请输入') + t('金额'), trigger: 'blur' }]
};

const saveLoading = ref(false);
const submitHandle = () => {
  formRef.value
    .validate()
    .then(() => {
      const { date, amount, note, cate } = formState;
      const params = {
        id: 0,
        cate,
        type: 5,
        date: date.format('YYYY-MM-DD'),
        amount,
        note,
        apply_uuid: props.currentId,
        change: 2
      };

      saveLoading.value = true;

      projectForecastAddf(params)
        .then(() => {
          saveLoading.value = false;
          visible.value = false;
          getDataInfo(Number(lateTabActiveKey.value) === 1);
        })
        .catch(() => {
          saveLoading.value = false;
        });
    })
    .catch((error) => {
      console.log('error', error);
    });
};

// 存续费字典
const cateData = ref([]);
const getDurationType = () => {
  // systemDictData('duration').then(res => {
  //   const data = res.map(item => {
  //     return {
  //       label: item.name.replace('(duration)', ''),
  //       value: item.code
  //     }
  //   })
  //   cateData.value = data
  // })
};

const updateLoading = ref(false);
const updateHandle = () => {
  // userStore.getTaskNumInfo()
  updateLoading.value = true;
  const params = {
    uuid: props.currentId,
    id: props.itemId
  };

  projectVariationForecastUpd(params)
    .then(() => {
      getDataInfo(Number(lateTabActiveKey.value) === 1);
      updateLoading.value = false;
    })
    .catch(() => {
      updateLoading.value = false;
    });
};

const lateTabActiveKey = ref('1');
const lateTableChange = (key) => {
  const number = Number(key);
  getDataInfo(number === 1);
};

// 对账
const ReconciliationType = ref(1);
const reconciliationModalRef = ref(null);
const itemDetail = ref(null);
const showReconciliationModal = async (val) => {
  if (val.amount > 0) {
    ReconciliationType.value = 1;
  } else {
    ReconciliationType.value = 2;
  }
  itemDetail.value = val;
  await nextTick(); // Wait for DOM and reactivity updates
  reconciliationModalRef.value.init();
};

const quickDate = ref('');
const quickDateData = ref([
  {
    label: t('本月'),
    value: 'month'
  },
  {
    label: t('本季度'),
    value: 'quarter'
  },
  {
    label: t('本财政年度'),
    value: 'year'
  },
  {
    label: t('上月'),
    value: 'lastMonth'
  },
  {
    label: t('上季度'),
    value: 'lastQuarter'
  },
  {
    label: t('上财政年度'),
    value: 'lastYear'
  }
]);

quickDateData.value.forEach((item) => {
  if (item.value === 'month') {
    // 获取本月开始日期和当前日期
    const monthRange = tool.getMonthRange();
    item.startDate = monthRange.start;
    item.endDate = monthRange.end;
  } else if (item.value === 'quarter') {
    const quarterRange = tool.getQuarterRange();
    item.startDate = quarterRange.start;
    item.endDate = quarterRange.end;
  } else if (item.value === 'year') {
    const yearRange = tool.getYearRange(4);
    item.startDate = yearRange.start;
    item.endDate = yearRange.end;
  } else if (item.value === 'lastMonth') {
    const lastMonthRange = tool.getLastMonthRange();
    item.startDate = lastMonthRange.start;
    item.endDate = lastMonthRange.end;
  } else if (item.value === 'lastQuarter') {
    const lastQuarterRange = tool.getLastQuarter();
    item.startDate = lastQuarterRange.start;
    item.endDate = lastQuarterRange.end;
  } else if (item.value === 'lastYear') {
    const lastYearRange = tool.getLastYearRange(4);
    item.startDate = lastYearRange.start;
    item.endDate = lastYearRange.end;
  }
});

const quickDateChange = (value) => {
  const item = quickDateData.value.find((item) => item.value === value);
  const { startDate, endDate } = item;

  let selectSdate = startDate;
  let selectEdate = endDate;

  // 如果startDate 在 statisticsData.value.day.sday 之前，则 selectSdate 为statisticsData.value.day.sday 否则为startDate
  if (dayjs(startDate).isBefore(dayjs(statisticsData.value.day.sday), 'day')) {
    selectSdate = statisticsData.value.day.sday;
  }

  adFormState.s_date = dayjs(selectSdate);
  adFormState.date = dayjs(selectEdate);
};

watch(
  () => visible.value,
  (val) => {
    if (!val) {
      formRef.value.clearValidate();
      formRef.value.resetFields();
    }
  }
);

onMounted(() => {
  if (props.currentId) {
    if (!props.lateTable) {
      lateTabActiveKey.value = '2';
    } else {
      lateTabActiveKey.value = '1';
    }
    getDataInfo(Number(lateTabActiveKey.value) === 1);
    if (!props.itemId) {
      getDurationType();
    }
  }
});

watch(
  () => props.tab_id,
  (val) => {
    getDataInfo(Number(lateTabActiveKey.value) === 1);
  }
);
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.header-static {
  margin-bottom: 60px;
  gap: 80px;
  align-items: center;
  .item-content {
    display: flex;
    flex: 1;
    gap: 45px;
    align-items: center;
    > .item {
      display: flex;
      gap: 15px;
      min-height: 75px;
      min-width: 15%;
      flex: 1;
      > .line {
        border-radius: 4px;
        width: 6px;
        &.one {
          background-color: rgba(169, 173, 87, 0.7);
          border: 1px solid rgba(109, 123, 31, 0.5);
        }
        &.two {
          background-color: #f7f9f8;
          border: 1px solid #e2e5e2;
        }
        &.three {
          background-color: #6d7b1f;
        }
      }
      > .line-content {
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        > .round {
          background-color: rgba(169, 173, 87, 0.7);
          border: 1px solid rgba(109, 123, 31, 0.5);
          border-radius: 3px;
          height: 6px;
          width: 6px;
        }
      }
      > .info-content {
        > p {
          font-size: 14px;
          font-weight: 500;
        }
        .vco-number.num {
          font-weight: 500;
          :deep(.ant-statistic-content) {
            font-size: 22px !important;
          }
        }
        > div {
          display: flex;
          align-items: center;
          color: #666;
          > span {
            font-size: 11px;
            padding-left: 5px;
          }
        }
      }
    }
    .chart-content {
      width: 160px;
      height: 160px;
      position: relative;
      &::after {
        content: '';
        display: block;
        width: 160px;
        height: 160px;
        border-radius: 50%;
        background-color: transparent;
        box-shadow: 0 5px 24px rgba(169, 173, 87, 0.5);
        position: absolute;
        top: 0;
        left: 0;
      }
    }
  }
}

.table-content {
  margin-bottom: 20px;
  min-height: 300px;
  border-top: 1px solid #808080;
  padding-top: 15px;
  .col-item {
    width: 100%;
    display: flex;
    &.th {
      font-weight: bold;
      font-size: 10px;
      color: #888;
    }
    > .item {
      padding: 0 15px;
      &:nth-child(1) {
        width: 0;
        &.about {
          width: 60px;
        }
      }
      &:nth-child(2) {
        width: 150px;
      }
      &:nth-child(3) {
        width: 180px;
      }
      &:nth-child(4) {
        width: 220px;
      }
      &:nth-child(5),
      &:nth-child(6),
      &:nth-child(7) {
        width: 170px;
        text-align: center;
      }
      &.balance {
        flex: 1;
        text-align: right;
      }
      &.ops {
        width: 50px;
        text-align: center;
      }
      .note {
        font-size: 12px;
        color: #666;
      }
      .iconfont {
        font-size: 14px;
        margin-right: 5px;
      }
    }
  }
  .col-content {
    margin-top: 10px;
    .col-block {
      border-bottom: 1px solid #e2e5e2;
      padding: 5px 0;
      margin-top: 5px;
      &:last-child {
        border-bottom: none;
      }
      &.passed {
        background-color: #f0f0f0 !important;
        border: 1px solid #e2e5e2 !important;
        border-radius: 10px;
        .drawdown {
          color: #282828;
        }
      }
      .drawdown {
        color: @colorPrimary;
      }
      .type {
        span,
        p {
          font-weight: 500;
        }
      }
    }
    .col-item {
      padding: 6px 0;
      > .item {
        display: flex;
        flex-direction: column;
        justify-content: center;
        &.ops {
          width: 50px;
          text-align: center;
          .iconfont {
            color: @colorPrimary;
          }
        }
        &.balance {
          :deep(.ant-statistic-content) {
            font-weight: 500 !important;
            font-size: 16px !important;
            line-height: 26px;
          }
        }
      }
    }
  }
}

.static-block {
  background-color: #181818;
  color: #fff;
  align-items: flex-start;
  display: flex;
  padding: 20px 0;
  border-radius: 12px;
  margin-top: 10px;
  font-weight: 500;
  > .item {
    padding: 0 15px;
    &:last-child {
      flex: 1;
      text-align: right;
    }
    &:first-child {
      width: 610px;
    }
    &:nth-last-child(2),
    &:nth-last-child(3),
    &:nth-last-child(4) {
      width: 170px;
      text-align: center;
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
    > .tips {
      font-size: 11px;
    }
    .day-box {
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
  }
  .sec-item {
    text-align: center;
    > p {
      color: hsla(0, 0%, 100%, 0.5);
      font-size: 12px;
      font-weight: 400;
      margin-bottom: 6px;
    }
    h3 {
      color: #b4d8d8;
      font-size: 14px;
      &.white {
        color: #fff;
        font-size: 16px;
      }
    }
  }
  .line {
    width: 1px;
    background-color: hsla(200, 9%, 66%, 0.3);
    margin: 0 8px;
  }
}

.circle {
  background-color: #b4d8d8;
  border: 1px solid;
  border-radius: 4px;
  display: inline-block;
  height: 8px;
  width: 8px;
}
</style>
