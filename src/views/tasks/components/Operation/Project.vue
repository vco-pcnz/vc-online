<template>
  <div></div>
</template>

<script setup>
import { navigationTo } from '@/utils/tool';

const todoHandle = (data) => {
  if (data.process_type === 'drawdown') {
    navigationTo(`/projects/drawdowns?uuid=${data.uuid}`);
  } else if (data.process_type === 'repayment') {
    navigationTo(`/projects/repayments?uuid=${data.uuid}`);
  } else if (data.process_type === 'discharge') {
    navigationTo(`/projects/discharge?uuid=${data.uuid}`);
  } else if (data.process_type === 'security') {
    navigationTo(`/projects/discharge?uuid=${data.uuid}&type=1`);
  } else if (['penalty-start', 'penalty-end'].includes(data.process_type)) {
    navigationTo(`/projects/penalty?uuid=${data.uuid}`);
  } else if (data.process_type === 'variation') {
    navigationTo(`/projects/variations?uuid=${data.uuid}`);
  } else if (data.process_type === 'journal') {
    navigationTo(`/projects/journal?uuid=${data.uuid}`);
  } else if (['closed', 'closed-cancel'].includes(data.process_type)) {
    navigationTo(`/projects/about?uuid=${data.uuid}`);
  } else if (data.process_type === 'aml') {
    navigationTo(`/projects/orgs?uuid=${data.uuid}&type=2`);
  }
};

defineExpose({
  todoHandle
});
</script>
