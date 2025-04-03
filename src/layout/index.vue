<template>
  <div class="app-layout">
    <layout-header class="animate__fadeIn animate__animated"></layout-header>
    <div class="main-container animate__fadeIn animate__animated faster animate__delay__faster">
      <router-view v-slot="{ Component }">
        <keep-alive :include="cachedComponentsArray">
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </div>
    <layout-footer></layout-footer>
    <Feedback></Feedback>
  </div>
</template>

<script setup>
  import { watch, ref, computed } from "vue";
  import { useRoute, useRouter } from "vue-router";

  import LayoutHeader from './components/header/index.vue'
  import LayoutFooter from './components/footer/index.vue'
  import Feedback from './components/Feedback/index.vue'

  const route = useRoute();
  const router = useRouter();
  const cachedComponents = ref(new Set());

  // 将 Set 转换为数组供 keep-alive 使用
  const cachedComponentsArray = computed(() => Array.from(cachedComponents.value)); 

  watch(
    () => route.path,
    () => {
      const matchedRoute = router.getRoutes().find((r) => r.path === route.path);
      if (matchedRoute?.components?.default?.name) {
        cachedComponents.value.add(matchedRoute.components.default.name);
      }
    },
    { immediate: true }
  );
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
