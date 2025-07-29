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
          <div class="weight_demiBold">
            <a-button size="small" class="showChildrenIcon" @click="item.showChildren = !item.showChildren">
              <template #icon><MinusOutlined v-if="item.showChildren" /><PlusOutlined v-else /></template>
            </a-button>
            {{ item.name }}
          </div>
          <div class="text-center">{{ item.count }}</div>
          <div class="color_grey fs_xs text-center">
            <vco-number :bold="true" :value="item.money" :precision="2" size="fs_md"></vco-number>
          </div>
          <div class="text-center">
            <vco-number :bold="true" :value="item.hkmoney" :precision="2" size="fs_md"></vco-number>
          </div>
        </div>
        <div v-if="item.children && item.children.length" class="childrenBox" :class="item.showChildren ? 'show' : 'hidden'">
          <div class="row" v-for="(sub, subIndex) in item.children" :key="subIndex">
            <div class="weight_demiBold">{{ sub.name }}</div>
            <div class="text-center">{{ sub.count }}</div>
            <div class="color_grey fs_xs text-center">
              <vco-number :bold="true" :value="sub.money" :precision="2" size="fs_md"></vco-number>
            </div>
            <div class="text-center">
              <vco-number :bold="true" :value="sub.hkmoney" :precision="2" size="fs_md"></vco-number>
            </div>
          </div>
        </div>
      </div>
      <a-empty v-if="!data || !data.length" />
      <div class="flex justify-center pb-5" v-if="total > pagination.limit">
        <a-pagination size="small" :total="total" :pageSize="pagination.limit" :current="pagination.page" show-quick-jumper :show-total="(total) => t('共{0}条', [total])" @change="setPaginate" />
      </div>
    </div>
    <div style="position: relative">
      <div class="chart" style="position: absolute; top: 0; right: 50px; height: 0; padding-top: 100%; left: 50px">
        <v-chart class="chart2" style="position: absolute; inset: 0" :option="option" autoresize />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';
import { regional } from '@/api/project/forecast';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons-vue';

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
  regional({ ...pagination.value })
    .then((res) => {
      let money = 0;
      let hkmoney = 0;
      res.map((item) => {
        item['showChildren'] = false;
        money = tool.plus(money, item.money);
        hkmoney = tool.plus(hkmoney, item.hkmoney);
      });
      option.value.series[0].data = [{ value: hkmoney }, { value: money }];
      total.value = res.length;
      dataList.value = res;
      getCurrentData();
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
  getCurrentData();
};

const dataList = ref([]);
const getCurrentData = () => {
  let star = (pagination.value.page - 1) * pagination.value.limit;
  data.value = dataList.value.slice(star, star + pagination.value.limit).concat([]);
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
});
</script>
<style lang="less" scoped>
.RegionalContent {
  display: grid;
  grid-template-columns: 0fr 5fr 1.5fr;
}
.row-box {
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
.childrenBox {
  background: #f7f3e6;
  overflow: hidden;
  transition: height 0.3s ease;
  max-height: 200px;
  overflow: auto;
  height: 0;
  &.show {
    height: auto;
  }
  &.hidden {
    height: 0;
  }

  .weight_demiBold {
    text-indent: 30px;
  }
}

.showChildrenIcon {
  outline: none;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  box-sizing: border-box;
  width: 17px !important;
  height: 17px !important;
  padding: 0;
  background: #ffffff;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  transform: scale(0.9411764705882353);
  user-select: none;
  font-size: 8px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  position: relative;
  bottom: 4px;
  &:hover {
    color: #69b1ff;
    border-color: #69b1ff;
  }
}
</style>
