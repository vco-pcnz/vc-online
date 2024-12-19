<template>
  <div class="vco-choose-user">
    <div class="vco-choose-user-search">
      <slot>
        <template v-if="showRest">
          <div class="flex justify-between align-center checkedData">
            <div>
              <span>{{ t('已选择') }}: </span>{{ checkedData.user_name || checkedData.name }}
            </div>
            <i class="iconfont" style="cursor: pointer" @click="rest()">&#xe77b;</i>
          </div>
        </template>
        <template v-else>
          <vco-type-input v-model="searchForm.keywords" v-model:type="searchForm.key" :type-data="keys" style="flex: 1" :placeholder="t('请输入')"></vco-type-input>
          <i class="iconfont" style="cursor: pointer" @click="searchHandle()"> &#xe756; </i>
        </template>
      </slot>
    </div>
    <div id="vco-choose-user-model"></div>
    <!-- <a-modal :width="900" v-if="open" :open="open" :title="t('搜索用户')" :getContainer="getContainer" @cancel="close"> -->
    <a-modal :width="900" v-if="open" :open="open" :title="t('搜索用户')" @cancel="close">
      <!-- 搜索 -->
      <div class="flex justify-end mb-5">
        <vco-page-search>
          <vco-page-search-item title="" width="300">
            <vco-type-input
              v-model="searchForm.keywords"
              v-model:type="searchForm.key"
              :type-data="keys"
              :placeholder="t('请输入')"
            ></vco-type-input>
          </vco-page-search-item>
          <vco-page-search-item width="100%">
            <div class="flex items-center gap-2">
              <a-button type="dark" @click="searchHandle(false)"><i class="iconfont">&#xe756;</i>{{ t('搜索') }}</a-button>
              <a-button type="dark-line" @click="searchHandle(true)"><i class="iconfont">&#xe757;</i>{{ t('重置') }}</a-button>
            </div>
          </vco-page-search-item>
        </vco-page-search>
      </div>
      
      <!-- <div class="sys-form-content" style="margin: 10px 0 15px">
        <div class="vco-choose-user-search" style="padding-left: 60%">
          <vco-type-input v-model="searchForm.keywords" v-model:type="searchForm.key" :type-data="keys" style="flex: 1" :placeholder="t('请输入')"></vco-type-input>
          <i class="iconfont" style="cursor: pointer" @click="rest()" v-if="showRest">&#xe77b;</i>
          <i v-else class="iconfont" style="cursor: pointer" @click="searchHandle()"> &#xe756; </i>
        </div>
      </div> -->
      <a-spin :spinning="loading" size="large">
        <TableBlock :isMultiple="isMultiple" :table-data="tableData" :url="url" v-model:list="checkedList" v-model:ids="checkedIds" v-model:data="checkedData" wrapClassName="vco-choose-user-modal" @change="change"></TableBlock>
      </a-spin>
      <template #footer>
        <div class="modal-footer">
          <div>
            <a-button
              v-if="isMultiple"
              type="primary"
              :disabled="!checkedIds.length"
              @click="handlePathChange"
            >{{ t('选择') }}</a-button>
          </div>
          <a-pagination v-if="count" size="small" :total="count" :pageSize="pagination.limit" :current="pagination.page" show-quick-jumper :show-total="(total) => t('共{0}条', [total])" @change="setPaginate" />
        </div>
      </template>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue';
import TableBlock from './components/TableBlock.vue';
import { cloneDeep } from 'lodash';
import { request } from '@/utils/request';

const { t } = useI18n();

const props = defineProps({
  url: {
    type: String,
    default: 'user/selUser'
  },
  list: {
    type: Array
  },
  ids: {
    type: Array
  },
  data: {
    type: Object
  },
  isMultiple: {
    type: Boolean,
    default: false
  },
  showRest: {
    type: Boolean,
    default: false
  },
  roleCode: {
    type: String,
    default: ''
  },
});
const open = ref(false);
const loading = ref(false);
const tableData = ref([]);
const count = ref(0);

const checkedList = ref([]);
const checkedIds = ref([]);
const checkedData = ref([]);

const keys = ref([
  {
    label: t('全部'),
    value: 'all'
  },
  {
    label: t('名称'),
    value: 'name'
  },
  {
    label: t('邮箱'),
    value: 'email'
  },
  {
    label: t('电话'),
    value: 'mobile'
  },
  {
    label: t('Id编码'),
    value: 'code'
  },
  {
    label: t('用户Id'),
    value: 'userId'
  }
]);
const searchForm = ref({
  key: 'all',
  keywords: ''
});
const pagination = ref({
  page: 1,
  limit: 5
});
const emits = defineEmits(['update:list', 'update:ids', 'update:data', 'change', 'done']);
const getContainer = () => {
  // 返回自定义容器的 DOM 元素
  return document.getElementById('vco-choose-user-model');
};

// 搜索
const searchHandle = (flag) => {
  if (flag) {
    searchForm.value = {
      key: 'all',
      keywords: ''
    }
  }

  pagination.value.page = 1;
  lodaData();
  open.value = true;
};

const close = () => {
  searchForm.value = {
    key: 'all',
    keywords: ''
  };
  pagination.value.page = 1;
  tableData.value = [];
  count.value = 0
  open.value = false;
};

// 加载数据
const lodaData = () => {
  loading.value = true;

  request({
    url: props.url,
    method: 'get',
    params: { ...searchForm.value, ...pagination.value, ...{role_code: props.roleCode} }
  })
    .then((res) => {
      tableData.value = res.data;
      count.value = res.count;
      loading.value = false;
    })
    .catch((e) => {
      loading.value = false;
    });
};

// 分页加载
const setPaginate = (page, limit) => {
  pagination.value = {
    page,
    limit
  };
  lodaData();
};

const handlePathChange = () => {
  emits('update:list', checkedList.value);
  emits('update:ids', checkedIds.value);
  emits('change', checkedIds.value);

  emits('done', checkedList.value)
  close();
};
const change = () => {
  if (!props.isMultiple) {
    emits('update:data', checkedData.value);
    emits('change', checkedData.value);

    emits('done', [checkedData.value])
    close();
  }
};

const rest = () => {
  Object.keys(checkedData.value).forEach((key) => {
    checkedData.value[key] = '';
  });
  change();
};

const init = (parameters) => {
  if (parameters) {
    searchForm.value = cloneDeep(parameters);
  }
  open.value = true;
  searchHandle()
};
// 暴露方法给父组件
defineExpose({
  init
});
</script>

<style lang="less">
@import '@/styles/variables.less';
.vco-choose-user {
  .vco-choose-user-search {
    display: flex;
    align-items: center;
    gap: 15px;
  }
}

.checkedData {
  width: 100%;
  line-height: 50px;
  padding: 0 10px;
  border-radius: 8px;
  background-color: #f7f0e6;
  .iconfont {
    font-size: 12px;
    color: @colorPrimary;
    &:hover {
      opacity: 0.8;
    }
  }
}
</style>
