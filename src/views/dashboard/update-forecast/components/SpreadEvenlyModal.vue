<template>
  <a-modal :open="open" :width="520" :mask-closable="false" @cancel="close">
    <template #title>
      <div>{{ closeOnly ? 'Nothing to spread' : 'Spread evenly to maturity?' }}</div>
      <p v-if="loan" class="sub">{{ loan.name }}</p>
    </template>
    <template v-if="plan">
      <p v-if="nothing" class="exp">
        {{ plan.from > plan.to ? 'There are no months left before maturity to spread into.' : 'There is no undrawn facility left to spread.' }}
        <template v-if="plan.removable">Removes the system-spread drawdowns of <b>{{ loan.name }}</b> ({{ plural(plan.removable, 'row') }}, <b>{{ money(plan.removed) }}</b>).</template>{{ keptText }}
      </p>
      <template v-else>
        <p v-if="!plan.n" class="exp">
          Spreads the whole undrawn facility of <b>{{ money(plan.whole) }}</b> evenly over {{ ymLabel(plan.from) }} – {{ ymLabel(plan.to) }} on day {{ loan.default_day }}, replacing the
          system-spread months of <b>{{ loan.name }}</b>.{{ keptText }}
        </p>
        <p v-else-if="plan.stuck" class="exp">
          Your {{ plural(plan.n, 'locked month') }} already {{ plan.n === 1 ? 'uses' : 'use' }} the whole undrawn facility of <b>{{ loan.name }}</b>, or no month is left after
          {{ ymLabel(plan.last) }}. Tick the box to start over.{{ keptText }}
        </p>
        <p v-else class="exp">
          Replaces the system-spread months of <b>{{ loan.name }}</b> with <b>{{ money(plan.target) }}</b> spread evenly over {{ ymLabel(plan.from) }} – {{ ymLabel(plan.to) }} on day
          {{ loan.default_day }}. Your {{ plural(plan.n, 'locked month') }} {{ plan.n === 1 ? 'is' : 'are' }} kept.{{ keptText }}
        </p>
        <a-checkbox v-if="plan.n" v-model:checked="unlock" class="chk">
          Also unlock my {{ plural(plan.n, 'month') }} and spread the whole <b>{{ money(plan.whole) }}</b> from {{ ymLabel(plan.first) }}.
        </a-checkbox>
      </template>
      <p v-if="!closeOnly" class="hint">Saved as a draft until you confirm.</p>
    </template>
    <template #footer>
      <a-button v-if="closeOnly" type="dark" @click="close">Close</a-button>
      <template v-else>
        <a-button type="grey" @click="close">Cancel</a-button>
        <a-button type="dark" @click="emit('submit', unlock ? 1 : 0)">Spread evenly</a-button>
      </template>
    </template>
  </a-modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { money, plural, ymLabel, ymOf, ymAdd, isDrawdown, isLocked, firstAllowedYm } from '../utils';

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  loan: {
    type: Object,
    default: null
  },
  // 服务器今天的日期
  today: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:open', 'submit']);

const unlock = ref(false);

const sum = (rows) => Math.round(rows.reduce((total, row) => total + Number(row.amount), 0) * 100) / 100;

// 要摊的额度 = Gap 加上删掉重摊的行，即剩余额度减去保留下来的预计放款（按分取整，不小于 0）
const toSpread = (facility, rows) => Math.max(Math.round((Number(facility.gap) + sum(rows)) * 100) / 100, 0);

// 弹窗文案用的计划（实际摊分由服务端完成）
// 只读行（今天以前的、在途申请关联的）保持不动：不算我的锁定月份，金额也不在要摊的额度里
const plan = computed(() => {
  const loan = props.loan;
  if (!loan) return null;
  const drawdowns = loan.rows.filter((row) => isDrawdown(row) && !row.void);
  const locked = drawdowns.filter((row) => isLocked(row) && !row.readonly && row.date >= props.today);
  const lockedMonths = [...new Set(locked.map((row) => ymOf(row.date)))].sort();
  const n = lockedMonths.length;
  const last = n ? lockedMonths[n - 1] : '';
  const first = firstAllowedYm(loan, props.today);
  const from = last && ymAdd(last, 1) > first ? ymAdd(last, 1) : first;
  const to = ymOf(loan.end_date);
  // 重摊的行：未锁定的（勾选解锁时连锁定的）可改行；VSL 按出资方分别计算
  const amount = (withLocked) => {
    const rows = drawdowns.filter((row) => !row.readonly && (withLocked || !isLocked(row)));
    const lenders = loan.facility.lenders;
    if (!lenders) return toSpread(loan.facility, rows);
    return toSpread(lenders.vs, rows.filter((row) => Number(row.source) !== 1)) + toSpread(lenders.boc, rows.filter((row) => Number(row.source) === 1));
  };
  const target = amount(false);
  // 在途申请关联的行（今天及以后的只读行）
  const pending = drawdowns.filter((row) => row.readonly && row.date >= props.today).length;
  // 有金额的未锁定可改行：没东西可摊时（如额度已用完），Spread evenly 只是删掉它们
  const removable = drawdowns.filter((row) => !row.readonly && !isLocked(row) && Number(row.amount) > 0);
  return { n, last, first, from, to, target, whole: amount(true), pending, removable: removable.length, removed: sum(removable), stuck: target <= 0 || from > to };
});

// 没有锁定月份，且没有月份或没有额度可摊
const nothing = computed(() => !!plan.value && !plan.value.n && plan.value.stuck);
// 没东西可摊，也没有可删的行：只能关闭
const closeOnly = computed(() => nothing.value && !plan.value.removable);

// 保留不动的在途申请关联的行
const keptText = computed(() => {
  const n = plan.value?.pending || 0;
  return n ? ` ${plural(n, 'row')} tied to a pending request ${n === 1 ? 'is' : 'are'} kept.` : '';
});

watch(
  () => props.open,
  (open) => {
    if (open) unlock.value = !!plan.value?.stuck;
  }
);

const close = () => emit('update:open', false);
</script>

<style scoped lang="less">
@import '@/views/dashboard/update-forecast/vars.less';

.sub {
  .uf-modal-sub();
}

.exp {
  .uf-modal-text();
  margin: 8px 0 10px;
}

.chk {
  display: flex;
  margin: 0 0 10px;
  padding: 10px 12px;
  border-radius: 10px;
  background: @uf-surface;
  font-size: 13px;
  line-height: 1.5;
}

.hint {
  margin: 0;
  color: @uf-muted;
  font-size: 12px;
}
</style>
