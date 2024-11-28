<template>
  <Panel
    :title="showDetail ? orgsDetailStore.detail?.name : t('添加组织')"
  ></Panel>
  <div class="addOrgsWrapper">
    <div class="addOrgsWrapper-left">
      <Detail v-if="showDetail" :showEdit="false"></Detail>
    </div>
    <div class="addOrgsWrapper-right">
      <FormDom></FormDom>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import FormDom from '../components/form.vue';
import Detail from '../components/detail.vue';
import Panel from '../components/panel.vue';
import { useOrgsDetailStore } from '@/store';
import { useRoute } from 'vue-router';
const route = useRoute();

const orgsDetailStore = useOrgsDetailStore();

const { t } = useI18n();

const showDetail = ref(false);
onMounted(() => {
  showDetail.value = !!route.query.id;
});
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';
.addOrgsWrapper {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 24px;
  align-items: flex-start;

  .addOrgsWrapper-left {
    background-color: #faf9f9;
    border-radius: 12px;
  }
  .addOrgsWrapper-right {
    flex: 1;
    background-color: #faf9f9;
    border-radius: 12px;
    padding: 30px;
  }
}
</style>
