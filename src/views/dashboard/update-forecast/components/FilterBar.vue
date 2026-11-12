<template>
  <div class="toolbar">
    <div class="filters">
      <label v-if="canLmFilter" class="fbox">
        <span class="fl">LM</span>
        <a-select :value="filters.lm_uuid" :options="lmOptions" :bordered="false" show-search option-filter-prop="label" class="lm-select" aria-label="Lending manager" @change="(value) => emit('change', { lm_uuid: value })" />
      </label>
      <div class="segf" role="group" aria-label="Review status">
        <button v-for="item in STATUS" :key="item.value" type="button" :aria-pressed="filters.review_status === item.value" @click="emit('change', { review_status: item.value })">
          {{ item.label }} <span class="n">{{ counts[item.count] || 0 }}</span>
        </button>
      </div>
      <button type="button" class="fchip" :aria-pressed="!!filters.draft" title="Only loans with a draft: edits saved automatically but not yet confirmed" @click="emit('change', { draft: filters.draft ? 0 : 1 })">
        Draft <span class="n">{{ counts.draft || 0 }}</span>
      </button>
      <button type="button" class="fchip overdue" :aria-pressed="!!filters.overdue" title="Only loans that have matured and are not repaid" @click="emit('change', { overdue: filters.overdue ? 0 : 1 })">
        Repayment overdue <span class="n">{{ counts.overdue || 0 }}</span>
      </button>
      <label class="fbox">
        <span class="fl">Loan</span>
        <a-input v-model:value="keyword" :bordered="false" allow-clear placeholder="Search" class="search" aria-label="Search loan" @change="emitKeyword" />
      </label>
    </div>
    <a-button type="dark" class="confirm-sel" :disabled="!selectedCount" title="Save every loan you ticked and record it as reviewed today. Changes are shown for review first" @click="emit('confirm-selected')">
      Confirm selected <span class="cnt">{{ selectedCount }}</span>
    </a-button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { debounce } from 'lodash';

const props = defineProps({
  filters: {
    type: Object,
    required: true
  },
  counts: {
    type: Object,
    default: () => ({})
  },
  lms: {
    type: Array,
    default: () => []
  },
  canLmFilter: {
    type: Boolean,
    default: false
  },
  selectedCount: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['change', 'confirm-selected']);

const STATUS = [
  { value: '', label: 'All', count: 'all' },
  { value: 'not_reviewed', label: 'Not reviewed', count: 'not_reviewed' },
  { value: 'reviewed', label: 'Reviewed', count: 'reviewed' }
];

const lmOptions = computed(() => [{ value: '', label: 'All' }, ...props.lms.map((item) => ({ value: item.uuid, label: item.name }))]);

// 搜索：名称或编号，输入停顿后再查询
const keyword = ref(props.filters.keyword);
const emitKeyword = debounce(() => emit('change', { keyword: keyword.value.trim() }), 400);
</script>

<style scoped lang="less">
@import '@/views/dashboard/update-forecast/vars.less';

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 16px;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.fbox {
  display: inline-flex;
  align-items: center;
  height: 34px;
  border: 1px solid @uf-line-2;
  border-radius: 8px;
  background: @uf-bg;
  overflow: hidden;
  .fl {
    display: flex;
    align-items: center;
    align-self: stretch;
    padding: 0 10px;
    border-right: 1px solid @uf-line-2;
    color: @uf-ink;
    font-size: 12.5px;
    font-weight: 600;
    white-space: nowrap;
  }
  .lm-select {
    min-width: 160px;
  }
  .search {
    width: 190px;
  }
}

.segf {
  display: inline-flex;
  align-items: center;
  height: 34px;
  padding: 2px;
  border: 1px solid @uf-line-2;
  border-radius: 999px;
  background: @uf-surface;
  button {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 28px;
    padding: 0 12px;
    border: 0;
    border-radius: 999px;
    background: transparent;
    color: @uf-ink-2;
    font-size: 12.5px;
    font-weight: 600;
    white-space: nowrap;
    cursor: pointer;
    &[aria-pressed='true'] {
      background: @uf-ink;
      color: @color_white;
      .n {
        background: rgba(@color_white, 0.18);
        color: inherit;
      }
    }
  }
}

.n {
  padding: 1px 7px;
  border-radius: 999px;
  background: @uf-surface-2;
  font-size: 11px;
  font-weight: 700;
}

.fchip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 34px;
  padding: 0 12px;
  border: 1px solid @uf-line-2;
  border-radius: 999px;
  background: @uf-bg;
  color: @uf-ink-2;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  &[aria-pressed='true'] {
    border-color: @uf-warn;
    background: @uf-warn-soft;
    color: @uf-warn-ink;
    .n {
      background: @uf-bg;
    }
  }
  &.overdue[aria-pressed='true'] {
    border-color: @uf-danger;
    background: @uf-danger-soft;
    color: @uf-danger;
  }
}

.confirm-sel {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 34px;
  border-radius: 8px;
  font-weight: 600;
  .cnt {
    min-width: 20px;
    padding: 2px 7px;
    border-radius: 999px;
    background: @color_white;
    color: @uf-ink;
    font-size: 11px;
    font-weight: 700;
    line-height: 1.2;
    text-align: center;
  }
}
</style>
