<template>
  <div class="search-content">
    <date-picker v-if="searchConfig.includes('Date')" :data="searchForm.date" @change="change" />
    <range-picker v-if="searchConfig.includes('Time')" :data="[searchForm.start_date, searchForm.end_date]" @change="change" />
    <select-state v-if="searchConfig.includes('State')" :data="searchForm.search" :open_hidden="open_hidden" @change="changeLm" />
    <select-type v-if="searchConfig.includes('Type')" :data="searchForm.type" @change="change" />
    <select-lm v-if="searchConfig.includes('LM')" @change="changeLm" />
    <select-project v-if="searchConfig.includes('Project')" ref="selectProjectRef" @change="change" />

    <a-button type="cyan" class="ml-3" @click="report" :loading="downloading" v-if="downloadUrl">
      <i class="iconfont">&#xe780;</i>
      {{ t('创建报告') }}
    </a-button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import DatePicker from './DatePicker.vue';
import RangePicker from './RangePicker.vue';
import SelectLm from './SelectLm.vue';
import SelectState from './SelectState.vue';
import SelectType from './SelectType.vue';
import SelectProject from './SelectProject.vue';
import { request } from '@/utils/request';

const { t } = useI18n();
const emits = defineEmits(['change']);

const props = defineProps({
  value: {
    type: Object
  },
  searchConfig: {
    type: Array
  },
  downloadUrl: {
    type: String
  },
  open_hidden: {
    type: Boolean,
    default: false
  }
});

const searchForm = ref({
  start_date: '',
  end_date: '',
  cycle: '',
  date: '',
  lm_uuids: '',
  project_uuids: '',
  type: '',
  search: ''
});

const downloading = ref(false);
const report = () => {
  downloading.value = true;

  const url = props.downloadUrl;
  const paramsInfo = {
    url,
    method: 'get',
    params: searchForm.value
  };

  request(paramsInfo)
    .then((res) => {
      window.open(res);
      downloading.value = false;
    })
    .catch((e) => {
      downloading.value = false;
    });
};

const selectProjectRef = ref();
const changeLm = (val) => {
  if (props.searchConfig.includes('Project')) {
    searchForm.value.project_uuids = '';
    searchForm.value = { ...searchForm.value, ...val };
    emits('change', searchForm.value);
    selectProjectRef.value.init({ lm_uuids: searchForm.value.lm_uuids, search: searchForm.value.search });
  } else {
    change(val);
  }
};

const change = (val) => {
  if (val) {
    searchForm.value = { ...searchForm.value, ...val };
  }
  emits('change', searchForm.value);
};

watch(
  () => props.value,
  (val) => {
    if (val) {
      Object.assign(searchForm.value, props.value);
    }
  },
  { deep: true, immediate: true }
);
</script>
<style lang="less" scoped>
.search-content {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  > p {
    margin-bottom: 5px;
    height: 21px;
    line-height: 21px;
    color: #888;
    font-size: 13px;
  }
  :deep(.ant-select) {
    width: 100%;
  }

  :deep(.ant-select-selector) {
    box-shadow: none !important;
  }

  :deep(.ant-input),
  :deep(.ant-picker),
  :deep(.ant-input-number),
  :deep(.ant-select-selector) {
    border-color: #000 !important;
  }
  :deep(.ant-select-arrow) {
    color: #000 !important;
  }
  :deep(.ant-input:focus),
  :deep(.ant-input-number-focused),
  :deep(.ant-picker-focused),
  :deep(.ant-select-open) .ant-select-selector {
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1) !important;
  }
  :deep(.ant-picker-active-bar) {
    background-color: #000;
  }
  :deep(.ant-btn) {
    .iconfont {
      font-size: 14px;
      margin-right: 5px;
    }
  }
  :deep(.ant-select-multiple) .ant-select-selection-overflow-item {
    max-width: calc(100% - 68px);
    padding-right: 4px;
  }

  :deep(.input-label) {
    width: 50px;
    position: relative;
    text-align: center;
    z-index: 1;
    padding: 0;
    margin-right: -4px;
    border-right: 1px solid #000 !important;
    border-top-right-radius: 0 !important;
    border-bottom-right-radius: 0 !important;
  }
}
</style>
