<template>
  <ul class="opFileList">
    <slot></slot>
    <a-dropdown class="Filter" trigger="hover" v-for="(item, index) in data" :key="item.id" placement="right">
      <li class="opFileList-item" :class="{ disabled: item.status == 0 }" @click="move(item.id, item.status == 0)" :key="item.id">
        <span class="index">{{ index + 1 }}</span>
        <span class="name">{{ item.name }}</span>
        <i class="iconfont" v-if="item.children && item.children.length && item.status !== 0">&#xe791;</i>
      </li>
      <template #overlay v-if="item.children && item.children.length && item.status !== 0">
        <FoldersDropdown :did="did" :apply_uuid="apply_uuid" :uuids="uuids" :data="item.children" @reload="reload"></FoldersDropdown>
      </template>
    </a-dropdown>
  </ul>
</template>

<script scoped setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import FoldersDropdown from './foldersDropdown.vue';
import { fcopy } from '@/api/project/annex';

const { t } = useI18n();
const emits = defineEmits(['reload']);

const props = defineProps({
  did: {
    type: Number
  },
  apply_uuid: {
    type: String
  },
  uuids: {
    type: Array,
    default: []
  },
  data: {
    type: Array,
    default: []
  }
});

const move = (target, type) => {
  if (type) return;
  fcopy({
    did: props.did,
    nid: target,
    apply_uuid: props.apply_uuid,
    uuids: props.uuids
  }).then((res) => {
    emits('reload');
  });
};

const reload = () => {
  emits('reload');
};
</script>
<style scoped lang="less">
@import '@/styles/variables.less';

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
</style>
