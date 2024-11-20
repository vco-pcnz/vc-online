<template>
  <div>
    <vco-page-nav sup-path="/requests">
      <template #action>
        <a-button type="primary" shape="round">{{ t('发起贷款请求') }}</a-button>
      </template>
    </vco-page-nav>

    <div class="mt-5">
      fdsa
    </div>
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>