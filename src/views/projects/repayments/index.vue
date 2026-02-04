<template>
  <detail-layout active-tab="repayments" @getProjectDetail="getProjectDetail">
    <template #content>
      <div class="ProjectDrawdowns">
        <div class="flex justify-end mb-5 gap-4">
          <vco-page-tab v-if="projectDetail && projectDetail.product.code === 'vsl' && (hasPermission('projects:schedule:vs_schedule') || hasPermission('projects:schedule:boc_schedule'))" :tabData="typeData" v-model:current="type_id"></vco-page-tab>
          <a-button
            v-if="hasPermission('projects:repayments:ViewRepaymentSchedule') && projectDetail?.product?.code === 'lender'"
            type="brown"
            shape="round"
            class="pre-sale-enter"
            @click="navigationTo(`/projects/repayments/repaymentSchedule?uuid=${uuid}`)"
          >
            {{ t('查看还款计划') }}
            <RightOutlined :style="{ fontSize: '11px', 'margin-inline-start': '4px' }" />
          </a-button>
        </div>
        <div :class="{ grid: (hasPermission('projects:repayments:add') || hasPermission('projects:repayments:calculator')) && projectDetail && !projectDetail?.base?.is_close }" class="mb-12">
          <MeterStat :uuid="uuid" :type_id="type_id" :projectDetail="projectDetail" v-if="Boolean(uuid)" ref="MeterStatRef"></MeterStat>
          <template v-if="projectDetail && !projectDetail?.base?.is_close && (hasPermission('projects:repayments:add') || hasPermission('projects:repayments:calculator'))">
            <div class="HelpBorrower">
              <calculator v-if="hasPermission('projects:repayments:calculator')" :uuid="uuid" :projectDetail="projectDetail">
                <a-button :title="t('还款计算器')" type="brown" class="calculator-btn">
                  <i class="iconfont">&#xe643;</i>
                </a-button>
              </calculator>
              <template v-if="hasPermission('projects:repayments:add')">
                <template v-if="isNormalUser">
                  <div class="flex items-center">
                    <i class="iconfont mr-2">&#xe757;</i><span class="weight_demiBold">{{ t('还款申请') }}</span>
                  </div>
                  <p class="color_grey mt-1 mb-3">{{ t('点击下方按钮创建还款申请') }}</p>

                  <drawdown-request-lendr v-if="projectDetail?.product?.code === 'lendr'" :uuid="uuid" :projectDetail="projectDetail" :count="total" @change="update">
                    <a-button type="brown" shape="round" size="small">{{ t('创建还款') }}</a-button>
                  </drawdown-request-lendr>
                  <drawdown-request v-else :uuid="uuid" :projectDetail="projectDetail" @change="update">
                    <a-button type="brown" shape="round" size="small">{{ t('创建还款') }}</a-button>
                  </drawdown-request>
                </template>
                <template v-else>
                  <div class="flex items-center">
                    <i class="iconfont mr-2">&#xe75d;</i><span class="weight_demiBold">{{ t('帮助借款人') }}</span>
                  </div>
                  <p class="color_grey mt-1 mb-3">{{ t('您可以帮助他们创建还款请求') }}</p>
                  <drawdown-request-lendr v-if="projectDetail?.product?.code === 'lendr'" :uuid="uuid" :projectDetail="projectDetail" :count="total" @change="update">
                    <a-button type="brown" shape="round" size="small">{{ t('创建还款') }}</a-button>
                  </drawdown-request-lendr>
                  <drawdown-request-vsl v-else-if="projectDetail?.product?.code === 'vsl'" :uuid="uuid" :projectDetail="projectDetail" :count="total" @change="update">
                    <a-button type="brown" shape="round" size="small">{{ t('创建还款') }}</a-button>
                  </drawdown-request-vsl>
                  <drawdown-request v-else :uuid="uuid" :projectDetail="projectDetail" :count="total" @change="update">
                    <a-button type="brown" shape="round" size="small">{{ t('创建还款') }}</a-button>
                  </drawdown-request>
                </template>
              </template>
              <template v-else>
                <div class="flex items-center">
                  <i class="iconfont mr-2">&#xe75d;</i><span class="weight_demiBold">{{ t('还款计算器') }}</span>
                </div>
                <p class="color_grey mt-1 mb-3">{{ t('您可以通过还款计算器计算还款金额') }}</p>
              </template>
            </div>
          </template>
        </div>
        <div :class="{ grid: tableData.length }">
          <a-spin :spinning="loading" size="large">
            <div class="table-content">
              <TableBlock :tableData="tableData" :pagination="pagination" :projectDetail="projectDetail" :total="total" @change="change"></TableBlock>
            </div>
            <div class="mt-5" v-if="total">
              <a-pagination size="small" :total="total" :pageSize="pagination.limit" :current="pagination.page" :show-size-changer="false" show-quick-jumper :show-total="(total) => t('共{0}条', [total])" @change="setPaginate" />
            </div>
          </a-spin>
          <div>
            <Detail ref="detailRef" :projectDetail="projectDetail" :uuid="uuid" :detail="detail_info" v-if="Boolean(uuid && detail_info && detail_info.id)" @update="loadData"></Detail>
          </div>
        </div>
      </div>
    </template>
  </detail-layout>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import detailLayout from '../components/detailLayout.vue';
import MeterStat from './components/MeterStat.vue';
import TableBlock from './components/TableBlock.vue';
import Detail from './components/Detail.vue';
import DrawdownRequest from './components/form/DrawdownRequest.vue';
import DrawdownRequestVsl from './components/form/DrawdownRequestVsl.vue';
import DrawdownRequestLendr from './components/form/DrawdownRequestLendr.vue';
import Calculator from './components/form/Calculator.vue';
import { hasPermission } from '@/directives/permission/index';
import { loanRepayment } from '@/api/project/loan';
import { useRoute } from 'vue-router';
import { useUserStore } from '@/store';
import { RightOutlined } from '@ant-design/icons-vue';
import { navigationTo } from '@/utils/tool';

const route = useRoute();

const { t } = useI18n();

const userStore = useUserStore();
const isNormalUser = computed(() => userStore.isNormalUser);

const type_id = ref('');
const typeData = ref([
  {
    label: 'All',
    value: ''
  },
  {
    label: 'VS',
    value: 'VS',
    hide: !hasPermission('projects:schedule:vs_schedule')
  },
  {
    label: 'BOC',
    value: 'BOC',
    hide: !hasPermission('projects:schedule:boc_schedule')
  }
]);

const uuid = ref('');
const detail_info = ref(null);
const total = ref(0);
const loading = ref(true);
const detailRef = ref();
const MeterStatRef = ref();
const pagination = ref({
  page: 1,
  limit: 5
});

const setPaginate = (page, limit) => {
  pagination.value = {
    page,
    limit
  };
  loadData();
};

const update = () => {
  userStore.getTaskNumInfo();
  pagination.value.page = 1;
  loadData();
  MeterStatRef.value.loadData();
};

const tableData = ref([]);

const loadData = () => {
  loading.value = true;
  loanRepayment({ uuid: uuid.value, ...pagination.value, lender: type_id.value })
    .then((res) => {
      const data = res.data || [];
      data.forEach((item) => {
        item.amount = Math.abs(Number(item.amount));
        item.apply_amount = Math.abs(Number(item.apply_amount));
      });
      tableData.value = data;
      total.value = res.count;
    })
    .finally(() => {
      loading.value = false;
    });
};

const change = (val) => {
  detail_info.value = val;
};

const projectDetail = ref();
const getProjectDetail = (val) => {
  projectDetail.value = val;
};

onMounted(() => {
  uuid.value = route.query.uuid;
  loadData();
});

watch(
  () => type_id.value,
  (val) => {
    loadData();
  }
);
</script>

<style scoped lang="less">
@import '@/styles/variables.less';
.ProjectDrawdowns {
  .grid {
    display: grid;
    gap: 36px;
    grid-template-columns: 3fr 1fr;
    align-items: start;
  }

  .HelpBorrower {
    min-height: 120px;
    padding: 30px;
    background-color: #f0f0f0;
    border: 1px solid #e2e5e2;
    border-radius: 12px;
    position: relative;
  }
}

.calculator-btn {
  padding: 0 !important;
  height: 32px;
  width: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 15px;
  right: 15px;
  border-radius: 3px;
  > i {
    line-height: 1;
  }
}

.pre-sale-enter {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
