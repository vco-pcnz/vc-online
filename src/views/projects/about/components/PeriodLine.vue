<template>
  <div class="Period bold">
    <div class="fs_xs text-center">
      <span class="weight_demiBold">{{ data?.is_overtime ? data?.sdaysDiff - data?.edaysDiff : data?.sdaysDiff + data?.edaysDiff }} days</span>
      <span class="color_red-error ml-2" v-if="Boolean(data?.is_overtime)">+ {{ data?.edaysDiff }} days overdue</span>
      <span class="color_grey ml-2" v-else>{{ data?.edaysDiff }} remaining</span>
    </div>
    <div class="flex">
      <div class="Box">
        <p class="fs_3xl" style="margin-bottom: 2px">{{ tool.showDate(data?.start_date) }}</p>
        <p class="fs_xs color_grey">Open</p>
      </div>
      <div class="Period-Line flex-1">
        <template v-if="Boolean(data?.is_overtime)">
          <div class="Period-Dash-red"></div>
        </template>
        <div v-else class="Period-Dash" v-for="item in 14" :key="item"></div>
        <div class="Period-Meter" :style="{ width: (data?.sdaysDiff / (data?.sdaysDiff + data?.edaysDiff)) * 100 + '%' }"></div>
      </div>
      <div class="text-right">
        <p class="fs_3xl" :class="{ 'color_red-error': Boolean(data?.is_overtime) }" style="margin-bottom: 2px">{{ tool.showDate(data?.end_date) }}</p>
        <p class="fs_xs color_red-error" v-if="Boolean(data?.is_overtime)">Maturity overdue</p>
        <p class="fs_xs color_grey" v-else>Maturity</p>
      </div>
    </div>
    <p class="fs_xs color_grey text-center" style="margin-top: -16px">{{ data?.sdaysDiff + 1 }} days</p>
    <div class="fs_xs color_grey text-center" v-if="base?.is_close && base?.close_date">{{ t('关账') }}: {{ tool.showDate(base?.close_date) }}</div>
  </div>
</template>

<script setup>
import tool from '@/utils/tool';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps(['data', 'base']);
</script>

<style scoped lang="less">
@import '@/styles/variables.less';

.Period-Line {
  display: flex;
  gap: 4px;
  justify-content: stretch;
  position: relative;
  top: 13px;
  margin: 0 13px;
  width: 100%;
  .Period-Dash {
    background-color: #f7f9f8;
    border: 1px solid #e2e5e2;
    border-radius: 4px;
    height: 8px;
    width: 100%;
  }
  .Period-Dash-red {
    background: #c1430c;
    width: 100%;
    height: 8px;
    border-radius: 4px;
  }
  .Period-Meter {
    background-color: #181818;
    border-radius: 4px;
    box-shadow: 0 3px 6px -4px hsla(0, 0%, 9%, 0.24), 0 6px 16px 0 hsla(0, 0%, 9%, 0.16), 0 9px 28px 8px hsla(0, 0%, 9%, 0.1);
    height: 8px;
    left: 0;
    position: absolute;
  }
}
</style>
