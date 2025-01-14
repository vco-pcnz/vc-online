<template>
  <div>
    <a-row :gutter="24">
      <a-col :span="6">
        <div class="info-content">
          <p class="name">{{ t('项目名称') }}</p>
          <p class="txt">{{ data.project_name }}</p>
        </div>
      </a-col>
      <a-col :span="6">
        <div class="info-content">
          <p class="name">{{ t('项目类型') }}</p>
          <p class="txt">{{ data.project_type_name }}</p>
        </div>
      </a-col>
      <a-col :span="6">
        <div class="info-content">
          <p class="name">{{ t('邮编') }}</p>
          <p class="txt">{{ data.project_postcode }}</p>
        </div>
      </a-col>
      <a-col :span="6">
        <div class="info-content">
          <p class="name">{{ t('楼栋数') }}</p>
          <p class="txt">{{ data.building_num }}</p>
        </div>
      </a-col>
      <a-col :span="24">
        <div class="info-content">
          <p class="name">{{ t('项目照片') }}</p>
          <div v-if="data.project_images && data.project_images.length">
            <a-image-preview-group>
              <div class="images-box-content">
                <div
                  v-for="(item, index) in data.project_images"
                  :key="index"
                  class="item"
                >
                  <a-image
                    :width="50"
                    :src="item.value"
                  />
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
  import { useI18n } from "vue-i18n";

  const props = defineProps({
    data: {
      type: Object,
      default: () => {}
    }
  })

  const { t } = useI18n();
</script>

<style lang="less" scoped>
  @import './style.less';
</style>