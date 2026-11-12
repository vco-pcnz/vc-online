<template>
  <div
    ref="rowRef"
    class="tx"
    :class="classes"
    :data-key="row.key"
    :title="voidTip"
    @mouseenter="hovering = true"
    @mouseleave="hovering = false"
    @focusin="focused = true"
    @focusout="onFocusOut"
  >
    <span class="tp" :title="drawdown ? 'Estimated drawdown' : 'Estimated partial repayment'">{{ drawdown ? 'D' : 'R' }}</span>
    <button v-if="showLender" type="button" class="lender" :disabled="!editable" title="Switch lender" @mousedown.prevent @click="toggleLender">{{ lenderName(row) }}</button>

    <a-select
      v-if="active"
      ref="dayRef"
      class="day-in"
      size="small"
      :value="dayOf(row.date)"
      :options="dayOptions"
      :show-arrow="false"
      :dropdown-match-select-width="64"
      :aria-label="`Day of ${ymLabel(ym)}`"
      @change="changeDay"
      @dropdown-visible-change="(open) => (selectOpen = open)"
    />
    <span v-else class="day" :tabindex="editable ? 0 : undefined" @focus="focusInput('day')">{{ dayOf(row.date) }}</span>

    <a-input-number
      v-if="active"
      ref="amtRef"
      class="amt-in"
      size="small"
      :value="inputAmount"
      :min="0"
      :precision="2"
      :controls="false"
      placeholder="0"
      aria-label="Amount"
      @update:value="onAmountInput"
      @blur="commitAmount"
      @press-enter="(e) => e.target.blur()"
    />
    <span v-else class="amt" :tabindex="editable ? 0 : undefined" @focus="focusInput('amt')">{{ amountText(row.amount) }}</span>

    <span class="tools">
      <!-- 工具按钮不抢焦点（mousedown.prevent），金额输入框保持聚焦，点击时先提交刚输入的金额 -->
      <template v-if="active">
        <button
          type="button"
          class="ic lock"
          :title="locked ? 'Locked by you. Click to let the system re-spread it' : 'System-spread. Click to lock this amount'"
          aria-label="Toggle lock"
          @mousedown.prevent
          @click="toggleLock"
        >
          <LockOutlined v-if="locked" />
          <UnlockOutlined v-else />
        </button>
        <button type="button" class="ic del" title="Remove this row" aria-label="Remove" @mousedown.prevent @click="remove">×</button>
      </template>
    </span>
  </div>
</template>

<script setup>
import { ref, computed, inject, nextTick } from 'vue';
import { LockOutlined, UnlockOutlined } from '@ant-design/icons-vue';
import { CTX_KEY, dateLabel, ymLabel, dayOf, dayRange, amountText, isDrawdown, isLocked, lenderName } from '../utils';

const props = defineProps({
  loan: {
    type: Object,
    required: true
  },
  // { key, type (2|4), date, amount, is_edit, source, readonly, void }
  row: {
    type: Object,
    required: true
  },
  ym: {
    type: String,
    required: true
  }
});

const { edit, today } = inject(CTX_KEY);

const rowRef = ref();
const dayRef = ref();
const amtRef = ref();
const hovering = ref(false);
const focused = ref(false);
const selectOpen = ref(false);

const drawdown = computed(() => isDrawdown(props.row));
const locked = computed(() => isLocked(props.row));
const editable = computed(() => !props.loan.readonly && !props.loan.overdue && !props.row.readonly && !props.row.void);
const showLender = computed(() => props.loan.product === 'vsl' && drawdown.value);
// 平时只显示文本，悬停或聚焦时才挂载输入框（格子多，避免整页都是输入组件）
const active = computed(() => editable.value && (hovering.value || focused.value || selectOpen.value));
const flashing = computed(() => (props.loan.changed_keys || []).includes(props.row.key));

const classes = computed(() => [
  drawdown.value ? 'd' : 'r',
  locked.value ? 'manual' : 'auto',
  { vsl: showLender.value, void: props.row.void, flash: flashing.value, ro: !editable.value }
]);

const voidTip = computed(() => (props.row.void ? `Won't happen: assumed fully repaid on ${dateLabel(props.loan.full_repayment?.date)}` : undefined));

// 日期选项：限该月内；当月不早于今天；到期月不晚于到期日
const dayOptions = computed(() => {
  const [min, max] = dayRange(props.loan, props.ym, today.value);
  const days = [];
  for (let day = min; day <= max; day++) days.push(day);
  const currentDay = dayOf(props.row.date);
  if (!days.includes(currentDay)) days.push(currentDay);
  return days.sort((a, b) => a - b).map((day) => ({ value: day, label: String(day) }));
});

// 焦点离开整行时才卸载输入框（行内切换焦点、文本被输入框替换时不算离开）
const onFocusOut = (e) => {
  if (e.target.classList.contains('day') || e.target.classList.contains('amt')) return;
  if (!rowRef.value?.contains(e.relatedTarget)) focused.value = false;
};

// 键盘聚焦到文本：先挂载输入框，再把焦点移过去
const focusInput = (name) => {
  focused.value = true;
  nextTick(() => (name === 'day' ? dayRef : amtRef).value?.focus());
};

// 金额：只有输入过才提交
const draftAmount = ref(null);
const dirty = ref(false);
// 金额为 0 时输入框留空、显示占位 0，直接输入新金额，不用先删掉 0.00
const inputAmount = computed(() => (dirty.value ? draftAmount.value : Number(props.row.amount) || null));

const onAmountInput = (value) => {
  draftAmount.value = value;
  dirty.value = true;
};

// 提交输入过的金额，返回是否发出了修改
const commitAmount = () => {
  if (!dirty.value) return false;
  dirty.value = false;
  const amount = (Number(draftAmount.value) || 0).toFixed(2);
  if (amount === Number(props.row.amount).toFixed(2)) return false;
  edit(props.loan, { action: 'update', key: props.row.key, amount }, { amount, is_edit: 1 });
  return true;
};

const changeDay = (day) => {
  const date = `${props.ym}-${String(day).padStart(2, '0')}`;
  if (date === props.row.date) return;
  edit(props.loan, { action: 'update', key: props.row.key, date }, { date, is_edit: 1 });
};

// 按用户点击时看到的状态切换；刚输入过金额时，提交本身就会锁定，这次点击保持锁定
const toggleLock = () => {
  if (commitAmount()) return;
  const is_edit = locked.value ? 0 : 1;
  edit(props.loan, { action: 'lock', key: props.row.key, is_edit }, { is_edit });
};

const toggleLender = () => {
  const source = Number(props.row.source) === 1 ? 0 : 1;
  commitAmount();
  edit(props.loan, { action: 'lender', key: props.row.key }, { source, is_edit: 1 });
};

const remove = () => {
  commitAmount();
  edit(props.loan, { action: 'delete', key: props.row.key });
};
</script>

<style scoped lang="less">
@import '@/views/dashboard/update-forecast/vars.less';

.tx {
  display: grid;
  grid-template-columns: 16px 36px 1fr 34px;
  align-items: center;
  gap: 3px;
  min-height: 28px;
  padding: 2px 2px 2px 4px;
  border-left: 3px solid transparent;
  border-radius: 8px;
  &.vsl {
    grid-template-columns: 16px 30px 36px 1fr 34px;
  }
  &.d.manual {
    border-left-color: @uf-green;
  }
  &.r.manual {
    border-left-color: @uf-gold;
  }
  &.flash {
    animation: tx-flash 1.4s ease-out;
  }
  &.void {
    opacity: 0.45;
    .amt,
    .day {
      text-decoration: line-through;
    }
  }
}

@keyframes tx-flash {
  0% {
    background: @uf-warn-soft;
  }
  100% {
    background: transparent;
  }
}

@media (prefers-reduced-motion: reduce) {
  .tx.flash {
    animation: none;
  }
}

.tp {
  display: grid;
  place-items: center;
  width: 16px;
  height: 18px;
  border-radius: 5px;
  font-size: 10px;
  font-weight: 800;
}

.tx.d .tp {
  background: @uf-green-soft;
  color: @uf-green-ink;
}

.tx.r .tp {
  background: @uf-gold-soft;
  color: @uf-gold-ink;
}

.lender {
  width: 30px;
  padding: 2px 0;
  border: 1px solid @uf-line-2;
  border-radius: 5px;
  background: @uf-bg;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.03em;
  cursor: pointer;
  &:disabled {
    cursor: default;
  }
}

// 文本态与输入态同高，悬停时不跳动
.day,
.amt {
  height: 24px;
  padding: 0 4px;
  border: 1px solid transparent;
  border-radius: 6px;
  line-height: 22px;
  outline: none;
}

.day {
  color: @uf-ink-2;
  font-size: 11.5px;
}

.amt {
  overflow: hidden;
  font-size: 12.5px;
  font-weight: 800;
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tx.d .amt {
  color: @uf-green-ink;
}

.tx.r .amt {
  color: @uf-gold-ink;
}

// 系统分配的行：浅色
.tx.auto .amt {
  color: @uf-ink-2;
  font-weight: 500;
  opacity: 0.8;
}

.tx:not(.ro) .day,
.tx:not(.ro) .amt {
  cursor: text;
}

.day-in,
.amt-in {
  width: 100%;
}

.day-in :deep(.ant-select-selector) {
  padding: 0 4px !important;
}

.amt-in :deep(.ant-input-number-input) {
  padding: 0 4px;
  font-weight: 800;
  text-align: right;
}

.tools {
  display: flex;
  justify-content: flex-end;
  gap: 2px;
}

.ic {
  display: grid;
  place-items: center;
  width: 16px;
  height: 18px;
  padding: 0;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: @uf-muted;
  font-size: 13px;
  line-height: 1;
  cursor: pointer;
  &:hover {
    background: @uf-surface-2;
    color: @uf-ink;
  }
  &.del:hover {
    color: @uf-danger;
  }
}

.tx.manual .lock {
  color: @uf-ink-2;
}
</style>
