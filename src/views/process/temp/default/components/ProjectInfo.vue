<template>
  <div>
    <a-row :gutter="24">
      <a-col :span="8">
        <div class="info-content">
          <p class="name">{{ t('项目名称') }}</p>
          <p class="txt">{{ data.project_name }}</p>
        </div>
      </a-col>
      <a-col :span="8">
        <div class="info-content">
          <p class="name">{{ t('项目类型') }}</p>
          <p class="txt">{{ data.project_type_name }}</p>
        </div>
      </a-col>
      <a-col :span="8">
        <div class="info-content">
          <p class="name">{{ t('楼栋数') }}</p>
          <p class="txt">{{ data.building_num }}</p>
        </div>
      </a-col>
      <a-col :span="8">
        <div class="info-content">
          <p class="name">{{ t('邮编') }}</p>
          <p class="txt">{{ data.project_postcode }}</p>
        </div>
      </a-col>
      <a-col :span="8">
        <div class="info-content cursor-pointer">
          <DevCostDetail :edit="false" v-model:dataJson="data.devCostDetail">
            <p class="name">{{ t('开发成本') }} <i class="iconfont color_coal">&#xe76f;</i></p>
            <p class="txt">{{ tool.formatMoney(data.devCost) }}</p>
          </DevCostDetail>
        </div>
      </a-col>
      <a-col :span="24">
        <div class="info-content">
          <p class="name">{{ t('项目照片') }}</p>
          <div v-if="data.project_images && data.project_images.length">
            <a-image-preview-group>
              <div class="images-box-content">
                <div v-for="(item, index) in data.project_images" :key="index" class="item">
                  <a-image :width="50" :src="item.value" />
                </div>
              </div>
            </a-image-preview-group>
          </div>
          <p v-else class="txt">--</p>
        </div>
      </a-col>
      <a-col :span="24">
        <div class="info-content">
          <p class="name">{{ t('项目地址') }}</p>
          <p class="txt">{{ data.project_city }}</p>
        </div>
      </a-col>
      <a-col :span="24">
        <div class="info-content">
          <p class="name">{{ t('项目介绍') }}</p>
          <p class="txt">{{ data.project_about }}</p>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';
import DevCostDetail from './DevCostDetail.vue';

const props = defineProps({
  data: {
    type: Object,
    default: () => {}
  }
});

const { t } = useI18n();
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';
@import './style.less';
.iconfont {
  color: @colorPrimary;
  font-size: 14px;
}
</style>
