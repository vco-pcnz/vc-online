<template>
  <div class="sys-table-content border-top-none">
    <a-table
      :columns="columns"
      :data-source="tableData"
      :row-class-name="(_record, index) => _record.project_apply_sn"
      :pagination="false"
      :scroll="{ x: '100%' }"
      :customRow="rowClick"
      row-key="uuid"
      :row-selection="{ selectedRowKeys: selectedRowKeys, ...rowSelection }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === '1'">
          <a-space>
            <vco-avatar :src="record.project_image" :radius="true" :round="false" :size="48" />
            <div class="ml-3">
              <p class="cer">ID: {{ record.project_apply_sn }}</p>
              <p class="bold black">{{ record.project_name }}</p>
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
        <template v-if="column.key === '3'">
          <p class="bold black">{{ tool.showDate(record.end_date) }}</p>
          <span class="replenish_text">{{ diffInDays(record.end_date) }} days left</span>
        </template>
        <template v-if="column.key === '4'">
          <p class="bold black">
            <i class="iconfont" style="color: #67837e">&#xe761;</i>
            {{ record.credit.irr }}%
          </p>
          <span class="replenish_text">{{ record.credit.irrPreset }}% · {{ (record.credit.irrPreset - record.credit.irr).toFixed(2) }}%</span>
        </template>
        <template v-if="column.key === '5'">
          <p class="black">{{ tool.formatMoney(record.credit.income) }}</p>
        </template>
        <template v-if="column.key === '6'">
          <p class="black">{{ tool.formatMoney(record.credit.undrawn) }}</p>
        </template>
        <template v-if="column.key === '7'">
          <div class="loan_balance">
            <p class="bold black">
              <i class="iconfont" style="color: #a9ad57">&#xe75b;</i>
              {{ tool.formatMoney(record.credit.loan_balance) }}
            </p>
            <div class="meter" v-if="type === 'current'">
              <p :style="{ fontSize: '10px' }">{{ record.credit.bili }}%</p>
              <vco-meter size="small" :width="Number(record.credit.bili)" :value="0" />
            </div>
          </div>
        </template>
        <template v-if="column.key === '8'">
          <p class="black">{{ tool.formatMoney(record.credit.fc2) }}</p>
        </template>
        <template v-if="column.key === '9'">
          <div class="closed" v-if="record.is_open === 3">{{t('关帐')}}</div>
          <p class="count" v-if="record.upd">{{ record.upd }}</p>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';
import { navigationTo } from '@/utils/tool';
import { DisconnectOutlined } from '@ant-design/icons-vue';
import dayjs from 'dayjs';
const emits = defineEmits(['update:data', 'update:keys', 'change']);

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
  { title: t('项目•类型'), key: '1', width: 280 },
  { title: t('借款人•贷款经理'), key: '2', width: 180 },
  { title: t('到期'), key: '3', width: 160 },
  { title: t('IRR预测'), key: '4', width: 140 },
  { title: t('收入'), key: '5', width: 120 },
  { title: t('待提取'), key: '6', width: 100 },
  { title: t('贷款余额'), key: '7', width: 220 },
  { title: t('FC2'), key: '8', width: 120 },
  { title: t('UPD'), key: '9', width: 60 }
]);

const diffInDays = (val) => {
  return dayjs(val).diff(dayjs(), 'day');
};
const rowClick = (record, index) => {
  return {
    onClick: () => {
      navigationTo(`/projects/about?uuid=${record.uuid}`);
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
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';
:deep(.ant-table-row) {
  cursor: pointer;
}
:deep(.ant-table-tbody) > tr td {
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

  .loan_balance {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .meter {
      text-align: center;
      position: relative;
      top: -4px;
      min-width: 30px;
    }
  }
}

// :deep(.P2502109935) {
//   td:after {
//     border-color: #edc4dc !important;
//   }
// }
.closed {
    position: absolute;
    background-color: #858585;
    color: #fff;
    font-size: 11px;
    padding: 2px 20px;
    top: 2px;
    right: 0;
    border-top-right-radius: 12px;
    border-bottom-left-radius: 12px;
}
</style>
