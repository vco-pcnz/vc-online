<template>
  <div class="flex items-end title mt-10">
    <div class="flex-1 fs_2xl cursor-pointer" @click="navigationTo('/dashboard/profit')">{{ t('收入记录') }}</div>
    <SearchContent v-model:value="searchForm" :searchConfig="searchConfig" downloadUrl="project/forecast/profitExport" @change="loadData"></SearchContent>
  </div>
  <template v-if="data">
    <div class="row thead mt-10">
      <div class="weight_demiBold">{{ t('日期') }}</div>
      <div class=""></div>
      <div>{{ t('项目数据') }}</div>
      <div>
        {{ t('类型') }}
      </div>
      <div>
        {{ t('说明') }}
      </div>
      <div class="text-center">
        {{ t('金额') }}
      </div>
      <!-- <div class="text-center">
        {{ t('项目') }}
      </div> -->
    </div>
    <div class="row-box" v-for="(item, index) in data" :key="index">
      <div class="row">
        <div class="weight_demiBold">{{ tool.monthYearDay(item.date) }}</div>
        <div class="circle"></div>
        <div class="bold">{{ item.project_name }}</div>
        <div class="bold">{{ item.name }}</div>
        <div class="color_grey fs_xs">
          {{ item.note }}
        </div>
        <div class="text-center">
          <vco-number :bold="true" :value="item.amount" :precision="2" size="fs_md"></vco-number>
        </div>
        <!-- <div class="text-right">
          <vco-number prefix="(" suffix=")" :bold="true" :end="true" :value="item.cashflow_amount" :precision="2" size="fs_md"></vco-number>
        </div> -->
      </div>
    </div>
  </template>
  <a-empty v-if="!data || !data.length" />
  <div class="flex justify-center pb-5" v-if="total > pagination.limit">
    <a-pagination size="small" :total="total" :pageSize="pagination.limit" :current="pagination.page" show-quick-jumper :show-total="(total) => t('共{0}条', [total])" @change="setPaginate" />
  </div>

  <div class="footer flex justify-between items-end" v-if="data.length">
    <div class="left">
      <span>{{ otherInfo.num }} {{ t('项目') }}</span>
    </div>
    <div>
      <p class="label color_grey fs_xs">Income amount</p>
      <vco-number :bold="true" prefix="$(" suffix=")" color="#fff" :value="otherInfo.amount" :end="true" :precision="2" size="fs_2xl"></vco-number>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';
import dayjs from 'dayjs';
import SearchContent from './SearchContent/index.vue';
import { profitLog } from '@/api/project/forecast';

const emits = defineEmits(['change']);

const props = defineProps({
  total: {
    type: Number
  }
});

const searchConfig = ref(['Time', 'LM', 'Project']);
const searchForm = ref({
  start_date: dayjs().add(-7, 'd').format('YYYY-MM-DD'),
  end_date: dayjs().format('YYYY-MM-DD')
});

const { t } = useI18n();

const pagination = ref({
  page: 1,
  limit: 10
});

const total = ref(0);
const data = ref([]);
const loading = ref(false);
const otherInfo = ref({
  amount: 0,
  count: 0
});

const loadData = (val) => {
  loading.value = true;
  if (val) searchForm.value = { ...searchForm.value, ...val };
  profitLog({ ...searchForm.value, ...pagination.value })
    .then((res) => {
      total.value = res.count;
      data.value = res.data;
      otherInfo.value = res.otherInfo;
    })
    .finally(() => {
      loading.value = false;
    });
};

const setPaginate = (page, limit) => {
  pagination.value = {
    page,
    limit
  };
  loadData();
};

onMounted(() => {
  loadData();
});
</script>
<style lang="less" scoped>
.footer {
  color: #fff;
  border-radius: 12px;
  background-color: #181818;
  margin-top: 20px;
  padding: 24px;
  .left {
    font-weight: 600;
    font-size: 20px;
    line-height: 1.2;
    gap: 20px;
    display: flex;
  }
}

.row-box {
  padding: 8px 0;
  border-bottom: 1px solid #e2e5e2;
  &:last-child {
    border: none;
  }
}
.row {
  align-items: center;
  display: grid;
  grid-template-columns: 0.8fr 0.1fr 1fr 1fr 2fr 0.75fr;
  gap: 10px;
  padding: 12px 24px;
  &.thead {
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #888 !important;
    background: rgba(0, 0, 0, 0.05);
  }
  .circle {
    border-radius: 4px;
    display: inline-block;
    height: 8px;
    width: 8px;
    background-color: #b4d8d8;
    color: #569695;
  }
}
</style>
