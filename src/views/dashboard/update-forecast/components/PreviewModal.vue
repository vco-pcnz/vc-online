<template>
  <a-modal :open="open" :width="760" :mask-closable="false" @cancel="close">
    <template #title>
      <div>Review before confirming</div>
      <p class="sub">{{ plural(loans.length, 'loan') }}{{ note ? ` · ${note}` : '' }}</p>
    </template>
    <a-spin :spinning="loading">
      <div class="note">Confirm saves these loans and records them as reviewed for this cycle.</div>
      <div v-for="item in items" :key="item.uuid" class="diff-loan">
        <h3>
          {{ item.name }}
          <span v-if="!item.changes?.length" class="k ok">No change · recorded as reviewed</span>
          <span v-else-if="item.draft_by && item.draft_by !== meName" class="k chg">Draft by {{ item.draft_by }}</span>
        </h3>
        <ul v-if="item.changes?.length">
          <li v-for="(change, index) in item.changes" :key="index">
            <span class="k" :class="KINDS[change.kind]?.cls">{{ KINDS[change.kind]?.label }}</span>{{ changeText(item, change) }}
          </li>
          <li v-if="item.full_repayment">
            <span class="k sys">Result</span>Full repayment {{ money(item.full_repayment.amount) }} on {{ dateLabel(item.full_repayment.date) }}
          </li>
          <li v-for="(warning, index) in item.warnings || []" :key="`w${index}`" :class="warning.level === 'bad' ? 'badline' : 'warnline'">
            {{ warning.level === 'bad' ? 'Blocked: ' : 'Warning: ' }}{{ warning.text }}
          </li>
        </ul>
      </div>
    </a-spin>
    <template #footer>
      <a-button type="grey" @click="close">Back</a-button>
      <a-button type="dark" :disabled="loading || !items.length || blocked" :loading="confirming" @click="confirm">{{ okText }}</a-button>
    </template>
  </a-modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { forecastUpdPreview } from '@/api/project/forecast-upd';
import { dateLabel, money, plural, lenderName, inChunks } from '../utils';

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  // 要确认的贷款（列表中的 Loan）
  loans: {
    type: Array,
    default: () => []
  },
  // 副标题补充：批量时跳过的数量
  note: {
    type: String,
    default: ''
  },
  meName: {
    type: String,
    default: ''
  },
  confirming: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:open', 'confirm', 'reset']);

const KINDS = {
  add: { label: 'Add', cls: 'add' },
  change: { label: 'Change', cls: 'chg' },
  remove: { label: 'Remove', cls: 'del' },
  system: { label: 'System', cls: 'sys' }
};

const loading = ref(false);
const items = ref([]);

const blocked = computed(() => items.value.some((item) => item.blocked));
const okText = computed(() => {
  if (blocked.value) return 'Fix the blocked loan first';
  return props.loans.length === 1 ? 'Confirm' : `Confirm ${props.loans.length} loans`;
});

// 加载序号：只采用最新一次加载的结果
let loadSeq = 0;

// 每次最多 10 笔，按顺序请求；草稿已在别处被重置的贷款交给页面提示和刷新，不在这里显示成"无变化"
const load = () => {
  const seq = ++loadSeq;
  const uuids = props.loans.map((loan) => loan.uuid);
  items.value = [];
  loading.value = true;
  inChunks(uuids, 10, (part) => forecastUpdPreview({ apply_uuids: part.join(',') }).then((res) => res || []))
    .then((list) => {
      if (seq !== loadSeq) return;
      items.value = list.filter((item) => !item.draft_reset);
      const reset = list.filter((item) => item.draft_reset);
      if (reset.length) emit('reset', reset);
    })
    .catch(() => {})
    .finally(() => {
      if (seq === loadSeq) loading.value = false;
    });
};

watch(
  () => props.open,
  (open) => {
    if (open) {
      load();
      return;
    }
    // 关闭：清空内容，丢弃在途的结果
    loadSeq++;
    items.value = [];
    loading.value = false;
  }
);

const close = () => emit('update:open', false);

// 确认时带上预览中显示了改动的贷款和看到的草稿版本（'uuid:ver'）：草稿之后又被改过的，服务端不写回
const confirm = () => emit('confirm', items.value.filter((item) => item.changes?.length).map((item) => `${item.uuid}:${item.draft_ver}`));

const sameAmount = (a, b) => Math.abs(Number(a) - Number(b)) < 0.005;

// Drawdown VS · 20 Nov '26
const rowLabel = (item, change, date) => {
  const isVsl = props.loans.find((loan) => loan.uuid === item.uuid)?.product === 'vsl';
  const name = Number(change.type) === 2 ? `Drawdown${isVsl ? ` ${lenderName(change)}` : ''}` : 'Partial repayment';
  return `${name} · ${dateLabel(date)}`;
};

const changeText = (item, change) => {
  const hasOld = change.old_amount !== null && change.old_amount !== undefined;
  if (change.kind === 'remove') return `${rowLabel(item, change, change.old_date || change.date)} · ${money(hasOld ? change.old_amount : change.amount)}`;
  if (change.kind === 'add') return `${rowLabel(item, change, change.date)} · ${money(change.amount)}`;
  if (!hasOld) return `${rowLabel(item, change, change.date)} · new row · ${money(change.amount)}`;
  const amount = sameAmount(change.old_amount, change.amount) ? money(change.amount) : `${money(change.old_amount)} → ${money(change.amount)}`;
  const moved = change.old_date && change.old_date !== change.date ? ` (was ${dateLabel(change.old_date)})` : '';
  const relock = change.relock ? ` · ${change.relock}` : '';
  return `${rowLabel(item, change, change.date)} · ${amount}${moved}${relock}`;
};
</script>

<style scoped lang="less">
@import '@/views/dashboard/update-forecast/vars.less';

.sub {
  .uf-modal-sub();
}

.note {
  margin: 6px 0 12px;
  padding: 10px 12px;
  border-radius: 10px;
  background: @uf-surface;
  color: @uf-ink-2;
  font-size: 12px;
}

.diff-loan {
  margin-bottom: 10px;
  padding: 10px 12px;
  border: 1px solid @uf-line;
  border-radius: 12px;
  font-size: 12.5px;
  h3 {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin: 0 0 6px;
    font-size: 13px;
    font-weight: 800;
  }
  ul {
    margin: 0;
    padding-left: 18px;
    list-style: disc;
  }
  li {
    margin: 2px 0;
  }
}

.k {
  margin-right: 4px;
  padding: 1px 6px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  &.add {
    background: @uf-green-soft;
    color: @uf-green-ink;
  }
  &.chg {
    background: @uf-warn-soft;
    color: @uf-warn-ink;
  }
  &.del {
    background: @uf-danger-soft;
    color: @uf-danger;
  }
  &.sys {
    background: @uf-surface-2;
    color: @uf-ink-2;
  }
  &.ok {
    background: @uf-ok-soft;
    color: @uf-ok;
  }
}

.warnline {
  color: @uf-warn-ink;
  font-weight: 600;
}

.badline {
  color: @uf-danger;
  font-weight: 600;
}
</style>
