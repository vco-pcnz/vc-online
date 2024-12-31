<template>
  <a-dropdown class="Filter" trigger="click" v-model:open="visible">
    <a-button type="brown" size="small" :class="['picker-btn', { open: visible }]" shape="round" @click="visible = true">
      for {{ value }} <DownOutlined class="DropdownIcon" />
    </a-button>
    <template #overlay>
      <ul class="list">
        <li class="item" v-for="item in list" :key="item.uuid" @click="change(item.name)">{{ item.name }}</li>
        <li class="item customPeriod" @click="showDate">Custom period…</li>
      </ul>
    </template>
  </a-dropdown>
  <a-modal :width="520" :open="open" @cancel="open = false">
    <div class="text-center bold fs_2xl pt-10 pb-10">Custom period</div>
    <div class="sys-form-content px-10">
      <a-range-picker
        v-model:value="date"
        :disabled-date="disabledStartDate"
        format="DD MMM 'YY"
        valueFormat="YYYY-MM-DD"
        :placeholder="[t('开始日期'), t('结束日期')]"
        @change="timeChange"
      />
    </div>
    <template #footer>
      <div class="flex justify-center pt-5 pb-10">
        <a-button type="dark" size="large" class="uppercase" @click="selectDate">{{ t('选择') }}</a-button>
      </div>
    </template>
  </a-modal>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { DownOutlined } from '@ant-design/icons-vue';
import dayjs, { Dayjs } from 'dayjs';
import tool from '@/utils/tool';

const emits = defineEmits(['update:value', 'change']);
const { t } = useI18n();

const props = defineProps(['value']);

const value = ref('');
const visible = ref(false);
const date = ref(null);
const open = ref(false);

const list = ref([
  { name: 'Current week', uuid: '1' },
  { name: 'Previous week', uuid: '2' },
  { name: 'Previous month', uuid: '3' },
  { name: 'Previous 2 months', uuid: '4' },
  { name: 'Upcoming week', uuid: '5' },
  { name: 'Upcoming month', uuid: '6' },
  { name: 'Upcoming 2 months', uuid: '7' }
]);

const showDate = () => {
  date.value = null;
  open.value = true;
};

const change = (val) => {
  value.value = val;
  visible.value = false;
};

const selectDate = () => {
  if (date.value) {
    value.value = tool.showDate(date.value[0]) + ' - ' + tool.showDate(date.value[1]);
  }
  open.value = false;
  emits('update:value', date.value);
  emits('change', date.value);
};

onMounted(() => {
  value.value = list.value[0].name;
});
</script>

<style scoped lang="less">
.list {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05);
  list-style-type: none;
  margin: 0;
  padding: 16px 0;
  position: relative;
  text-align: left;
  .item {
    font-weight: 500;
    padding: 8px 24px;
    cursor: pointer;
    font-size: 14px;
    line-height: 22px;
    &:hover {
      background-color: rgba(227, 235, 235, 0.4);
    }
    &.selected {
      color: #181818;
      font-weight: 600;
      background-color: #fffbf0;
    }
    &.customPeriod {
      color: #d8b480;
    }
  }
}
</style>
