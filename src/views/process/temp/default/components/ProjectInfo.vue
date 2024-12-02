<template>
  <div>
    <a-row :gutter="24">
      <a-col :span="12">
        <div class="info-content">
          <p class="name">{{ t('项目名称') }}</p>
          <p class="txt">{{ data.project_name }}</p>
        </div>
      </a-col>
      <a-col :span="12">
        <div class="info-content">
          <p class="name">{{ t('项目类型') }}</p>
          <p class="txt">{{ data.project_type_name }}</p>
        </div>
      </a-col>
      <a-col :span="12">
        <div class="info-content">
          <p class="name">{{ t('邮箱') }}</p>
          <p class="txt">{{ data.project_postcode }}</p>
        </div>
      </a-col>
      <a-col :span="12">
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
                    :src="item.url"
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
          <p class="txt">{{ addressInfo }}</p>
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
  import { computed } from "vue"
  import { useI18n } from "vue-i18n";

  const props = defineProps({
    data: {
      type: Object,
      default: () => {}
    }
  })

  const { t, locale } = useI18n();

  const addressInfo = computed(() => {
    if (locale.value === 'en') {
      return `${props.data.project_address} ${props.data.region_three_name} ${props.data.region_two_name} ${props.data.region_one_name}`
    } else {
      return `${props.data.region_one_name} ${props.data.region_two_name} ${props.data.region_three_name} ${props.data.project_address}`
    }
  })
</script>

<style lang="less" scoped>
  .info-content {
    margin-top: 15px;
    .name {
      font-size: 12px;
      color: #666;
    }
    .txt {
      font-size: 13px;
      font-weight: 500;
      margin-top: 2px;
    }
  }

  .images-box-content {
    display: flex;
    align-items: center;
    gap: 15px;
    .item {
      width: 50px;
      height: 50px;
      background-color: #ddd;
      margin-top: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
</style>