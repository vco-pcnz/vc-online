<template>
  <div></div>
</template>

<script setup>
import { navigationTo } from '@/utils/tool';

const todoHandle = (data) => {
  if (data.process_type === 'drawdown') {
    navigationTo(`/projects/drawdowns?uuid=${data.uuid}`,true);
  } else if (data.process_type === 'repayment') {
    navigationTo(`/projects/repayments?uuid=${data.uuid}`,true);
  } else if (data.process_type === 'discharge') {
    navigationTo(`/projects/discharge?uuid=${data.uuid}`,true);
  } else if (data.process_type === 'security') {
    navigationTo(`/projects/discharge?uuid=${data.uuid}&type=1`,true);
  } else if (['penalty-start', 'penalty-end'].includes(data.process_type)) {
    navigationTo(`/projects/penalty?uuid=${data.uuid}`,true);
  } else if (data.process_type === 'variation') {
    if (data.relation_id) {
      navigationTo(`/projects/variations-details/about?uuid=${data.uuid}&id=${data.relation_id}`,true);
    } else {
      navigationTo(`/projects/variations?uuid=${data.uuid}`,true);
    }
  } else if (data.process_type === 'journal') {
    navigationTo(`/projects/journal?uuid=${data.uuid}`,true);
  } else if (['closed', 'closed-cancel'].includes(data.process_type)) {
    navigationTo(`/projects/about?uuid=${data.uuid}`,true);
  } else if (data.process_type === 'aml') {
    navigationTo(`/projects/orgs?uuid=${data.uuid}&type=2`,true);
  }
};

defineExpose({
  todoHandle
});
</script>
