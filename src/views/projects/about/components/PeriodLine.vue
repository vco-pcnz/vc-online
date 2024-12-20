<template>
  <div class="Period bold">
    <div class="fs_xs text-center"><span class="weight_demiBold">21 days</span><span class="color_grey ml-2">361 remaining</span></div>
    <div class="flex">
      <div class="Box">
        <p class="fs_3xl" style="margin-bottom: 2px">30 Nov ‘24</p>
        <p class="fs_xs color_grey">Open</p>
      </div>
      <div class="Period-Line flex-1">
        <div class="Period-Dash" v-for="item in 14" :key="item"></div>
        <div class="Period-Meter" style="width: 5.5%"></div>
      </div>
      <div class="text-right">
        <p class="fs_3xl" style="margin-bottom: 2px">16 Dec ‘25</p>
        <p class="fs_xs color_grey">Maturity</p>
      </div>
    </div>
    <p class="fs_xs color_grey text-center" style="margin-top: -16px">382 days</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps([]);
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
