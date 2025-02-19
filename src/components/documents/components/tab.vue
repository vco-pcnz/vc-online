<template>
  <div class="tab flex items-center justify-between">
    <ul class="flex">
      <li
        class="tab-item flex items-center"
        v-for="(item, index) in data"
        :key="index"
        :class="{ active: activeIndex === index, disabled: item.status == 0 }"
        @click="setIndex(index)"
      >
        <img class="icon" :src="item.icon" alt="" />
        <img class="icon icon2" :src="item.icon2" alt="" />
        {{ item.name }}
      </li>
    </ul>
    <div class="tab-item search" :class="{ active: showSearch }" @click="updateSearch">
      <i class="iconfont">&#xe731;</i>
      <span>{{ t('搜索') }}</span>
    </div>
  </div>

  <template v-if="showSearch">
    <div class="searchWraper">
      <div class="search-box">
        <div class="search-title">Search</div>
        <a-input class="search-input" v-model:value="keywords" v-focus="true" @input="search" placeholder="Search across the folder..." />
      </div>
      <a-spin :spinning="searchLoading" size="large">
        <div class="folderBox">
          <template v-for="files in folders" :key="files.id">
            <template v-if="files.show">
              <div class="folderPath">{{ getPath(files.id) }}</div>
              <div v-for="(item, index) in files.attach" :key="index" @click="toTarget(files.id)">
                <File :file="item" :tree="data" :apply_uuid="apply_uuid" :files="files" :folder="files" :edit="edit" :key="index" @update="search"></File>
              </div>
            </template>
          </template>
        </div>
      </a-spin>
    </div>
  </template>
</template>

<script scoped setup>
import { ref, watch,onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { getChild } from '@/api/project/annex';
import { cloneDeep } from 'lodash';
import File from './file.vue';

const { t } = useI18n();
const emits = defineEmits(['update:active', 'update:folder', 'update:showSearch']);

const props = defineProps({
  showSearch: {
    type: Boolean,
    default: false
  },
  active: {
    type: Number
  },
  data: {
    type: Array
  },
  apply_uuid: {
    type: String
  },
  folder: {
    type: Object
  },
  annex_id: {
    type: [String,Number]
  },
  edit: {
    type: Boolean,
    default: true
  }
});

const debounce = (func, wait) => {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
};

const activeIndex = ref(0);
const keywords = ref('');
const folders = ref([]);
const searchLoading = ref(false);

const setIndex = (index, obj) => {
  if (!props.data[index].status) return;
  activeIndex.value = index;
  let folders = obj ? obj : props.data[index].children ? props.data[index].children[0] : props.data[index];
  emits('update:folder', folders);
  emits('update:active', index);
  emits('update:showSearch', false);
};

const updateSearch = () => {
  keywords.value = '';
  folders.value = [];
  emits('update:active', 0);
  emits('update:showSearch', true);
};

const search = debounce(() => {
  searchLoading.value = true;
  getChild({ apply_uuid: props.apply_uuid, attach__name: keywords.value })
    .then((res) => {
      folders.value = res.data;
    })
    .finally(() => {
      searchLoading.value = false;
    });
}, 300);

// 用于存储结果的对象
const pathIndex = ref({});

// 递归遍历树形结构的函数
// const traverseTree(nodes, path = []) {
//   for (const node of nodes) {
//     // 更新当前节点的路径
//     const currentNodePath = [...path, node.id];
//     // 将当前节点的路径保存到结果对象中
//     pathIndex.value[node.id] = currentNodePath;
//     // 递归遍历子节点
//     if (node.children && node.children.length > 0) {
//       traverseTree(node.children, currentNodePath);
//     }
//   }
// }

const traverseTree = (nodes, path = []) => {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const currentIndexPath = [...path, i];
    pathIndex.value[node.id] = currentIndexPath;
    if (node.children && node.children.length > 0) {
      traverseTree(node.children, currentIndexPath);
    }
  }
};

const getPath = (id) => {
  let obj = cloneDeep(props.data);
  let nameStr = '';
  if (!pathIndex.value[id]) return '';
  pathIndex.value[id].map((item) => {
    obj = obj.children ? obj.children[item] : obj[item];
    nameStr += obj.name + '/';
  });
  return nameStr;
};

const toTarget = (id) => {
  let obj = cloneDeep(props.data);
  if (!pathIndex.value[id]) return '';
  pathIndex.value[id].map((item) => {
    obj = obj.children ? obj.children[item] : obj[item];
  });
  setIndex(pathIndex.value[id][0], obj);
};

onMounted(() => {
  toTarget(props.annex_id)
})

watch(
  () => props.active,
  (val) => {
    activeIndex.value = props.active;
  }
);
watch(
  () => props.data,
  (val) => {
    if (val) {
      // 调用函数遍历树形结构
      pathIndex.value = {};
      traverseTree(val);
    }
  },
  { immediate: true, deep: true }
);


// 暴露方法给父组件
defineExpose({
  toTarget
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

.searchWraper {
  border: 1px solid #e2e5e2;
  padding: 42px 34px;
  box-shadow: 2px 2px 4px 0 hsla(120, 5%, 89%, 0.15), 5px 5px 7px 0 hsla(0, 0%, 53%, 0.1);

  .search-box {
    min-height: auto;
    display: flex;
    align-items: center;

    .search-title {
      font-size: 24px;
      line-height: 1.2;
      font-weight: 500;
      margin-right: 15px;
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
  }

  .folderBox {
    margin-top: 15px;
    flex: 1;
    padding-right: 600px;
    min-height: 300px;
  }
}

.folderPath {
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
}
</style>
