<template>
  <a-popover v-if="activeRisks.length" placement="top" overlay-class-name="risk-warning-popover">
    <template #content>
      <div class="risk-warning-list">
        <div v-for="item in activeRisks" :key="item.id || item.risk_id || item.content" class="risk-warning-item" :class="item.level">
          <span class="risk-level">{{ riskLevelLabel(item.level) }}</span>
          <span class="risk-content">{{ item.content }}</span>
        </div>
      </div>
    </template>
    <a-alert
      class="mb-5 risk-warning-alert"
      :class="highestRiskLevel"
      show-icon
      :message="t('该项目存在风险提示')"
      type="warning"
    />
  </a-popover>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  risk: {
    type: Array,
    default: () => []
  }
});

const { t } = useI18n();

const parsedRisks = computed(() => {
  if (Array.isArray(props.risk)) return props.risk;
  return [];
});

const activeRisks = computed(() =>
  parsedRisks.value.filter(
    (item) => item?.content && Number(item?.is_archived) !== 1
  )
);

const highestRiskLevel = computed(() => {
  const levels = activeRisks.value.map((item) => item.level);
  return ['high', 'medium', 'low'].find((level) => levels.includes(level)) || 'medium';
});

const riskLevelLabel = (level) => {
  const labels = {
    high: 'High',
    medium: 'Medium',
    low: 'Low'
  };
  return labels[level] || labels.medium;
};
</script>

<style scoped lang="less">
.risk-warning-alert {
  width: 100%;
  border-left: 4px solid;

  &.high {
    border-color: #d9363e;
    background: #fff1f0;
  }

  &.medium {
    border-color: #fa8c16;
    background: #fff7e6;
  }

  &.low {
    border-color: #52c41a;
    background: #f6ffed;
  }
}

.risk-warning-list {
  display: flex;
  width: min(420px, 70vw);
  max-height: 260px;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
}

.risk-warning-item {
  display: grid;
  grid-template-columns: 70px minmax(0, 1fr);
  gap: 10px;
  padding: 8px 10px;
  border-left: 3px solid;
  border-radius: 4px;

  &.high {
    border-color: #d9363e;
    background: #fff1f0;
    color: #d9363e;
  }

  &.medium {
    border-color: #fa8c16;
    background: #fff7e6;
    color: #d46b08;
  }

  &.low {
    border-color: #52c41a;
    background: #f6ffed;
    color: #389e0d;
  }
}

.risk-level {
  font-weight: 700;
  text-transform: uppercase;
}

.risk-content {
  color: #262626;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
