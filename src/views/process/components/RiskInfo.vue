<template>
  <div>
    <div v-if="isOpen" class="sys-form-content">
      <div v-if="hasPermission('projects:details:risk')" class="title-content">
        <p>Risk</p>
        <a-button
          type="primary"
          size="small"
          shape="round"
          class="uppercase"
          :loading="saveLoading"
          @click="saveHandle"
        >{{ t('保存') }}</a-button>
      </div>
      <a-form-item v-if="hasPermission('projects:details:risk')">
        <a-textarea v-model:value="riskInfo" :auto-size="{ minRows: 4, maxRows: 5 }" />
      </a-form-item>
      <p v-else>{{ data.base.risk || t('暂无数据') }}</p>
    </div>
    <div v-else class="block-item sec">
      <div class="title-content">
        <vco-process-title :title="t('风险信息')"></vco-process-title>
        <a-button
          v-if="!isDetails"
          type="dark"
          size="small"
          shape="round"
          class="uppercase"
          :loading="saveLoading"
          @click="saveHandle"
        >{{ t('保存') }}</a-button>
      </div>
      <div class="sys-form-content">
        <p v-if="isDetails">{{ data.base.risk || t('暂无数据') }}</p>
        <a-form-item v-else>
          <a-textarea v-model:value="riskInfo" :auto-size="{ minRows: 4, maxRows: 5 }" :disabled="isDetails" />
        </a-form-item>
      </div>
    </div>
  </div>
  
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { projectAuditSaveRisk } from '@/api/process';
import { saveRiskInfo } from '@/api/project/project';
import { message } from 'ant-design-vue/es';
import { hasPermission } from "@/directives/permission"

const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
  isDetails: {
    type: Boolean,
    default: false,
  },
  isOpen: {
    type: Boolean,
    default: false,
  },
});

const { t } = useI18n();
const riskInfo = ref('');
const originRiskInfo = ref('');
const uuid = computed(() => {
  return props.data.base.uuid || '';
});

const saveLoading = ref(false);

watch(
  () => props.data.base.risk,
  (risk) => {
    const value = risk || '';
    originRiskInfo.value = value;
    riskInfo.value = value;
  },
  { immediate: true }
);

const saveHandle = () => {
  if (riskInfo.value === originRiskInfo.value) {
    return;
  }
  saveLoading.value = true;
  const ajaxFn = props.isOpen ? saveRiskInfo : projectAuditSaveRisk;
  ajaxFn({
    uuid: uuid.value,
    risk: riskInfo.value,
  }).then(() => {
      originRiskInfo.value = riskInfo.value;
      message.success(t('保存成功'));
    })
    .finally(() => {
      saveLoading.value = false;
    });
};
</script>

<style lang="less" scoped>
.block-item {
  padding: 22px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.title-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 10px;

  :deep(.process-title) {
    border-bottom: none;
    padding-bottom: 0;
    min-height: auto;
  }

  p {
    margin: 0;
    font-size: 14px;
    color: #666;
    font-weight: 500;
  }
}

.sys-form-content :deep(.ant-form-item) {
  margin-bottom: 0;
}
</style>
