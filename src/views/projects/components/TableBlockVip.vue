<template>
  <div class="sys-table-content border-top-none" :class="{ copy: hasPermission('projects:copy') }">
    <a-table :columns="columns" :data-source="tableData" :pagination="false" :customRow="rowClick" row-key="uuid" :rowClassName="setRowClass" :row-selection="{ selectedRowKeys: selectedRowKeys, ...rowSelection }">
      <template #headerCell="{ column }">
        <template v-if="column.key === 'open'">
          <span class="headSortItem" :class="{ active: sort.sort == 'start_date' }" @click="sortChange('start_date')">
            <i class="iconfont" :class="{ asc: sort.order == 'asc' && sort.sort == 'start_date' }">&#xe74d;</i>
            {{ column.title }}
          </span>
        </template>
        <template v-if="column.key === 'end_date'">
          <span class="headSortItem" :class="{ active: sort.sort == 'end_date' }" @click="sortChange('end_date')">
            <i class="iconfont" :class="{ asc: sort.order == 'asc' && sort.sort == 'end_date' }">&#xe74d;</i>
            {{ column.title }}
          </span>
        </template>
        <template v-if="column.key === 'irr'">
          <span class="headSortItem" :class="{ active: sort.sort == 'credit_irr' }" @click="sortChange('credit_irr')">
            <i class="iconfont" :class="{ asc: sort.order == 'asc' && sort.sort == 'credit_irr' }">&#xe74d;</i>
            {{ column.title }}
          </span>
        </template>
        <template v-if="column.key === 'lvr'">
          <span class="headSortItem" :class="{ active: sort.sort == 'credit_lvr' }" @click="sortChange('credit_lvr')">
            <i class="iconfont" :class="{ asc: sort.order == 'asc' && sort.sort == 'credit_lvr' }">&#xe74d;</i>
            {{ column.title }}
          </span>
        </template>
        <template v-if="column.key === 'ltc'">
          <span class="headSortItem" :class="{ active: sort.sort == 'credit_ltc' }" @click="sortChange('credit_ltc')">
            <i class="iconfont" :class="{ asc: sort.order == 'asc' && sort.sort == 'credit_ltc' }">&#xe74d;</i>
            {{ column.title }}
          </span>
        </template>
        <!-- <template v-if="column.key === 'income'">
          <span class="headSortItem" :class="{ active: sort.sort == 'income' }" @click="sortChange('income')">
            <i class="iconfont" :class="{ asc: sort.order == 'asc' && sort.sort == 'income' }">&#xe74d;</i>
            {{ column.title }}
          </span>
        </template> -->
        <!-- <template v-if="column.key === 'undrawn'">
          <span class="headSortItem" :class="{ active: sort.sort == 'undrawn' }" @click="sortChange('undrawn')">
            <i class="iconfont" :class="{ asc: sort.order == 'asc' && sort.sort == 'undrawn' }">&#xe74d;</i>
            {{ column.title }}
          </span>
        </template> -->
        <!-- <template v-if="column.key === 'loan_balance'">
          <span class="headSortItem" :class="{ active: sort.sort == 'credit.loan_balance' }" @click="sortChange('credit.loan_balance')">
            <i class="iconfont" :class="{ asc: sort.order == 'asc' && sort.sort == 'credit.loan_balance' }">&#xe74d;</i>
            {{ column.title }}
          </span>
        </template> -->
        <!-- <template v-if="column.key === 'bili'">
          <span class="headSortItem" :class="{ active: sort.sort == 'bili' }" @click="sortChange('bili')">
            <i class="iconfont" :class="{ asc: sort.order == 'asc' && sort.sort == 'bili' }">&#xe74d;</i>
            {{ column.title }}
          </span>
        </template> -->
        <template v-if="column.key === 'fc2'">
          <span class="headSortItem" :class="{ active: sort.sort == 'credit_forecastFc2' }" @click="sortChange('credit_forecastFc2', true)">
            <i class="iconfont" :class="{ asc: sort.order == 'asc' && sort.sort == 'credit_forecastFc2' }">&#xe74d;</i>
            {{ column.title }}
          </span>
        </template>
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === '1'">
          <a-space>
            <vco-avatar :src="record.project_image" :radius="true" :round="false" :size="48" />
            <div class="ml-3">
              <p :title="record.project_name" class="bold black text-ellipsis overflow-hidden text-nowrap" style="width: 320px; font-size: 16px">{{ record.project_name }}</p>
              <p class="replenish_text mt-1" style="line-height: 1">ID: {{ record.project_apply_sn }}</p>
              <span class="replenish_text">
                {{ record.loan_type_name }}
                <template v-if="record.loan_type_name && record.project_type_name"> • </template>
                {{ record.project_type_name }}
              </span>
            </div>
          </a-space>
        </template>
        <template v-if="column.key === '2'">
          <a-space>
            <a-avatar-group>
              <vco-avatar :src="lm.avatar" :radius="true" :round="true" :size="22" v-for="lm in record.lm_list" :key="lm.uuid" />
            </a-avatar-group>
            <div class="replenish_text">
              <template v-if="record.borrower_list.length">
                <template v-for="borrower in record.borrower_list" :key="borrower.uuid">
                  <span> {{ borrower.name }} </span>
                  <br />
                </template>
              </template>
              <template v-else>
                ...
                <br />
              </template>

              <span>
                <i class="iconfont relevance_icon">&#xe720; </i>
                <template v-for="lm in record.lm_list" :key="lm.uuid">
                  <span> {{ lm.name }} </span>
                  <br />
                </template>
              </span>
            </div>
          </a-space>
        </template>
        <template v-if="column.key === 'open'">
          <p class="bold black">{{ tool.showDate(record.start_date) }}</p>
        </template>
        <template v-if="column.key === 'end_date'">
          <p class="bold black">{{ tool.showDate(record.end_date) }}</p>
          <span class="replenish_text" :class="{ 'color_red-error': diffInDays(record.end_date) < 0 }"> {{ Math.abs(diffInDays(record.end_date)) }} {{ diffInDays(record.end_date) < 0 ? 'days ago' : 'days left' }}</span>
        </template>
        <template v-if="column.key === 'close_date'">
          <p class="bold black" v-if="record.close_date">{{ tool.showDate(record.close_date) }}</p>
        </template>

        <template v-if="column.key === 'irr'">
          <div :class="{ 'color_red-error': Math.abs(record.credit?.irr) < Math.abs(record.credit?.irrPreset) }">
            <p class="bold black">
              <i class="iconfont" style="color: #67837e">&#xe761;</i>
              {{ record.credit.irr }}%
            </p>
            <span class="replenish_text">{{ record.credit.irrPreset }}% · {{ (record.credit.irr - record.credit.irrPreset).toFixed(2) }}%</span>
          </div>
        </template>

        <template v-if="column.key === 'lvr'">
          <div :class="{ 'color_red-error': Math.abs(record.credit?.lvrMax) < Math.abs(record.credit?.lvr) }">
            <p class="bold black">
              <i class="iconfont" style="color: #67837e">&#xe761;</i>
              {{ record.credit.lvr }}%
            </p>
            <span class="replenish_text">{{ record.credit.lvrMax }}% · {{ (record.credit.lvrMax - record.credit.lvr).toFixed(2) }}%</span>
          </div>
        </template>
        <template v-if="column.key === 'ltc'">
          <div :class="{ 'color_red-error': Math.abs(record.credit?.ltc) > Math.abs(record.credit?.baseline) }">
            <p class="bold black">
              <i class="iconfont" style="color: #67837e">&#xe761;</i>
              {{ record.credit.ltc }}%
            </p>
            <span class="replenish_text">{{ record.credit.baseline }}% · {{ (record.credit.baseline - record.credit.ltc).toFixed(2) }}%</span>
          </div>
        </template>

        <template v-if="column.key === 'income'">
          <p class="black">{{ tool.formatMoney(record.credit.income) }}</p>
        </template>
        <template v-if="column.key === 'undrawn'">
          <p class="black">{{ tool.formatMoney(record.credit.undrawn) }}</p>
        </template>
        <template v-if="column.key === 'loan_balance'">
          <p class="bold black">
            <i class="iconfont" style="color: #a9ad57">&#xe75b;</i>
            {{ tool.formatMoney(record.credit.loan_balance) }}
          </p>
        </template>
        <template v-if="column.key === 'bili'">
          <div class="flex justify-center">
            <div class="meter" v-if="type === 'current'">
              <p :style="{ fontSize: '10px' }">{{ record.credit.bili }}%</p>
              <vco-meter size="small" :value="Number(record.credit.bili)" />
            </div>
          </div>
        </template>
        <template v-if="column.key === 'fc2'">
          <p class="black">{{ tool.formatMoney(record.credit.fc2) }}</p>
        </template>
        <template v-if="column.key === '9'">
          <template v-if="!hasPermission('projects:copy')">
            <div class="closed" v-if="record.is_substitution">{{ t('被再融资') }}</div>
            <div class="closed" v-else-if="record.is_open === 3">{{ t('关账') }}</div>
          </template>

          <p class="count" v-if="record.condition_count">{{ record.condition_count }}</p>
        </template>
        <template v-if="column.key === 'operation'">
          <template v-if="hasPermission('projects:copy')">
            <div class="closed" v-if="record.is_substitution">{{ t('被再融资') }}</div>
            <div class="closed" v-else-if="record.is_open === 3">{{ t('关账') }}</div>
          </template>
          <div @click.stop>
            <a-dropdown :trigger="['click']">
              <a class="ant-dropdown-link">
                <i class="iconfont cert">&#xe77a;</i>
              </a>
              <template #overlay>
                <a-menu :selectable="false">
                  <a-menu-item key="0">
                    <vco-popconfirm url="/project/project/copyProject" :formParams="{ uuid: record.uuid }" :tip="t('确定要复制{0}', [record.project_name])" @update="toCopyDetail">
                      <a>{{ t('复制') }}</a>
                    </vco-popconfirm>
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';
import { navigationTo } from '@/utils/tool';
import { DisconnectOutlined } from '@ant-design/icons-vue';
import { hasPermission } from '@/directives/permission/index';
import dayjs from 'dayjs';
import { useProjectsStore } from '@/store';
const pageStore = useProjectsStore();
const emits = defineEmits(['update:data', 'update:keys', 'change']);
import { useUserStore } from '@/store';

const pageRole = computed(() => useUserStore().pageRole);
const props = defineProps({
  tableData: {
    type: Array,
    default: () => []
  },
  type: {
    type: String,
    default: 'current'
  }
});
const { t } = useI18n();
const columns = reactive([
  { title: t('项目•类型'), key: '1', width: 320 },
  { title: t('借款人•贷款经理'), key: '2', width: 200 },
  { title: t('开始日期'), key: 'open', width: 110 },
  { title: t('到期'), key: 'end_date', width: 110 },
  { title: t('待提取'), key: 'undrawn', width: 160 },
  { title: t('贷款余额'), key: 'loan_balance', width: 180 },
  { title: t('完成情况'), key: 'bili', width: 120, align: 'center' },
  { title: t('条件'), key: '9', align: 'center' }
]);

const diffInDays = (val) => {
  return dayjs(val).diff(dayjs(), 'day');
};
const rowClick = (record, index) => {
  return {
    onClick: () => {
      let mode = pageRole.value ? '/' + pageRole.value.toLowerCase() : '';
      navigationTo(`${mode}/projects/about?uuid=${record.uuid}`);
    }
  };
};

const selectedRowKeys = ref([]); // 存放UUid
const selectedRows = ref([]); // 存放所有选中的选项的所有内容
const rowSelection = ref({
  checkStrictly: false,
  onSelect: (record, selected) => {
    if (selected) {
      selectedRowKeys.value.push(record.uuid);
      selectedRows.value.push(record);
    } else {
      let index = selectedRowKeys.value.findIndex((it) => {
        return it === record.uuid;
      });
      selectedRowKeys.value.splice(index, 1);
      selectedRows.value.splice(index, 1);
    }
    handlePathChange();
  },
  onSelectAll: (selected, Rows, changeRows) => {
    const changeRowId = changeRows.map((it) => {
      return it.uuid;
    });
    if (selected) {
      let newIds = Array.from(new Set(changeRowId.concat(selectedRowKeys.value)));
      let newRows = Array.from(new Set(changeRows.concat(selectedRows.value)));
      selectedRowKeys.value = newIds;
      selectedRows.value = newRows;
    } else {
      // 取消选中
      changeRowId.map((it) => {
        let index = selectedRowKeys.value.findIndex((item) => {
          return item == it;
        });
        if (index != -1) {
          selectedRowKeys.value.splice(index, 1);
          selectedRows.value.splice(index, 1);
        }
      });
    }
    handlePathChange();
  },
  getCheckboxProps: (r) => ({
    disabled: Boolean(parseInt(r.open_count) + parseInt(r.close_count) + parseInt(r.apply_count))
  })
});

const handlePathChange = () => {
  emits('update:data', selectedRows.value);
  emits('update:keys', selectedRowKeys.value);
  emits('change');
};

const toCopyDetail = (val) => {
  navigationTo('/process/four?uuid=' + val.uuid);
};
const setRowClass = (record, index) => {
  const targetDate = new Date(record.end_date);
  const currentDate = new Date();
  if (targetDate < currentDate && props.type === 'current') {
    return 'red';
  }
  return '';
};

onMounted(() => {
  if (hasPermission('projects:copy')) {
    columns.push({
      title: t('操作1'),
      key: 'operation',
      align: 'center',
      fixed: 'right',
      width: 50
    });
  }
});

const sort = ref({
  sort: '',
  order: 'desc' //排序：asc升序，desc降序
});

const sortChange = (e) => {
  if (e == sort.value.sort) {
    sort.value.order = sort.value.order == 'desc' ? 'asc' : 'desc';
  } else {
    sort.value.sort = e;
    sort.value.order = 'desc';
  }
  pageStore.setSearchParams(sort.value);
};

watch(
  () => props.type,
  (val) => {
    sort.value = {
      sort: 'start_date',
      order: 'desc'
    };
    const closeDateIndex = columns.findIndex((column) => column.key === 'close_date');
    if (props.type == 'closed') {
      if (closeDateIndex == -1) {
        columns.splice(4, 0, {
          title: t('关闭日期'),
          key: 'close_date',
          align: 'center',
          width: 110
        });
      }
    } else {
      if (closeDateIndex !== -1) {
        columns.splice(closeDateIndex, 1);
      }
    }
  },
  {
    immediate: true
  }
);
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';
:deep(.ant-table-row) {
  cursor: pointer;
}
:deep(.ant-table-tbody) > tr td {
  // position: initial !important;

  .relevance_icon {
    font-size: 7px;
    margin: 0 !important;
  }
  .replenish_text {
    font-size: 12px;
  }
  .bold {
    font-size: 14px;
  }
  .count {
    display: inline-block;
    width: 24px;
    height: 24px;
    line-height: 24px;
    background-color: @color_coal;
    color: @color_white;
    font-size: @fs_2xs;
    font-weight: bold;
    text-align: center;
    border-radius: 6px;
  }

  .meter {
    text-align: center;
    position: relative;
    top: -4px;
    min-width: 40px;
    width: 40px;
  }
}

// :deep(.P2502109935) {
//   td:after {
//     border-color: #edc4dc !important;
//   }
// }
.closed {
  position: absolute !important;
  background-color: #858585;
  color: #fff;
  font-size: 11px;
  padding: 2px 10px;
  // width: 100%;
  white-space: nowrap;
  text-align: center;
  top: 4px;
  right: 0;
  border-top-right-radius: 12px;
  border-bottom-left-radius: 12px;
}

.color_red-error {
  .black {
    color: #c1430c !important;
  }
}
:deep(.ant-table-tbody) > tr.red td {
  overflow: hidden;
}

:deep(.ant-table-tbody) > tr.red td::after {
  background-color: #ffeae0 !important;
  border-color: rgba(193, 67, 12, 0.2) !important;
}

:deep(.ant-table-tbody) > tr.red td.ant-table-cell-fix-right::before {
  background-color: #ffeae0 !important;
  border-color: rgba(193, 67, 12, 0.2) !important;
}

:deep(.ant-table-tbody) > tr.red td.ant-table-cell-fix-right::after {
  background: transparent !important;
}

:deep(.ant-table-tbody) .ant-table-cell-fix-left,
:deep(.ant-table-tbody) .ant-table-cell-fix-right {
  background: #fff !important;
}

.headSortItem {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  &.active {
    color: #000;
  }
  > .iconfont {
    cursor: pointer;
    font-size: 10px;
    user-select: none;
    transition: all 0.3s ease;
    &:hover {
      color: @colorPrimary;
    }
    &.asc {
      transform: rotateX(180deg);
    }
  }
}
</style>
