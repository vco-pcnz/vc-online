<template>
  <vco-file-item
    :showClose="files.show"
    :filter="filter"
    :file="file"
    :time="file.create_time"
    :key="index"
    iconColor="#bf9425"
    :showDownload="true"
    @remove="remove(file)"
  >
    <template #ops v-if="files.show">
      <a-dropdown trigger="click" @click.stop>
        <a class="ant-dropdown-link" @click.prevent>
          <i class="iconfont icon-ops">&#xe77f;</i>
        </a>
        <template #overlay>
          <ul class="opFileList">
            <li class="opFileList-item" @click="updateVisibleRename()">Rename</li>
            <li class="opFileList-item">Copy to...</li>
            <a-dropdown class="Filter" trigger="hover" v-for="(tabItem, index) in tree" :key="tabItem.id" placement="right">
              <li class="opFileList-item" :class="{ disabled: tabItem.status == 0 }">
                <span class="index">{{ index + 1 }}</span>
                <span class="name">{{ tabItem.name }}</span>
                <i class="iconfont" v-if="tabItem.children && tabItem.children.length">&#xe791;</i>
              </li>
              <template #overlay v-if="tabItem.children && tabItem.children.length">
                <ul class="opFileList">
                  <li class="opFileList-item" v-for="(sub, subIndex) in tabItem.children" @click="move(files.id, sub.id, [item.uuid])" :key="sub.id">
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
    <template #ops v-else>
      <a-dropdown trigger="click">
        <a class="ant-dropdown-link" @click.prevent>
          <i class="iconfont icon-ops">&#xe77f;</i>
        </a>
        <template #overlay>
          <ul class="opFileList">
            <li class="opFileList-item" @click="move(files.id, folder.id, [file.uuid])">Unarchive</li>
          </ul>
        </template>
      </a-dropdown>
    </template>
  </vco-file-item>
  <RenameModel @click.stop :formParams="formParams" v-model:visible="visibleRename" @change="update"></RenameModel>
</template>

<script scoped setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { getChild, fadd, fdel, fmove } from '@/api/project/annex';
import RenameModel from './rename.vue';

const { t } = useI18n();
const emits = defineEmits(['update', 'reload']);

const props = defineProps({
  file: {
    type: Object
  },
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
  filter: {
    type: String
  },
  files: {
    type: Object
  }
});

const visibleRename = ref(false);
const removeLoading = ref(false);
const filter = ref('');

const formParams = ref(null);
const updateVisibleRename = () => {
  formParams.value = {
    did: props.folder.id,
    apply_uuid: props.apply_uuid,
    uuid: props.file.uuid,
    name: props.file.name
  };
  visibleRename.value = true;
};

const remove = () => {
  removeLoading.value = true;
  fdel({
    did: props.folder.id,
    apply_uuid: props.apply_uuid,
    uuids: [props.file.uuid]
  })
    .then((res) => {
      emits('reload');
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
    emits('reload');
  });
};

const update = () => {
  emits('update');
};
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
  padding-right: 400px;
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
