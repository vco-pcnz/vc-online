<template>
  <vco-page-panel :title="showDetail ? orgsDetailStore.detail?.name : t('添加组织')" :isBack="true"></vco-page-panel>
  <div class="addOrgsWrapper">
    <div class="addOrgsWrapper-left">
      <div style="background-color: #faf9f9" v-if="orgsFormStore.p_uuid || orgsFormStore.uuid">
        <Detail :showEdit="false"></Detail>
      </div>
      <div v-else>
        <img :src="advertisement?.adv" style="width: 100%" v-if="advertisement?.adv" alt="adv" />
        <p>{{ advertisement?.advMsg }}</p>
      </div>
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
import { systemConfigData } from '@/api/system';
import { useRoute } from 'vue-router';
import { useOrgsDetailStore } from '@/store';
import { useOrgsFormStore } from '@/store';
const route = useRoute();

const orgsDetailStore = useOrgsDetailStore();
const orgsFormStore = useOrgsFormStore();

const { t } = useI18n();

const showDetail = ref(false);
const advertisement = ref();
onMounted(() => {
  showDetail.value = orgsFormStore.p_uuid || orgsFormStore.uuid;
  if (!showDetail.value) {
    // 加载广告
    systemConfigData({ pcode: 'web_config', code: 'adv,advMsg' }).then(
      (res) => {
        advertisement.value = res;
      }
    );
  }
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
