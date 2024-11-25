<template>
  <div>
    <div class="unauth_container">
      <div class="language">
        <language-select :show-img="true"></language-select>
      </div>
      
      <div class="animation">
        <!-- <Lottie
          :options="defaultOptions"
          :isStopped="false"
          :isPaused="false"
        /> -->
      </div>
      <div class="content_container">
        <div class="header">
          <img :src="logoImg" alt="VC Online" />
          <slot name="header"></slot>
        </div>
        <div class="content">
          <slot name="content"></slot>
        </div>
        <footer class="footer">
          <slot name="footer"></slot>
        </footer>
        <!-- <template v-if="!!footerTo">
        <footer class="footer">
          {{ isLogin ? "Do not" : "Already" }} have an account?
          <router-link class="link" to="to">
            {{ isLogin ? "Sign up" : "Log in" }}
          </router-link>
        </footer>
      </template> -->
      </div>
    </div>
    <div class="login-bg">
      <Vue3Lottie :animationData="AstronautJSON" width="2880" height="2048" />
    </div>
  </div>
  
</template>

<script setup>
import LanguageSelect from "./../language-select/index.vue"
import logoImg from "@/assets/images/auth_logo.svg";
import { Vue3Lottie } from 'vue3-lottie'
import AstronautJSON from './astronaut.json'

const props = defineProps({
  backTo: String,
  footerTo: String,
  isLogin: Boolean,
});
</script>

<style scoped lang="less">
@import "@/styles/variables.less";

.unauth_container {
  width: 100%;
  position: relative;
  z-index: 9;

  .animation {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1;
  }

  .content_container {
    position: relative;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: transparent;
    z-index: 2;
    padding-top: 80px;

    .header {
      width: 56%;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .content {
      padding-top: 90px;
      margin: 0 auto;
      max-width: 528px;
    }

    .footer {
      margin-top: 32px;
      color: @color_white;
      font-size: @fs_xs;

      .link {
        font-weight: 600;
        margin-left: 8px;
        padding-top: 6px;
        padding-bottom: 6px;
      }
    }
  }
}

// 注册页面滚动到底部时，添加一个伪元素，使内容区域不会被滚动条遮盖
.unauth_container::after {
  content: "";
  display: block;
  height: 100px;
}

.language {
  position: fixed;
  top: 10px;
  right: 20px;
  z-index: 9;
  :deep(.lang-item) {
    color: #fff !important;
  }
}

.login-bg {
  width: 100vw;
  height: 100vh;
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 1;
  background-color: @clr_charcoal;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  overflow: hidden;
}
</style>
