<template>
  <div class="files">
    <div class="flex items-center justify-between">
      <h3 class="files-title">{{ tabName }}/ {{ folder.name }}</h3>
      <div class="files-ops">
        <div class="files-ops-item" :class="{ active: showFilter }" @click="setShowFilter"><i class="iconfont">&#xe756;</i></div>

        <vco-upload-modal v-model:value="document" v-model:list="upDocument">
          <a-spin :spinning="upLoading">
            <div class="files-ops-item"><i class="iconfont">&#xe734;</i></div>
          </a-spin>
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
      <a-input class="search-input my-5" v-model:value="filter" v-focus="true" placeholder="Search across the folder..." v-if="showFilter" />
      <a-spin :spinning="spinning">
        <div style="padding-right: 400px; min-height: 400px">
          <template v-for="files in documentList" :key="files.id">
            <template v-if="files.id !== folder.id && files.show">
              <!-- <div>{{ files.name }}</div> -->
            </template>
            <template v-if="files.show">
              <vco-file-item
                :showClose="true"
                :filter="filter"
                :file="item"
                :time="item.create_time"
                :key="index"
                iconColor="#bf9425"
                :showDownload="true"
                @remove="remove(item)"
                v-for="(item, index) in files.attach"
              >
                <template #ops>
                  <a-dropdown trigger="click">
                    <a class="ant-dropdown-link" @click.prevent>
                      <i class="iconfont icon-ops">&#xe77f;</i>
                    </a>
                    <template #overlay>
                      <ul class="opFileList">
                        <li class="opFileList-item" @click="updateVisibleRename(item)">Rename</li>
                        <li class="opFileList-item">Copy to...</li>
                        <a-dropdown class="Filter" trigger="hover" v-for="(tabItem, index) in tree" :key="tabItem.id" placement="right">
                          <li class="opFileList-item" :class="{ disabled: tabItem.status == 0 }">
                            <span class="index">{{ index + 1 }}</span>
                            <span class="name">{{ tabItem.name }}</span>
                            <i class="iconfont" v-if="tabItem.children && tabItem.children.length">&#xe791;</i>
                          </li>
                          <template #overlay v-if="tabItem.children && tabItem.children.length">
                            <ul class="opFileList">
                              <li
                                class="opFileList-item"
                                v-for="(sub, subIndex) in tabItem.children"
                                @click="move(files.id, sub.id, [item.uuid])"
                                :key="sub.id"
                              >
                                <span class="index">{{ index + 1 }}.{{ subIndex + 1 }}</span>
                                <span class="name">{{ sub.name }}</span>
                              </li>
                            </ul>
                          </template>
                        </a-dropdown>
                      </ul>
                    </template>
                  </a-dropdown>
                </template>
              </vco-file-item>
            </template>

            <template v-if="!files.show">
              <div class="archivedTitle" @click="showArchived = !showArchived">
                Archived documents <span class="num">{{ files.attach.length }}</span> <i class="iconfont" :class="{active: showArchived}">&#xe778;</i>
              </div>
              <template v-if="showArchived">
                <vco-file-item
                  :filter="filter"
                  :file="item"
                  :key="index"
                  iconColor="#bf9425"
                  :time="item.create_time"
                  :showDownload="true"
                  v-for="(item, index) in files.attach"
                >
                  <template #ops>
                    <a-dropdown trigger="click">
                      <a class="ant-dropdown-link" @click.prevent>
                        <i class="iconfont icon-ops">&#xe77f;</i>
                      </a>
                      <template #overlay>
                        <ul class="opFileList">
                          <li class="opFileList-item" @click="move(files.id, folder.id, [item.uuid])">Unarchive</li>
                        </ul>
                      </template>
                    </a-dropdown>
                  </template>
                </vco-file-item>
              </template>
            </template>
          </template>
        </div>
      </a-spin>
    </div>
  </div>
  <RenameModel :formParams="formParams" v-model:visible="visibleRename" @change="getFiles"></RenameModel>
</template>

<script scoped setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { getChild, fadd, fdel, fmove } from '@/api/project/annex';
import RenameModel from './rename.vue';

const { t } = useI18n();
const emits = defineEmits(['update:visible', 'change']);

const props = defineProps({
  tree: {
    type: Array,
    default: false
  },
  apply_uuid: {
    type: String
  },
  folder: {
    type: Object
  },
  tabName: {
    type: String
  }
});

const visibleRename = ref(false);
const documentList = ref([]);
const showFilter = ref(false);
const spinning = ref(false);
const upLoading = ref(false);
const removeLoading = ref(false);
const filter = ref('');
const document = ref([]);
const upDocument = ref([]);
const showArchived = ref(true)

const sortsList = ref([
  { name: 'Date', id: '1' },
  { name: 'Name', id: '2' },
  { name: 'Size', id: '3' }
]);

const sortSelect = ref({ name: 'Date', id: '1' });
const changeSort = (val) => {
  sortSelect.value = val;
};

const setShowFilter = () => {
  showFilter.value = !showFilter.value;
};

const formParams = ref(null);
const updateVisibleRename = (val) => {
  formParams.value = {
    did: props.folder.id,
    apply_uuid: props.apply_uuid,
    uuid: val.uuid,
    name: val.name
  };
  visibleRename.value = true;
};
const getFiles = () => {
  let params = { uuid: props.apply_uuid };
  params['id'] = props.folder.id;
  spinning.value = true;
  showArchived.value = true;
  documentList.value = [];
  getChild(params)
    .then((res) => {
      documentList.value = res.data;
    })
    .finally((_) => {
      spinning.value = false;
    });
};

const remove = (val) => {
  removeLoading.value = true;
  fdel({
    did: props.folder.id,
    apply_uuid: props.apply_uuid,
    files: document.value,
    uuids: [val.uuid]
  })
    .then((res) => {
      getFiles();
    })
    .finally((_) => {
      removeLoading.value = false;
    });
};

const move = (current, target, uuids) => {
  fmove({
    did: current,
    nid: target,
    apply_uuid: props.apply_uuid,
    uuids: uuids
  }).then((res) => {
    // getFiles();
    emits('change');
  });
};

watch(
  () => document.value,
  (val) => {
    if (val && val.length) {
      upLoading.value = true;
      fadd({
        did: props.folder.id,
        apply_uuid: props.apply_uuid,
        files: document.value
      })
        .then((res) => {
          getFiles();
        })
        .finally((_) => {
          upLoading.value = false;
        });
    }
  }
);
// 暴露方法给父组件
defineExpose({
  getFiles
});
</script>
<style lang="less">
@import '@/styles/variables.less';
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
  .disabled {
    .name {
      opacity: 0.3;
    }
  }
}

.icon-ops {
  font-size: 10px;
  &:hover {
    opacity: 0.8;
  }
}

.archivedTitle {
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;

  .num {
    color: #b8cdcc;
    margin-left: 6px;
  }
  .iconfont {
    font-size: 6px;
    transition: transform .24s;
    color: @color_grey;
    &.active {
      transform: rotate(180deg);
      color: @color_coal;
    }
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
  
</style>
