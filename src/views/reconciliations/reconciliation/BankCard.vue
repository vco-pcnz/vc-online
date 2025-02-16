<template>
  <a-col :span="11">
    <a-row :class="['content', { content_match: false }]">
      <a-col :span="11" class="content_cell">
        <p class="xs_text">{{ tool.showDate(data.date) }}</p>
        <p v-if="project">{{ project.project_name }}</p>
        <p>{{ data.type }}</p>
        <p>{{ data.description || '' }}</p>
      </a-col>
      <a-col :span="6" class="content_cell content_middle">
        <p class="xs_text">Spent</p>
        <p v-if="data.amount > 0">{{ tool.formatMoney(Math.abs(data.amount), { prefix: '' }) }}</p>
      </a-col>
      <a-col :span="7" class="content_cell relative">
        <p class="xs_text">Received</p>
        <p v-if="data.amount < 0">{{ tool.formatMoney(Math.abs(data.amount), { prefix: '' }) }}</p>
        <div class="splitBillBox" v-if="!data.parent_id">
          <splitBill :item="data" @update="update"><a-button type="primary" shape="round" size="small">Split bill</a-button></splitBill>
        </div>
      </a-col>
    </a-row>
  </a-col>
</template>

<script scoped setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
import tool from '@/utils/tool';
import splitBill from './splitBill.vue';
const emits = defineEmits(['update']);

const props = defineProps({
  data: {
    type: Object
  },
  project: {
    type: Object
  }
});

const update = () => {
  emits('update');
};
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

  .splitBillBox {
    position: absolute;
    top: 10px;
    right: 10px;
  }
}
</style>
