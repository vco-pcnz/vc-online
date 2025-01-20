<template>
  <div class="files">
    <div class="flex items-center justify-between">
      <h3 class="files-title">
        <template v-if="isTab"> {{ folder.attach_count }} {{ tabName }}</template>
        <template v-else> {{ tabName }}/ {{ folder.name }}</template>
      </h3>
      <div class="files-ops">
        <div class="files-ops-item" :class="{ active: showFilter }" @click="setShowFilter"><i class="iconfont">&#xe756;</i></div>

        <vco-upload-modal v-model:value="document" v-model:list="upDocument">
          <a-spin :spinning="upLoading">
            <div class="files-ops-item"><i class="iconfont">&#xe734;</i></div>
          </a-spin>
        </vco-upload-modal>

        <div class="files-ops-item">
          <i
            class="iconfont"
            :class="{ asc: !isDefault }"
            @click="
              isDefault = !isDefault;
              getFiles();
            "
            >&#xe74d;</i
          >
        </div>
        <a-dropdown class="Filter" trigger="click">
          <div class="files-ops-item">
            <i class="iconfont">&#xe772;</i>Sort by:<span class="lowercase">{{ sortSelect.name }}</span>
          </div>
          <template #overlay>
            <ul class="opFileList">
              <li
                class="opFileList-item"
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
        <div :class="{ row2: isTab, row1: !isTab }">
          <template v-for="files in documentList" :key="files.id">
            <template v-if="files.id !== folder.id && files.show">
              <div class="archivedTitle">{{ files.name }}</div>
              <p class="color_grey fs_xs">{{ files.note }}</p>
            </template>
            <div class="row">
              <template v-if="files.show">
                <File
                  :file="item"
                  :tree="tree"
                  :apply_uuid="apply_uuid"
                  :filter="filter"
                  :files="files"
                  :showClose="true"
                  :folder="folder"
                  v-for="(item, index) in files.attach"
                  :key="index"
                  @reload="reload"
                  @update="getFiles"
                ></File>
              </template>
            </div>

            <template v-if="!files.show">
              <div class="archivedTitle" @click="showArchived = !showArchived">
                Archived documents <span class="num">{{ files.attach.length }}</span>
                <i class="iconfont" :class="{ active: showArchived }">&#xe778;</i>
              </div>
              <div class="row">
                <template v-if="showArchived">
                  <File
                    :file="item"
                    :tree="tree"
                    :apply_uuid="apply_uuid"
                    :filter="filter"
                    :folder="folder"
                    :files="files"
                    v-for="(item, index) in files.attach"
                    :key="index"
                    @reload="reload"
                    @update="getFiles"
                  ></File>
                </template>
              </div>
            </template>
          </template>
        </div>
      </a-spin>
    </div>
  </div>
</template>

<script scoped setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { getChild, fadd, fdel, fmove } from '@/api/project/annex';
import File from './file.vue';

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
  },
  isTab: {
    type: Boolean,
    default: false
  }
});

const documentList = ref([]);
const showFilter = ref(false);
const spinning = ref(false);
const upLoading = ref(false);
const filter = ref('');
const document = ref([]);
const upDocument = ref([]);
const showArchived = ref(true);

const sortsList = ref([
  { name: 'Date', id: 'create_time' },
  { name: 'Name', id: 'name' },
  { name: 'Size', id: 'att_size' }
]);

const isDefault = ref(false);
const sortSelect = ref({ name: 'Date', id: 'create_time' });
const changeSort = (val) => {
  sortSelect.value = val;
  getFiles();
};

const setShowFilter = () => {
  showFilter.value = !showFilter.value;
};

const getFiles = () => {
  let params = { apply_uuid: props.apply_uuid };
  if (!isDefault.value) {
    params['__sort__asc'] = sortSelect.value.id;
  } else {
    params['__sort__desc'] = sortSelect.value.id;
  }
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

const reload = () => {
  emits('change');
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
          emits('change');
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
<style scoped lang="less">
@import '@/styles/variables.less';
.files {
  padding: 32px 24px;
  &-title {
    font-weight: 500;
    font-size: 24px;
    line-height: 1.2;
    max-width: calc(100% - 250px);
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

      .iconfont {
        transition: all 0.3s ease;
        &.asc {
          transform: rotateX(180deg);
        }
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
    transition: transform 0.24s;
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

.row1 {
  min-height: 400px;
  width: 400px;
}
.row2 {
  .row {
    display: flex;
    flex-wrap: wrap;
    // .fileBox {
    //   flex: 0 0 50%;
    // }
  }
}
</style>
