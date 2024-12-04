<template>
  <div>
    <a-row :gutter="24">
      <a-col :span="12">
        <div class="info-content">
          <p class="name">{{ t('资源许可') }}</p>
          <div class="file-content">
            <template v-if="data.resource_consent_files.length">
              <div v-for="(item, index) in data.resource_consent_files" :key="index" class="file-item">
                <vco-file-item :file="item"></vco-file-item>
              </div>
            </template>
            <p v-else class="txt">--</p>
          </div>
        </div>
      </a-col>
      <a-col :span="12">
        <div class="info-content">
          <p class="name">{{ t('工程计划批准') }}</p>
          <div class="file-content">
            <template v-if="data.engineering_plan_approval_files.length">
              <div v-for="(item, index) in data.engineering_plan_approval_files" :key="index" class="file-item">
                <vco-file-item :file="item"></vco-file-item>
              </div>
            </template>
            <p v-else class="txt">--</p>
          </div>
        </div>
      </a-col>
      <a-col :span="12">
        <div class="info-content">
          <p class="name">{{ t('建筑许可') }}</p>
          <div class="file-content">
            <template v-if="data.building_consent_files.length">
              <div v-for="(item, index) in data.building_consent_files" :key="index" class="file-item">
                <vco-file-item :file="item"></vco-file-item>
              </div>
            </template>
            <p v-else class="txt">--</p>
          </div>
        </div>
      </a-col>
      <a-col :span="12">
        <div class="info-content">
          <p class="name">{{ t('可行性研究') }}</p>
          <div class="file-content">
            <template v-if="data.feasibility_files.length">
              <div v-for="(item, index) in data.feasibility_files" :key="index" class="file-item">
                <vco-file-item :file="item"></vco-file-item>
              </div>
            </template>
            <p v-else class="txt">--</p>
          </div>
        </div>
      </a-col>
      <a-col :span="12">
        <div class="info-content">
          <p class="name">{{ t('其他') }}</p>
          <div class="file-content">
            <template v-if="data.others_files.length">
              <div v-for="(item, index) in data.others_files" :key="index" class="file-item">
                <vco-file-item :file="item"></vco-file-item>
              </div>
            </template>
            <p v-else class="txt">--</p>
          </div>
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
    .file-content {
      .file-item {
        .fileBox {
          background-color: #f7f0e6;
          border-radius: 8px;
        }
      }
    }
  }
</style>