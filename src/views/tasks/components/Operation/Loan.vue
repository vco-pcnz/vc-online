<template>
  <bind-users-dialog v-model:visible="showDialog" :type="1" :p-ids="pIds" :data="vcTeamObj" :vc-team="vcTeamData" @done="bindDone"></bind-users-dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { processRoutes } from '@/constant';
import { navigationTo } from '@/utils/tool';
import { associateSystemConfig } from '@/api/process';
import BindUsersDialog from '@/views/process/components/BindUsersDialog.vue';
import emitter from '@/event';

const emits = defineEmits(['update']);

const vcTeamObj = ref(null);
const vcTeamData = ref([]);
const showDialog = ref(false);
const pIds = ref([]);

const bindHandle = (data) => {
  pIds.value = [data.uuid];
  vcTeamObj.value['alm'] = [];
  showDialog.value = true;
};

const bindDone = () => {
  emits('update');

  emitter.emit('refreshRequestsList');
};

const getVcteamData = () => {
  associateSystemConfig().then((res) => {
    vcTeamData.value = res || [];
    const vcTeamArr = vcTeamData.value.map((item) => item.code);

    const vcObj = {};

    for (let i = 0; i < vcTeamArr.length; i++) {
      vcObj[vcTeamArr[i]] = [];
    }

    vcTeamObj.value = vcObj;
  });
};

const todoHandle = (data) => {
  if (data.status_name === 'LC 分配 LM') {
    bindHandle(data);
  } else {
    const href = processRoutes[data.next_index - 1];
    if (href) {
      navigationTo(`${href}?uuid=${data.uuid}`);
    }
  }
};

onMounted(() => {
  getVcteamData();
});

defineExpose({
  todoHandle
});
</script>
