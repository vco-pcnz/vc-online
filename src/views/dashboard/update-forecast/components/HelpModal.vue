<template>
  <a-modal :open="open" :width="760" title="How this page works" @cancel="close">
    <div class="tipgrid">
      <div class="tip">
        <h4>Colours</h4>
        <p><span class="sw d"></span><b>Drawdown</b> (D)</p>
        <p><span class="sw r"></span><b>Partial repayment</b> (R)</p>
        <p><span class="sw f"></span><b>Full repayment</b> is set by the system: balance plus interest at maturity. Once maturity has passed, it is assumed repaid today.</p>
      </div>
      <div class="tip">
        <h4>Row marks</h4>
        <p><b>Bold</b> = locked by you. The system never changes it.</p>
        <p>Light = spread by the system. Editing it locks it.</p>
      </div>
      <div class="tip">
        <h4>Confirm and drafts</h4>
        <p>Every edit is saved as a <b>Draft</b> straight away. The Cashflow forecast keeps showing the confirmed figures.</p>
        <p><b>Confirm</b> saves the loan and records it as reviewed for this cycle. With a draft you see the changes first; without one it is recorded straight away.</p>
      </div>
      <div class="tip">
        <h4>Auto-spread and the cycle</h4>
        <p><b>Auto-spread</b> {{ AUTO_INFO }}</p>
        <p>The forecast is due on the {{ ordinal(dueDay) }} of each month. A new cycle starts the day after, and every loan is <b>Not reviewed</b> again.</p>
      </div>
    </div>
    <template #footer>
      <a-button type="dark" @click="close">Close</a-button>
    </template>
  </a-modal>
</template>

<script setup>
import { AUTO_INFO, ordinal } from '../utils';

defineProps({
  open: {
    type: Boolean,
    default: false
  },
  // 后台配置的 Forecast due day
  dueDay: {
    type: Number,
    default: 25
  }
});

const emit = defineEmits(['update:open']);

const close = () => emit('update:open', false);
</script>

<style scoped lang="less">
@import '@/views/dashboard/update-forecast/vars.less';

.tipgrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 24px;
  padding: 4px 0 6px;
}

.tip {
  h4 {
    margin: 0 0 6px;
    color: @uf-muted;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.07em;
    text-transform: uppercase;
  }
  p {
    margin: 0 0 5px;
    font-size: 13px;
    line-height: 1.5;
  }
}

.sw {
  display: inline-block;
  width: 9px;
  height: 9px;
  margin-right: 6px;
  border-radius: 3px;
  vertical-align: -1px;
  &.d {
    background: @uf-green;
  }
  &.r {
    background: @uf-gold;
  }
  &.f {
    border-radius: 50%;
    background: @uf-gold;
  }
}
</style>
