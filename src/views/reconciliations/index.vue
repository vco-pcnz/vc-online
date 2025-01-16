<template>
  <layout>
    <template #content>
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
        <a-row v-for="{ statement, transaction } in rowData" :key="statement.id">
          <a-col :span="11">
            <!-- TODO -->
            <a-row :class="['content', { content_match: false }]">
              <a-col :span="12" class="content_cell">
                <p class="xs_text">{{ statement.date }}</p>
                <p>{{ statement.client }}</p>
                <p>{{ statement.item }}</p>
                <p>{{ statement.description || 0 }}</p>
              </a-col>
              <a-col :span="6" class="content_cell content_middle">
                <p class="xs_text">Spent</p>
                <p>{{ statement.spent }}</p>
              </a-col>
              <a-col :span="6" class="content_cell">
                <p class="xs_text">Received</p>
                <p>{{ statement.received }}</p>
              </a-col>
            </a-row>
          </a-col>
          <a-col :span="2" class="content_btn">
            <a-button @click="visible = true" :disabled="false">OK</a-button>
          </a-col>
          <a-col :span="11" v-if="!!transaction">
            <a-row :class="['content', { content_match: true }]">
              <a-col :span="12" class="content_cell">
                <p class="xs_text">{{ transaction.date }}</p>
                <p>{{ transaction.account || '' }}</p>
                <p>{{ transaction.reference || '' }}</p>
                <p>{{ transaction.notes || 0 }}</p>
              </a-col>
              <a-col :span="6" class="content_cell content_middle">
                <p class="xs_text">Spent</p>
                <p>{{ transaction.spent }}</p>
              </a-col>
              <a-col :span="6" class="content_cell">
                <p class="xs_text">Received</p>
                <p>{{ transaction.received }}</p>
              </a-col>
            </a-row>
            <a-collapse ghost class="footer">
              <a-collapse-panel>
                <template #header>
                  <span class="xs_text">Change Record Date</span>
                </template>
                <a-date-picker :disabled="false" placeholder="" />
              </a-collapse-panel>
            </a-collapse>
          </a-col>
          <a-col :span="11" v-else class="content empty_content">
            <a-row :gutter="24">
              <a-col :span="12" class="empty_slip">
                <p class="xs_text">When</p>
                <a-date-picker placeholder="" />
              </a-col>
              <a-col :span="12" class="empty_slip">
                <p class="xs_text">When</p>
                <a-select :options="WHAT_OPTIONS"></a-select>
              </a-col>
            </a-row>
            <a-row>
              <a-col :span="24" class="empty_slip why_slip">
                <p class="xs_text">Why</p>
                <a-select>
                  <a-select-option v-for="item in WHY_OPTIONS" :key="item.value" :value="item.value">
                    {{ item.value }}
                  </a-select-option>
                </a-select>
              </a-col>
            </a-row>
          </a-col>
        </a-row>
      </div>
    </template>
  </layout>

  <TipModal v-model:visible="visible"></TipModal>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import Layout from './components/layout.vue';
import TipModal from './components/tipModal.vue';

const visible = ref(false)
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
const rowData = reactive([
  {
    statement: {
      id: 'uuid1111',
      date: '9 Jul 2024',
      spent: '60,000,000.00',
      received: '60,000,000.00',
      description: 'description',
      client: 'stag-ex-0722',
      item: 'drawdown'
    },
    transaction: {
      id: 'uuid11112222',
      date: '9 Jul 2024',
      reference: 'reference',
      notes: 'notes',
      spent: '60,000,000.00',
      received: '60,000,000.00',
      account: 'wwwwwww'
    }
  },
  {
    statement: {
      id: 'uuid1111',
      date: '9 Jul 2024',
      spent: '60,000,000.00',
      received: '60,000,000.00',
      description: 'description',
      client: 'stag-ex-0722',
      item: 'drawdown'
    },
    transaction: null
  }
]);
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
</style>
