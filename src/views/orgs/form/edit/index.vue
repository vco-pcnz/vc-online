<template>
  <vco-page-panel :title="t('编辑')" :isBack="true"></vco-page-panel>
  <div class="addOrgsWrapper">
    <div class="addOrgsWrapper-left">
      <Detail ref="detailRef" :showEdit="false" @getDetail="getDetail"></Detail>
    </div>
    <div class="addOrgsWrapper-right">
      <FormDom v-if="Boolean(detail)" :detail="detail" :isMember="Boolean(detail.is_pid)" @update="updateDetail"></FormDom>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import FormDom from '../../components/form.vue';
import Detail from '../../components/detail.vue';
const { t } = useI18n();

const detail = ref(null);
const detailRef = ref()

const getDetail = (val) => {
  detail.value = val;
};

const updateDetail = () => {
  detailRef.value.updateDetail()
}

onMounted(() => {});
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
