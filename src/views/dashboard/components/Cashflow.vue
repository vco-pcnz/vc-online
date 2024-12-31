<template>
  <div class="flex title mb-10">
    <span class="fs_2xl">Cashflow</span>
    <SelectDate v-model:value="date"></SelectDate>
  </div>

  <div class="flex items-center gap-10" style="line-height: 1.2">
    <div class="flex items-center gap-3">
      <i class="iconfont cashflow_icon">&#xe723;</i>
      <div>
        <vco-number :value="0" :precision="2"></vco-number>
        <p class="fs_xs color_grey">{{ tool.showDate('2024-08-08') }} - {{ tool.showDate('2024-12-08') }}</p>
      </div>
    </div>
    <div class="flex items-center flex-1 gap-5">
      <div class="text-right">
        <p class="fs_2xl color_coal flex items-center gap-2"><i class="iconfont fs_md">&#xe757;</i> $0.00</p>
        <p class="fs_xs color_grey">0 drawdowns</p>
      </div>
      <div class="flex flex-col justify-between flex-1">
        <vco-meter size="medium" color="blacky" :value="51.5" class="mb-3" />
        <vco-meter size="medium" color="greeny" :value="51.5" />
      </div>
      <div class="">
        <p class="fs_2xl color_coal flex items-center gap-2"><i class="iconfont fs_md">&#xe755;</i> ($0.00)</p>
        <p class="fs_xs color_grey">0 repayments</p>
      </div>
    </div>
    <a-button type="cyan" size="small" shape="round">{{ t('证件资料') }}</a-button>
  </div>
  <div class="pwYmV" v-if="show">
    <div class="left">
      <span>0 drawdowns</span>
      <span class="ml-5">0 repayments</span>
    </div>
    <div class="item">
      <p class="label" style="margin-bottom: 4px">withdrawn</p>
      <p class="value">$0.00</p>
    </div>
    <div class="item">
      <p class="label" style="margin-bottom: 4px">repaid</p>
      <p class="value">$(0.00)</p>
    </div>
    <div class="item">
      <p class="label" style="margin-bottom: 4px">cashflow</p>
      <p class="value">$0.00</p>
    </div>
  </div>
  <div class="more" @click="show = true" :class="{ moreShow: show }">
    <a-button type="brown" shape="round" size="small" v-if="show" @click.stop="show = false">Hide</a-button>
    <i v-if="!show" class="iconfont">&#xe77f;</i>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';
import SelectDate from './SelectDate.vue';

const { t } = useI18n();

const props = defineProps([]);

const date = ref(null);
const show = ref(false);

onMounted(() => {});
</script>

<style scoped lang="less">
@import '@/styles/variables.less';
.more {
  background-color: #f7f9f8;
  height: 36px;
  border-bottom-left-radius: 24px;
  border-bottom-right-radius: 24px;
  color: #bf9425;
  position: relative;
  left: -30px;
  width: calc(100% + 60px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-top: 40px;
  &:hover {
    background-color: hsla(35, 53%, 67%, 0.2);
  }
  .iconfont {
    display: inline-block;
    transform: rotate(90deg);
  }
  &.moreShow {
    background-color: #fff;
  }
}

.pwYmV {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 12px 24px;
  background-color: #181818;
  border-radius: 12px;

  margin-top: 68px;
  margin-bottom: 40px;
  .left {
    flex: 1;
    gap: 12px;
    font-weight: 600;
    font-size: 20px;
    line-height: 1.2;
    color: #fff;
  }

  .item {
    padding-left: 8px;
    padding-right: 8px;
    color: hsla(0, 0%, 100%, 0.5);
    min-width: 150px;
    text-align: right;
    .label {
      margin-bottom: 4px;
      font-size: 12px;
    }
    .value {
      font-size: 20px;
      font-weight: 600;
    }
  }
}
.cashflow_icon {
  font-size: 34px;
  color: #b8cdcc;
}
</style>
