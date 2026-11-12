<template>
  <div class="update-forecast">
    <span class="back" @click="back"><i class="iconfont">&#xe794;</i>Cashflow forecast</span>
    <div class="titlebar">
      <h1>Update forecast</h1>
      <div v-if="cycle" class="hdr-right">
        <a-tooltip :title="dueTip">
          <span class="due" :class="{ soon: daysLeft <= 7 }">
            Forecast due <b>{{ dateLabel(cycle.due_date) }}</b> · {{ plural(daysLeft, 'day') }} left
          </span>
        </a-tooltip>
        <span class="cycle">Cycle <b>{{ dateLabel(cycle.cycle_from) }} – {{ dateLabel(cycle.cycle_to) }}</b></span>
        <a-tooltip title="How this page works">
          <button type="button" class="tips" aria-label="How this page works" @click="helpOpen = true">?</button>
        </a-tooltip>
      </div>
    </div>

    <div v-if="isLendr" class="empty">Update forecast is not available for Lendr.</div>
    <template v-else>
      <FilterBar :filters="filters" :counts="counts" :lms="lms" :can-lm-filter="!!can.lm_filter" :selected-count="selectedCount" @change="changeFilters" @confirm-selected="confirmSelected" />
      <a-spin :spinning="loading">
        <LoanGrid :loans="loans" :months="months" :totals="totals" :cur-ym="curYm" :selected="selected" :busy="busy" />
      </a-spin>
    </template>

    <AskModal v-model:open="ask.open" :title="ask.title" :sub="ask.sub" :text="ask.text" :ok-text="ask.okText" :cancel="ask.cancel" @ok="onAskOk" />
    <SpreadEvenlyModal v-model:open="spread.open" :loan="spread.loan" :today="today" @submit="onSpreadEvenly" />
    <PreviewModal v-model:open="preview.open" :loans="preview.loans" :note="preview.note" :me-name="meName" :confirming="confirming" @reset="onPreviewReset" @confirm="onPreviewConfirm" />
    <HelpModal v-model:open="helpOpen" :due-day="Number(cycle?.due_day) || 25" />
  </div>
</template>

<script setup>
import { ref, reactive, shallowRef, shallowReactive, computed, watch, provide, nextTick, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import { message } from 'ant-design-vue/es';
import tool, { goBack, navigationTo } from '@/utils/tool';
import { useUserStore } from '@/store';
import useProductStore from '@/store/modules/product';
import { forecastUpdIndex, forecastUpdEdit, forecastUpdAutoSpread, forecastUpdSpreadEvenly, forecastUpdDiscard, forecastUpdConfirm } from '@/api/project/forecast-upd';
import { CTX_KEY, AUTO_INFO, dateLabel, money, plural, ordinal, ymOf, isLocked, inChunks } from './utils';
import FilterBar from './components/FilterBar.vue';
import LoanGrid from './components/LoanGrid.vue';
import AskModal from './components/AskModal.vue';
import SpreadEvenlyModal from './components/SpreadEvenlyModal.vue';
import PreviewModal from './components/PreviewModal.vue';
import HelpModal from './components/HelpModal.vue';

const route = useRoute();
const userStore = useUserStore();
const productStore = useProductStore();

const meName = computed(() => userStore.userInfo?.user_name || '');
const isLendr = computed(() => {
  const product = productStore.productData.find((item) => item.uuid === productStore.currentProduct);
  return String(product?.code || '').toLowerCase() === 'lendr';
});
// 服务器今天的日期（Pacific/Auckland，来自列表接口）：日期规则和当月都以它为准
const today = ref('');
const curYm = computed(() => ymOf(today.value));

// 返回 Cashflow forecast；从 Task 新开标签页进入时没有上一页，回首页
const back = () => (window.history.state?.back ? goBack() : navigationTo('/'));

// ---------- 列表 ----------
const loading = ref(false);
const cycle = ref(null);
const counts = ref({});
const months = ref([]);
const lms = ref([]);
const can = ref({});
const totals = ref({});
const loans = shallowRef([]);
const helpOpen = ref(false);

const daysLeft = computed(() => Number(cycle.value?.days_left) || 0);
const dueTip = computed(
  () => `Set by Finance: the forecast is due on the ${ordinal(Number(cycle.value?.due_day) || 25)} of every month. The forecast KPI is recorded at the end of the due day, and a new cycle starts the day after.`
);

const filters = reactive({
  lm_uuid: '',
  review_status: ['not_reviewed', 'reviewed'].includes(route.query.review_status) ? route.query.review_status : '',
  draft: 0,
  overdue: 0,
  keyword: ''
});

// 请求在途的贷款数（> 0 时 Confirm 置灰）
const busy = reactive({});
const current = (uuid) => loans.value.find((loan) => loan.uuid === uuid);

// 草稿在别处被改动而丢弃的提示
const resetNotice = (name) => message.warning(`${name}: the forecast was changed elsewhere, so the draft was discarded.`);

const noticeReset = (loan) => {
  if (loan.draft_reset) resetNotice(loan.name);
};

// 先后顺序：每次列表开始加载、每笔贷款的写操作结束时各记一次
let clock = 0;
const writtenAt = {};
// 每笔贷款最近一次从服务端读到的版本（不含乐观修改）：行编辑失败且重新读取也失败时恢复
const serverLoans = {};

let loadSeq = 0;
const loadData = () => {
  if (!productStore.currentProduct || isLendr.value) return;
  const seq = ++loadSeq;
  const startedAt = ++clock;
  loading.value = true;
  forecastUpdIndex(tool.filterEmptyValues({ product_uuid: productStore.currentProduct, ...filters }))
    .then((res) => {
      if (seq !== loadSeq) return;
      // 选中的 LM 已不在列表中（没有贷款了）：清掉后重新加载
      if (filters.lm_uuid && !(res.lms || []).some((item) => item.uuid === filters.lm_uuid)) {
        filters.lm_uuid = '';
        loadData();
        return;
      }
      today.value = res.today;
      cycle.value = res.cycle;
      counts.value = res.counts || {};
      months.value = res.months || [];
      lms.value = res.lms || [];
      can.value = res.can || {};
      totals.value = res.totals || {};
      // 请求在途、或在本次加载开始后才写完的贷款保留本地版本（列表结果可能更旧）；服务端丢弃了草稿的照样提示
      loans.value = (res.loans || []).map((loan) => {
        noticeReset(loan);
        if (busy[loan.uuid] || writtenAt[loan.uuid] > startedAt) return current(loan.uuid) || loan;
        serverLoans[loan.uuid] = loan;
        return loan;
      });
      const uuids = new Set(loans.value.map((loan) => loan.uuid));
      selected.value = new Set([...selected.value].filter((uuid) => uuids.has(uuid)));
    })
    .finally(() => {
      if (seq === loadSeq) loading.value = false;
    });
};

const changeFilters = (patch) => {
  Object.assign(filters, patch);
  loadData();
};

// ---------- 勾选 ----------
const selected = shallowRef(new Set());
const selectedCount = computed(() => loans.value.filter((loan) => selected.value.has(loan.uuid)).length);

const toggleSelect = (uuid, checked) => {
  const next = new Set(selected.value);
  if (checked) next.add(uuid);
  else next.delete(uuid);
  selected.value = next;
};

const selectAll = (checked) => {
  const next = new Set(selected.value);
  loans.value.forEach((loan) => (checked ? next.add(loan.uuid) : next.delete(loan.uuid)));
  selected.value = next;
};

// ---------- 单笔贷款更新 ----------
const queues = {};
const pending = {};
const flashTimers = {};

// 替换列表中的一笔贷款，并同步 Draft / Reviewed 计数
const replaceLoan = (loan) => {
  const list = loans.value;
  const index = list.findIndex((item) => item.uuid === loan.uuid);
  if (index < 0) return;
  const old = list[index];
  const draftDiff = (loan.draft ? 1 : 0) - (old.draft ? 1 : 0);
  const reviewDiff = (loan.review?.reviewed ? 1 : 0) - (old.review?.reviewed ? 1 : 0);
  if (draftDiff || reviewDiff) {
    const c = counts.value;
    counts.value = { ...c, draft: (c.draft || 0) + draftDiff, reviewed: (c.reviewed || 0) + reviewDiff, not_reviewed: (c.not_reviewed || 0) - reviewDiff };
  }
  const next = list.slice();
  next[index] = loan;
  loans.value = next;
};

// 乐观更新：请求返回前先在本地改这一行
const optimistic = (loan, { payload, change }) => {
  if (payload.action === 'delete') return { ...loan, rows: loan.rows.filter((row) => row.key !== payload.key) };
  if (!change) return loan;
  return { ...loan, rows: loan.rows.map((row) => (row.key === payload.key ? { ...row, ...change } : row)) };
};

// 系统摊分改动的行闪一下后取消高亮
const clearFlashLater = (uuid) => {
  clearTimeout(flashTimers[uuid]);
  flashTimers[uuid] = setTimeout(() => {
    const loan = current(uuid);
    if (loan?.changed_keys?.length) replaceLoan({ ...loan, changed_keys: [] });
  }, 1600);
};

// 服务端返回的贷款：叠加仍在途的修改后替换
const applyLoan = (loan) => {
  serverLoans[loan.uuid] = loan;
  replaceLoan((pending[loan.uuid] || []).reduce(optimistic, loan));
  if (loan.changed_keys?.length) clearFlashLater(loan.uuid);
};

// 同一笔贷款的请求排队执行，避免先发后至互相覆盖（请求并发上限为 8）
const enqueue = (uuid, task) => {
  busy[uuid] = (busy[uuid] || 0) + 1;
  const run = (queues[uuid] || Promise.resolve()).then(task).finally(() => {
    writtenAt[uuid] = ++clock;
    busy[uuid] -= 1;
    if (!busy[uuid]) delete busy[uuid];
  });
  queues[uuid] = run.catch(() => {});
  return run;
};

const settle = (uuids) => Promise.all(uuids.map((uuid) => queues[uuid]));

// 重新读取一笔贷款（请求失败、草稿被重置后），返回读到的贷款
const reloadLoan = (uuid) =>
  forecastUpdIndex({ product_uuid: productStore.currentProduct, apply_uuids: uuid })
    .then((res) => {
      const loan = (res.loans || [])[0];
      if (!loan) {
        loans.value = loans.value.filter((item) => item.uuid !== uuid);
        return null;
      }
      applyLoan(loan);
      noticeReset(loan);
      return loan;
    })
    .catch(() => null);

// 写操作失败后重新读取：本地有草稿而读回来没有了，说明草稿在别处被重置（draft_reset 已由 reloadLoan 提示过的不再提示）
// 返回读到的贷款，读取失败为 null
const reloadAfterFail = (uuid) => {
  const hadDraft = !!current(uuid)?.draft;
  return reloadLoan(uuid).then((loan) => {
    if (hadDraft && loan && !loan.draft && !loan.draft_reset) resetNotice(loan.name);
    return loan;
  });
};

// 行编辑：add / update / delete / lock / push / lender，返回新的贷款数据
const edit = (loan, payload, change) => {
  const uuid = loan.uuid;
  const op = { payload, change };
  pending[uuid] = [...(pending[uuid] || []), op];
  if (change || payload.action === 'delete') replaceLoan(optimistic(current(uuid) || loan, op));
  const done = () => {
    pending[uuid] = pending[uuid].filter((item) => item !== op);
  };
  return enqueue(uuid, () =>
    forecastUpdEdit({ apply_uuid: uuid, ...payload })
      .then((res) => {
        done();
        applyLoan(res);
        return res;
      })
      .catch(() => {
        done();
        // 重新读取也失败：恢复到乐观更新之前（服务端最后的版本，加上仍在排队的修改），没保存的值不留在页面上
        return reloadAfterFail(uuid).then((res) => {
          if (!res && serverLoans[uuid]) replaceLoan((pending[uuid] || []).reduce(optimistic, serverLoans[uuid]));
        });
      })
  );
};

// 新增一行，返回后把焦点放到新行的金额上
const addRow = (loan, type, ym, source) => {
  const before = new Set(loan.rows.map((row) => row.key));
  edit(loan, { action: 'add', type, ym, source }).then((res) => {
    const row = res?.rows?.find((item) => !before.has(item.key) && Number(item.type) === type && ymOf(item.date) === ym && isLocked(item));
    if (row) nextTick(() => document.querySelector(`.update-forecast [data-key="${row.key}"] .amt`)?.focus());
  });
};

// Auto-spread / Spread evenly / Discard：整笔贷款的操作
const loanOp = (uuid, request) =>
  enqueue(uuid, () =>
    request()
      .then((res) => {
        applyLoan(res);
        noticeReset(res);
      })
      .catch(() => reloadAfterFail(uuid))
  );

// ---------- 确认弹窗（1 2 3 5） ----------
const ask = shallowReactive({ open: false, title: '', sub: '', text: '', okText: '', cancel: true, onOk: null });

const openAsk = (options) => Object.assign(ask, { sub: '', cancel: true, onOk: null }, options, { open: true });

const onAskOk = () => {
  ask.open = false;
  if (ask.onOk) ask.onOk();
};

const loanSub = (loan) => `${loan.name} · undrawn ${money(loan.facility.undrawn)} · forecast ${money(loan.facility.forecast)}`;

const askAutoSpread = (loan) => {
  const turnOn = Number(loan.auto_spread) !== 1;
  const gap = Number(loan.facility.gap);
  let text = `The system stops adjusting other months of ${loan.name} when you edit. Any gap stays and shows in gold.`;
  if (turnOn) {
    text =
      gap > 0
        ? `The system spreads the current gap of ${money(gap)} over the unlocked months now, and keeps the forecast equal to the undrawn facility after each edit. Locked months are not touched.`
        : 'From now on the system keeps the forecast equal to the undrawn facility after each edit.';
  }
  openAsk({
    title: turnOn ? 'Turn on Auto-spread?' : 'Turn off Auto-spread?',
    sub: loanSub(loan),
    text,
    okText: turnOn ? 'Turn on' : 'Turn off',
    onOk: () => loanOp(loan.uuid, () => forecastUpdAutoSpread({ apply_uuid: loan.uuid, auto: turnOn ? 1 : 0 }))
  });
};

const showAutoInfo = () => openAsk({ title: 'Auto-spread', text: AUTO_INFO, okText: 'Close', cancel: false });

const askDiscard = (loan) => {
  const n = Number(loan.draft?.changes) || 0;
  const review = loan.review || {};
  const base = review.time ? `confirmed on ${dateLabel(review.time)} by ${review.user_name}` : 'as it was before the edits';
  openAsk({
    title: 'Discard draft?',
    sub: loan.name,
    text: `${loan.name} goes back to the forecast ${base}. ${plural(n, 'changed row')} ${n === 1 ? 'is' : 'are'} lost.`,
    okText: 'Discard draft',
    onOk: () => loanOp(loan.uuid, () => forecastUpdDiscard({ apply_uuid: loan.uuid }))
  });
};

// ---------- Spread evenly（弹窗 4） ----------
const spread = shallowReactive({ open: false, loan: null });

const openSpreadEvenly = (loan) => Object.assign(spread, { open: true, loan });

const onSpreadEvenly = (unlock) => {
  const uuid = spread.loan.uuid;
  spread.open = false;
  loanOp(uuid, () => forecastUpdSpreadEvenly({ apply_uuid: uuid, unlock }));
};

// ---------- Confirm ----------
const confirming = ref(false);
const preview = shallowReactive({ open: false, loans: [], note: '', batch: 0, skip: null });

const showConfirmResult = (results, names, batch, skip) => {
  results.forEach((item) => {
    const name = names[item.uuid] || '';
    if (item.status === 'reset') resetNotice(name);
    if (item.status === 'changed') message.warning(`${name} has new changes. Review them before confirming.`);
    // 整批请求失败的没有 message：request 已统一提示过
    if (['error', 'readonly'].includes(item.status) && item.message) message.error(`${name}: ${item.message}`);
    if (!batch && item.status === 'blocked') message.error(`${name}: ${item.message || 'Forecast drawdowns exceed the undrawn facility'}`);
  });
  if (!batch) {
    const item = results[0];
    if (item && ['updated', 'unchanged'].includes(item.status)) {
      message.success(`${names[item.uuid]} confirmed · ${item.status === 'updated' ? 'changes saved' : 'no change'} · reviewed for this cycle`);
    }
    return;
  }
  const count = (status) => results.filter((item) => item.status === status).length;
  const updated = count('updated');
  const unchanged = count('unchanged');
  const already = count('already') + skip.already;
  const blocked = count('blocked') + skip.blocked;
  const readonly = count('readonly') + skip.readonly;
  const failed = count('error');
  const parts = [`${plural(updated + unchanged, 'loan')} confirmed`];
  if (updated) parts.push(`${updated} updated`);
  if (unchanged) parts.push(`${unchanged} unchanged`);
  if (already) parts.push(`${already} already confirmed this cycle`);
  if (blocked) parts.push(`${blocked} blocked: drawdowns exceed the facility`);
  if (readonly) parts.push(`${readonly} can't be changed right now — discard their drafts first`);
  if (failed) parts.push(`${failed} failed`);
  message.success(parts.join(' · '));
};

// 单笔 Confirm：无草稿直接记录复核，有草稿由预览弹窗调用
// drafts：预览中显示了改动的贷款及其草稿版本（'uuid:ver'）；返回的 loans 是确认后重新读取的数据（changed / reset 时也有）
const confirmSingle = (loan, drafts = []) => {
  const uuid = loan.uuid;
  return enqueue(uuid, () =>
    forecastUpdConfirm({ apply_uuids: uuid, batch: 0, drafts: drafts.join(',') })
      .then((res) => {
        const results = res.results || [];
        (res.loans || []).forEach(applyLoan);
        showConfirmResult(results, { [uuid]: loan.name }, 0);
        // 改动已写回：底部合计（已确认数据）需要刷新
        if (results.some((item) => item.status === 'updated')) loadData();
      })
      .catch(() => reloadLoan(uuid))
  );
};

// 批量 Confirm：每次最多 10 笔，按顺序提交，最后总是给出汇总并重新加载列表
const confirmBatch = (list, skip, drafts = []) => {
  const names = Object.fromEntries(list.map((loan) => [loan.uuid, loan.name]));
  const uuids = list.map((loan) => loan.uuid);
  const returned = [];
  // 每批返回的 loans 先更新到列表；某批请求失败：这批记为 error（request 已提示过），继续下一批
  const confirmPart = (part) =>
    forecastUpdConfirm({ apply_uuids: part.join(','), batch: 1, drafts: drafts.filter((pair) => part.includes(pair.split(':')[0])).join(',') })
      .then((res) => {
        (res.loans || []).forEach((loan) => {
          applyLoan(loan);
          returned.push(loan.uuid);
        });
        return res.results || [];
      })
      .catch(() => part.map((uuid) => ({ uuid, status: 'error', message: '' })));
  loading.value = true;
  return inChunks(uuids, 10, confirmPart)
    .then((results) => {
      showConfirmResult(results, names, 1, skip);
      const done = new Set(results.filter((item) => ['updated', 'unchanged'].includes(item.status)).map((item) => item.uuid));
      selected.value = new Set([...selected.value].filter((uuid) => !done.has(uuid)));
    })
    .finally(() => {
      loading.value = false;
      loadData();
      // 同单笔 Confirm：确认返回的贷款是写完后读主库的，这次重新加载（只读库）可能还没同步，记为加载开始后写完，保留本地版本
      returned.forEach((uuid) => (writtenAt[uuid] = ++clock));
    });
};

const confirmLoan = (loan) => {
  if (loan.draft) Object.assign(preview, { open: true, loans: [loan], note: '', batch: 0, skip: null });
  else confirmSingle(loan);
};

// Confirm selected：跳过 Gap < 0、只读且有草稿（只能丢弃）和本周期已确认且无草稿的贷款；有草稿时先预览
const confirmSelected = () => {
  const uuids = loans.value.filter((loan) => selected.value.has(loan.uuid)).map((loan) => loan.uuid);
  settle(uuids).then(() => {
    const list = uuids.map((uuid) => current(uuid)).filter(Boolean);
    const blocked = list.filter((loan) => loan.blocked);
    const readonly = list.filter((loan) => loan.readonly && loan.draft);
    const already = list.filter((loan) => !loan.blocked && !loan.draft && loan.review?.reviewed);
    const ready = list.filter((loan) => !blocked.includes(loan) && !readonly.includes(loan) && !already.includes(loan));
    const skip = { already: already.length, blocked: blocked.length, readonly: readonly.length };
    const notes = [];
    if (skip.already) notes.push(`${skip.already} already confirmed this cycle`);
    if (skip.blocked) notes.push(`${skip.blocked} blocked: drawdowns exceed the facility`);
    if (skip.readonly) notes.push(`${skip.readonly} can't be changed right now — discard their drafts first`);
    if (!ready.length) {
      message.info(`Nothing to confirm · ${notes.join(' · ')}`);
      return;
    }
    if (ready.some((loan) => loan.draft)) Object.assign(preview, { open: true, loans: ready, note: notes.join(' · '), batch: 1, skip });
    else confirmBatch(ready, skip);
  });
};

// 预览时发现草稿已在别处被重置：提示并刷新这笔贷款，不放在这次确认里；没有剩下的就关闭预览
const onPreviewReset = (items) => {
  items.forEach((item) => {
    resetNotice(item.name);
    reloadLoan(item.uuid);
  });
  const uuids = new Set(items.map((item) => item.uuid));
  preview.loans = preview.loans.filter((loan) => !uuids.has(loan.uuid));
  if (!preview.loans.length) preview.open = false;
};

// drafts：预览中显示了改动的贷款及其草稿版本（'uuid:ver'）
const onPreviewConfirm = (drafts) => {
  confirming.value = true;
  const run = preview.batch ? confirmBatch(preview.loans, preview.skip, drafts) : confirmSingle(preview.loans[0], drafts);
  run.finally(() => {
    confirming.value = false;
    preview.open = false;
  });
};

provide(CTX_KEY, { meName, today, edit, addRow, toggleSelect, selectAll, askAutoSpread, showAutoInfo, confirmLoan, openSpreadEvenly, askDiscard });

watch(
  () => productStore.currentProduct,
  () => {
    selected.value = new Set();
    filters.lm_uuid = '';
    loadData();
  },
  { immediate: true }
);

onBeforeUnmount(() => Object.values(flashTimers).forEach(clearTimeout));
</script>

<style scoped lang="less">
@import '@/views/dashboard/update-forecast/vars.less';

.update-forecast {
  color: @uf-ink;
  font-size: 13px;
}

.back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: @uf-muted;
  font-size: 12px;
  cursor: pointer;
  .iconfont {
    display: inline-block;
    rotate: 180deg;
    font-size: 12px;
  }
  &:hover {
    color: @uf-ink;
  }
}

.titlebar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 24px;
  align-items: center;
  justify-content: space-between;
  margin: 4px 0 14px;
  h1 {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
  }
}

.hdr-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.due {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 11px;
  border-radius: 999px;
  background: @uf-surface-2;
  color: @uf-ink-2;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  b {
    color: @uf-ink;
    font-weight: 700;
  }
  &.soon {
    background: @uf-warn-soft;
    color: @uf-warn-ink;
    b {
      color: @uf-warn-ink;
    }
  }
}

.cycle {
  color: @uf-muted;
  font-size: 12.5px;
  white-space: nowrap;
  b {
    color: @uf-ink;
    font-weight: 600;
  }
}

.tips {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  padding: 0;
  border: 1px solid @uf-line-2;
  border-radius: 50%;
  background: @uf-bg;
  color: @uf-ink-2;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  &:hover {
    border-color: @uf-ink-2;
    color: @uf-ink;
  }
}

.empty {
  .uf-empty();
}
</style>
