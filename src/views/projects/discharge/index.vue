<template>
  <detail-layout active-tab="discharge" @getProjectDetail="getProjectDetail">
    <template #content>
      <!-- 新增抵押物 -->
      <security-add-edit
        v-model:visible="addVisible"
        :current-id="uuid"
        :info-data="itemInfo"
        :project-info="projectDetail?.base"
        :is-open="true"
        @refresh="tabChange(true)"
      ></security-add-edit>

      <div class="ProjectDrawdowns">
        <div :class="{ grid: hasPermission('projects:securities:aer') &&  projectDetail && !projectDetail?.base?.is_close}" class="mb-12">
          <MeterStat :uuid="uuid" :projectDetail="projectDetail" v-if="Boolean(uuid)" ref="MeterStatRef"></MeterStat>
          <template v-if="projectDetail && !projectDetail?.base?.is_close && hasPermission('projects:securities:aer')">
            <div class="HelpBorrower">
              <div class="flex items-center"><i class="iconfont mr-2">&#xe614;</i><span class="weight_demiBold">{{ t('抵押物信息') }}</span></div>
              <p class="color_grey mt-1 mb-3">{{ t('您可以点击下方按钮添加抵押物') }}</p>
              <a-button type="brown" shape="round" size="small" @click="openAddEdit(null)">{{ t('添加抵押物') }}</a-button>
            </div>
          </template>
        </div>

        <vco-page-tab :tabData="tabData" v-model:current="currentTab" @change="tabChange(false)"></vco-page-tab>

        <div :class="{ grid: tableData.length }">
          <a-spin :spinning="loading" size="large">
            <div class="table-content">
              <TableBlock :tableData="tableData" :is-add="currentTab === 1" @change="change"></TableBlock>
            </div>
            <div class="mt-5" v-if="total">
              <a-pagination size="small" :total="total" :pageSize="pagination.limit" :current="pagination.page" :show-size-changer="false" show-quick-jumper :show-total="(total) => t('共{0}条', [total])" @change="setPaginate" />
            </div>
          </a-spin>
          <div>
            <Detail
              v-if="Boolean(uuid && detail_info && detail_info.uuid)"
              ref="detailRef"
              :projectDetail="projectDetail"
              :uuid="uuid"
              :is-add="currentTab === 1"
              :detail="detail_info"
              @itemEdit="openAddEdit(detail_info)"
              @update="loadData"
            >
            </Detail>
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
import { hasPermission } from '@/directives/permission/index';
import { dischargeSecurity, dischargeApplySecurity } from '@/api/project/loan';
import { useRoute } from 'vue-router';
import SecurityAddEdit from '@/views/process/temp/default/components/SecurityAddEdit.vue';
import { useUserStore } from '@/store';

const route = useRoute();
const userStore = useUserStore();

const { t } = useI18n();

const uuid = ref('');
const detail_info = ref(null);
const total = ref(0);
const loading = ref(true);
const detailRef = ref();
const MeterStatRef = ref();

const currentTab = ref(0)
const tabData = ref([
  {
    label: t('解押申请'),
    value: 0
  },
  {
    label: t('添加申请'),
    value: 1
  }
])

const tabChange = (flag) => {
  if (flag) {
    MeterStatRef.value.loadData()
    currentTab.value = 1
  }
  
  pagination.value.page = 1
  loadData()
};

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
  userStore.getTaskNumInfo()

  loading.value = true;

  const ajaxFn = currentTab.value ? dischargeApplySecurity : dischargeSecurity
  ajaxFn({ uuid: uuid.value, ...pagination.value })
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

const addVisible = ref(false)
const itemInfo = ref(null)

const openAddEdit = (data) => {
  itemInfo.value = data
  addVisible.value = true
}

onMounted(() => {
  uuid.value = route.query.uuid;
  const type = route.query.type
  if (type) {
    currentTab.value = Number(type)
  }
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
    .iconfont {
      font-size: 18px;
    }
  }
}
</style>
