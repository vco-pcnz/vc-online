<template>
  <layout ref="layoutRef" @update="reload">
    <template #content>
      <a-spin :spinning="loading" size="large">
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
            <bank-card :data="item" :project="item.project" @update="loadData"></bank-card>
            <template v-if="!item.children.length">
              <!-- ok -->
              <ok :item="item" :project="item.project" @update="loadData"></ok>
              <!-- right -->
              <transaction :item="item" v-if="!!item.transaction"></transaction>
              <reconciliation-form :disabled="!item.project" :fee_type="item.fee_type" v-else :item="item"></reconciliation-form>
            </template>
          </a-row>
          <template v-if="item.children && item.children.length">
            <a-row v-for="sub in item.children" :key="sub.id" class="my-5">
              <template v-if="!sub.status">
                <!-- left -->
                <bank-card :data="sub" :project="item.project" @update="loadData"></bank-card>
                <!-- ok -->
                <ok :item="sub" :project="item.project" @update="loadData"></ok>
                <!-- right -->
                <transaction :item="sub" v-if="!!sub.transaction"></transaction>
                <reconciliation-form :disabled="!item.project" :fee_type="item.fee_type" v-else :item="sub"></reconciliation-form>
              </template>
            </a-row>
          </template>
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
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { reconciliationList } from '@/api/reconciliations';
import Layout from './components/layout.vue';
import BankCard from './reconciliation/BankCard.vue';
import ReconciliationForm from './reconciliation/ReconciliationForm.vue';
import Transaction from './reconciliation/Transaction.vue';
import Ok from './reconciliation/Ok.vue';

const { t } = useI18n();

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
