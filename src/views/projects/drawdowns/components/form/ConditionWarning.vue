<template>
  <a-popover v-if="conditions.length" placement="top" overlay-class-name="condition-warning-popover">
    <template #content>
      <div class="condition-warning-list">
        <div v-for="item in conditions" :key="item.id || `${item.date}-${item.note}`" class="condition-warning-item">
          <span class="condition-date">{{ showDate(item.date) }}</span>
          <span class="condition-note">{{ item.note }}</span>
        </div>
      </div>
    </template>
    <a-alert
      class="mb-5 condition-warning-alert"
      show-icon
      type="warning"
      :message="t('该项目存在未完成条件')"
    />
  </a-popover>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import dayjs from 'dayjs';
import { projectDetailConditionList } from '@/api/process';

const props = defineProps({
  uuid: {
    type: String,
    default: ''
  },
  visible: {
    type: Boolean,
    default: true
  }
});

const { t } = useI18n();
const conditions = ref([]);
const showDate = (date) => date ? dayjs(date).format('DD MMM YYYY') : '--';

const loadConditions = () => {
  if (!props.uuid || !props.visible) {
    conditions.value = [];
    return;
  }

  projectDetailConditionList({ uuid: props.uuid }).then((res) => {
    conditions.value = (Array.isArray(res) ? res : []).filter(
      (item) => Number(item?.is_ok) !== 1 && String(item?.note || '').trim()
    );
  }).catch(() => {
    conditions.value = [];
  });
};

watch(() => [props.uuid, props.visible], loadConditions, { immediate: true });
</script>

<style scoped lang="less">
.condition-warning-alert {
  width: 100%;
  border-left: 4px solid #fa8c16;
  background: #fff7e6;
}

.condition-warning-list {
  display: flex;
  width: min(460px, 70vw);
  max-height: 260px;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
}

.condition-warning-item {
  display: grid;
  grid-template-columns: 110px minmax(0, 1fr);
  gap: 10px;
  padding: 8px 10px;
  border-left: 3px solid #fa8c16;
  border-radius: 4px;
  background: #fff7e6;
}

.condition-date {
  color: #d46b08;
  font-weight: 600;
}

.condition-note {
  color: #262626;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
