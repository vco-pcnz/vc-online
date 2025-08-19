<template>
  <vco-choose-user ref="vcoChooseUserRef" :check_uuids="bindUserForm.uuids" :isMultiple="true" @change="checkUser"><div></div> </vco-choose-user>

  <div class="sys-table-content">
    <a-table :columns="columns" :data-source="tableData" :pagination="false" :scroll="{ x: '1500px' }" row-key="uuid" :row-selection="{ selectedRowKeys: selectedRowKeys, ...rowSelection }">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'name'">
          <a-space>
            <vco-avatar :src="record.logo" :radius="true" :round="false" :size="48" />
            <div class="ml-3">
              <p :title="record.name" class="bold black text-ellipsis overflow-hidden text-nowrap" style="width: 200px; font-size: 16px">{{ record.name }}</p>
            </div>
          </a-space>
        </template>
        <template v-if="column.key === 'user'">
          <a-space>
            <a-avatar-group>
              <vco-avatar :src="lm.avatar" :radius="true" :round="true" :size="22" v-for="lm in record.user" :key="lm.uuid" />
            </a-avatar-group>
            <div class="replenish_text">
              <template v-if="record.user.length">
                <template v-for="borrower in record.user" :key="borrower.uuid">
                  <span> {{ borrower.user_name }} </span>
                  <br />
                </template>
              </template>
              <template v-else>
                ...
                <br />
              </template>
            </div>
          </a-space>
        </template>

        <template v-if="column.key === 'available'">
          <p class="black bold">{{ tool.formatMoney(tool.minus(record.amount || 0, record.use_amount || 0)) }}</p>
        </template>
        <template v-if="column.key === 'used'">
          <p class="black bold">{{ tool.formatMoney(record.use_amount) }}</p>
        </template>
        <template v-if="column.key === 'rate'">
          <p class="black">{{ record.rate || 0 }}%</p>
        </template>
        <template v-if="column.key === 'frate'">
          <p class="black">{{ record.frate || 0 }}%</p>
        </template>
        <template v-if="column.key === 'lrate'">
          <p class="black">{{ record.lrate || 0 }}%</p>
        </template>
        <template v-if="column.key === 'amount'">
          <p class="bold black">
            <i class="iconfont" style="color: #a9ad57">&#xe75b;</i>
            {{ tool.formatMoney(record.amount) }}
          </p>
        </template>

        <template v-if="column.key === 'start_date'">
          <span v-if="record.start_date">{{ tool.showDate(record.start_date) }}</span>
          <p v-else>--</p>
        </template>
        <template v-if="column.key === 'operation'">
          <div @click.stop>
            <a-dropdown :trigger="['click']">
              <a class="ant-dropdown-link">
                <i class="iconfont cert">&#xe77a;</i>
              </a>
              <template #overlay>
                <a-menu :selectable="false">
                  <a-menu-item key="0" @click="showEdit(record)">
                    {{ t('编辑') }}
                  </a-menu-item>
                  <a-menu-item key="1" @click="showBindUser(record)">
                    {{ t('绑定用户') }}
                  </a-menu-item>
                  <a-menu-item key="2" @click="navigationTo('/Investment/projects?uuid=' + record.id)">
                    {{ t('项目信息') }}
                  </a-menu-item>
                  <a-menu-item key="3" @click="navigationTo('/Investment/schedule/index?uuid=' + record.id)">
                    {{ t('明细表') }}
                  </a-menu-item>
                  <a-menu-item key="4">
                    <vco-popconfirm :formParams="{ id: record.id }" url="invest/delete" :tip="t('确定删除吗？')" @update="update()">
                      {{ t('删除l') }}
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
import { ref, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';
import { navigationTo } from '@/utils/tool';
const emits = defineEmits(['update:data', 'update:keys', 'change', 'update', 'showEdit']);
import { bindUser, investBindData } from '@/api/invest/index';

const props = defineProps({
  tableData: {
    type: Array,
    default: () => []
  }
});
const { t } = useI18n();
const columns = reactive([
  { title: t('投资方'), key: 'name', width: 280 },
  { title: t('总计金额'), key: 'amount', width: 160 },
  { title: t('可用余额1'), key: 'available', width: 140 },
  { title: t('已使用'), key: 'used', width: 140 },
  { title: t('用户'), key: 'user' },
  { title: t('利率'), key: 'rate', width: 120 },
  { title: t('浮动利率'), key: 'frate', width: 120 },
  { title: t('Line Fee 费率'), key: 'lrate', width: 120 },
  { title: t('开始日期'), key: 'start_date', width: 120 },
  { title: t('操作'), fixed: 'right', key: 'operation', align: 'center', width: 80 }
]);

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

const bindUserForm = ref({
  id: '',
  uuids: []
});
const vcoChooseUserRef = ref();

const showBindUser = (val) => {
  bindUserForm.value.id = val.id;

  if (val.user && val.user.length) {
    bindUserForm.value.uuids = val.user.map((item) => {
      return item.uuid;
    });
  }
  vcoChooseUserRef.value.init();
};

// 选择用户
const checkUser = (val) => {
  bindUserForm.value.uuids = val;

  bindUser(bindUserForm.value).then((res) => {
    emits('update');
  });
};

const showEdit = (val) => {
  emits('showEdit', val);
};

const update = (id) => {
  emits('update');
};
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
