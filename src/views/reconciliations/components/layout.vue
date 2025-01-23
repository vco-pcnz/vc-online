<template>
  <div>
    <vco-page-nav sup-path="/reconciliations" ref="pageNavRef">
      <template #action>
        <img :width="58" :height="14" :src="xeroImg" alt="Xero" />
        <a-statistic-countdown :value="deadline" @finish="onFinish" format="mm:ss" v-if="Boolean(countdown)">
          <template #prefix>
            <span>Processing (</span>
          </template>
          <template #suffix>
            <span>)</span>
          </template>
        </a-statistic-countdown>
        <a-button class="sync-btn" v-if="Boolean(!countdown)" @click="update">
          <template #icon>
            <i class="iconfont">&#xe749;</i>
          </template>
        </a-button>
      </template>
    </vco-page-nav>
    <div class="page-content">
      <slot name="content"></slot>
    </div>
  </div>
</template>

<script setup>
import { nextTick, ref } from 'vue';
import xeroImg from '@/assets/images/services-xero.png';
const deadline = Date.now() + 1000 * 60 * 10;
const countdown = ref(false);
const update = (e) => {
  countdown.value = true;
};
const pageNavRef = ref()


const setNum = (num) => {
  nextTick(_ => {
    pageNavRef.value.setNum(num)
  })
}

  // 暴露方法给父组件
  defineExpose({
    setNum
  });
</script>

<style scoped lang="less">
.sync-btn {
  border: none;
  background-color: transparent;
}

.page-content {
  margin-top: 36px;
  min-height: 100%;
  padding: 24px 28px;
  background-color: #f0f0f0;
  border: 1px solid #e2e5e2;
  border-radius: 12px;
}

:deep(.ant-statistic-content) {
  color: #888;
  font-size: 12px;
}
</style>
