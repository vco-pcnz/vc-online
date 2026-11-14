<template>
  <td class="c-bal">
    <a-tooltip :title="lenders ? undefined : badTip" placement="right">
      <!-- VSL：按出资方拆分 -->
      <template v-if="lenders" #title>
        <table class="lenders">
          <tbody>
            <tr>
              <th></th>
              <th>Undrawn</th>
              <th>Forecast</th>
              <th>Gap</th>
            </tr>
            <tr v-for="item in lenders" :key="item.name">
              <td>{{ item.name }}</td>
              <td>{{ money(item.undrawn) }}</td>
              <td>{{ money(item.forecast) }}</td>
              <td>{{ money(item.gap) }}</td>
            </tr>
          </tbody>
        </table>
        <div v-if="badTip" class="bad-tip">{{ badTip }}</div>
      </template>
      <div class="pad bal" :class="{ busy }">
        <div>
          <span>Undrawn</span>
          <b>{{ money(facility.undrawn) }}</b>
        </div>
        <div>
          <span>Forecast</span>
          <b>{{ money(facility.forecast) }}</b>
        </div>
        <div class="gap" :class="gapClass">
          <span>{{ loan.overdue ? 'Not drawn' : 'Gap' }}</span>
          <b>{{ money(facility.gap) }}</b>
        </div>
      </div>
    </a-tooltip>
  </td>
</template>

<script setup>
import { computed } from 'vue';
import { money } from '../utils';

const props = defineProps({
  loan: {
    type: Object,
    required: true
  },
  // 请求在途：数字待刷新
  busy: {
    type: Boolean,
    default: false
  }
});

const facility = computed(() => props.loan.facility || {});

const lenders = computed(() => {
  const data = facility.value.lenders;
  if (!data) return null;
  return [
    { name: 'VS', ...data.vs },
    { name: 'BOC', ...data.boc }
  ];
});

// Gap：0 绿；>0 且 Auto-spread 开黄；>0 且关金；<0 或不能确认（VSL 一方超额时合计可能 ≥ 0）红；逾期中性
const gapClass = computed(() => {
  const gap = Number(facility.value.gap) || 0;
  if (props.loan.overdue) return 'na';
  if (gap < 0 || props.loan.blocked) return 'bad';
  if (gap === 0) return 'ok';
  return Number(props.loan.auto_spread) === 1 ? 'warn' : 'gold';
});

// VSL 被拦时写明超额的出资方（loan.block）
const badTip = computed(() => {
  if (gapClass.value !== 'bad') return '';
  const lender = props.loan.block?.lender;
  return `Forecast drawdowns exceed the undrawn ${lender ? `${lender.toUpperCase()} ` : ''}facility`;
});
</script>

<style scoped lang="less">
@import '@/views/dashboard/update-forecast/vars.less';

.bal {
  display: grid;
  gap: 3px;
  font-size: 11.5px;
  transition: opacity 0.2s;
  &.busy {
    opacity: 0.5;
  }
  > div {
    display: flex;
    justify-content: space-between;
    gap: 6px;
  }
  span {
    color: @uf-muted;
  }
  b {
    font-weight: 700;
  }
}

.gap b {
  padding: 0 6px;
  border-radius: 999px;
}

.gap.ok b {
  background: @uf-ok-soft;
  color: @uf-ok;
}

.gap.warn b {
  background: @uf-warn-soft;
  color: @uf-warn-ink;
}

.gap.gold b {
  background: @uf-gold-soft;
  color: @uf-gold-ink;
}

.gap.bad b {
  background: @uf-danger-soft;
  color: @uf-danger;
}

.gap.na b {
  background: @uf-surface-2;
  color: @uf-ink-2;
}

.lenders {
  border-collapse: collapse;
  font-size: 12px;
  th,
  td {
    padding: 1px 6px;
    text-align: right;
    white-space: nowrap;
  }
  th {
    font-weight: 600;
    opacity: 0.75;
  }
  td:first-child {
    font-weight: 700;
    text-align: left;
  }
}

.bad-tip {
  margin-top: 4px;
}
</style>
