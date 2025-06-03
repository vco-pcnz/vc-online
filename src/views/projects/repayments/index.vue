<template>
  <detail-layout active-tab="repayments" @getProjectDetail="getProjectDetail">
    <template #content>
      <div class="ProjectDrawdowns">
        <div :class="{ grid: (hasPermission('projects:repayments:add') || hasPermission('projects:repayments:calculator')) &&  projectDetail && !projectDetail?.base?.is_close}" class="mb-12">
          <MeterStat :uuid="uuid" :projectDetail="projectDetail" v-if="Boolean(uuid)" ref="MeterStatRef"></MeterStat>
          <template v-if="projectDetail && !projectDetail?.base?.is_close && (hasPermission('projects:repayments:add') || hasPermission('projects:repayments:calculator'))">
            <div class="HelpBorrower">
              <calculator v-if="hasPermission('projects:repayments:calculator')" :uuid="uuid" :projectDetail="projectDetail">
                <a-button :title="t('还款计算器')" type="brown" class="calculator-btn">
                  <i class="iconfont">&#xe643;</i>
                </a-button>
              </calculator>
              <template v-if="hasPermission('projects:repayments:add')">
                <template v-if="isNormalUser">
                  <div class="flex items-center"><i class="iconfont mr-2">&#xe757;</i><span class="weight_demiBold">{{ t('还款申请') }}</span></div>
                  <p class="color_grey mt-1 mb-3">{{ t('点击下方按钮创建还款申请') }}</p>
                  <drawdownre-quest :uuid="uuid" :projectDetail="projectDetail" @change="update">
                    <a-button type="brown" shape="round" size="small">{{ t('创建还款') }}</a-button>
                  </drawdownre-quest>
                </template>
                <template v-else>
                  <div class="flex items-center"><i class="iconfont mr-2">&#xe75d;</i><span class="weight_demiBold">{{ t('帮助借款人') }}</span></div>
                  <p class="color_grey mt-1 mb-3">{{ t('您可以帮助他们创建还款请求') }}</p>
                  <drawdownre-quest :uuid="uuid" :projectDetail="projectDetail" :count="total" @change="update">
                    <a-button type="brown" shape="round" size="small">{{ t('创建还款') }}</a-button>
                  </drawdownre-quest>
                </template>
              </template>
              <template v-else>
                <div class="flex items-center"><i class="iconfont mr-2">&#xe75d;</i><span class="weight_demiBold">{{ t('还款计算器') }}</span></div>
                <p class="color_grey mt-1 mb-3">{{ t('您可以通过还款计算器计算还款金额') }}</p>
              </template>
            </div>
          </template>
        </div>
        <div :class="{ grid: tableData.length }">
          <a-spin :spinning="loading" size="large">
            <div class="table-content">
              <TableBlock :tableData="tableData" :pagination="pagination" :total="total" @change="change"></TableBlock>
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
import { ref, reactive, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { size, template } from 'lodash';
import detailLayout from '../components/detailLayout.vue';
import MeterStat from './components/MeterStat.vue';
import TableBlock from './components/TableBlock.vue';
import Detail from './components/Detail.vue';
import DrawdownreQuest from './components/form/DrawdownRequest.vue';
import Calculator from './components/form/Calculator.vue';
import { hasPermission } from '@/directives/permission/index';
import { loanRepayment } from '@/api/project/loan';
import { useRoute } from 'vue-router';
import { useUserStore } from '@/store';

const route = useRoute();

const { t } = useI18n();

const userStore = useUserStore();
const isNormalUser = computed(() => userStore.isNormalUser)

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
  userStore.getTaskNumInfo()
  pagination.value.page = 1;
  loadData();
  MeterStatRef.value.loadData();
};

const tableData = ref([]);

const loadData = () => {
  loading.value = true;
  loanRepayment({ uuid: uuid.value, ...pagination.value })
    .then((res) => {
      const data = res.data || []
      data.forEach(item => {
        item.amount = Math.abs(Number(item.amount))
        item.apply_amount = Math.abs(Number(item.apply_amount))
      })
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
</style>
