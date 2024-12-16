<template>
  <div class="page flex flex-col items-center">
    <div class="bg flex flex-col items-center">
      <img src="@/assets/images/404.svg" />
      <div class="mt-2">{{ t('您访问的页面不存在') }}</div>
    </div>
    <div class="mt-5"><a-button type="primary" @click="goHome">{{ t('回到主页') }}</a-button></div>
  </div>
</template>

<script setup>
  import { useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()
  const router = useRouter()

  const goHome = () => {
    router.push('/')
  }
</script>

<style scoped lang="less">
.page {
  position: absolute;
  top: 50%;
  left: 50%;
  margin-top: -200px;
  margin-left: -195px;
}
.bg, .bg img{
  width: 390px;
}
</style>
