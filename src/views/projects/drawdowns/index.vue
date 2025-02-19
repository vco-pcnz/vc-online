<template>
  <detail-layout active-tab="drawdowns" @getProjectDetail="getProjectDetail">
    <template #content>
      <div class="ProjectDrawdowns">
        <div :class="{ grid: hasPermission('projects:drawdowns:add') || (hasPermission('projects:drawdowns:add:lm') && !projectDetail?.base?.is_close) }" class="mb-12">
          <MeterStat :uuid="uuid" v-if="Boolean(uuid)" ref="MeterStatRef"></MeterStat>
          <template v-if="!projectDetail?.base?.is_close">
            <div class="HelpBorrower" v-if="hasPermission('projects:drawdowns:add:lm')">
              <div class="flex items-center"><i class="iconfont mr-2">&#xe75d;</i><span class="weight_demiBold">Help borrower</span></div>
              <p class="color_grey mt-1 mb-3">You can help to create drawdown on their behalf.</p>
              <drawdownre-quest :uuid="uuid" :projectDetail="projectDetail" @change="update(true)">
                <a-button type="brown" shape="round" size="small">create drawdown</a-button>
              </drawdownre-quest>
            </div>
            <div v-else-if="hasPermission('projects:drawdowns:add')" class="pt-5" style="padding-top: 65px">
              <!-- <p class="fs_2xl bold">0 drawdowns received</p>
            <p class="mb-4 bold">1 drawdown pending -0% of loan drawn</p> -->
              <drawdownre-quest :uuid="uuid" :projectDetail="projectDetail" @change="update(true)">
                <a-button type="dark" class="big uppercase fs_2xs"> REQUEST DRAWDOWN </a-button>
              </drawdownre-quest>
            </div>
          </template>
        </div>
        <div :class="{ grid: tableData.length }">
          <a-spin :spinning="loading" size="large">
            <div class="table-content">
              <TableBlock :tableData="tableData" @change="change"></TableBlock>
            </div>
            <div class="mt-5" v-if="total">
              <a-pagination size="small" :total="total" :pageSize="pagination.limit" :current="pagination.page" :show-size-changer="false" show-quick-jumper :show-total="(total) => t('共{0}条', [total])" @change="setPaginate" />
            </div>
          </a-spin>
          <div>
            <Detail ref="detailRef" :projectDetail="projectDetail" :uuid="uuid" :detail="detail_info" v-if="Boolean(uuid && detail_info && detail_info.id)" @update="update(false)"></Detail>
          </div>
        </div>
      </div>
    </template>
  </detail-layout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { size, template } from 'lodash';
import detailLayout from '../components/detailLayout.vue';
import MeterStat from './components/MeterStat.vue';
import TableBlock from './components/TableBlock.vue';
import Detail from './components/Detail.vue';
import DrawdownreQuest from './components/form/DrawdownRequest.vue';
import { hasPermission } from '@/directives/permission/index';
import { loanDrawdown } from '@/api/project/loan';
import { useRoute } from 'vue-router';
const route = useRoute();

const { t } = useI18n();

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

const update = (val) => {
  if (val) {
    pagination.value.page = 1;
  }
  loadData();
  detailRef.value.loadData();
  MeterStatRef.value.loadData();
};

const tableData = ref([]);

const loadData = () => {
  loading.value = true;
  loanDrawdown({ uuid: uuid.value, ...pagination.value })
    .then((res) => {
      tableData.value = res.data;
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
  }
}
</style>
