<template>
  <div class="flex justify-between title mb-10">
    <span class="fs_2xl">{{ t('统计简报') }}</span>
    <SearchContent v-model:value="searchForm" :searchConfig="searchConfig" :open_hidden="true" @change="loadData"></SearchContent>
  </div>
  <a-spin :spinning="loading" size="large">
    <div class="list mb-10">
      <div class="item">
        <i class="iconfont">&#xe78a;</i>
        <div class="flex-1">
          <div class="name color_grey">{{ t('新增贷款') }}</div>
          <div class="value">{{ data?.num?.all }}</div>
          <div class="flex">
            <div class="flex-1">
              <div class="label">
                {{ t('请求') }}：<span>{{ data?.num?.request }}</span>
              </div>
              <div class="label color_grey">
                {{ t('环比') }}：<span class="rate" :class="data?.num?.request_rate > 0 ? 'color_success' : 'color_red-error'">{{ data?.num?.request_rate }}%</span>
              </div>
            </div>
            <div class="flex-1">
              <div class="label">
                {{ t('批准项目') }}：<span>{{ data?.num?.open }}</span>
              </div>
              <div class="label color_grey">
                {{ t('环比') }}：<span class="rate" :class="data?.num?.open_rate > 0 ? 'color_success' : 'color_red-error'">{{ data?.num?.open_rate }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="item">
        <!-- <i class="iconfont">&#xe723;</i> -->
        <div class="flex-1">
          <div class="name color_grey">{{ t('新增贷款金额') }}</div>
          <div class="value">{{ tool.formatMoney(data?.money?.all) }}</div>
          <div class="flex">
            <div class="flex-1">
              <div class="label">
                {{ t('请求') }}：<span>{{ tool.formatMoney(data?.money?.request) }}</span>
              </div>
              <div class="label color_grey">
                {{ t('环比') }}：<span class="rate" :class="data?.money?.request_rate > 0 ? 'color_success' : 'color_red-error'">{{ data?.money?.request_rate }}%</span>
              </div>
            </div>
            <div class="flex-1">
              <div class="label">
                {{ t('批准项目') }}：<span>{{ tool.formatMoney(data?.money?.open) }}</span>
              </div>
              <div class="label color_grey">
                {{ t('环比') }}：<span class="rate" :class="data?.money?.open_rate > 0 ? 'color_success' : 'color_red-error'">{{ data?.money?.open_rate }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="item">
        <i class="iconfont">&#xe755;</i>
        <div class="flex-1">
          <div class="name color_grey">{{ t('新增放款') }}</div>
          <div class="value">{{ tool.formatMoney(data?.darwdown?.all) }}</div>
          <div class="label color_grey">
            {{ t('环比') }}：<span class="rate" :class="-1 > 0 ? 'color_success' : 'color_red-error'">{{ data?.darwdown?.rate }}%</span>
          </div>
        </div>
      </div>

      <div class="item">
        <i class="iconfont">&#xe757;</i>
        <div class="flex-1">
          <div class="name color_grey">{{ t('新增还款') }}</div>
          <div class="value">{{ tool.formatMoney(data?.repayment?.all) }}</div>
          <div class="label color_grey">
            {{ t('环比') }}：<span class="rate" :class="-1 > 0 ? 'color_success' : 'color_red-error'">{{ data?.repayment?.rate }}%</span>
          </div>
        </div>
      </div>
    </div>
  </a-spin>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import SearchContent from './SearchContent/index.vue';
import { forecastBrief } from '@/api/project/forecast';
import dayjs, { Dayjs } from 'dayjs';

import tool from '@/utils/tool';

const { t } = useI18n();

const searchConfig = ref(['time','LM','State'])
const searchForm = ref({
  start_date: dayjs().add(-7, 'd').format('YYYY-MM-DD'),
  end_date: dayjs().format('YYYY-MM-DD')
});

const data = ref(null);
const loading = ref(false);
const loadData = (val) => {
  let params = searchForm.value;
  if (val) params = { ...searchForm.value, ...val };
  loading.value = true;
  forecastBrief(params)
    .then((res) => {
      data.value = res;
    })
    .finally(() => {
      loading.value = false;
    });
};

onMounted(() => {
  loadData();
});
</script>
<style lang="less" scoped>
.list {
  display: flex;
  gap: 20px;
  .item {
    display: flex;
    padding: 10px;
    flex: 1;
    border-radius: 16px;
    transition: all 0.3s ease;
    overflow: hidden;
    position: relative;
    border: 1px solid #fff;
    gap: 10px;
    background-color: #f0f0f0;

    .iconfont {
      font-size: 60px;
      opacity: 0.5;
    }

    .value {
      font-size: 20px;
      margin-bottom: 5px;
      font-weight: 500;
    }
  }
}
</style>
