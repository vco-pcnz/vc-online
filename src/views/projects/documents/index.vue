<template>
  <detail-layout :title="baseInfo.name" active-tab="documents">
    <template #content>
      <div class="tab flex items-center justify-between">
        <ul class="flex">
          <li
            class="tab-item flex items-center"
            v-for="(item, index) in tree"
            :key="index"
            :class="{ active: tabIndex == index, disabled: item.status == 0 }"
            @click="setIndex(index)"
          >
            <img class="icon" :src="item.icon" alt="" />
            <img class="icon icon2" :src="item.icon2" alt="" />
            {{ item.name }}
          </li>
        </ul>
        <div class="tab-item search" :class="{ active: showSearch }" @click="setSearch">
          <i class="iconfont">&#xe731;</i>
          <span>{{ t('搜索') }}</span>
        </div>
      </div>

      <div class="content search-box" v-if="showSearch">
        <div class="search-title">Search</div>
        <a-input class="search-input" v-model:value="keywords" v-focus="true" placeholder="Search across the folder..." />
      </div>

      <div class="content" v-if="!showSearch">
        <div class="folder" v-if="tree && tree[tabIndex] && tree[tabIndex].children">
          <a-button class="add uppercase" type="brown" shape="round" size="small" @click="visible_add = true">{{ t('添加') }}</a-button>
          <div
            class="folder-item"
            :class="{ active: folderIndex == index, disabled: item.status == 0 }"
            v-for="(item, index) in tree[tabIndex].children"
            :key="item.id"
            @click="setFolderIndex(index)"
          >
            <div class="">
              <span class="serial-number">{{ tabIndex + 1 }}.{{ index + 1 }}</span>
              <span>{{ item.name }}</span>
              <span class="num">・0</span>
            </div>
          </div>
        </div>

        <div class="files">
          <div class="flex items-center justify-between">
            <h3 class="files-title">
              <template v-if="tree && tree[tabIndex] && tree[tabIndex].children">
                {{ tree[tabIndex].name }}/ {{ tree[tabIndex].children[folderIndex].name }}
              </template>
            </h3>
            <div class="files-ops">
              <div class="files-ops-item" :class="{ active: showFilter }" @click="setShowFilter"><i class="iconfont">&#xe756;</i></div>

              <vco-upload-modal v-model:list="documentList" v-model:value="document">
                <div class="files-ops-item"><i class="iconfont">&#xe734;</i></div>
              </vco-upload-modal>

              <a-dropdown class="Filter" trigger="click">
                <div class="files-ops-item">
                  <i class="iconfont">&#xe772;</i>Sort by:<span class="lowercase">{{ sortSelect.name }}</span>
                </div>
                <template #overlay>
                  <ul class="dropdown-list">
                    <li
                      class="dropdown-list-item"
                      :class="{ selected: sortSelect && sortSelect.id === item.id }"
                      v-for="item in sortsList"
                      :key="item.id"
                      @click="changeSort(item)"
                    >
                      {{ item.name }}
                    </li>
                  </ul>
                </template>
              </a-dropdown>
            </div>
          </div>
          <div>
            <a-input class="search-input" v-model:value="filter" v-focus="true" placeholder="Search across the folder..." v-if="showFilter" />
            <div style="padding-right: 400px">
              <vco-file-item :showClose="true" :filter="filter" :file="item" v-for="(item, index) in files" :key="index">
                <template #ops>
                  <a-dropdown trigger="click">
                    <a class="ant-dropdown-link" @click.prevent>
                      <i class="iconfont icon-ops">&#xe77f;</i>
                      <DownOutlined />
                    </a>
                    <template #overlay>
                      <ul class="opFileList">
                        <li class="opFileList-item" @click="visible_rename = true">Rename</li>
                        <li class="opFileList-item">Copy to...</li>
                        <a-dropdown class="Filter" trigger="hover" v-for="(item, index) in tree" :key="item.id" placement="right">
                          <li class="opFileList-item type" :class="{ disabled: item.status == 0 }">
                            <span class="index">{{ index + 1 }}</span>
                            <span class="name">{{ item.name }}</span>
                            <i class="iconfont" v-if="item.children && item.children.length">&#xe791;</i>
                          </li>
                          <template #overlay v-if="item.children && item.children.length">
                            <ul class="dropdown-list">
                              <li class="dropdown-list-item" v-for="sub in item.children" :key="sub.id">{{ sub.name }}</li>
                            </ul>
                          </template>
                        </a-dropdown>
                      </ul>
                    </template>
                  </a-dropdown>
                </template>
              </vco-file-item>
            </div>
          </div>
        </div>
      </div>
    </template>
  </detail-layout>
  <Add v-model:visible="visible_add"></Add>
  <Rename v-model:visible="visible_rename"></Rename>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import detailLayout from '../components/detailLayout.vue';
import Rename from './components/rename.vue';
import Add from './components/add.vue';
import { getTree } from '@/api/project/annex';

const { t } = useI18n();

const baseInfo = ref({
  id: 1614,
  name: 'test1212',
  purpose: ['Construction'],
  background: 'xxx'
});

const tree = ref();
const tabIndex = ref(0);
const showSearch = ref(false);
const keywords = ref('');
const folderIndex = ref(0);
const showFilter = ref(false);
const filter = ref('');
const visible_rename = ref(false);
const visible_add = ref(false);

const documentList = ref([]);
const document = ref([]);

const sortsList = ref([
  { name: 'Date', id: '1' },
  { name: 'Name', id: '2' },
  { name: 'Size', id: '3' }
]);

const files = ref([
  {
    uuid: '87460a7d-ac7e-4c24-b496-234ebb3354b8',
    type: 2,
    name: '新建 DOCX 文档.docx',
    value: 'http://vco.com/uploads/images/stakeholder/20241213/587c539a5d0d1899777.docx',
    size: 10051
  },
  {
    uuid: '0f8cb6ee-0adb-4bbc-81ce-0cdfdd72ba54',
    type: 3,
    name: '测试视频.mp4',
    value: 'http://vco.com/uploads/images/stakeholder/20241223/7c360ed8072e7168433.mp4',
    size: 15458651
  }
]);

// 删除文件
const remove = (index) => {
  documentList.value.splice(index, 1);
};

const sortSelect = ref({ name: 'Date', id: '1' });
const changeSort = (val) => {
  sortSelect.value = val;
};

const setIndex = (index) => {
  if (!tree.value[index].status) return;
  tabIndex.value = index;
  showSearch.value = false;
};

const setSearch = () => {
  showSearch.value = true;
  active.value = '';
};

const setFolderIndex = (index) => {
  if (!tree.value[index].children[index].status) return;
  folderIndex.value = index;
};

const setShowFilter = () => {
  showFilter.value = !showFilter.value;
};

onMounted(() => {
  sortSelect.value = sortsList.value[0];
  getTree({ uuid: '96e7a828-2ef8-495a-b8cd-2a83c923889c' }).then((res) => {
    tree.value = res;
  });
});
</script>

<style scoped lang="less">
@import '@/styles/variables.less';
.tab {
  &-item {
    gap: 8px;
    border-radius: 24px;
    font-weight: 600;
    height: 36px;
    padding-left: 12px;
    padding-right: 12px;
    transition: all 0.2s cubic-bezier(0.215, 0.61, 0.355, 1);
    cursor: pointer;
    margin-bottom: 20px;
    .icon {
      width: 20px;
      height: 20px;
      &.icon2 {
        display: none;
      }
    }
    &.active {
      background-color: @color_variation;
    }
    &:hover {
      color: @color_brown;
      .icon {
        display: none;
        &.icon2 {
          display: block;
        }
      }
    }

    &.disabled {
      color: #181818;
      opacity: 0.3;
      .icon {
        display: block;
        &.icon2 {
          display: none;
        }
      }
    }

    &.search {
      display: flex;
      align-items: center;
      transition: all 0.2s cubic-bezier(0.215, 0.61, 0.355, 1);
      .iconfont {
        font-size: 16px;
      }
      span {
        overflow: hidden;
        transition: 0.2s cubic-bezier(0.215, 0.61, 0.355, 1);
        transition-property: width, opacity;
        width: 0;
      }
      &.active span {
        opacity: 1;
        width: 53px;
      }
    }
  }
}

.content {
  display: grid;
  gap: 24px;
  grid-template-columns: 1fr 3fr;
  border: 1px solid #e2e5e2;
  box-shadow: 2px 2px 4px 0 hsla(120, 5%, 89%, 0.15), 5px 5px 7px 0 hsla(0, 0%, 53%, 0.1);
  border-radius: 12px;
  padding: 10px;
  min-height: 550px;
  .folder {
    background-color: #f7f9f8;
    border-radius: 10px;
    padding-bottom: 32px;
    padding-top: 50px;
    position: relative;
    &-item {
      cursor: pointer;
      display: flex;
      font-weight: 600;
      gap: 16px;
      justify-content: space-between;
      min-height: 40px;
      padding: 8px 24px 8px 8px;
      text-align: left;
      transition: background-color 0.2s cubic-bezier(0.215, 0.61, 0.355, 1);
      width: 100%;
      &:hover {
        background-color: hsla(35, 53%, 67%, 0.2);
      }

      &.active {
        background-color: #eef1f1;
      }
      .serial-number {
        color: #888;
        margin-right: 10px;
        text-align: right;
        width: 32px;
        display: inline-block;
      }

      .num {
        color: #569695;
        white-space: nowrap;
      }
    }
    .add {
      position: absolute;
      right: 10px;
      top: 15px;
    }
  }
  .files {
    padding: 32px 24px;
    &-title {
      font-weight: 500;
      font-size: 24px;
      line-height: 1.2;
    }
    &-ops {
      color: @color_brown;

      font-size: 12px;
      display: flex;
      &-item {
        min-height: 36px;
        padding-left: 12px;
        padding-right: 12px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        &:hover,
        &.active {
          background-color: #f7f9f8;
          color: #181818;
          border-radius: 6px;
        }
      }

      .search {
        margin: 10px 0;
        background-color: #f7f9f8;
        border: none;
        outline: none;
        box-shadow: none;
        padding: 13.7px 11px;
      }
    }
  }
}

.dropdown-list {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05);
  list-style-type: none;
  margin: 0;
  padding: 16px 0;
  position: relative;
  text-align: left;
  &-item {
    font-weight: 500;
    padding: 8px 24px;
    cursor: pointer;
    font-size: 14px;
    line-height: 22px;
    &:hover {
      background-color: rgba(227, 235, 235, 0.4);
    }
    &.selected {
      color: #181818;
      font-weight: 600;
      background-color: #fffbf0;
    }
    &.customPeriod {
      color: #d8b480;
    }
  }
}

.search-box {
  min-height: auto;
  display: flex;
  align-items: center;
  border: 1px solid #e2e5e2;
  padding: 42px 34px;
  box-shadow: 2px 2px 4px 0 hsla(120, 5%, 89%, 0.15), 5px 5px 7px 0 hsla(0, 0%, 53%, 0.1);

  .search-title {
    font-size: 24px;
    line-height: 1.2;
    font-weight: 500;
  }
}

.search-input {
  &.ant-input {
    padding: 13.7px 11px;
    background-color: #f7f9f8;
    border: 1px solid transparent;
    &:focus {
      border-color: #e6d0ac;
      border-right-width: 1px;
      box-shadow: 0 0 0 2px hsla(35, 53%, 67%, 0.2);
      outline: 0;
    }
  }
}

.opFileList {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05);
  list-style-type: none;
  margin: 0;
  padding: 16px 0;
  position: relative;
  text-align: left;
  .opFileList-item {
    font-weight: 500;
    padding: 8px 10px 8px 24px;
    cursor: pointer;
    font-size: 14px;
    line-height: 22px;
    &:hover {
      background-color: rgba(227, 235, 235, 0.4);
    }
    &.selected {
      color: #181818;
      font-weight: 600;
      background-color: #fffbf0;
    }
    &.customPeriod {
      color: #d8b480;
    }
    &.type {
      display: flex;
      justify-content: space-between;
      span {
        display: inline-block;
      }
      .index {
        color: #7dc1c1;
        display: inline-block;
        font-weight: 500;
        margin-right: 10px;
        min-width: 16px;
      }
      .name {
        font-weight: 500;
        flex: 1;
      }
      .iconfont {
        color: #b8cdcc;
        font-size: 12px;
        margin-left: 16px;
      }
    }
    &.disabled {
      .name {
        opacity: 0.3;
      }
    }
  }
}

.icon-ops {
  font-size: 12px;
  color: @colorPrimary;
  &:hover {
    opacity: 0.8;
  }
}
</style>
