<template>
  <td class="c-loan">
    <div class="pad loan">
      <div class="nm" :title="loan.name">{{ loan.name }}</div>
      <div class="ln">{{ loan.sn }}</div>
      <div class="ln">Matures <b>{{ dateLabel(loan.end_date) }}</b></div>
      <div v-if="loan.lm" class="ln lm">
        <vco-avatar :src="loan.lm.avatar || ''" :name="loan.lm.name || ''" :size="16" />
        <span>{{ loan.lm.name }}</span>
      </div>
      <div v-if="loan.draft || loan.overdue || loan.readonly" class="flags">
        <a-tooltip v-if="loan.draft" :title="`Draft by ${loan.draft.user_name} · ${dateLabel(loan.draft.time)} · saved automatically. The Cashflow forecast still shows the confirmed figures`">
          <span class="chip draft">Draft{{ loan.draft.user_name && loan.draft.user_name !== meName ? ` · ${loan.draft.user_name}` : '' }}</span>
        </a-tooltip>
        <a-tooltip v-if="loan.overdue" :title="`Matured ${dateLabel(loan.end_date)}, not repaid. Assumed repaid today`">
          <span class="chip overdue">Repayment overdue</span>
        </a-tooltip>
        <a-tooltip v-else-if="loan.readonly" :title="loan.readonly_reason">
          <span class="chip ro">Read-only</span>
        </a-tooltip>
      </div>
    </div>
  </td>
</template>

<script setup>
import { inject } from 'vue';
import { CTX_KEY, dateLabel } from '../utils';

defineProps({
  loan: {
    type: Object,
    required: true
  }
});

const { meName } = inject(CTX_KEY);
</script>

<style scoped lang="less">
@import '@/views/dashboard/update-forecast/vars.less';

.loan {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.nm {
  overflow: hidden;
  font-size: 12.5px;
  font-weight: 800;
  letter-spacing: 0.01em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ln {
  overflow: hidden;
  color: @uf-muted;
  font-size: 11.5px;
  text-overflow: ellipsis;
  white-space: nowrap;
  b {
    color: @uf-ink-2;
    font-weight: 500;
  }
}

.lm {
  display: flex;
  align-items: center;
  gap: 5px;
}

.flags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 3px;
}

.chip {
  padding: 1px 7px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 700;
  cursor: default;
  &.draft {
    background: @uf-warn-soft;
    color: @uf-warn-ink;
  }
  &.overdue {
    background: @uf-danger-soft;
    color: @uf-danger;
  }
  &.ro {
    background: @uf-surface-2;
    color: @uf-ink-2;
  }
}
</style>
