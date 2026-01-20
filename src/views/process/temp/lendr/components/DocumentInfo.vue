<template>
  <div>
    <a-row :gutter="24">
      <a-col :span="8">
        <div class="info-content">
          <p class="name">{{ t('辅助文件') }}</p>
          <div class="file-content">
            <template v-if="data.supporting_docs_files && data.supporting_docs_files.length">
              <div v-for="(item, index) in data.supporting_docs_files" :key="index" class="file-item">
                <vco-file-item :file="item" :bg="true"></vco-file-item>
              </div>
            </template>
            <p v-else class="txt">--</p>
          </div>
        </div>
      </a-col>
      <a-col :span="8">
        <div class="info-content">
          <p class="name">{{ t('贷款文件') }}</p>
          <div class="file-content">
            <template v-if="data.loan_docs_files && data.loan_docs_files.length">
              <div v-for="(item, index) in data.loan_docs_files" :key="index" class="file-item">
                <vco-file-item :file="item" :bg="true"></vco-file-item>
              </div>
            </template>
            <p v-else class="txt">--</p>
          </div>
        </div>
      </a-col>
      <a-col :span="8">
        <div class="info-content">
          <p class="name">{{ t('其他') }}</p>
          <div class="file-content">
            <template v-if="data.others_files && data.others_files.length">
              <div v-for="(item, index) in data.others_files" :key="index" class="file-item">
                <vco-file-item :file="item" :bg="true"></vco-file-item>
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
  @import './style.less';
</style>