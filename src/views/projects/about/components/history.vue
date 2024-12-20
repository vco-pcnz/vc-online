<template>
  <ul class="step">
    <li class="step-item flex justify-between items-center" v-for="item in 9" :key="item">
      <div class="content flex items-center">
        <i class="iconfont">&#xe725;</i>
        <span>Loan request created</span>
      </div>
      <span class="date">12/12/24</span>
    </li>
  </ul>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps([]);
</script>

<style scoped lang="less">
@import '@/styles/variables.less';

.step {
  .step-item {
    margin-bottom: 12px;
    gap: 6px;
    position: relative;
    .content {
      font-size: 9px;
      font-weight: 600;
      letter-spacing: 1px;
      line-height: 2;
      position: relative;
      text-transform: uppercase;
      gap: 6px;
      .iconfont {
        font-size: 12px;
      }
    }
    .date {
      color: hsla(0, 0%, 9%, 0.3);
      font-size: 10px;
    }
    &:not(:last-child):after {
      background-color: #181818;
      content: '';
      display: block;
      height: 24px;
      left: 5.5px;
      position: absolute;
      top: 18px;
      width: 1px;
    }
  }
}

</style>
