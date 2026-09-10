<template>
  <div class="input-item estimated-drawdown">
    <div class="label" :class="{ err: validate && !selected }">{{ t('预计放款') }}</div>
    <a-select
      style="width: 100%"
      :value="modelValue"
      :loading="loading"
      :placeholder="t('请选择')"
      optionLabelProp="label"
      :popupMatchSelectWidth="true"
      popupClassName="estimated-drawdown-dropdown"
      @update:value="emits('update:modelValue', $event)"
    >
      <a-select-option :value="0" :label="t('不关联预计放款')">
        {{ t('不关联预计放款') }}
      </a-select-option>
      <a-select-option
        v-for="item in list"
        :key="item.id"
        :value="item.id"
        :label="`${item.name}  ${tool.showDate(item.date)}`"
      >
        <div class="estimated-option">
          <span class="estimated-option-main">
            {{ item.name }}
            <span class="estimated-option-date">{{ tool.showDate(item.date) }}</span>
          </span>
          <span class="estimated-option-amount">{{ tool.formatMoney(item.amount) }}</span>
        </div>
      </a-select-option>
    </a-select>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { forecastDarwdown } from '@/api/project/loan';
import tool from '@/utils/tool';

const { t } = useI18n();
const props = defineProps({
  modelValue: {
    default: undefined
  },
  uuid: {
    type: String,
    required: true
  },
  applyId: {
    default: undefined
  },
  validate: {
    type: Boolean,
    default: false
  }
});
const emits = defineEmits(['update:modelValue']);

const loading = ref(false);
const list = ref([]);

const selected = computed(() => {
  return props.modelValue === 0 || props.modelValue > 0;
});

const load = () => {
  if (!props.uuid) return;
  loading.value = true;
  const params = { uuid: props.uuid };
  if (props.applyId) params.id = props.applyId;
  forecastDarwdown(params)
    .then((res) => {
      list.value = res || [];
    })
    .finally(() => {
      loading.value = false;
    });
};

watch(
  () => [props.uuid, props.applyId],
  () => {
    load();
  },
  { immediate: true }
);
</script>

<style scoped lang="less">
.estimated-drawdown {
  margin: 15.5px 0;
}
.estimated-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  .estimated-option-main {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .estimated-option-date {
    margin-left: 8px;
    color: #888;
  }
  .estimated-option-amount {
    flex-shrink: 0;
    font-weight: 600;
    color: #7dc1c1;
  }
}
</style>

<style lang="less">
.estimated-drawdown-dropdown {
  .ant-select-item-option-content {
    white-space: normal;
  }
}
</style>
