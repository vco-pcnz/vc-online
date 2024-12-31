<template>
  <detail-layout :title="baseInfo.name" active-tab="documents">
    <template #content>
      <div class="tab flex items-center justify-between">
        <ul class="flex">
          <li class="tab-item flex items-center" v-for="(item, index) in tabs" :key="index" :class="{ active: active == index }">
            <i class="iconfont" v-if="Number(index === 0)">&#xe72b;</i>
            <i class="iconfont" v-if="Number(index === 1)">&#xe779;</i>
            <i class="iconfont" v-if="Number(index === 2)">&#xe787;</i>
            <i class="iconfont" v-if="Number(index === 3)">&#xe758;</i>
            <i class="iconfont" v-if="Number(index === 4)">&#xe771;</i>
            <i class="iconfont" v-if="Number(index === 5)">&#xe785;</i>
            {{ item.label }}
          </li>
        </ul>
        <i class="iconfont search">&#xe731;</i>
      </div>

      <div class="content">
        <div class="folder">
          <div class="folder-item">
            <div class=""><span>1.1</span><span>General</span><span>・0</span></div>
          </div>
        </div>
        <div class="files">
          <div class="flex items-center justify-between">
            <h3 class="files-title">AML documents/ General</h3>
            <div class="files-ops">
              <div class="files-ops-item" :class="{'active':showSearch}" @click="showSearch = !showSearch"><i class="iconfont">&#xe756;</i></div>

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
            <a-input class="search" v-model:value="keywords" placeholder="Search across the folder..." v-if="showSearch" />
            <vco-file-item :showClose="true" :file="item" v-for="(item, index) in files" :key="index"></vco-file-item>
          </div>
        </div>
      </div>
    </template>
  </detail-layout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import detailLayout from '../components/detailLayout.vue';

const { t } = useI18n();

const baseInfo = ref({
  id: 1614,
  name: 'test1212',
  purpose: ['Construction'],
  background: 'xxx'
});

const showSearch = ref(false)
const keywords = ref('')
const active = ref(0);
const documentList = ref([]);
const document = ref([]);
const tabs = ref([
  {
    label: 'AML documents'
  },
  {
    label: 'Proposal'
  },
  {
    label: 'Legal docs'
  },
  {
    label: 'Drawdowns'
  },
  {
    label: 'Project files'
  },
  {
    label: 'Chat files'
  }
]);

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

onMounted(() => {
  sortSelect.value = sortsList.value[0];
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
    .iconfont {
      font-size: 20px;
      font-weight: normal;
    }
    &.active {
      background-color: @color_variation;
    }
    &:hover {
      color: @color_brown;
    }
  }

  .search {
    cursor: pointer;
    &:hover {
      color: @color_brown;
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
  .folder {
    background-color: #f7f9f8;
    border-radius: 10px;
    padding-bottom: 32px;
    padding-top: 32px;
    &-item {
      background-color: #eef1f1;
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
        &:hover,&.active {
          background-color: #f7f9f8;
          color: #181818;
          border-radius: 6px;
        }
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

.search {
  margin: 10px 0;
  background-color: #f7f9f8;
  border: none;
  outline: none;
  box-shadow: none;

  padding: 13.7px 11px;
}
</style>
