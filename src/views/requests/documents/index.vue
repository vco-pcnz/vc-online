<template>
  <div class="main-info-container">
    <vco-page-panel :title="t('项目文件')" @back="goBack"> </vco-page-panel>
    <Documents :project_id="uuid" v-if="uuid"></Documents>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Documents from '@/components/documents/index.vue';
import { useRoute } from 'vue-router';
const route = useRoute();
import tool, { goBack } from '@/utils/tool';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const uuid = ref('');
onMounted(() => {
  uuid.value = route.query.uuid;
});
</script>
