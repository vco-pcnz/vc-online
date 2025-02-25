<template>
  <detail-layout active-tab="journal" @getProjectDetail="getProjectDetail">
    <template #content>
      <div class="ProjectDrawdowns">
        <div class="mb-12">
          <!-- <MeterStat :uuid="uuid" v-if="Boolean(uuid)" ref="MeterStatRef"></MeterStat> -->
        </div>
        <div class="flex justify-end">
          <Add v-if="hasPermission('projects:journal:edit')" :currentId="uuid" :detail="projectDetail" @update="reload">
            <a-button type="brown" shape="round" size="small">{{ t('日志') }}</a-button>
          </Add>
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
            <Detail ref="detailRef" :projectDetail="projectDetail" :uuid="uuid" :detail="detail_info" v-if="Boolean(uuid && detail_info && detail_info.id)" @update="loadData"></Detail>
          </div>
        </div>
      </div>
    </template>
  </detail-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import detailLayout from '../components/detailLayout.vue';
import MeterStat from './components/MeterStat.vue';
import TableBlock from './components/TableBlock.vue';
import Detail from './components/Detail.vue';
import Add from './components/form/Add.vue';
import { journal } from '@/api/project/journal';
import { useRoute } from 'vue-router';
import { hasPermission } from '@/directives/permission/index';

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

const tableData = ref([]);

const loadData = () => {
  loading.value = true;

  journal({ uuid: uuid.value, ...pagination.value })
    .then((res) => {
      const data = res.data || []
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

const reload = () => {
  pagination.value.page = 1;
  loadData();
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
    grid-template-columns: 2.9fr 1.1fr;
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
