<template>
  <a-col :span="11" v-if="!!item.transaction">
    <a-row :class="['content', { content_match: item.transaction.date ===item.date }, { content_match: item.transaction.date!==item.date }]">
      <a-col :span="12" class="content_cell">
        <p class="xs_text">{{ tool.showDate(item.transaction.date) }}</p>
        <p v-if="item.project">{{ item.project.project_name }}</p>
        <p>{{ item.transaction.type_name || '' }}</p>
        <p>{{ item.transaction.note || '' }}</p>
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
        <a-date-picker :format="selectDateFormat()" valueFormat="YYYY-MM-DD" v-model:value="item['f_date']" placeholder="" />
      </a-collapse-panel>
    </a-collapse>
  </a-col>
</template>

<script scoped setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
import tool, { selectDateFormat } from '@/utils/tool.js';
const emits = defineEmits(['update']);

const props = defineProps({
  item: {
    type: Object
  }
});
</script>
<style scoped lang="less">
@import '@/styles/variables.less';
.content {
  background-color: white;
  border: 1px solid #e6e7e9;
  overflow: hidden;
  border-radius: 4px;

  &_match {
    border: 1px solid #50dcaa;
    border-radius: 4px 4px 0 0;
    background-color: #a8eed5;
  }

  &_date_inconsistency {
    border: 1px solid #4ec399;
    border-radius: 4px 4px 0 0;
    background-color: #a8dbc9;
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
:deep(.ant-collapse-item) {
  background: #fff !important;
}
</style>
