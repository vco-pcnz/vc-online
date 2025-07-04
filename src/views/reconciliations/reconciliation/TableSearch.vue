<template>
  <vco-page-search @keyup.enter="searchHandle(false)">
    <div style="flex: 1"></div>
    <vco-page-search-item width="100" :title="t('项目Open')">
      <a-select :placeholder="t('请选择')" v-model:value="searchForm.is_open">
        <a-select-option v-for="item in openData" :key="item.value" :value="item.value">
          {{ item.label }}
        </a-select-option>
      </a-select>
    </vco-page-search-item>
    <vco-page-search-item width="100" :title="t('类型')">
      <a-select :placeholder="t('请选择')" v-model:value="searchForm.type">
        <a-select-option v-for="item in typeData" :key="item.value" :value="item.value">
          {{ item.label }}
        </a-select-option>
      </a-select>
    </vco-page-search-item>
    <vco-page-search-item width="120" :title="t('匹配')">
      <a-select :placeholder="t('请选择')" v-model:value="match" allowClear>
        <a-select-option v-for="item in matchData" :key="item.value" :value="item.value">
          {{ item.label }}
        </a-select-option>
      </a-select>
    </vco-page-search-item>
    <vco-page-search-item :title="t('日期')" width="277">
      <div v-if="!exadtDate" class="flex items-center gap-2">
        <a-date-picker v-model:value="searchForm.start_date" valueFormat="YYYY-MM-DD" :format="selectDateFormat()" :placeholder="t('开放日期')" @change="searchForm.end_date = ''" />
        <p>-</p>
        <a-date-picker v-model:value="searchForm.end_date" valueFormat="YYYY-MM-DD" :format="selectDateFormat()" :disabledDate="disabledDateFormatAfter" :placeholder="t('到期日期')" />
      </div>
      <a-date-picker v-else v-model:value="searchForm.date" valueFormat="YYYY-MM-DD" :format="selectDateFormat()" :placeholder="t('请选择')" />
      <div class="Exact">
        <a-checkbox v-model:checked="exadtDate">{{ t('精确日期') }}</a-checkbox>
      </div>
    </vco-page-search-item>

      <vco-page-search-item width="150" :title="t('名称')">
        <a-input v-model:value="searchForm.project_name" :placeholder="t('请输入')" />
      </vco-page-search-item>
  
    <template v-if="isExpand">
        <vco-page-search-item :title="t('金额')" width="230">
      <div v-if="!exadtAmount" class="flex items-center gap-2">
        <a-input-number v-model:value="searchForm.min_amount" :min="1" :placeholder="t('最小值')" />
        <p>-</p>
        <a-input-number v-model:value="searchForm.max_amount" :min="searchForm.min_amount" :placeholder="t('最大值')" />
      </div>
      <a-input-number v-else v-model:value="searchForm.amount" :placeholder="t('请输入')" />
      <div class="Exact">
        <a-checkbox v-model:checked="exadtAmount">{{ t('精确金额') }}</a-checkbox>
      </div>
    </vco-page-search-item>
      <vco-page-search-item width="150" :title="t('客户经理')" v-if="hasPermission('reconciliations:manage:search:lm')">
        <a-input v-model:value="searchForm.lm_name" :placeholder="t('请输入')" />
      </vco-page-search-item>
    </template>

    <template v-else>
      <vco-page-search-item>
        <div class="flex items-center gap-2">
          <div class="search_expand" v-if="!isExpand" @click="isExpand = !isExpand">{{ t('展开') }}<DoubleRightOutlined class="icon" /></div>
          <a-button type="dark" @click="searchHandle(false)"><i class="iconfont">&#xe756;</i>{{ t('搜索') }}</a-button>
          <a-button type="dark-line" @click="searchHandle(true)"><i class="iconfont">&#xe757;</i>{{ t('重置') }}</a-button>
        </div>
      </vco-page-search-item>
    </template>
  </vco-page-search>
  <div class="flex items-center justify-between" style="width: 100%">
    <slot></slot>
    <div class="flex items-center gap-2" v-if="isExpand">
      <div class="search_expand isExpand" @click="isExpand = !isExpand">{{ t('收起') }}<DoubleRightOutlined class="icon" /></div>
      <a-button type="dark" @click="searchHandle(false)"><i class="iconfont">&#xe756;</i>{{ t('搜索') }}</a-button>
      <a-button type="dark-line" @click="searchHandle(true)"><i class="iconfont">&#xe757;</i>{{ t('重置') }}</a-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { selectDateFormat } from '@/utils/tool';
import { hasPermission } from '@/directives/permission/index';
import { DoubleRightOutlined } from '@ant-design/icons-vue';

const emits = defineEmits(['search', 'update:value']);
const { t } = useI18n();

const isExpand = ref(false);
const typeData = computed(() => {
  return [
    {
      label: t('全部'),
      value: ''
    },
    {
      label: t('支出'),
      value: 'SPEND'
    },
    {
      label: t('已收到'),
      value: 'RECEIVE'
    }
  ];
});
const matchData = computed(() => {
  return [
    {
      label: t('匹配'),
      value: '1'
    },
    {
      label: t('精确匹配'),
      value: '2'
    }
  ];
});

const openData = computed(() => {
  return [
    {
      label: t('全部'),
      value: ''
    },
    {
      label: t('是'),
      value: 1
    },
    {
      label: t('否'),
      value: 0
    }
  ];
});

const searchForm = ref({
  type: '',
  project_name: '',
  min_amount: '',
  max_amount: '',
  amount: '',
  start_date: '',
  end_date: '',
  date: '',
  match: '',
  date_match: '',
  is_open: '',
  lm_name: ''
});

const exadtAmount = ref(false);
const exadtDate = ref(false);
const match = ref(undefined);

const disabledDateFormatAfter = (current) => {
  const targetDate = new Date(searchForm.value.start_date).setHours(0, 0, 0, 0);
  return current && current < targetDate;
};

watch(
  () => match.value,
  (val) => {
    if (val == 1) {
      searchForm.value.match = 1;
      searchForm.value.date_match = '';
    } else if (val == 2) {
      searchForm.value.match = 1;
      searchForm.value.date_match = 1;
    } else {
      searchForm.value.match = '';
      searchForm.value.date_match = '';
    }
  }
);

watch(
  () => exadtAmount.value,
  (val) => {
    if (val) {
      searchForm.value.min_amount = '';
      searchForm.value.max_amount = '';
    } else {
      searchForm.value.amount = '';
    }
  }
);
watch(
  () => exadtDate.value,
  (val) => {
    if (val) {
      searchForm.value.start_date = '';
      searchForm.value.end_date = '';
    } else {
      searchForm.value.date = '';
    }
  }
);
// 搜索
const searchHandle = (flag) => {
  if (flag) {
    for (const key in searchForm.value) {
      searchForm.value[key] = '';
    }
  }
  emits('update:value', searchForm.value);
  emits('search', searchForm.value);
};
</script>

<style scoped lang="less">
.page-search-content {
  gap: 15px;
  align-items: flex-start;
  justify-content: space-between;
  margin: 0;
  .Exact {
    margin-top: 5px;
    .ant-checkbox-wrapper {
      color: #888;
    }
  }
}
</style>
