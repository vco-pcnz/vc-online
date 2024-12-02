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
    <slot name="content"></slot>
  </div>
</template>

<script setup>
import { ref, reactive, h } from 'vue';
import { useI18n } from 'vue-i18n';
import xeroImg from '@/assets/images/services-xero.png';

const { t } = useI18n();

const onClick = (e) => {
 
};
</script>

<style scoped lang="less">
.sync-btn {
    border: none;
    background-color: transparent;
}
</style>
