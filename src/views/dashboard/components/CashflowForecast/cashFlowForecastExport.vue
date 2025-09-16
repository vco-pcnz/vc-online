<template>
  <div class="inline" @click="init">
    <slot>
      <a-button type="cyan" class="ml-3 flex items-center gap-1" :loading="loading">
        <i class="iconfont">&#xe780;</i>
        {{ t('创建报告') }}
      </a-button>
    </slot>
  </div>
  <div @click.stop ref="JournalRef" class="Journal">
    <a-modal :width="486" :open="visible" title=" " :getContainer="() => $refs.JournalRef" :maskClosable="false" :footer="false" @cancel="updateVisible(false)">
      <div class="content sys-form-content">
        <a-form ref="formRef" layout="vertical" :model="formState" :rules="formRules">
          <a-form-item :label="t('日期')" name="start_date">
            <a-range-picker v-if="visible" :allowClear="false" inputReadOnly :presets="rangePresets" :format="selectDateFormat()" valueFormat="YYYY-MM-DD" @change="onChange" />
          </a-form-item>
        </a-form>

        <div class="flex justify-center">
          <a-button @click="save" type="dark" class="save big uppercase" :loading="loading">
            {{ t('导出') }}
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script scoped setup>
import { ref, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import dayjs from 'dayjs';
import { selectDateFormat } from '@/utils/tool';
import { request } from '@/utils/request';

const { t } = useI18n();
const emits = defineEmits(['change']);

const props = defineProps({
  searchParams: {
    type: Object
  },
  downloadUrl: {
    type: String
  }
});

const visible = ref(false);
const loading = ref(false);

const formState = ref({
  start_date: '',
  end_date: ''
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
      dayjs().subtract(1, 'week').startOf('week').add(1, 'day'), // 上周的第一天（周一）
      dayjs().subtract(1, 'week').endOf('week').add(1, 'day') // 上周的最后一天（周日）
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
const formRef = ref();
const formRules = ref({
  start_date: [{ required: true, message: t('请选择') + t('日期'), trigger: 'change' }]
});

const onChange = (dates) => {
  if (!dates || dates.length !== 2) {
    formState.value.start_date = '';
    formState.value.end_date = '';
  } else {
    formState.value.start_date = dates[0];
    formState.value.end_date = dates[1];
    // 将用户选择的日期格式化为 YYYY-MM-DD 字符串
    const [start, end] = dates.map((d) => d);

    // 查找匹配的预设
    const matchedPreset = rangePresets.value.find((preset) => {
      const [presetStart, presetEnd] = preset.value.map((d) => dayjs(d).format('YYYY-MM-DD'));
      return start === presetStart && end === presetEnd;
    });

    if (matchedPreset) {
      formState.value.cycle = matchedPreset.cycle;
      // 执行预设相关逻辑
    } else {
      formState.value.cycle = '';
      // 执行自定义范围逻辑
    }
  }
};

const updateVisible = (value) => {
  visible.value = value;
};

const save = () => {
  formRef.value
    .validate()
    .then(() => {
      const url = props.downloadUrl;
      const paramsInfo = {
        url,
        method: 'get',
        params: { ...formState.value, ...props.searchParams }
      };
      loading.value = true;

      request(paramsInfo)
        .then((res) => {
          window.open(res);
          loading.value = false;
          visible.value = false;
          emits('change');
        })
        .catch(() => {
          loading.value = false;
        });
    })
    .catch((error) => {
      console.log('error', error);
    });
};

const init = () => {
  visible.value = true;
  formState.value.date = dayjs().format('YYYY-MM-DD');
  nextTick(() => {
    formRef.value.clearValidate();
    formRef.value.resetFields();
  });
};
</script>
<style scoped lang="less">
@import '@/styles/variables.less';

.Journal {
  :deep(.ant-modal-content) {
    .ant-modal-header {
      padding: 32px 84px 0px;
      border-radius: 24px;
      .ant-modal-title {
        font-size: 20px;
        font-weight: 500;
      }
    }
    padding: 0px !important;

    .content {
      line-height: 1.33;
      padding: 24px 84px 72px;

      .save {
        width: 100%;
        margin-top: 24px;
      }
    }
  }

  .input-item {
    margin-top: 20px;
  }
}
</style>
