<template>
  <vco-page-panel :title="uuid ? t('添加人员') : t('添加组织')" :isBack="true"></vco-page-panel>
  <div class="addOrgsWrapper">
    <div class="addOrgsWrapper-left">
      <div style="background-color: #faf9f9" v-if="uuid">
        <Detail :showEdit="false" @getDetail="getDetail"></Detail>
      </div>
      <div v-else>
        <img :src="advertisement?.adv" style="width: 100%" v-if="advertisement?.adv" alt="adv" />
        <p>{{ advertisement?.advMsg }}</p>
      </div>
    </div>
    <div class="addOrgsWrapper-right">
      <FormDom :isMember="Boolean(uuid)" :p_uuid="uuid" :p_type="detail ? detail.type : ''"></FormDom>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import FormDom from '../../components/form.vue';
import Detail from '../../components/detail.vue';
import { systemConfigData } from '@/api/system';
import { useRoute } from 'vue-router';
const route = useRoute();

const { t } = useI18n();

const uuid = ref('');
const advertisement = ref();
const detail = ref(null);
const getDetail = (val) => {
  detail.value = val;
};

onMounted(() => {
  uuid.value = route.query.uuid;
  if (!uuid.value) {
    // 加载广告
    systemConfigData({ pcode: 'web_config', code: 'adv,advMsg' }).then((res) => {
      advertisement.value = res;
    });
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
