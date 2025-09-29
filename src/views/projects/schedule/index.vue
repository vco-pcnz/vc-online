<template>
  <detail-layout active-tab="schedule" @getProjectDetail="getProjectDetail">
    <template #content>
      <vco-page-tab
        v-if="projectDetail.product.code === 'vsl' && (!hasPermission('projects:schedule:vs_schedule') || hasPermission('projects:schedule:boc_schedule'))"
        class="mt-5"
        :tabData="tabData"
        v-model:current="tab_id"
        @change="tabChange"
      ></vco-page-tab>
      <div class="relative">
        <a-button v-if="hasPermission('projects:detail:schedule:reconciliation') && !projectDetail?.base?.is_close" type="brown" shape="round" class="pre-sale-enter" @click="navigationTo(`/projects/schedule/reconciliation?uuid=${project_id}`)">
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
        :tab_id="tab_id"
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

const tab_id = ref('');
const tabData = ref([
  {
    label: 'Overall',
    value: ''
  },
  {
    label: 'VS Schedule',
    value: 1,
    hide: hasPermission('projects:schedule:vs_schedule')
  },
  {
    label: 'BOC Schedule',
    value: 2,
    hide: hasPermission('projects:schedule:boc_schedule')
  }
]);

const tabChange = () => {};

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
