<template>
  <div class="folder">
    <a-button class="add uppercase" type="brown" shape="round" size="small" @click="updateAddModel('0')">{{ t('添加') }}</a-button>
    <a-tree
      :show-line="true"
      show-icon
      :tree-data="data"
      @select="onSelect"
      :fieldNames="{ children: 'children', title: 'name', key: 'id' }"
      v-model:expandedKeys="expandedKeys"
    >
      <template #title="item">
        <div class="folder-item" :class="{ select: folder && item.id == folder.id }">
          <div>
            <!-- <span class="serial-number">{{ tabIndex + 1 }}.{{ index + 1 }}</span> -->
            <span class="name">{{ item.name }}</span>
            <span class="num">・{{ item.attach_count }}</span>
          </div>
          <div>
            <i class="iconfont mr-2" @click.stop="updateAddModel('0', item)">&#xe790;</i>
            <i class="iconfont mr-2" @click.stop="updateAddModel(item.id, item)">&#xe8cf;</i>
            <a-popconfirm title="Are you sure delete this task?" ok-text="Yes" cancel-text="No" @confirm="remove(item.id, index)">
              <a href="#" @click.stop class="iconfont">&#xe8c1;</a>
            </a-popconfirm>
          </div>
        </div>
      </template>
      <template #icon="{ expanded }">
        <FolderOpenOutlined v-if="expanded" />
        <FolderOutlined v-else />
        <!-- <FolderOutlined v-if="!expanded && !data.children" /> -->
      </template>
      <!-- <template #switcherIcon="{ expanded }">
        <FolderOpenOutlined v-if="expanded" />
        <FolderOutlined v-else />
      </template> -->
    </a-tree>
    <Add :formParams="formParams" v-model:visible="visibleAdd" @change="change(selectFolder)"></Add>
  </div>
</template>

<script scoped setup>
import { nextTick, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { annexRemove } from '@/api/project/annex';
import Add from './add.vue';
import { cloneDeep } from 'lodash';
import { FolderOutlined, FolderOpenOutlined } from '@ant-design/icons-vue';

const { t } = useI18n();
const emits = defineEmits(['update:folder', 'change']);

const props = defineProps({
  active: {
    type: Number
  },
  data: {
    type: Array,
    default: false
  },
  folder: {
    type: Object
  },
  apply_uuid: {
    type: String
  },
  pid: {
    type: Number
  }
});

const visibleAdd = ref(false);
const formParams = ref();
const selectFolder = ref();
const expandedKeys = ref();

const onSelect = (selectedKeys, e) => {
  emits('update:folder', e.node.dataRef);
};

const updateAddModel = (id, item) => {
  formParams.value = {
    id: id,
    pid: item ? (id == '0' ? item.id : item.pid) : props.pid,
    apply_uuid: props.apply_uuid,
    name: id == '0' ? '' : item.name
  };
  visibleAdd.value = true;
};

const change = (val) => {
  emits('change', val);
};

const remove = (id) => {
  annexRemove({ id }).then((res) => {
    if (selectFolder.value.id == id) {
      change(null);
    } else {
      change(selectFolder.value);
    }
  });
};
watch(
  () => props.folder,
  (val) => {
    selectFolder.value = cloneDeep(props.folder);
    nextTick(() => {
      // expandedKeys.value = [selectFolder.value.id]
      // console.log(expandedKeys.value)
      
    })
  }
);
</script>
<style lang="less">
@import '@/styles/variables.less';
.folder {
  background-color: #f7f9f8;
  border-radius: 10px;
  padding-bottom: 32px;
  padding-top: 50px;
  position: relative;
  &-item {
    &.select {
      &::before {
        display: inline-block;
        content: '';
        position: absolute;
        inset: 0;
        background-color: hsla(35, 53%, 67%, 0.2);
        border-radius: 6px;
      }
    }
    > div {
      display: flex;
    }
    .name {
      white-space: nowrap; /* 禁止换行 */
      overflow: hidden; /* 隐藏溢出内容 */
      text-overflow: ellipsis; /* 使用省略号表示溢出内容 */
      display: inline-block;
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
      position: relative;
      z-index: 1;
    }

    .iconfont {
      font-size: 12px;
      display: none;
      color: @color_brown;
      position: relative;
      z-index: 1;
    }
  }
  .add {
    position: absolute;
    right: 10px;
    top: 15px;
  }
}

.ant-tree {
  background: transparent;
  .ant-tree-treenode {
    width: 100%;
  }
  .ant-tree-checkbox + span.ant-tree-node-selected {
    background-color: hsla(35, 53%, 67%, 0.2);
  }
  .ant-tree-node-content-wrapper {
    display: flex;
    align-items: center;
    cursor: pointer;
    display: flex;
    font-weight: 600;
    align-items: center;
    min-height: 40px;
    text-align: left;
    transition: background-color 0.2s cubic-bezier(0.215, 0.61, 0.355, 1);
    width: 100%;
    padding: 0;
    padding-right: 10px;
    .folder-item {
      flex: 1;
      display: flex;
      justify-content: space-between;
    }
    .ant-tree-title {
      flex: 1;
    }
    &:hover {
      .iconfont {
        display: inline-block !important;
      }
    }
  }

  .ant-tree-node-content-wrapper.ant-tree-node-selected,
  .ant-tree-checkbox + span.ant-tree-node-selected {
    background: transparent;
  }
  .ant-tree-switcher-noop {
    display: none !important;
  }
  .ant-tree-switcher {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
  }

  .ant-tree-node-content-wrapper-normal {
    .folder-item {
      padding-left: 6px;
    }
  }
}
</style>
