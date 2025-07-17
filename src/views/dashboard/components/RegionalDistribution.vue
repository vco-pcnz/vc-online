<template>
  <div class="flex items-end title mt-10">
    <div class="flex-1 fs_2xl cursor-pointer">{{ t('区域分布') }}</div>
  </div>
  <div class="RegionalContent">
    <div></div>
    <div>
      <div class="row thead mt-10">
        <div class="weight_demiBold">{{ t('地区') }}</div>
        <div class="text-center">{{ t('项目数量') }}</div>
        <div class="text-center">
          {{ t('放款总额') }}
        </div>
        <div class="text-center">
          {{ t('待还款总额') }}
        </div>
      </div>
      <div class="row-box" v-for="(item, index) in data" :key="index">
        <div class="row">
          <div class="weight_demiBold">Auckland</div>
          <div class="text-center">10</div>
          <div class="color_grey fs_xs text-center">
            <vco-number :bold="true" prefix="" :value="item.amount" :precision="2" size="fs_md"></vco-number>
          </div>
          <div class="text-center">
            <vco-number :bold="true" prefix="" :value="item.amount" :precision="2" size="fs_md"></vco-number>
          </div>
        </div>
      </div>
      <a-empty v-if="!data || !data.length" />
      <div class="flex justify-center pb-5" v-if="total > pagination.limit">
        <a-pagination size="small" :total="total" :pageSize="pagination.limit" :current="pagination.page" show-quick-jumper :show-total="(total) => t('共{0}条', [total])" @change="setPaginate" />
      </div>
    </div>
    <div class="chart" style="padding: 0 30px;">
      <v-chart class="chart2" :option="option" autoresize />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';
import { cashFlowList } from '@/api/project/forecast';

const { t } = useI18n();
const pagination = ref({
  page: 1,
  limit: 5
});

const total = ref(0);
const data = ref([]);
const loading = ref(false);

const loadData = (val) => {
  loading.value = true;
  cashFlowList({ ...pagination.value })
    .then((res) => {
      console.log(res);
      total.value = res.count;
      data.value = res.data.list;
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
// 初始化图表
const option = ref({
  autoFit: false,
  legend: false,
  tooltip: false,

  series: [
    {
      type: 'pie',
      center: ['50%', '50%'],
      radius: '100%',
      color: ['#181818', '#f3ede5'],
      label: {
        show: false
      },
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
      },
      silent: true,
      data: []
    }
  ]
});

onMounted(() => {
  loadData();
  option.value.series[0].data = [{ value: 100 }, { value: 300 }]
});
</script>
<style lang="less" scoped>
.RegionalContent {
  display: grid;
  grid-template-columns: 0fr 5fr 1.5fr;
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
  grid-template-columns: 2fr 1fr 2fr 2fr;
  padding: 8px 24px;
  &.thead {
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #888 !important;
    background: rgba(0, 0, 0, 0.05);
  }
}
</style>
