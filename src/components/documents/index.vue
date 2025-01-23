<template>
  <a-spin :spinning="spinning" size="large">
    <div style="min-height: 200px;">
      <template v-if="tree">
        <Tab v-model:active="tabIndex" v-model:folder="folder" :data="tree" :apply_uuid="project_id" v-model:showSearch="showSearch"></Tab>
        <div class="content" :class="{ grid: tree && tree[tabIndex] && tree[tabIndex].children }" v-if="!showSearch">
          <template v-if="tree && tree[tabIndex].children">
            <Folders
              v-model:folder="folder"
              :pid="tree[tabIndex].id"
              :apply_uuid="project_id"
              :tabIndex="tabIndex"
              :data="tree[tabIndex].children"
              @change="(val) => loadData(tabIndex, val)"
            ></Folders>
          </template>
          <FileList
            :tree="tree"
            :tabName="tree[tabIndex].name"
            :apply_uuid="project_id"
            :folder="tree[tabIndex].children ? folder : tree[tabIndex]"
            :isTab="Boolean(!tree[tabIndex].children)"
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
const route = useRoute();

const { t } = useI18n();
const props = defineProps({
  project_id: {
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
  getTree({ apply_uuid: props.project_id })
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
