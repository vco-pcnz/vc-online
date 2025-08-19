<template>
  <schedule v-if="project_id" :isDetails="true" :current-product="currentProduct" :isAbout="true" :currentId="project_id" :ptRole="!!projectDetail?.base?.ptRole" :is-old="isOld" :is-reset="true"></schedule>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import schedule from './schedule.vue';
import { useRoute } from 'vue-router';

const { t } = useI18n();
const route = useRoute();
const project_id = ref('51ccb4fd-52ab-447c-94d2-cf48ba27fc7a');
const currentProduct = ref('');
const isOld = ref(false);

const projectDetail = ref();

onMounted(() => {});
</script>

<style scoped lang="less">
@import '@/styles/variables.less';

.pre-sale-enter {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: -10px;
  right: 0;
  z-index: 2;
}
</style>
