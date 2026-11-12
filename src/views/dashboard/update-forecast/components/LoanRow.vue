<template>
  <tr :class="{ selected }">
    <td class="c-sel">
      <div class="sel">
        <a-checkbox :checked="selected" :aria-label="`Select ${loan.name}`" @change="(e) => toggleSelect(loan.uuid, e.target.checked)" />
      </div>
    </td>
    <LoanCell :loan="loan" />
    <FacilityCell :loan="loan" :busy="busy" />
    <td class="c-rev">
      <div class="pad rev">
        <span class="badge" :class="review.reviewed ? 'yes' : 'no'">{{ review.reviewed ? 'Reviewed' : 'Not reviewed' }}</span>
        <div v-if="review.time">{{ review.reviewed ? '' : 'last ' }}{{ dateLabel(review.time) }}</div>
        <div v-else>no review yet</div>
        <div v-if="review.user_name">{{ review.user_name }}</div>
      </div>
    </td>
    <template v-for="ym in months" :key="ym">
      <td v-if="ym > lastYm" class="c-m off"></td>
      <MonthCell v-else :loan="loan" :ym="ym" :rows="rowsByYm[ym] || NO_ROWS" :current="ym === curYm" :full-repayment="ym === frYm ? loan.full_repayment : null" />
    </template>
    <ActionsCell :loan="loan" :busy="busy" />
  </tr>
</template>

<script setup>
import { computed, inject } from 'vue';
import { CTX_KEY, dateLabel, ymOf, compareRows } from '../utils';
import LoanCell from './LoanCell.vue';
import FacilityCell from './FacilityCell.vue';
import MonthCell from './MonthCell.vue';
import ActionsCell from './ActionsCell.vue';

const props = defineProps({
  loan: {
    type: Object,
    required: true
  },
  months: {
    type: Array,
    default: () => []
  },
  curYm: {
    type: String,
    default: ''
  },
  selected: {
    type: Boolean,
    default: false
  },
  busy: {
    type: Boolean,
    default: false
  }
});

const { toggleSelect } = inject(CTX_KEY);

// 空月份共用同一个数组，避免无关重绘
const NO_ROWS = [];

const review = computed(() => props.loan.review || {});
// 最后一个可编辑月：逾期贷款只有当月
const lastYm = computed(() => (props.loan.overdue ? props.curYm : ymOf(props.loan.end_date)));
const frYm = computed(() => (props.loan.full_repayment?.date ? ymOf(props.loan.full_repayment.date) : ''));

const rowsByYm = computed(() => {
  const map = {};
  [...props.loan.rows].sort(compareRows).forEach((row) => {
    const ym = ymOf(row.date);
    if (!map[ym]) map[ym] = [];
    map[ym].push(row);
  });
  return map;
});
</script>

<style scoped lang="less">
@import '@/views/dashboard/update-forecast/vars.less';

.rev {
  color: @uf-muted;
  font-size: 11px;
}

.badge {
  display: inline-block;
  margin-bottom: 3px;
  padding: 2px 7px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.04em;
  &.yes {
    background: @uf-ok-soft;
    color: @uf-ok;
  }
  &.no {
    background: @uf-warn-soft;
    color: @uf-warn-ink;
  }
}
</style>
