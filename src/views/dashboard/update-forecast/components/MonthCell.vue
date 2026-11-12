<template>
  <td class="c-m" :class="{ cur: current }">
    <div class="cell">
      <TxRow v-for="row in rows" :key="row.key" :loan="loan" :row="row" :ym="ym" />

      <!-- 全额还款：系统计算，只读 -->
      <div v-if="fullRepayment" class="fr">
        <div class="fr-h">
          <span class="tp">F</span>Full repayment
          <span class="fb" :class="loan.overdue ? 'over' : 'auto'">{{ loan.overdue ? 'Overdue' : 'System' }}</span>
        </div>
        <div class="fr-l">
          <span>{{ dateLabel(fullRepayment.date) }}</span>
          <b>{{ money(fullRepayment.amount) }}</b>
        </div>
        <div v-if="loan.overdue" class="fr-note"><b>Matured {{ dateLabel(loan.end_date) }}, not repaid.</b> Assumed repaid today, penalty interest included.</div>
        <div v-else class="fr-note">At maturity. Balance + interest to this date, set by the system.</div>
      </div>

      <div v-if="editable" class="cfoot">
        <div v-if="adding" class="addmenu">
          <template v-if="loan.product === 'vsl'">
            <button type="button" class="d" @click="add(2, 0)">+ Drawdown VS</button>
            <button type="button" class="d" @click="add(2, 1)">+ Drawdown BOC</button>
          </template>
          <button v-else type="button" class="d" @click="add(2)">+ Drawdown</button>
          <button type="button" class="r" @click="add(4)">+ Partial repayment</button>
          <button type="button" @click="adding = false">Cancel</button>
        </div>
        <template v-else>
          <button type="button" class="ic" :title="`Add a drawdown or partial repayment in ${ymLabel(ym)}`" :aria-label="`Add in ${ymLabel(ym)}`" @click="adding = true">+</button>
          <button v-if="canPush" type="button" class="ic push" title="Push this month's drawdowns to next month (same day)" :aria-label="`Push ${ymLabel(ym)} drawdowns to next month`" @click="push">→</button>
        </template>
      </div>
    </div>
  </td>
</template>

<script setup>
import { ref, computed, inject } from 'vue';
import { CTX_KEY, dateLabel, ymLabel, ymOf, money, isDrawdown } from '../utils';
import TxRow from './TxRow.vue';

const props = defineProps({
  loan: {
    type: Object,
    required: true
  },
  ym: {
    type: String,
    required: true
  },
  rows: {
    type: Array,
    default: () => []
  },
  current: {
    type: Boolean,
    default: false
  },
  // 全额还款在这个月时传入 { date, amount, overdue }
  fullRepayment: {
    type: Object,
    default: null
  }
});

const { edit, addRow } = inject(CTX_KEY);

const adding = ref(false);
const editable = computed(() => !props.loan.readonly && !props.loan.overdue);

// "→"：到期月之前、该月有可改的预计放款时显示
const canPush = computed(() => props.ym < ymOf(props.loan.end_date) && props.rows.some((row) => isDrawdown(row) && Number(row.amount) > 0 && !row.void && !row.readonly));

const add = (type, source) => {
  adding.value = false;
  addRow(props.loan, type, props.ym, source);
};

// 该月全部预计放款推到下月同一天并锁定
const push = () => edit(props.loan, { action: 'push', ym: props.ym });
</script>

<style scoped lang="less">
@import '@/views/dashboard/update-forecast/vars.less';

.cell {
  display: grid;
  gap: 4px;
  min-height: 44px;
  padding: 6px;
}

.fr {
  display: grid;
  gap: 2px;
  padding: 4px 6px;
  border: 1px solid @uf-gold;
  border-radius: 8px;
  background: mix(@uf-gold-soft, @uf-bg, 60%);
}

.fr-h {
  display: flex;
  align-items: center;
  gap: 5px;
  color: @uf-gold-ink;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  .tp {
    display: grid;
    place-items: center;
    width: 16px;
    height: 18px;
    border-radius: 5px;
    background: @uf-gold;
    color: @color_white;
    font-size: 10px;
  }
}

.fb {
  margin-left: auto;
  padding: 1px 6px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: none;
  &.auto {
    background: @uf-surface-2;
    color: @uf-muted;
  }
  &.over {
    background: @uf-danger-soft;
    color: @uf-danger;
  }
}

.fr-l {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 0 2px;
  color: @uf-ink-2;
  font-size: 11.5px;
  b {
    color: @uf-gold-ink;
    font-size: 12.5px;
    font-weight: 800;
  }
}

.fr-note {
  color: @uf-muted;
  font-size: 10px;
  b {
    color: @uf-danger;
    font-weight: 700;
  }
}

.cfoot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
}

.ic {
  display: grid;
  place-items: center;
  width: 22px;
  height: 20px;
  padding: 0;
  border: 1px dashed @uf-line-2;
  border-radius: 5px;
  background: transparent;
  color: @uf-muted;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  &:hover {
    background: @uf-surface-2;
    color: @uf-ink;
  }
  &.push {
    font-size: 12px;
  }
}

.addmenu {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  button {
    padding: 2px 8px;
    border: 1px solid @uf-line-2;
    border-radius: 999px;
    background: @uf-bg;
    font-size: 10.5px;
    font-weight: 700;
    cursor: pointer;
  }
  .d {
    border-color: transparent;
    background: @uf-green-soft;
    color: @uf-green-ink;
  }
  .r {
    border-color: transparent;
    background: @uf-gold-soft;
    color: @uf-gold-ink;
  }
}
</style>
