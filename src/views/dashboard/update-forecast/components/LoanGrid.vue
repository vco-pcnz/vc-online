<template>
  <div class="grid-wrap" :class="{ vsl: isVsl }">
    <table>
      <thead>
        <tr>
          <th class="c-sel">
            <div class="sel">
              <a-checkbox :checked="allChecked" :indeterminate="!allChecked && someChecked" :disabled="!loans.length" aria-label="Select all loans shown" @change="(e) => selectAll(e.target.checked)" />
            </div>
          </th>
          <th class="c-loan"><div class="pad">Loan</div></th>
          <th class="c-bal"><div class="pad">Facility</div></th>
          <th class="c-rev"><div class="pad">Status</div></th>
          <th v-for="ym in months" :key="ym" class="c-m" :class="{ cur: ym === curYm }">
            <div class="pad">
              {{ ymLabel(ym) }}
              <small v-if="ym === curYm">current month</small>
            </div>
          </th>
          <th class="c-act"><div class="pad">Actions</div></th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!loans.length">
          <td :colspan="months.length + 5"><div class="empty">No loans match these filters.</div></td>
        </tr>
        <LoanRow v-for="loan in loans" :key="loan.uuid" :loan="loan" :months="months" :cur-ym="curYm" :selected="selected.has(loan.uuid)" :busy="!!busy[loan.uuid]" />
      </tbody>
      <tfoot>
        <tr>
          <td class="c-sel"></td>
          <td class="c-loan">
            <div class="pad tot">
              <b>Totals for the loans shown</b>
              <span class="lbl">what the Cashflow forecast will show (confirmed figures)</span>
            </div>
          </td>
          <td class="c-bal">
            <div class="pad tot">
              <span class="lbl">Undrawn</span>
              <b>{{ money(undrawnTotal) }}</b>
            </div>
          </td>
          <td class="c-rev"></td>
          <td v-for="ym in months" :key="ym" class="c-m">
            <div class="pad tot">
              <b class="d">{{ totalText(ym, 'drawdown') }}</b>
              <b class="r">{{ totalText(ym, 'repayment') }}</b>
            </div>
          </td>
          <td class="c-act"></td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue';
import { CTX_KEY, money, ymLabel } from '../utils';
import LoanRow from './LoanRow.vue';

const props = defineProps({
  loans: {
    type: Array,
    default: () => []
  },
  months: {
    type: Array,
    default: () => []
  },
  // 底部合计：已确认数据（与 Cashflow forecast 同口径）
  totals: {
    type: Object,
    default: () => ({})
  },
  curYm: {
    type: String,
    default: ''
  },
  selected: {
    type: Set,
    required: true
  },
  busy: {
    type: Object,
    default: () => ({})
  }
});

const { selectAll } = inject(CTX_KEY);

// 页面只显示一个产品；VSL 的放款行多一个出资方按钮，月份列需要加宽
const isVsl = computed(() => props.loans.some((loan) => loan.product === 'vsl'));
const allChecked = computed(() => props.loans.length > 0 && props.loans.every((loan) => props.selected.has(loan.uuid)));
const someChecked = computed(() => props.loans.some((loan) => props.selected.has(loan.uuid)));
const undrawnTotal = computed(() => props.loans.reduce((sum, loan) => sum + (Number(loan.facility?.undrawn) || 0), 0));

const totalText = (ym, kind) => {
  const value = Number(props.totals[ym]?.[kind]) || 0;
  return value ? money(value) : '–';
};
</script>

<style scoped lang="less">
@import '@/views/dashboard/update-forecast/vars.less';

.grid-wrap {
  position: relative;
  height: calc(100vh - 290px);
  min-height: 420px;
  overflow: auto;
  border: 1px solid @uf-line-2;
  border-radius: 14px;
  background: @uf-bg;
  color: @uf-ink;
  font-size: 13px;
  line-height: 1.4;
  font-variant-numeric: tabular-nums;
}

table {
  width: max-content;
  min-width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
}

:deep(th),
:deep(td) {
  padding: 0;
  border-right: 1px solid @uf-line;
  border-bottom: 1px solid @uf-line;
  background: @uf-bg;
  vertical-align: top;
}

thead th {
  position: sticky;
  // 上移 2px（超出部分被容器裁掉）：非整数缩放（125% / 150% 等）下表头按整像素绘制，与滚动区上沿会差约 1 个物理像素，露出一条滚动中的行内容
  top: -2px;
  z-index: 5;
  background: @uf-surface-2;
  text-align: left;
  .pad {
    color: @uf-muted;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    white-space: nowrap;
  }
  small {
    display: block;
    color: @uf-green-ink;
    font-weight: 500;
    letter-spacing: 0;
    text-transform: none;
  }
}

tfoot td {
  position: sticky;
  bottom: 0;
  z-index: 5;
  border-top: 2px solid @uf-line-2;
  border-bottom: 0;
  background: @uf-surface-2;
}

:deep(tbody tr:hover > td) {
  background: @uf-hover;
}

:deep(tbody tr.selected > td) {
  background: @uf-green-soft;
}

:deep(.pad) {
  padding: 8px;
}

:deep(.sel) {
  padding: 10px 12px;
}

// 冻结列：左侧勾选 / Loan / Facility / Status，右侧 Actions
:deep(.c-sel) {
  position: sticky;
  left: 0;
  z-index: 3;
  width: 40px;
}

:deep(.c-loan) {
  position: sticky;
  left: 40px;
  z-index: 3;
  width: 232px;
}

:deep(.c-bal) {
  position: sticky;
  left: 272px;
  z-index: 3;
  width: 150px;
}

:deep(.c-rev) {
  position: sticky;
  left: 422px;
  z-index: 3;
  width: 110px;
  box-shadow: 6px 0 10px -8px @uf-shadow;
}

:deep(.c-m) {
  width: 236px;
}

// VSL：放款行多一个 30px 的出资方按钮，金额列 = 252 - 13 格子边框/内边距 - 9 行边框/内边距 - 116 类型/出资方/日/工具 - 12 间距 ≈ 102px，
// 去掉内边距和边框后约 93px 可显示文字，放得下 99,999,999.99（文本 12.5px 粗体约 84px，输入框 14px 约 88px；236px 时只有约 77px）
.grid-wrap.vsl :deep(.c-m) {
  width: 252px;
}

:deep(.c-act) {
  position: sticky;
  right: 0;
  z-index: 3;
  width: 152px;
  box-shadow: -6px 0 10px -8px @uf-shadow;
}

thead,
tfoot {
  .c-sel,
  .c-loan,
  .c-bal,
  .c-rev,
  .c-act {
    z-index: 6;
  }
}

thead .c-m.cur {
  background: @uf-green-soft;
}

:deep(tbody .c-m.cur) {
  background: mix(@uf-green-soft, @uf-bg, 45%);
}

// 到期月之后的格子：斜纹置灰
:deep(.c-m.off) {
  background: repeating-linear-gradient(135deg, @uf-hatch 0 6px, @uf-hatch-line 6px 7px);
}

.tot {
  display: grid;
  gap: 2px;
  font-size: 11.5px;
  b {
    font-weight: 800;
  }
  .d {
    color: @uf-green-ink;
  }
  .r {
    color: @uf-gold-ink;
  }
  .lbl {
    color: @uf-muted;
    font-size: 10.5px;
    font-weight: 600;
  }
}

.empty {
  .uf-empty();
}
</style>
