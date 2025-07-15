<template>
  <div class="flex">
    <a-input readonly class="input-label" value="Time" />
    <a-range-picker style="width: 230px" :allowClear="false" inputReadOnly :presets="rangePresets" v-model:value="value" :disabledDate="disabledDateFormat" :format="selectDateFormat()" valueFormat="YYYY-MM-DD" :showToday="false" @change="onChange" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import tool, { selectDateFormat } from '@/utils/tool';
import dayjs, { Dayjs } from 'dayjs';
import { cloneDeep } from 'lodash';

const emits = defineEmits(['change']);
const value = ref();

const props = defineProps({
  data: {
    type: Object
  }
});

const searchForm = ref({
  start_date: '',
  end_date: '',
  cycle: ''
});

const rangePresets = ref([
  // 按周选项
  // {
  //   label: 'Current Week',
  //   value: [
  //     dayjs().startOf('week'), // 本周的第一天（周一）
  //     dayjs().endOf('week') // 本周的最后一天（周日）
  //   ]
  // },
  {
    label: 'Previous Week',
    cycle: '',
    value: [
      dayjs().subtract(1, 'week').startOf('week').add(1, 'day').add(1, 'day'), // 上周的第一天（周一）
      dayjs().subtract(1, 'week').endOf('week').add(1, 'day').add(1, 'day') // 上周的最后一天（周日）
    ]
  },
  {
    label: 'Previous 2 Weeks',
    cycle: '',
    value: [
      dayjs().subtract(2, 'week').startOf('week').add(1, 'day'), // 上上周的第一天
      dayjs().subtract(1, 'week').endOf('week').add(1, 'day') // 上周的最后一天
    ]
  },
  // 按月选项
  {
    label: 'Previous Month',
    cycle: 'm',
    value: [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')]
  },
  {
    label: 'Previous 2 Months',
    cycle: '2m',
    value: [dayjs().subtract(2, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')]
  },
  {
    label: 'Previous 3 Months',
    cycle: '3m',
    value: [dayjs().subtract(3, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')]
  }
]);

const disabledDateFormat = (current) => {
  const endDate = new Date();
  if (current && current.isAfter(endDate, 'day')) {
    return true;
  }

  return false;
};

const onChange = (dates) => {
  console.log(dates);
  if (!dates || dates.length !== 2) {
    searchForm.value.start_date = '';
    searchForm.value.end_date = '';
  } else {
    searchForm.value.start_date = dates[0];
    searchForm.value.end_date = dates[1];
    // 将用户选择的日期格式化为 YYYY-MM-DD 字符串
    const [start, end] = dates.map((d) => d);

    // 查找匹配的预设
    const matchedPreset = rangePresets.value.find((preset) => {
      const [presetStart, presetEnd] = preset.value.map((d) => dayjs(d).format('YYYY-MM-DD'));
      return start === presetStart && end === presetEnd;
    });

    if (matchedPreset) {
      searchForm.value.cycle = matchedPreset.cycle;
      // 执行预设相关逻辑
    } else {
      searchForm.value.cycle = '';
      // 执行自定义范围逻辑
    }
  }

  emits('change', searchForm.value);
};

onMounted(() => {
  value.value = cloneDeep(props.data);
});
</script>
<style lang="less" scoped></style>
