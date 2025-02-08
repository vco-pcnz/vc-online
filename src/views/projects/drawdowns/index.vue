<template>
  <detail-layout active-tab="drawdowns">
    <template #content>
      <div class="ProjectDrawdowns">
        <div>
          <MeterStat :uuid="uuid" v-if="Boolean(uuid)"></MeterStat>
          <a-spin :spinning="loading" size="large">
            <div class="table-content">
              <TableBlock :tableData="tableData" @change="change"></TableBlock>
            </div>
            <div class="mt-5" v-if="total">
              <a-pagination size="small" :total="total" :pageSize="pagination.limit" :current="pagination.page" :show-size-changer="false" show-quick-jumper :show-total="(total) => t('共{0}条', [total])" @change="setPaginate" />
            </div>
          </a-spin>
        </div>
        <div>
          <div class="HelpBorrower" v-if="hasPermission('projects:drawdowns:add')" >
            <div class="flex items-center"><i class="iconfont mr-2">&#xe75d;</i><span class="weight_demiBold">Help borrower</span></div>
            <p class="color_grey mt-1 mb-3">You can help to create drawdown on their behalf.</p>
            <drawdownre-quest :uuid="uuid" @change="update">
              <a-button type="brown" shape="round" size="small">{{ t('默认开始') }}</a-button>
            </drawdownre-quest>
          </div>
          <div style="height: 225px;" v-else></div>
          <Detail ref="detailRef" :uuid="uuid" :detail="detail_info" v-if="Boolean(uuid && detail_info && detail_info.id)" @update="loadData"></Detail>
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
const detailRef = ref()
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
  pagination.value.page = 1;
  loadData();
  detailRef.value.loadData()
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

onMounted(() => {
  uuid.value = route.query.uuid;
  loadData();
});
</script>

<style scoped lang="less">
@import '@/styles/variables.less';
.ProjectDrawdowns {
  display: grid;
  gap: 36px;
  grid-template-columns: 3fr 1fr;

  .HelpBorrower {
    margin-bottom: 61px;
    min-height: 160px;
    padding: 30px;
    background-color: #f0f0f0;
    border: 1px solid #e2e5e2;
    border-radius: 12px;
  }
}
</style>
