<template>
  <detail-layout active-tab="schedule" @getProjectDetail="getProjectDetail">
    <template #content>
      <div class="relative">
        <a-button v-if="hasPermission('projects:detail:schedule:reconciliation') && ! projectDetail?.base?.is_close" type="brown" shape="round" class="pre-sale-enter" @click="navigationTo(`/projects/schedule/reconciliation?uuid=${project_id}`)">
          {{ t('对账') }}
          <RightOutlined :style="{ fontSize: '11px', 'margin-inline-start': '4px' }" />
        </a-button>
      </div>
      <schedule
        v-if="project_id"
        :isDetails="true"
        :current-product="currentProduct"
        :isClose="Boolean(projectDetail?.base?.is_close)"
        :isAbout="true"
        :currentId="project_id"
        :ptRole="!!projectDetail?.base?.ptRole"
        :is-old="isOld"
        :is-reset="true"
      ></schedule>
    </template>
  </detail-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import detailLayout from '../components/detailLayout.vue';
import schedule from '@/components/schedule/index.vue';
import { useRoute } from 'vue-router';
import { hasPermission } from '@/directives/permission/index';
import { RightOutlined } from '@ant-design/icons-vue';
import { navigationTo } from '@/utils/tool';

const { t } = useI18n();
const route = useRoute();
const project_id = ref();
const currentProduct = ref('');
const isOld = ref(false);

const projectDetail = ref();
const getProjectDetail = (val) => {
  isOld.value = Boolean(val.base.old);
  currentProduct.value = val.product.code;
  projectDetail.value = val;
};

onMounted(() => {
  project_id.value = route.query.uuid;
});
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
