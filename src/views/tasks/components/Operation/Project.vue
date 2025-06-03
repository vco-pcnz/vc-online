<template>
  <a-button type="primary" size="small" shape="round" class="uppercase" @click="todoHandle()">{{ t('点击处理') }}</a-button>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { navigationTo } from '@/utils/tool';

const { t } = useI18n();

const props = defineProps({
  data: {
    type: Object
  }
});

const todoHandle = () => {
  if (props.data.process_type === 'drawdown') {
    navigationTo(`/projects/drawdowns?uuid=${props.data.uuid}`);
  } else if (props.data.process_type === 'repayment') {
    navigationTo(`/projects/repayments?uuid=${props.data.uuid}`);
  } else if (props.data.process_type === 'discharge') {
    navigationTo(`/projects/discharge?uuid=${props.data.uuid}`);
  } else if (props.data.process_type === 'security') {
    navigationTo(`/projects/discharge?uuid=${props.data.uuid}&type=1`);
  } else if (['penalty-start', 'penalty-end'].includes(props.data.process_type)) {
    navigationTo(`/projects/penalty?uuid=${props.data.uuid}`);
  } else if (props.data.process_type === 'variation') {
    navigationTo(`/projects/variations?uuid=${props.data.uuid}`);
  } else if (props.data.process_type === 'journal') {
    navigationTo(`/projects/journal?uuid=${props.data.uuid}`);
  } else if (['closed', 'closed-cancel'].includes(props.data.process_type)) {
    navigationTo(`/projects/about?uuid=${props.data.uuid}`);
  } else if (props.data.process_type === 'aml') {
    navigationTo(`/projects/orgs?uuid=${props.data.uuid}&type=2`);
  }
};
</script>
