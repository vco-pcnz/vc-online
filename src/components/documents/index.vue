<template>
  <a-spin :spinning="spinning" size="large">
    <div style="min-height: 200px;">
      <template v-if="tree">
        <Tab v-model:active="tabIndex" v-model:folder="folder" :data="tree" :apply_uuid="project_id" :annex_id="annex_id" :edit="edit" v-model:showSearch="showSearch"></Tab>
        <div class="content" :class="{ grid: tree }" v-if="!showSearch">
          <!--   && tree[tabIndex] && tree[tabIndex].children -->
          <!--  && tree[tabIndex].children -->
          <template v-if="tree">
            <Folders
              v-model:folder="folder"
              :pid="tree[tabIndex].id"
              :apply_uuid="project_id"
              :tabIndex="tabIndex"
              :data="tree[tabIndex].children|| []"
              :edit="edit"
              @change="(val) => loadData(tabIndex, val)"
            ></Folders>
          </template>
          <FileList
            :tree="tree"
            :tabName="tree[tabIndex].name"
            :apply_uuid="project_id"
            :folder="tree[tabIndex].children ? folder : tree[tabIndex]"
            :isTab="Boolean(!tree[tabIndex].children)"
            :edit="edit"
            ref="fileListRef"
            @change="loadData(tabIndex, folder)"
          ></FileList>
        </div>
      </template>
    </div>
  </a-spin>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import Tab from './components/tab.vue';
import Folders from './components/folders.vue';
import FileList from './components/fileList.vue';
import { useRoute } from 'vue-router';
import { getTree } from '@/api/project/annex';
import { number } from 'echarts';
const route = useRoute();

const { t } = useI18n();
const props = defineProps({
  project_id: {
    type: String
  },
  annex_id: {
    type: [String,Number]
  },
  edit: {
    type: Boolean,
    default: true
  },
  __way__: {
    type: String
  }
});

const tree = ref(null);
const tabIndex = ref(0);
const folder = ref(null);
const fileListRef = ref();
const spinning = ref(false);
const showSearch = ref(false);

const loadData = (index, val) => {
  spinning.value = true;
  getTree({ apply_uuid: props.project_id,__way__: props.__way__})
    .then((res) => {
      tabIndex.value = index || 0;
      folder.value = val || res[tabIndex.value].children[0];
      tree.value = res;
      getFiles();
    })
    .finally((_) => {
      spinning.value = false;
    });
};

const getFiles = () => {
  nextTick((_) => {
    fileListRef.value.getFiles();
  });
};

onMounted(() => {
  loadData();
});

watch(
  () => [folder.value],
  (val) => {
    if (showSearch.value) return;
    getFiles();
  }
);
</script>

<style scoped lang="less">
@import '@/styles/variables.less';

.content {
  gap: 24px;
  border: 1px solid #e2e5e2;
  box-shadow: 2px 2px 4px 0 hsla(120, 5%, 89%, 0.15), 5px 5px 7px 0 hsla(0, 0%, 53%, 0.1);
  border-radius: 12px;
  padding: 10px;
  min-height: 550px;
  &.grid {
    display: grid;
    grid-template-columns: 1.2fr 3fr;
  }
}

:deep(.fileBox-content) {
  width: calc(100% - 150px) !important;
}
</style>
