<template>
  <layout ref="layoutRef" @update="reload">
    <template #content>
      <a-spin :spinning="loading" size="large">
        <div class="sys-form-content">
          <a-row>
            <a-col :span="11">
              <p class="title">Review your Xero statement lines...</p>
            </a-col>
            <a-col :span="11" :offset="2">
              <p class="title">...then match with your transactions in VC Online</p>
            </a-col>
          </a-row>
          <a-row v-for="item in rowData" :key="item.id">
            <!-- left -->
            <a-col :span="11">
              <!-- TODO -->
              <a-row :class="['content', { content_match: false }]">
                <a-col :span="12" class="content_cell">
                  <p class="xs_text">{{ tool.showDate(item.date) }}</p>
                  <p v-if="item.project">{{ item.project.project_name }}</p>
                  <p>{{ item.type }}</p>
                  <p>{{ item.description || '' }}</p>
                </a-col>
                <a-col :span="6" class="content_cell content_middle">
                  <p class="xs_text">Spent</p>
                  <p v-if="item.amount > 0">{{ tool.formatMoney(Math.abs(item.amount), { prefix: '' }) }}</p>
                </a-col>
                <a-col :span="6" class="content_cell">
                  <p class="xs_text">Received</p>
                  <p v-if="item.amount < 0">{{ tool.formatMoney(Math.abs(item.amount), { prefix: '' }) }}</p>
                </a-col>
              </a-row>
            </a-col>
            <!-- ok -->
            <a-col :span="2" class="content_btn">
              <a-button
                :loading="ok_loading && formState.id == item.id"
                :class="{ active: (!item.transaction && item['f_date'] && item['f_fee'] && item['f_note'] && item.project) || item.transaction }"
                :disabled="(!item.transaction && (!item['f_date'] || !item['f_fee'] || !item['f_note'])) || !item.project"
                @click="showTip(item)"
              >
                OK
              </a-button>
            </a-col>
            <!-- right -->
            <a-col :span="11" v-if="!!item.transaction">
              <a-row :class="['content', { content_match: true }]">
                <a-col :span="12" class="content_cell">
                  <p class="xs_text">{{ tool.showDate(item.transaction.date) }}</p>
                  <p v-if="item.project">{{ item.project.project_name }}</p>
                  <p>{{ item.transaction.type || '' }}</p>
                  <p>{{ item.transaction.note || 0 }}</p>
                </a-col>
                <a-col :span="6" class="content_cell content_middle">
                  <p class="xs_text">Spent</p>
                  <p v-if="item.transaction.amount > 0">{{ tool.formatMoney(Math.abs(item.transaction.amount), { prefix: '' }) }}</p>
                </a-col>
                <a-col :span="6" class="content_cell">
                  <p class="xs_text">Received</p>
                  <p v-if="item.transaction.amount < 0">{{ tool.formatMoney(Math.abs(item.transaction.amount), { prefix: '' }) }}</p>
                </a-col>
              </a-row>
              <a-collapse ghost class="footer">
                <a-collapse-panel>
                  <template #header>
                    <span class="xs_text">Change Record Date</span>
                  </template>
                  <a-date-picker valueFormat="YYYY-MM-DD" v-model:value="item['f_date']" placeholder="" />
                </a-collapse-panel>
              </a-collapse>
            </a-col>
            <a-col :span="11" v-else class="content empty_content">
              <a-row :gutter="24">
                <a-col :span="12" class="empty_slip">
                  <p class="xs_text">When</p>
                  <a-date-picker :disabled="!item.project" valueFormat="YYYY-MM-DD" v-model:value="item['f_date']" placeholder="" />
                </a-col>
                <a-col :span="12" class="empty_slip">
                  <p class="xs_text">When</p>
                  <a-select :disabled="!item.project" v-model:value="item['f_fee']" :options="item.fee_type" :fieldNames="{ label: 'name', value: 'value' }"></a-select>
                </a-col>
              </a-row>
              <a-row>
                <a-col :span="24" class="empty_slip why_slip">
                  <p class="xs_text">Why</p>
                  <a-select v-model:value="item['f_note']" :disabled="!item.project">
                    <a-select-option v-for="item in WHY_OPTIONS" :key="item.value" :value="item.value">
                      {{ item.value }}
                    </a-select-option>
                  </a-select>
                </a-col>
              </a-row>
            </a-col>
          </a-row>
        </div>

        <a-empty v-if="!rowData || !rowData.length" />
      </a-spin>
      <div class="flex justify-center pb-5">
        <a-pagination size="small" :total="total" :pageSize="pagination.limit" :current="pagination.page" show-quick-jumper :show-total="(total) => t('共{0}条', [total])" @change="setPaginate" />
      </div>
    </template>
  </layout>

  <TipModal v-model:visible="visible" :formState="formState" @submit="submit"></TipModal>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import Layout from './components/layout.vue';
import TipModal from './components/tipModal.vue';
import { reconciliationList, addTransaction, checkMatchBill } from '@/api/reconciliations';
import tool from '@/utils/tool';

const visible = ref(false);
const { t } = useI18n();
const WHY_OPTIONS = [
  { value: 'Commitment payment received on [Date on bank statement]' },
  { value: 'Equity Injection or Project Contribution' },
  { value: 'Repayment from sale proceeds of [Address]' },
  { value: 'Full Repayment' },
  { value: 'Repayment from GST Refund' }
];

const layoutRef = ref();
const total = ref(0);
const loading = ref(false);
const ok_loading = ref(false);
const pagination = ref({
  page: 1,
  limit: 10
});

const setPaginate = (page, limit) => {
  pagination.value = {
    page,
    limit
  };
  loadData();
};
const rowData = ref([]);

const loadData = () => {
  loading.value = true;
  reconciliationList(pagination.value)
    .then((res) => {
      total.value = res.count;
      if (res.data.length) {
        res.data.map((item) => {
          if (item.fee_type.length) {
            item.fee_type.map((_item) => {
              _item['value'] = JSON.stringify(_item);
            });
          }
        });
      }
      rowData.value = res.data;
      layoutRef.value.setNum(total.value);
    })
    .finally(() => {
      loading.value = false;
    });
};

const formState = ref({});
const showTip = (val) => {
  formState.value = val;
  if (val.f_date && val.f_date !== val.date) {
    visible.value = true;
  } else if (val.transaction && val.date !== val.transaction.date) {
    visible.value = true;
  } else {
    submit();
  }
};
const submit = () => {
  let params = {};
  let ajaxFn = null;
  if (formState.value.transaction) {
    // 对账
    ajaxFn = checkMatchBill;
    params = {
      bank_sn: formState.value.bank_sn,
      date: formState.value.date
    };
  } else {
    // 新增
    params = {
      apply_project_uuid: formState.value.project ? formState.value.project.uuid : 0,
      amount: formState.value.amount,
      date: formState.value.date,
      note: formState.value.f_note,
      bank_sn: formState.value.bank_sn,
      ...JSON.parse(formState.value.f_fee)
    };
    ajaxFn = addTransaction;
  }
  ok_loading.value = true;
  ajaxFn(params)
    .then((res) => {
      reload();
    })
    .finally(() => {
      ok_loading.value = false;
    });
  console.log(params);
};

const reload = () => {
  pagination.value.page = 1;
  loadData();
};

onMounted((_) => {
  loadData();
});
// const rowData = reactive([])
</script>

<style scoped lang="less">
.title {
  width: 100%;
  border-bottom: 1px solid #a6a9b0;
  color: #181818;
  font-size: 12px;
  line-height: 18px;
}

.content {
  background-color: white;
  border: 1px solid #e6e7e9;
  overflow: hidden;
  border-radius: 4px;
  margin-top: 24px;

  &_match {
    border: 1px solid #50dcaa;
    border-radius: 4px 4px 0 0;
    background-color: #a8eed5;
  }

  &_cell {
    width: 100%;
    padding: 12px 16px;
    > p {
      font-size: 14px;
      font-weight: 500;
    }

    .xs_text {
      font-size: 12px;
      font-weight: 400;
    }
  }

  &_middle {
    border-left: 1px solid #e6e7e9;
    border-right: 1px solid #e6e7e9;
  }
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

.sys-form-content {
  :deep(.ant-picker),
  :deep(.ant-select-selector) {
    border: none !important;
  }
}

.content_btn {
  margin-top: 60px;
  display: flex;
  justify-content: center;
}

.active {
  background: rgb(0, 120, 200);
  color: #fff;
}
</style>
