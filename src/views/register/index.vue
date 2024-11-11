<template>
  <auth-template func="login">
    <template #header>
      <img :src="logoImg" alt="VC Online" />
      <router-link to="/login">
        <a-button type="primary"> {{ t('登录') }} </a-button>
      </router-link>
    </template>
    <template #content>

    </template>
  </auth-template>
</template>

<script setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import logoImg from "@/assets/images/auth_logo.svg";

const { t } = useI18n();
</script>
