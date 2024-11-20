<template>
  <div class="app-layout">
    <layout-header class="animate__fadeIn animate__animated"></layout-header>
    <div class="main-container animate__fadeIn animate__animated faster animate__delay__faster">
      <router-view />
    </div>
    <layout-footer></layout-footer>
  </div>
</template>

<script setup>
  import LayoutHeader from './components/header/index.vue'
  import LayoutFooter from './components/footer/index.vue'
</script>

<style lang="less" scoped>
  .app-layout {
    width: 1440px;
    min-height: 100vh;
    margin: 0 auto;
    padding: 0 25px 25px 25px;

    .main-container {
      border-radius: 24px;
      min-height: calc(100vh - 165px);
      box-shadow: 0 0 8px 0 rgba(0, 0, 0, .1);
      background-color: #ffffff;
      padding: 40px 30px;
    }
  }
</style>
