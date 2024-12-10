<template>
  <div>
    <vco-page-nav sup-path="/reconciliations">
      <template #action>
        <img :width="58" :height="14" :src="xeroImg" alt="Xero" />
        <a-button class="sync-btn">
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
import xeroImg from '@/assets/images/services-xero.png';

const onClick = (e) => {};
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
</style>
