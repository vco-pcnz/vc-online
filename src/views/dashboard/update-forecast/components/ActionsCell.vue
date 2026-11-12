<template>
  <td class="c-act">
    <div class="pad act">
      <!-- Auto-spread：贷款级设置，切换前弹窗确认 -->
      <div class="asw">
        <span class="asw-l">Auto-spread</span>
        <button type="button" class="info" aria-label="About Auto-spread" @click="showAutoInfo">i</button>
        <a-tooltip :title="switchTip">
          <span class="switch" :class="{ disabled: !editable }" role="switch" aria-label="Auto-spread" :aria-checked="auto" :tabindex="editable ? 0 : undefined" @click="toggleAuto" @keydown.enter.space.prevent="toggleAuto">
            <a-switch size="small" :checked="auto" :disabled="!editable" tabindex="-1" />
          </span>
        </a-tooltip>
      </div>

      <!-- 只读贷款的草稿不能确认，只能丢弃 -->
      <a-tooltip v-if="loan.draft && loan.readonly" :title="`This loan can't be changed right now (${readonlyReason}). Discard the draft to confirm it.`">
        <a-button type="dark" block disabled>
          Confirm <span class="cnt">{{ changes }}</span>
        </a-button>
      </a-tooltip>
      <a-tooltip v-else-if="loan.blocked" :title="blockTip">
        <a-button type="cyan" block disabled>Confirm</a-button>
      </a-tooltip>
      <a-button v-else-if="loan.draft" type="dark" block :disabled="busy" :title="`Review ${plural(changes, 'change')}, save them and record this loan as reviewed for this cycle`" @click="confirmLoan(loan)">
        Confirm <span class="cnt">{{ changes }}</span>
      </a-button>
      <a-tooltip v-else-if="review.reviewed" :title="`Reviewed ${dateLabel(review.time)} by ${review.user_name}. Edit the loan to confirm again`">
        <span class="done">Confirmed ✓</span>
      </a-tooltip>
      <a-button v-else type="cyan" block :disabled="busy" title="Record that you reviewed this loan and nothing changes. Saved straight away" @click="confirmLoan(loan)">Confirm</a-button>

      <!-- More：浮层，不撑高行 -->
      <a-dropdown :trigger="['click']" placement="bottomRight">
        <a-button block class="more">More ⋯</a-button>
        <template #overlay>
          <a-menu class="more-menu" @click="onMore">
            <a-menu-item key="even" :disabled="!editable">
              <b>Spread evenly to maturity</b>
              <small>{{ editable ? 'Start over from the undrawn facility' : readonlyHint }}</small>
            </a-menu-item>
            <a-menu-item key="discard" :disabled="!loan.draft">
              <b>Discard draft</b>
              <small>{{ loan.draft ? 'Back to the last confirmed forecast' : 'No draft on this loan' }}</small>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>
  </td>
</template>

<script setup>
import { computed, inject } from 'vue';
import { CTX_KEY, dateLabel, money, plural } from '../utils';

const props = defineProps({
  loan: {
    type: Object,
    required: true
  },
  // 请求在途时不能 Confirm（草稿状态可能还在变）
  busy: {
    type: Boolean,
    default: false
  }
});

const { askAutoSpread, showAutoInfo, confirmLoan, openSpreadEvenly, askDiscard } = inject(CTX_KEY);

const auto = computed(() => Number(props.loan.auto_spread) === 1);
const editable = computed(() => !props.loan.readonly && !props.loan.overdue);
const review = computed(() => props.loan.review || {});
// 超额提示：金额为至少要减掉的预计放款，VSL 写明超额的出资方（服务端算，见 loan.block）
const blockTip = computed(() => {
  const { amount, lender } = props.loan.block || {};
  return `Forecast drawdowns exceed the undrawn ${lender ? `${lender.toUpperCase()} ` : ''}facility by ${money(amount)}. Fix this before confirming`;
});
const changes = computed(() => Number(props.loan.draft?.changes) || 0);
const readonlyHint = computed(() => (props.loan.overdue ? 'Not available: assumed repaid today' : props.loan.readonly_reason || ''));
// 放在括号里的只读原因（去掉句末句号）
const readonlyReason = computed(() => (props.loan.overdue ? 'matured, not repaid' : String(props.loan.readonly_reason || '').replace(/\.$/, '')));

const switchTip = computed(() => {
  if (!editable.value) return readonlyHint.value;
  return auto.value ? 'On · click to turn off' : 'Off · click to turn on';
});

const toggleAuto = () => {
  if (editable.value) askAutoSpread(props.loan);
};

const onMore = ({ key }) => {
  if (key === 'even') openSpreadEvenly(props.loan);
  if (key === 'discard') askDiscard(props.loan);
};
</script>

<style scoped lang="less">
@import '@/views/dashboard/update-forecast/vars.less';

// 三项等宽等高，自上而下
.act {
  display: grid;
  gap: 6px;
  :deep(.ant-btn) {
    height: 28px;
    padding: 0 8px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
  }
}

.asw {
  display: flex;
  align-items: center;
  gap: 5px;
  height: 28px;
  padding: 0 8px 0 10px;
  border: 1px solid @uf-line-2;
  border-radius: 999px;
  background: @uf-bg;
  color: @uf-ink-2;
  font-size: 11.5px;
  font-weight: 600;
}

.asw-l {
  flex: 1;
  white-space: nowrap;
}

.info {
  display: grid;
  flex: none;
  place-items: center;
  width: 15px;
  height: 15px;
  padding: 0;
  border: 1px solid @uf-line-2;
  border-radius: 50%;
  background: @uf-bg;
  color: @uf-muted;
  font-size: 9.5px;
  font-style: italic;
  font-weight: 800;
  line-height: 1;
  cursor: pointer;
  &:hover {
    border-color: @uf-ink-2;
    color: @uf-ink;
  }
}

// 开关只做展示，点击由外层处理（先弹窗确认，再保存）
.switch {
  display: inline-flex;
  cursor: pointer;
  &.disabled {
    cursor: not-allowed;
  }
  :deep(.ant-switch) {
    pointer-events: none;
  }
}

.cnt {
  margin-left: 6px;
  padding: 1px 6px;
  border-radius: 999px;
  background: @color_white;
  color: @uf-ink;
  font-size: 10.5px;
  font-weight: 700;
}

.done {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  border-radius: 999px;
  background: @uf-surface-2;
  color: @uf-muted;
  font-size: 12px;
  font-weight: 600;
  cursor: default;
}

.more {
  color: @uf-ink-2;
}

.more-menu {
  width: 256px;
  b {
    display: block;
    font-size: 12px;
    font-weight: 700;
  }
  small {
    display: block;
    color: @uf-muted;
    font-size: 10.5px;
    line-height: 1.3;
    white-space: normal;
  }
}
</style>
