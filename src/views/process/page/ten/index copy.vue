<template>
  <div>
    <a-spin :spinning="tempLoading" size="large">
      <div class="main-info-container">
        <process-header :step-data="processStepData" :current="10">
          <!-- <template #left>
            <a-button type="grey-line" @click="goBack">{{ t('取消请求') }}</a-button>
          </template> -->
          <template #right>
            <a-button type="primary" shape="round" ghost size="small">{{ t('帮助') }}?</a-button>
          </template>
        </process-header>
        <component v-if="tempModule" :is="tempModule"></component>
        <a-empty v-if="!tempModule && queryError" :image="simpleImage" />
      </div>
    </a-spin>
    
  </div>
</template>

<script setup>
  import { useDynamicModule } from "@/hooks/useDynamicModule";
  import ProcessHeader from "../../components/ProcessHeader.vue";
  import { useI18n } from "vue-i18n";
  import { goBack } from "@/utils/tool";

  const { t } = useI18n();
  const { tempLoading, tempModule, currentId, queryError, simpleImage, processStepData } = useDynamicModule('ten');
</script>
