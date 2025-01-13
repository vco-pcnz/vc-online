<template>
  <template v-if="data">
    <div class="row-box" v-for="(item, index) in data.list" :key="index">
      <div class="row">
        <div class="weight_demiBold">{{ tool.monthYearDay(item.date) }}</div>
        <div class="circle"></div>
        <div class="bold">{{ item.name }}</div>
        <div class="color_grey fs_xs text-center">
          {{ item.note }}
        </div>
        <div class="text-right">
          <vco-number :bold="true" prefix="" color="#569695" :value="item.amount" :precision="2" size="fs_md"></vco-number>
        </div>
        <div class="text-right">
          <vco-number prefix="(" suffix=")" :bold="true" :end="true" :value="item.cashflow_amount" :precision="2" size="fs_md"></vco-number>
        </div>
      </div>
    </div>
  </template>
  <a-empty v-if="!data || !data.list.length" />
  <div class="flex justify-center pb-5" v-if="total > pagination.limit">
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
  <template v-if="data">
    <div class="footer flex justify-between items-end">
      <div class="left">
        <span>{{ data.drawdown_num }} drawdowns</span>
        <span>{{ data.repayment_num }} repayments</span>
      </div>
      <div class="flex gap-8">
        <div>
          <p class="label color_grey fs_xs">withdrawn</p>
          <vco-number
            :bold="true"
            color="#fff"
            :value="data.drawdown_amount"
            :end="true"
            :precision="2"
            size="fs_2xl"
            v-if="data.drawdown_amount > 0"
          ></vco-number>
          <vco-number
            v-else
            :bold="true"
            prefix="$("
            suffix=")"
            color="#fff"
            :value="data.drawdown_amount"
            :end="true"
            :precision="2"
            size="fs_2xl"
          ></vco-number>
        </div>
        <div>
          <p class="label color_grey fs_xs">repaid</p>
          <vco-number
            :bold="true"
            color="#fff"
            :value="data.repayment_amount"
            :end="true"
            :precision="2"
            size="fs_2xl"
            v-if="data.repayment_amount > 0"
          ></vco-number>
          <vco-number
            v-else
            :bold="true"
            prefix="$("
            suffix=")"
            color="#fff"
            :value="data.repayment_amount"
            :end="true"
            :precision="2"
            size="fs_2xl"
          ></vco-number>
        </div>
        <div>
          <p class="label color_grey fs_xs">cashflow</p>
          <vco-number :bold="true" color="#fff" :value="data.total" :end="true" :precision="2" size="fs_2xl" v-if="data.total > 0"></vco-number>
          <vco-number
            :bold="true"
            prefix="$("
            suffix=")"
            color="#fff"
            :value="data.total"
            :end="true"
            :precision="2"
            size="fs_2xl"
            v-else
          ></vco-number>
        </div>
      </div>
    </div>
  </template>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';

const emits = defineEmits(['change']);

const props = defineProps({
  total: {
    type: Number
  },
  data: {
    type: Object
  }
});

const { t } = useI18n();

const pagination = ref({
  page: 1,
  limit: 1
});

const setPaginate = (page, limit) => {
  pagination.value = {
    page,
    limit
  };
  emits('change', pagination.value);
};
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
  grid-template-columns: 0.4fr 0.1fr 0.7fr 0.75fr 0.75fr 0.75fr;
  padding: 12px 24px;
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
