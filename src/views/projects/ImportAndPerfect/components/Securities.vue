<template>
  <div class="cursor-pointer">
    <DevCostDetail :dataJson="projectDetail?.base?.devCostDetail" @change="editSaveDevCost">
      <div class="color_grey fs_xs">Total Development Cost</div>
      <div class="flex items-center gap-2">
        <vco-number :value="projectDetail?.base?.devCost" :bold="true" size="fs_xl" :precision="2"></vco-number>
        <i class="iconfont color_coal">&#xe743;</i>
      </div>
    </DevCostDetail>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import DevCostDetail from '@/views/process/temp/default/components/DevCostDetail.vue';
const { t } = useI18n();
const props = defineProps({
  currentId: {
    type: [String, Number]
  },
  projectDetail: {
    type: Object
  }
});

const editSaveDevCost = (val) => {
  console.log(val);
  return;
  saveDevCost({ uuid: props.currentId, ...val }).then((res) => {
    emits('update');
  });
};
</script>

<style scoped lang="less">
@import '@/styles/variables.less';
.color_coal {
  color: @colorPrimary;
  font-size: 14px;
}
</style>
