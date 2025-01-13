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
      <div class="flex items-end justify-between mb-5">
        <div>
          <a-radio-group v-model:value="type">
            <a-radio-button value="list"><i class="iconfont">&#xe62e;</i></a-radio-button>
            <a-radio-button value="card"><i class="iconfont">&#xe60a;</i></a-radio-button>
          </a-radio-group>
          <a-button type="dark" class="ml-5">
            {{ t('上传') }}
          </a-button>
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

      <div :class="['file-' + type]">
        <div :class="['file-' + type + '-item', { checked: true }]" v-for="item in history" :key="item">
          <vco-file-item :file="item" :type="type" :time="item.create_time"></vco-file-item>
          <div class="check-content"><i class="iconfont">&#xe647;</i></div>
        </div>
      </div>

      <a-pagination
        size="small"
        :total="total"
        :pageSize="pagination.limit"
        :current="pagination.page"
        show-quick-jumper
        :show-total="(total) => t('共{0}条', [total])"
        @change="setPaginate"
      />
      <template #footer>
        <div class="modal-footer">
          <a-button @click="confirm" size="large" type="primary" style="width: 40%">
            {{ t('确认') }}
          </a-button>
        </div>
      </template>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue';

const { t } = useI18n();

const props = defineProps({
  value: {
    type: Array,
    required: false
  },
  list: {
    type: Array,
    required: false
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
  }
});
const emits = defineEmits(['update:value', 'update:list', 'change']);
const open = ref(true);
const activeKey = ref('1');
const images = ref([]);
const files = ref([]);
const videos = ref([]);

const show = () => {
  activeKey.value = '1';
  images.value = [];
  files.value = [];
  videos.value = [];
  open.value = true;
};

const type = ref('card');
const history = ref([]);
history.value = [
  {
    uuid: 'b0df6d9e-e6e8-475d-b1fd-2865a03430ec',
    type: 1,
    name: 'shield-check-second (2).png',
    att_dir: 'http:\/\/vco.com\/uploads\/images\/project\/20250107\/37a125fb8e510388269.png',
    att_size: 1247,
    create_time: '2025-01-07 23:50:49',
    origin: 2,
    user_name: 'liu  zhang'
  },
  {
    uuid: '4788f05f-4429-4007-b3e7-27318ad1a12e',
    type: 1,
    name: 'shield-check-second (3).png',
    att_dir: 'http:\/\/vco.com\/uploads\/images\/project\/20250107\/acc1f7eb874b7d5a200.png',
    att_size: 1160,
    create_time: '2025-01-07 23:50:49',
    origin: 2,
    user_name: 'liu  zhang'
  },
  {
    uuid: '3af1147a-e735-4982-a752-d7853dd666f1',
    type: 1,
    name: 'shield-check-second (1).png',
    att_dir: 'http:\/\/vco.com\/uploads\/images\/project\/20250107\/520f6ed3ef1e686a710.png',
    att_size: 4331,
    create_time: '2025-01-07 23:50:49',
    origin: 2,
    user_name: 'liu  zhang'
  },
  {
    uuid: '15ec9146-bed6-4c18-abcb-0c853b33656f',
    type: 1,
    name: 'shield-check-second.png',
    att_dir: 'http:\/\/vco.com\/uploads\/images\/project\/20250107\/668ee665682a2656580.png',
    att_size: 4132,
    create_time: '2025-01-07 23:50:49',
    origin: 2,
    user_name: 'liu  zhang'
  },
  {
    uuid: '1d01fe86-971e-4c24-8845-59f9dbb3d891',
    type: 2,
    name: 'clyde-forecast-drawdown-report_2024-12-30-2025-01-05 (1).xlsx',
    att_dir: 'http:\/\/vco.com\/uploads\/images\/project\/20250107\/2216ce5737dd5412612.xlsx',
    att_size: 16913,
    create_time: '2025-01-07 23:50:57',
    origin: 2,
    user_name: 'liu  zhang'
  },
  {
    uuid: '00d624cd-6909-4c62-a0f2-345a1938ecdc',
    type: 2,
    name: 'clyde-forecast-drawdown-report_2024-12-30-2025-01-05.xlsx',
    att_dir: 'http:\/\/vco.com\/uploads\/images\/project\/20250107\/357500aaf0842532548.xlsx',
    att_size: 16913,
    create_time: '2025-01-07 23:50:57',
    origin: 2,
    user_name: 'liu  zhang'
  },
  {
    uuid: '6ae861bb-cef1-47f1-ba01-2ca6b76a464f',
    type: 3,
    name: '\u6d4b\u8bd5\u89c6\u9891.mp4',
    att_dir: 'http:\/\/vco.com\/uploads\/images\/project\/20250109\/87a09e0fc7a2b3a1112.mp4',
    att_size: 15458651,
    create_time: '2025-01-09 16:38:08',
    origin: 2,
    user_name: 'liu  zhang'
  }
];

const total = ref(0);
const pagination = ref({
  page: 1,
  limit: 10
});
const searchForm = ref({
  name: ''
});

// 搜索
const searchHandle = (flag) => {
  if (flag) {
    searchForm.value = {
      name: ''
    }
  }

  pagination.value.page = 1;
  lodaData();
};

const setPaginate = (page, limit) => {
  pagination.value = {
    page,
    limit
  };
  loadData();
};

const loadData = ()=>{
  
}

const confirm = () => {
  const list = [...props.list, ...images.value, ...files.value, ...videos.value];
  emits('update:list', list);
  emits('change', list);
  open.value = false;
};

watch(
  () => props.list,
  (val) => {
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
.ant-tabs-tabpane {
  padding: 24px 0;
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
  content: '';
  display: block;
  width: 40px;
  height: 40px;
  position: absolute;
  background-color: #3fdea4;
  z-index: -1;
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
</style>
