<template>
  <detail-layout :title="baseInfo.name" active-tab="drawdowns">
    <template #content>
      <div class="ProjectDrawdowns">
        <div>
          <MeterStat></MeterStat>

          <a-spin :spinning="loading" size="large">
            <div class="table-content">
              <TableBlock :tableData="tableData"></TableBlock>
            </div>
            <div class="mt-5" v-if="total">
              <a-pagination
                size="small"
                :total="total"
                :pageSize="pagination.limit"
                :current="pagination.page"
                show-size-changer
                show-quick-jumper
                :show-total="(total) => t('共{0}条', [total])"
                @change="setPaginate"
              />
            </div>
          </a-spin>
        </div>
        <div>
          <div class="HelpBorrower">
            <div class="flex items-center"><i class="iconfont mr-2">&#xe75d;</i><span class="weight_demiBold">Help borrower</span></div>
            <p class="color_grey mt-1 mb-3">You can help to create drawdown on their behalf.</p>
            <drawdownre-quest :uuid="uuid">
              <a-button type="brown" shape="round" size="small">{{ t('默认开始') }}</a-button>
            </drawdownre-quest>
          </div>
          <Detail :uuid="uuid"></Detail>
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
import { loanDrawdown } from '@/api/project/loan';
import { useRoute } from 'vue-router';

const route = useRoute();

const { t } = useI18n();

const baseInfo = ref({
  id: 1614,
  name: 'test1212',
  purpose: ['Construction'],
  background: 'xxx'
});

const uuid = ref('');
const total = ref(0);
const loading = ref(true);
const pagination = ref({
  page: 1,
  limit: 10
});

const setPaginate = (page, limit) => {
  pagination.value = {
    page,
    limit
  };
  loadData();
};

const tableData = ref([]);

const loadData = () => {
  loading.value = true;
  loanDrawdown({ uuid: uuid.value, ...pagination.value })
    .then((res) => {
      tableData.value = res.list;
      total.value = res.count;
    })
    .finally(() => {
      loading.value = false;
    });
};
onMounted(() => {
  uuid.value = route.query.uuid;
  // uuid.value =  'ec58c625-3df7-465d-8316-1db220fdb0c2' || 'a0f7382c-ae5b-422c-94f5-6c0a87d0351b' || '795e168e-51eb-48dd-aa39-a14792ed8f1c';
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
    margin-bottom: 48px;
    min-height: 160px;
    padding: 30px;
    background-color: #f0f0f0;
    border: 1px solid #e2e5e2;
    border-radius: 12px;
  }
}
</style>
