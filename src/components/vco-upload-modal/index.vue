<template>
  <div>
    <div style="display: inline-block" @click="show">
      <slot>
        <a-button size="large" type="dark">
          {{ t('上传') }}
        </a-button>
      </slot>
    </div>
    <a-modal :width="800" v-if="open" :open="open" :title="t('上传')" @cancel="open = false">
      <a-tabs v-model:activeKey="activeKey" @change="searchHandle(false)">
        <a-tab-pane :key="1" :tab="t('图片')" v-if="!uploadType || uploadType == 1"> </a-tab-pane>
        <a-tab-pane :key="2" :tab="t('文件')" v-if="!uploadType || uploadType == 2"> </a-tab-pane>
        <a-tab-pane :key="3" :tab="t('视频')" v-if="!uploadType || uploadType == 3"></a-tab-pane>
      </a-tabs>
      <div class="fileType flex">
        <a-form-item-rest>
          <a-radio-group v-model:value="fileType">
            <a-radio-button value="list"><i class="iconfont">&#xe62e;</i></a-radio-button>
            <a-radio-button value="card"><i class="iconfont">&#xe60a;</i></a-radio-button>
          </a-radio-group>
        </a-form-item-rest>
        
        <div class="ml-2">
          <a-form-item-rest>
            <vco-upload
              :controller="controller"
              :params="params"
              :type="TYPE_TEXT[activeKey]"
              :showUploadList="false"
              :limit="limit"
              isMultiple
              v-model:list="documentList"
              ref="vcoUploadRef"
              listType="text"
              @change="updateNewFile"
            >
              <a-button type="brown">{{ t('上传') }}</a-button>
            </vco-upload>
          </a-form-item-rest>
        </div>
      </div>
      <div class="flex items-end justify-between mb-5">
        <div>
          <a-tag class="cusur" color="#f19915" v-if="checkedIds.length"
            >{{ t('已选择') }} {{ checkedIds.length }} <i class="iconfont close" @click="resetCheck">&#xe77b;</i></a-tag
          >
        </div>
        <vco-page-search>
          <vco-page-search-item :title="t('名称')" width="266">
            <a-input v-model:value="searchForm.name" :placeholder="t('请输入')" />
          </vco-page-search-item>
          <vco-page-search-item width="100%">
            <div class="flex items-center gap-2">
              <a-button type="dark" @click="searchHandle(false)"><i class="iconfont">&#xe756;</i>{{ t('搜索') }}</a-button>
              <a-button type="dark-line" @click="searchHandle(true)"><i class="iconfont">&#xe757;</i>{{ t('重置') }}</a-button>
            </div>
          </vco-page-search-item>
        </vco-page-search>
      </div>
      <!-- 新上传 -->
      <template v-if="Boolean(newFile && newFile.length) || upLoading">
        <div class="flex items-center">
          <h3 class="title">New files</h3>
          <p class="fs_xs color_grey ml-2">{{ t('需要点击选择已上传的文件进行上传') }}</p>
        </div>
        <a-spin :spinning="upLoading" size="large">
          <template v-if="Boolean(newFile && newFile.length)">
            <div :class="['file-' + fileType]">
              <div
                :class="['file-' + fileType + '-item', { checked: checkedIds.includes(item.uuid) }]"
                v-for="item in newFile"
                :key="item.uuid"
                @click="itemcheck(item)"
              >
                {{ item }}
                <vco-file-item :file="item" :type="fileType" :time="item.create_time"></vco-file-item>
                <div class="check-content"><i class="iconfont">&#xe647;</i></div>
              </div>
            </div>
          </template>
          <a-empty style="min-height: 192px;" v-else />
        </a-spin>
        <a-divider />
      </template>
      <!-- 上传历史 -->
      <a-spin :spinning="loading" size="large">
        <template v-if="Boolean(history && history.length)">
          <div class="flex items-center">
            <h3 class="title">History files</h3>
            <p class="fs_xs color_grey ml-2">{{ t('需要点击选择已上传的文件进行上传') }}</p>
          </div>
          <div :class="['file-' + fileType]">
            <div
              :class="['file-' + fileType + '-item', { checked: checkedIds.includes(item.uuid) }]"
              v-for="item in history"
              :key="item.uuid"
              @click="itemcheck(item)"
            >
              <vco-file-item :file="item" :type="fileType" :time="item.create_time"></vco-file-item>
              <div class="check-content"><i class="iconfont">&#xe647;</i></div>
            </div>
          </div>
          <a-pagination
            size="small"
            :total="total"
            :pageSize="pagination.limit"
            :current="pagination.page"
            show-quick-jumper
            :showSizeChanger="false"
            :show-total="(total) => t('共{0}条', [total])"
            @change="setPaginate"
          />
        </template>
        <a-empty v-else />
      </a-spin>

      <template #footer>
        <div class="modal-footer">
          <a-button @click="confirm" size="large" type="primary" style="width: 40%" :disabled="Boolean(!checkedIds.length)">
            {{ t('确认') }}
          </a-button>
        </div>
      </template>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, watch, h } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue';
import UploadBtn from './upload-btn.vue';
import { UploadOutlined } from '@ant-design/icons-vue';
import { attach } from '@/api/system';

const { t } = useI18n();

const props = defineProps({
  value: {
    type: [Array, String],
    required: false
  },
  list: {
    type: Array,
    required: false,
    default: []
  },
  controller: {
    type: String,
    default: '/upload'
  },
  // 后端要求携带的其他参数
  params: {
    type: Object,
    required: false,
    default: () => {
      return {};
    }
  },
  defaultUploadType: {
    type: Number,
    default: 1 //1 image,2 file,3 video
  },
  uploadType: {
    type: Number //1 image,2 file,3 video
  },
  limit: {
    type: Number,
    default: 99 //1 image,2 file,3 video
  },
  isAvatar: {
    type: Boolean,
    default: false //1 image,2 file,3 video
  }
});
const emits = defineEmits(['update:value', 'update:list', 'change']);

const loading = ref(false);
const upLoading = ref(false);

const vcoUploadRef = ref();
const open = ref(false);
const fileType = ref('card');
const activeKey = ref(1);
const history = ref([]);
const total = ref(0);
const checkedIds = ref([]);
const checkedList = ref([]);
const documentList = ref([]);
const newFile = ref([]);
const pagination = ref({
  page: 1,
  limit: 10
});
const searchForm = ref({
  name: ''
});

const TYPE_TEXT = ref({
  1: 'image',
  2: 'file',
  3: 'video'
});

const show = () => {
  activeKey.value = props.defaultUploadType;
  if (props.uploadType) activeKey.value = props.uploadType;
  documentList.value = [];
  newFile.value = [];
  checkedIds.value = [];
  checkedList.value = [];
  open.value = true;
  loadData();
};

// 搜索
const searchHandle = (flag) => {
  if (flag) {
    searchForm.value = {
      name: ''
    };
  }

  pagination.value.page = 1;
  loadData();
};

// 单个复选
const itemcheck = (item) => {
  let index = checkedIds.value.indexOf(item.uuid);
  if (index < 0) {
    if (checkedIds.value.length >= props.limit) {
      return message.error(t('数量不能超过{0}', [`${props.limit}`]));
    }
    checkedIds.value.push(item.uuid);
    checkedList.value.push(item);
  } else {
    checkedIds.value.splice(index, 1);
    checkedList.value.splice(index, 1);
  }
};

const resetCheck = () => {
  checkedIds.value = [];
  checkedList.value = [];
};

const setPaginate = (page, limit) => {
  pagination.value = {
    page,
    limit
  };
  loadData();
};

const loadData = () => {
  loading.value = true;
  attach({ ...pagination.value, ...searchForm.value, type: activeKey.value })
    .then((res) => {
      history.value = res.data;
      total.value = res.count;
    })
    .finally(() => {
      loading.value = false;
    });
};

const updateNewFile = () => {
  newFile.value = [...newFile.value, ...documentList.value];
  documentList.value.map((item) => {
    if (checkedIds.value.length >= props.limit) return;
    itemcheck(item);
  });
  vcoUploadRef.value.reset();
};

const confirm = () => {
  const list = [...props.list, ...checkedList.value];
  const isOneImg = props.uploadType == 1 && props.limit == 1 && props.isAvatar;
  if (isOneImg) {
    emits('update:value', checkedList.value[0].value);
  } else {
    emits('update:list', list);
  }
  emits('change', list);
  open.value = false;
};

watch(
  () => props.list,
  (val) => {
    if (props.uploadType == 1 && props.limit == 1) return;
    if (val) {
      const formData = val.map((item) => {
        return item.uuid;
      });
      emits('update:value', formData);
    } else {
      emits('update:value', []);
    }
  },
  {
    immediate: true,
    deep: true
  }
);
</script>

<style scoped lang="less">
@import '@/styles/variables.less';
.submit-btn:hover {
  color: @clr_white;
}

.modal-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 0;
}

.modal-content {
  height: 70vh;
  overflow-y: auto;
}

.file-card {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 4px;
  &-item {
    position: relative;
    display: inline-block;
    overflow: hidden;
    font-size: 0;
    border: 1px solid #fff;
    border-radius: 8px;
  }
}

.file-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 4px;
  :deep(.fileBox) {
    margin: 0px;
  }
  &-item {
    width: calc(50% - 8px);
    flex: 0 0 calc(50% - 8px);
    position: relative;
    overflow: hidden;
    font-size: 0;
    border: 1px solid #fff;
    border-radius: 8px;
  }
}

.checked {
  border: 1px solid #3fdea4;
  .check-content {
    opacity: 1;
  }
}
.check-content::after {
  z-index: -1;
  content: '';
  display: block;
  width: 40px;
  height: 40px;
  position: absolute;
  background-color: #3fdea4;
  transform: rotate(45deg);
  right: -20px;
  bottom: -20px;
}

.check-content {
  position: absolute;
  width: 40px;
  height: 40px;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  padding-top: 22px;
  padding-left: 22px;
  color: #fff;
  opacity: 0;
  transition: all 0.3s ease;
  .iconfont {
    font-size: 10px;
  }
}

.fileType {
  position: absolute;
  top: 60px;
  right: 25px;
}

.close {
  cursor: pointer;
  font-size: 10px;
}
.title {
  font-size: 16px;
  font-weight: 500;
  padding: 5px 0;
}

:deep(.ant-btn-brown) {
  color: #fff;
  background-color: #d8b480;
  display: flex;
  align-items: center;
}
</style>
