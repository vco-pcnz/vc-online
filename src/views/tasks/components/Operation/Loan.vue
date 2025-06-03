<template>
  <bind-users-dialog v-model:visible="showDialog" :type="1" :p-ids="pIds" :data="vcTeamObj" :vc-team="vcTeamData" @done="bindDone"></bind-users-dialog>
  <a-button type="primary" size="small" shape="round" class="uppercase" @click="todoHandle()">{{ t('点击处理') }}</a-button>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { processRoutes } from '@/constant';
import { navigationTo } from '@/utils/tool';
import BindUsersDialog from '@/views/process/components/BindUsersDialog.vue';
import emitter from '@/event';

const { t } = useI18n();
const emits = defineEmits(['update']);
const props = defineProps({
  data: {
    type: Object
  },
  vcTeamData: {
    type: Array
  },
  vcTeamObj: {
    type: Object
  }
});

const showDialog = ref(false);
const pIds = ref([]);

const bindHandle = () => {
  pIds.value = [props.data.uuid];
  props.vcTeamObj['alm'] = [];
  showDialog.value = true;
};

const bindDone = () => {
  emits('update');
  emitter.emit('refreshRequestsList');
};

const todoHandle = () => {
  if (props.data.status_name === 'LC 分配 LM') {
    bindHandle();
  } else {
    const href = processRoutes[props.data.next_index - 1];
    if (href) {
      navigationTo(`${href}?uuid=${props.data.uuid}`);
    }
  }
};
</script>
