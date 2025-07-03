<template>
  <a-col :span="11" v-if="item.transaction && item.transaction.length">
    <a-row :class="['content', { content_match: item.transaction[item.check_index].date === item.date }, { content_date_inconsistency: item.transaction[item.check_index].date !== item.date }]">
      <a-col :span="12" class="content_cell">
        <p class="xs_text">{{ tool.showDate(item.transaction[item.check_index].date) }}</p>
        <p v-if="item.project">{{ item.project.project_name }}</p>
        <p>{{ item.transaction[item.check_index].type_name || '' }}</p>
        <p>{{ item.transaction[item.check_index].note || '' }}</p>
      </a-col>
      <a-col :span="6" class="content_cell content_middle">
        <p class="xs_text">Spent</p>
        <p v-if="item.transaction[item.check_index].amount > 0">{{ tool.formatMoney(Math.abs(item.transaction[item.check_index].amount), { prefix: '' }) }}</p>
      </a-col>
      <a-col :span="6" class="content_cell">
        <p class="xs_text">Received</p>
        <p v-if="item.transaction[item.check_index].amount < 0">{{ tool.formatMoney(Math.abs(item.transaction[item.check_index].amount), { prefix: '' }) }}</p>
      </a-col>
    </a-row>
    <a-collapse ghost class="footer">
      <a-collapse-panel>
        <template #header>
          <span class="xs_text">Change Record Date</span>
        </template>
        <a-date-picker :format="selectDateFormat()" valueFormat="YYYY-MM-DD" v-model:value="item['f_date']" placeholder="" @change="handleChange" />
      </a-collapse-panel>
    </a-collapse>

    <div class="flex justify-end mt-5" style="position: absolute; top: -20px; right: -3px; z-index: 11" v-if="item.transaction && item.transaction.length > 1">
      <a-dropdown class="Filter" trigger="click" v-model:open="dropdownVisible">
        <a-button type="primary" size="small"> {{ t('选择') }}</a-button>

        <template #overlay>
          <div class="list">
            <template v-for="(sub, index) in item.transaction" :key="sub">
              <div @click="check(index)" :class="['list-item', { active: item.check_index == index }]">
                <div class="flex justify-between">
                  <span>{{ tool.showDate(sub.date) }}</span>
                  <vco-number color="#7dc1c1" :value="sub.amount" :precision="2" :bold="true" size="fs_md"></vco-number>
                </div>
                <p class="fs_2xs color_grey">{{ sub.note }}</p>
              </div>
            </template>
          </div>
        </template>
      </a-dropdown>
    </div>
  </a-col>
</template>

<script scoped setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
import tool, { selectDateFormat } from '@/utils/tool.js';
const emits = defineEmits(['update']);

const props = defineProps({
  item: {
    type: Object
  }
});

const dropdownVisible = ref(false);
const check = (val) => {
  props.item.check_index = val;
  dropdownVisible.value = false;
  handleChange();
};
const handleChange = () => {
  emits('update', props.item);
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

  &_date_inconsistency {
    border: 1px solid #80bb7c;
    border-radius: 4px 4px 0 0;
    background-color: #acd5a9;
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

.list {
  border-radius: 8px;
  box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05);
  background: #fff;
  padding: 20px 0;

  max-height: 380px;
  width: 300px;
  overflow-y: auto;
  padding-bottom: 8px;
  padding-top: 8px;
  .list-item {
    line-height: 1.5;
    transition: background-color 0.1s cubic-bezier(0.215, 0.61, 0.355, 1);
    align-items: center;
    padding: 8px 20px;
    cursor: pointer;
    &:hover {
      background-color: rgba(227, 235, 235, 0.4);
    }
    &.active {
      background-color: rgba(227, 235, 235, 0.8);
    }
    &.dis,
    &.par {
      background-color: rgba(206, 206, 206, 0.4);
      opacity: 0.5;
      cursor: auto;
    }
  }
}
</style>
