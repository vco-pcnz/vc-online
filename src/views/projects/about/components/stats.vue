<template>
  <div class="stats-content">
    <div class="box left">
      <div class="box-top">
        <p class="bold">Projected Total Income</p>
        <vco-number :value="data?.left?.income" :bold="true" size="fs_3xl" :precision="2"></vco-number>
      </div>
      <a-divider />

      <a-row :gutter="16" class="income">
        <a-col :span="24">
          <p class="color_grey fs_xs">Interest ({{ data?.left?.interestRate }}%)</p>
          <vco-number :value="data?.left?.interest" :bold="true" :precision="2" size="fs_2xl"></vco-number>
        </a-col>
        <a-col :span="24" class="">
          <p class="color_grey fs_xs">Establishment fee ({{ data?.left?.estabFeeRate }}%)</p>
          <vco-number :value="data?.left?.estabFee" :bold="true" :precision="2" size="fs_2xl"></vco-number>
        </a-col>
        <a-col :span="24" v-if="detail?.base?.has_linefee">
          <p class="color_grey fs_xs">Line fee ({{ data?.left?.lineFeeRate }}%)</p>
          <vco-number :value="data?.left?.lineFee" :bold="true" :precision="2" size="fs_2xl"></vco-number>
        </a-col>
        <a-col :span="24" v-if="hasPermission('projects:about:bonus')">
          <p class="color_grey fs_xs">Bonus ({{ data?.left?.bonusRate }}%)</p>
          <vco-number :value="data?.left?.bonus" :bold="true" :precision="2" size="fs_2xl"></vco-number>
        </a-col>
      </a-row>
    </div>
    <div class="box middle">
      <div class="box-top">
        <p class="bold">Current income</p>
        <vco-number :value="data?.middle?.income" :bold="true" size="fs_3xl" :precision="2"></vco-number>
      </div>
      <a-divider />
      <a-row :gutter="16" class="income">
        <a-col :span="24">
          <p class="color_grey fs_xs">Interest</p>
          <vco-number :value="data?.middle?.interest" :bold="true" :precision="2" size="fs_2xl"></vco-number>
        </a-col>
        <a-col :span="24">
          <p class="color_grey fs_xs">Establishment fee (to {{ toDay }})</p>
          <vco-number :value="data?.middle?.estabFee" :bold="true" :precision="2" size="fs_2xl"></vco-number>
          <p class="fs_xs color_grey"></p>
        </a-col>
        <a-col :span="24" v-if="detail?.base?.has_linefee">
          <p class="color_grey fs_xs">Line fee</p>
          <vco-number :value="data?.middle?.lineFee" :bold="true" :precision="2" size="fs_2xl"></vco-number>
        </a-col>
        <a-col :span="24" v-if="hasPermission('projects:about:bonus')">
          <p class="color_grey fs_xs">Bonus</p>
          <vco-number :value="data?.middle?.bonus2" :bold="true" :precision="2" size="fs_2xl"></vco-number>
        </a-col>
      </a-row>
    </div>
    <div class="box right">
      <p class="box-top text-center" style="font-size: 22px; line-height: 60px">Indicator</p>
      <a-divider />
      <a-row :gutter="16">
        <a-col :span="12">
          <div :class="{ 'color_red-error': Math.abs(data?.right?.lvr) > Math.abs(data?.right?.lvrMax) }">
            <p class="color_grey fs_xs">LVR</p>
            <span class="fs_xl bold">{{ data?.right?.lvr }}%</span>
            <p class="fs_xs">{{ Math.abs(data?.right?.lvr) > Math.abs(data?.right?.lvrMax) ? 'over the ' : '' }}max {{ data?.right?.lvrMax }}%</p>
          </div>
        </a-col>
        <a-col :span="12" class="text-right">
          <p class="color_grey fs_xs">Security value</p>
          <vco-number :value="data?.right?.security" :bold="true" size="fs_xl" :precision="2"></vco-number>
          <!-- <a-button v-if="hasPermission('projects:detail:viewSecurity')" type="brown" shape="round" size="small" class="mt-1" @click="navigationTo(`/projects/discharge?uuid=${currentId}`)">
            security items <i class="iconfont fs_2xs ml-3">&#xe794;</i>
          </a-button> -->
        </a-col>
        <a-col :span="24" class="my-4">
          <div :class="{ 'color_red-error': Math.abs(data?.right?.irr) < Math.abs(data?.right?.irrPreset) }">
            <p class="color_grey fs_xs">IRR</p>
            <p class="fs_xl bold">{{ data?.right?.irr }}%</p>
            <p class="fs_xs">Benchmark {{ data?.right?.irrPreset }}%</p>
          </div>
        </a-col>
        <a-col :span="10">
          <div :class="{ 'color_red-error': Math.abs(data?.right?.ltc) > Math.abs(data?.right?.baseline) }">
            <div class="color_grey fs_xs flex items-center gap-2">
              LTC
              <div class="efSGMs">
                <i class="iconfont">&#xe6b3;</i>
                <div class="tips"><p>LTC = Projected FC2 / Total Development Cost </p></div>
              </div>
            </div>
            <p class="fs_xl bold">{{ data?.right?.ltc }}%</p>
          </div>
        </a-col>
        <a-col :span="14" class="text-right cursor-pointer">
          <DevCostDetail :dataJson="detail?.base?.devCostDetail" :disabledGST="true" :disabledLoan="true" :disabledModel="true" @change="editSaveDevCost">
            <div class="color_grey fs_xs">Total Development Cost</div>
            <div class="flex justify-end items-center gap-2">
              <vco-number :value="data?.right?.devCost" :bold="true" size="fs_xl" :precision="2"></vco-number>
              <i class="iconfont color_coal">&#xe743;</i>
            </div>
          </DevCostDetail>
        </a-col>
        <a-col :span="24">
          <div class="fs_xs flex items-center gap-2" :class="{ 'color_red-error': Math.abs(data?.right?.ltc) > Math.abs(data?.right?.baseline) }">
            Benchmark {{ data?.right?.baseline }}%
            <div class="efSGMs">
              <i class="iconfont">&#xe6b3;</i>
              <div class="tips" style="width: 230px;"><p>Benchmark = FC2 / Development Cost </p></div>
            </div>
          </div>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { navigationTo } from '@/utils/tool';
import { hasPermission } from '@/directives/permission/index';
import { selectDateFormat } from '@/utils/tool';
import dayjs, { Dayjs } from 'dayjs';
import DevCostDetail from '@/views/process/temp/default/components/DevCostDetail.vue';
import { edit } from '@/api/project/annex';
import { saveDevCost } from '@/api/project/project';

const { t } = useI18n();
const emits = defineEmits(['update']);

const props = defineProps({
  currentId: {
    type: String,
    default: ''
  },
  data: {
    type: Object,
    default: () => {}
  },
  detail: {
    type: Object,
    default: () => {}
  }
});
const toDay = ref(dayjs().format(selectDateFormat()));

const editSaveDevCost = (val) => {
  saveDevCost({ uuid: props.currentId, ...val }).then((res) => {
    emits('update');
  });
};
</script>

<style scoped lang="less">
@import '@/styles/variables.less';

.stats-content {
  grid-gap: 12px;
  display: grid;
  gap: 12px;
  grid-template-columns: 2fr 2fr 2fr;

  .box {
    background-color: #f0f0f0;
    border: 1px solid #e2e5e2;
    padding: 20px 15px 20px;
    border-radius: 12px;
  }
}
.box-top {
  min-height: 60px;
}
.bonus2 {
  :deep(.ant-statistic-content),
  :deep(.ant-statistic) {
    font-size: 12px !important;
    line-height: 18px !important;
    font-weight: normal !important;
    color: #888 !important;
  }
}
:deep(.income) {
  .ant-col {
    height: 60px;
    margin-left: 46px;
  }
}

:deep(.ant-divider-horizontal) {
  margin: 12px 0;
}

.middle,
.left {
  .box-top {
    padding-left: 46px;
  }
}
.iconfont {
  color: @colorPrimary;
  font-size: 14px;
}

.efSGMs {
  position: relative;
  cursor: pointer;
  color: rgba(24, 24, 24, 0.5);
  .tips {
    position: absolute;
    top: 0px;
    left: 50%;
    right: auto;
    transform: translateY(calc(-100% - 4px));
    width: 280px;
    padding: 8px;
    border-radius: 4px;
    border: 1px solid rgba(24, 24, 24, 0.2);
    background: rgb(255, 255, 255);
    box-shadow: rgba(0, 0, 0, 0.25) 0px 4px 4px 0px;
    color: rgba(24, 24, 24, 0.5);
    font-size: 12px;
    font-style: normal;
    font-weight: 500;
    line-height: 1.5;
    display: none;
  }
  &:hover {
    .tips {
      display: block;
    }
  }
}
</style>
