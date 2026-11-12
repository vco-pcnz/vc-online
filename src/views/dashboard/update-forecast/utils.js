import dayjs from 'dayjs';
import { chunk } from 'lodash';
import tool from '@/utils/tool';

// 页面与子组件共享（index.vue provide，子组件 inject）：
// meName 当前用户名、today 服务器今天的日期（ref）、edit / addRow 行编辑、toggleSelect / selectAll 勾选、
// askAutoSpread / showAutoInfo / confirmLoan / openSpreadEvenly / askDiscard Actions 列的操作
export const CTX_KEY = 'updateForecast';

// Auto-spread 说明：弹窗与页面说明共用
export const AUTO_INFO = 'On: after each edit the system adjusts the unlocked months so drawdowns add up to the undrawn facility. Off: months stay as you set them. Any gap shows in gold.';

// 日期显示：5 Oct '26
export const dateLabel = (date) => (date ? dayjs(date).format("D MMM 'YY") : '');

// 月份显示：Oct '26
export const ymLabel = (ym) => tool.monthYear(ym);

export const ymOf = (date) => String(date).slice(0, 7);
export const dayOf = (date) => Number(String(date).slice(8, 10));
export const ymAdd = (ym, n) => dayjs(`${ym}-01`).add(n, 'month').format('YYYY-MM');
const daysInMonth = (ym) => dayjs(`${ym}-01`).daysInMonth();

// 金额：$1,234.56 / 1,234.56
export const money = (value) => tool.formatMoney(Number(value) || 0);
export const amountText = (value) => tool.formatMoney(Number(value) || 0, { prefix: false });

export const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

// 序数：1st 2nd 3rd 25th
export const ordinal = (n) => {
  const suffix = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (suffix[(v - 20) % 10] || suffix[v] || suffix[0]);
};

export const isDrawdown = (row) => Number(row.type) === 2;
export const isLocked = (row) => Number(row.is_edit) === 1;
export const lenderName = (row) => (Number(row.source) === 1 ? 'BOC' : 'VS');

// 月内排序：日期、类型（D 在 R 前）、出资方（VS 在 BOC 前）
export const compareRows = (a, b) => a.date.localeCompare(b.date) || Number(a.type) - Number(b.type) || Number(a.source) - Number(b.source);

// 分批按顺序请求：每批最多 size 笔，fn 返回 Promise<数组>，结果按顺序合并
export const inChunks = (uuids, size, fn) => chunk(uuids, size).reduce((chain, part) => chain.then((all) => fn(part).then((list) => all.concat(list))), Promise.resolve([]));

// 某月可选的日：当月不早于今天，到期月不晚于到期日，不早于 var_start_date（today 为服务器日期）
export const dayRange = (loan, ym, today) => {
  let min = 1;
  let max = daysInMonth(ym);
  if (ym === ymOf(today)) min = dayOf(today);
  if (loan.var_start_date && ym === ymOf(loan.var_start_date)) min = Math.max(min, dayOf(loan.var_start_date));
  if (ym === ymOf(loan.end_date)) max = Math.min(max, dayOf(loan.end_date));
  return [min, max];
};

// 系统生成行的第一个月：当月默认日（不超过到期日）不早于今天则为当月，否则下月
export const firstAllowedYm = (loan, today) => {
  const curYm = ymOf(today);
  const day = Math.min(Number(loan.default_day) || 20, daysInMonth(curYm));
  let date = `${curYm}-${String(day).padStart(2, '0')}`;
  if (date > loan.end_date) date = loan.end_date;
  return date >= today ? curYm : ymAdd(curYm, 1);
};
