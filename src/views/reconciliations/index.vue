<template>
  <layout ref="layoutRef">
    <template #content>
      <a-spin :spinning="loading" size="large">
        <div class="sys-form-content">
          <a-row>
            <a-col :span="11">
              <p class="title">{{ t('Review your Xero statement lines...') }}</p>
            </a-col>
            <a-col :span="11" :offset="2">
              <p class="title">
                {{ t('...then match with your transactions in VC Online') }}
              </p>
            </a-col>
          </a-row>
          <a-row v-for="item in rowData" :key="item.id">
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
            <a-col :span="2" class="content_btn">
              <template v-if="item.transaction">
                <a-button
                  :class="{ active: item.transaction.date !== item.date }"
                  @click="showTip(item)"
                  :disabled="item.transaction.date == item.date"
                  >OK</a-button
                >
              </template>
              <template v-else>
                <a-button
                  :class="{ active: item['f_date'] && item['f_type'] && item['f_name'] }"
                  @click="showTip(item)"
                  :disabled="!item['f_date'] || !item['f_type'] || !item['f_name']"
                  >OK</a-button
                >
              </template>
            </a-col>
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
                  <a-date-picker valueFormat="YYYY-MM-DD" :disabled="false" placeholder="" />
                </a-collapse-panel>
              </a-collapse>
            </a-col>
            <a-col :span="11" v-else class="content empty_content">
              <a-row :gutter="24">
                <a-col :span="12" class="empty_slip">
                  <p class="xs_text">When</p>
                  <a-date-picker valueFormat="YYYY-MM-DD" v-model:value="item['f_date']" placeholder="" />
                </a-col>
                <a-col :span="12" class="empty_slip">
                  <p class="xs_text">When</p>
                  <a-select v-model:value="item['f_name']" :options="WHAT_OPTIONS"></a-select>
                </a-col>
              </a-row>
              <a-row>
                <a-col :span="24" class="empty_slip why_slip">
                  <p class="xs_text">Why</p>
                  <a-select v-model:value="item['f_type']">
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
        <a-pagination
          size="small"
          :total="total"
          :pageSize="pagination.limit"
          :current="pagination.page"
          show-quick-jumper
          :show-total="(total) => t('共{0}条', [total])"
          @change="setPaginate"
        />
      </div>
    </template>
  </layout>

  <TipModal v-model:visible="visible" :formState="formState"></TipModal>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import Layout from './components/layout.vue';
import TipModal from './components/tipModal.vue';
import { reconciliationList } from '@/api/reconciliations';
import tool from '@/utils/tool';

const visible = ref(false);
const { t } = useI18n();
const WHAT_OPTIONS = [
  { value: 'legal-fee', label: 'Legal fee' },
  { value: 'broker-fee', label: 'Broker fee' },
  { value: 'other-fee', label: 'Other fee' },
  { value: 'repayment', label: 'Repayment' },
  { value: 'application-fee', label: 'Application fee' }
];
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
  visible.value = true;
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
