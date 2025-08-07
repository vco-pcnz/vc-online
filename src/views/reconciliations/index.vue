<template>
  <layout ref="layoutRef" @update="reload">
    <template #content>
      <a-spin :spinning="loading" size="large">
        <a-row class="flex justify-between mb-5 pb-5" style="border-bottom: 1px solid #a6a9b0">
          <TableSearch v-model:value="searchParams" @search="search">
            <div>
              <a-checkbox :checked="state.checkAll" :indeterminate="state.indeterminate" @change="onCheckAllChange" class="mr-3"></a-checkbox>
              <a-popconfirm :title="t('确定要对账吗？')" :cancel-text="t('取消')" :ok-text="t('确定')" @confirm="checkMatchBills()" :disabled="!selectedRowKeys.length">
                <a-button :disabled="!selectedRowKeys.length">
                  {{ t('对账') }}
                </a-button>
              </a-popconfirm>
            </div>
          </TableSearch>
        </a-row>

        <a-row>
          <a-col :span="11">
            <p class="title">Review your Xero statement lines...</p>
          </a-col>
          <a-col :span="11" :offset="2">
            <p class="title">...then match with your transactions in VC Online</p>
          </a-col>
        </a-row>
        <div :class="{ cardBorder: true }" v-for="item in rowData" :key="item.id">
          <a-row class="my-5">
            <!-- left -->
            <bank-card :selectedRowKeys="selectedRowKeys" @check="check" :data="item" :project="item.project" @update="loadData"></bank-card>
            <template v-if="item.way != 'api-split'">
              <!-- ok -->
              <ok :item="item" :project="item.project" @update="loadData"></ok>
              <!-- right -->
              <transaction :item="item" @update="changeItemForm" v-if="item.transaction && item.transaction.length"></transaction>
              <reconciliation-form :way_options="way_options" :disabled="!item.project" :fee_type="item.fee_type" v-else :item="item"></reconciliation-form>
            </template>
          </a-row>
          <template v-if="item.way == 'api-split' && item.children && item.children.length">
            <a-row v-for="sub in item.children" :key="sub.id" class="my-5">
              <template v-if="!sub.status">
                <!-- left -->
                <bank-card :selectedRowKeys="selectedRowKeys" @check="check" :data="sub" :project="item.project" @update="loadData"></bank-card>
                <!-- ok -->
                <ok :item="sub" :project="item.project" @update="loadData"></ok>
                <!-- right -->
                <transaction :item="sub" @update="changeItemForm" v-if="sub.transaction && sub.transaction.length"></transaction>
                <reconciliation-form :way_options="way_options" :disabled="!item.project" :fee_type="item.fee_type" v-else :item="sub"></reconciliation-form>
              </template>
            </a-row>
          </template>
        </div>

        <a-empty v-if="!rowData || !rowData.length" />
      </a-spin>
      <div class="flex justify-center pb-5">
        <a-pagination size="small" :total="total" :pageSize="pagination.limit" :current="pagination.page" show-quick-jumper :show-total="(total) => t('共{0}条', [total])" @change="setPaginate" />
      </div>
    </template>
  </layout>
  <TipModal v-model:visible="visible" @submit="submit"></TipModal>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { reconciliationList } from '@/api/reconciliations';
import Layout from './components/layout.vue';
import BankCard from './reconciliation/BankCard.vue';
import ReconciliationForm from './reconciliation/ReconciliationForm.vue';
import Transaction from './reconciliation/Transaction.vue';
import TableSearch from './reconciliation/TableSearch.vue';
import Ok from './reconciliation/Ok.vue';
import TipModal from './reconciliation/TipModal.vue';
import { checkMatchBill } from '@/api/reconciliations';
import { cloneDeep } from 'lodash';
import { systemDictData } from '@/api/system';
import dayjs from 'dayjs';
const { t } = useI18n();

const layoutRef = ref();
const total = ref(0);
const loading = ref(false);
const pagination = ref({
  page: 1,
  limit: 10
});
const searchParams = ref({
  type: '',
  name: ''
});

const setPaginate = (page, limit) => {
  pagination.value = {
    page,
    limit
  };
  // loadData();
  getCurrentData();
};
const rowData = ref([]);
const dataList = ref([]);
const loadData = () => {
  loading.value = true;
  reconciliationList({ ...pagination.value, ...searchParams.value })
    .then((res) => {
      total.value = res.count;
      localStorage.setItem('res_xero_update_time', res.otherInfo);
      layoutRef.value.updateResTime();
      if (res.data.length) {
        res.data.map((item) => {
          if (item.fee_type.length) {
            item.fee_type.map((_item) => {
              _item['value'] = JSON.stringify(_item);
            });
          }
          item['check_index'] = 0;
          if (item.transaction && item.transaction.length > 1) {
            const dates = item.transaction.map((item) => {
              return item.date;
            });
            let smallestDiff = Math.abs(dayjs(dates[0]).diff(dayjs(item.date), 'day'));

            dates.forEach((date, index) => {
              const currentDiff = Math.abs(dayjs(date).diff(dayjs(item.date), 'day'));
              if (currentDiff < smallestDiff) {
                smallestDiff = currentDiff;
                item['check_index'] = index;
              }
            });
          }
        });
      }
      dataList.value = res.data;
      // rowData.value = res.data;
      getCurrentData();
      layoutRef.value.setNum(total.value);
    })
    .finally(() => {
      loading.value = false;
    });
};

const getCurrentData = () => {
  let star = (pagination.value.page - 1) * pagination.value.limit;
  rowData.value = dataList.value.slice(star, star + pagination.value.limit).concat([]);
};

const reload = () => {
  pagination.value.page = 1;
  loadData();
};
const way_options = ref([]);
onMounted((_) => {
  // loadData();
  systemDictData('reconciliation_way').then((res) => {
    way_options.value = res;
  });
});

const selectedRowKeys = ref([]); // 存放UUid
const selectedRows = ref([]); // 存放所有选中的选项的所有内容
const selectedRowsDate = ref([]); // 存放所有选中的选项的日期有不有不一致的

const check = (val) => {
  if (selectedRowKeys.value.includes(val.id)) {
    let index = selectedRowKeys.value.findIndex((it) => {
      return it === val.id;
    });
    selectedRowKeys.value.splice(index, 1);
    selectedRows.value.splice(index, 1);
    selectedRowsDate.value.splice(index, 1);
  } else {
    selectedRowKeys.value.push(val.id);
    selectedRowsDate.value.push(val.date !== val.transaction[val.check_index].date && val.date !== val.f_date);
    selectedRows.value.push({
      bank_sn: val.bank_sn,
      sn: val.transaction[val.check_index].sn
    });
  }
};

const visible = ref(false);

const checkMatchBills = () => {
  // console.log(selectedRowsDate.value)
  // return
  if (selectedRowsDate.value.includes(true)) {
    visible.value = true;
  } else {
    submit();
  }
};

const submit = () => {
  loading.value = true;
  checkMatchBill({ data: selectedRows.value })
    .then((res) => {
      selectedRows.value = [];
      selectedRowKeys.value = [];
      loadData();
    })
    .finally(() => {
      loading.value = false;
    });
};

const search = (val) => {
  searchParams.value = cloneDeep(val);
  reload();
};

const state = ref({
  indeterminate: false,
  checkAll: false
});

const onCheckAllChange = (e) => {
  currentSelectData.value.map((val) => {
    if (state.value.checkAll) {
      // 取消当前页面所有选中
      if (selectedRowKeys.value.includes(val.id)) {
        let index = selectedRowKeys.value.findIndex((it) => {
          return it === val.id;
        });
        selectedRowKeys.value.splice(index, 1);
        selectedRows.value.splice(index, 1);
        selectedRowsDate.value.splice(index, 1);
      }
    } else {
      // 选中当前页面所有
      if (!selectedRowKeys.value.includes(val.id) && val.transaction.length) {
        selectedRowKeys.value.push(val.id);
        selectedRowsDate.value.push(val.date !== val.transaction[val.check_index].date && val.date !== val.f_date);
        selectedRows.value.push({
          bank_sn: val.bank_sn,
          sn: val.transaction[val.check_index].sn
        });
      }
    }
  });
};

// 当前页面可选中的数据
const currentSelectData = ref([]);
watch(
  () => rowData.value,
  (val) => {
    currentSelectData.value = [];
    rowData.value.map((item) => {
      if (item.transaction && item.transaction.length) {
        currentSelectData.value.push(item);
      }
      if (item.children && item.children.length) {
        item.children.map((sub) => {
          if (sub.transaction && sub.transaction.length) {
            currentSelectData.value.push(sub);
          }
        });
      }
    });
  }
);

const currentSelectData_selectedRowKeys = computed(() => ({
  currentSelectData: currentSelectData.value,
  selectedRowKeys: selectedRowKeys.value
}));

watch(
  () => currentSelectData_selectedRowKeys,
  (val) => {
    const allIncluded = currentSelectData.value.every((item) => selectedRowKeys.value.includes(item.id));
    const someIncluded = currentSelectData.value.some((item) => selectedRowKeys.value.includes(item.id));
    if (allIncluded) {
      state.value = {
        indeterminate: false,
        checkAll: true
      };
    } else if (someIncluded) {
      state.value = {
        indeterminate: true,
        checkAll: false
      };
    } else {
      state.value = {
        indeterminate: false,
        checkAll: false
      };
    }
  },
  { deep: true }
);

const changeItemForm = (val) => {
  if (selectedRowKeys.value.includes(val.id)) {
    let index = selectedRowKeys.value.findIndex((it) => {
      return it === val.id;
    });

    selectedRows.value[index] = {
      bank_sn: val.bank_sn,
      sn: val.transaction[val.check_index].sn
    };

    selectedRowsDate.value[index] = val.date !== val.transaction[val.check_index].date && val.date !== val.f_date;
  }
};
</script>

<style scoped lang="less">
.page-search-content {
  margin-top: 0;
}
.title {
  width: 100%;
  color: #181818;
  font-size: 12px;
  line-height: 18px;
}

.footer {
  background-color: white;
  border: 1px solid #e6e7e9;
  border-top: none;
  border-radius: 0 0 4px 4px;
  cursor: pointer;

  .xs_text {
    font-size: 12px;
    font-weight: 400;
  }

  :deep(.ant-collapse-header),
  :deep(.ant-collapse-content) {
    background-color: white;
  }
}

.empty_content {
  padding: 12px 16px;
  .empty_slip {
    display: grid;
    grid-template-columns: 40px 1fr;
    align-items: center;
  }

  .why_slip {
    margin-top: 16px;
  }
}
.cardBorder {
  // border: 1px solid rgb(248, 223, 164);
  border-radius: 8px;
  padding: 10px 24px;
  margin: 10px 0;
  // background: rgba(248, 223, 164,.5);
  box-shadow: 0 0 2rem rgba(0, 0, 0, 0.2);
}
</style>
