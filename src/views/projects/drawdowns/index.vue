<template>
  <detail-layout active-tab="drawdowns" @getProjectDetail="getProjectDetail">
    <template #content>
      <div class="ProjectDrawdowns">
        <div class="flex justify-end mb-5 gap-4">
          <a-button
            v-if="showProcessEdit"
            type="brown" shape="round" class="pre-sale-enter"
            @click="navigationTo(`/projects/progress-payment/edit?uuid=${uuid}`)"
          >
            {{ t('编辑进度付款') }}
            <RightOutlined :style="{ fontSize: '11px', 'margin-inline-start': '4px'  }" />
          </a-button>
          <a-button
            v-if="showProcessView"
            type="brown" shape="round" class="pre-sale-enter"
            @click="navigationTo(`/projects/progress-payment/view?uuid=${uuid}`)"
          >
            {{ t('查看进度付款') }}
            <RightOutlined :style="{ fontSize: '11px', 'margin-inline-start': '4px'  }" />
          </a-button>
        </div>

        <div :class="{ grid: hasPermission('projects:drawdowns:add') || (hasPermission('projects:drawdowns:add:lm') && projectDetail && !projectDetail?.base?.is_close) }" class="mb-12">
          <MeterStat :uuid="uuid" v-if="Boolean(uuid)" ref="MeterStatRef"></MeterStat>
          <template v-if="projectDetail && !projectDetail?.base?.is_close">
            <div class="HelpBorrower" v-if="hasPermission('projects:drawdowns:add:lm')">
              <div class="flex items-center"><i class="iconfont mr-2">&#xe75d;</i><span class="weight_demiBold">{{t('帮助借款人')}}</span></div>
              <p class="color_grey mt-1 mb-3">{{t('您可以帮助他们创建提款。')}}</p>
              <drawdownre-quest :uuid="uuid" :projectDetail="projectDetail" @change="update(true)">
                <a-button type="brown" shape="round" size="small">{{ t('创建放款') }}</a-button>
              </drawdownre-quest>
            </div>
            <div class="HelpBorrower" v-else-if="hasPermission('projects:drawdowns:add')">
              <div class="flex items-center"><i class="iconfont mr-2">&#xe755;</i><span class="weight_demiBold">{{ t('放款申请') }}</span></div>
              <p class="color_grey mt-1 mb-3">{{ t('点击下方按钮创建放款申请') }}</p>
              <drawdownre-quest :uuid="uuid" :projectDetail="projectDetail" @change="update(true)">
                <a-button type="brown" shape="round" size="small">{{ t('创建放款') }}</a-button>
              </drawdownre-quest>
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
            <Detail ref="detailRef" :projectDetail="projectDetail" :uuid="uuid" :detail="detail_info" v-if="Boolean(uuid && detail_info && detail_info.id)" @update="update(false)"></Detail>
          </div>
        </div>
      </div>
    </template>
  </detail-layout>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { RightOutlined } from '@ant-design/icons-vue';
import { size, template } from 'lodash';
import detailLayout from '../components/detailLayout.vue';
import MeterStat from './components/MeterStat.vue';
import TableBlock from './components/TableBlock.vue';
import Detail from './components/Detail.vue';
import DrawdownreQuest from './components/form/DrawdownRequest.vue';
import { hasPermission } from '@/directives/permission/index';
import { loanDrawdown } from '@/api/project/loan';
import { useRoute } from 'vue-router';
import { useUserStore } from '@/store';
import { navigationTo } from '@/utils/tool'

const route = useRoute();

const { t } = useI18n();
const userStore = useUserStore();

const showProcessEdit = computed(() => userStore.hasRouteInfo('/projects/progress-payment/edit'))
const showProcessView = computed(() => userStore.hasRouteInfo('/projects/progress-payment/view'))

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
  userStore.getTaskNumInfo()
  
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

.pre-sale-enter {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
