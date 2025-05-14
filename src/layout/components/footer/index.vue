<template>
  <div class="footer-container">
    <div class="Copyright">Copyright © 2022-present Vincent Capital</div>
    <router-link to="/version" class="version">{{version}}</router-link>
  </div>
</template>

<script setup>
const version = __APP_VERSION__
</script>

<style lang="less" scoped>
.footer-container {
  padding-top: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  > .Copyright {
    text-align: center;
    line-height: 24px;
    font-size: 14px;
    color: #999;
  }
  > .version {
    margin-left: 10px;
    color: #d8b480;
    font-weight: normal;
  }
}
</style>
