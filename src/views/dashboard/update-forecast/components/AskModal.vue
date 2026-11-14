<template>
  <!-- 通用确认弹窗：标题为提问句，正文一两句，按钮为明确动词 -->
  <a-modal :open="open" :width="520" :mask-closable="false" @cancel="emit('update:open', false)">
    <template #title>
      <div>{{ title }}</div>
      <p v-if="sub" class="sub">{{ sub }}</p>
    </template>
    <p class="exp">{{ text }}</p>
    <template #footer>
      <a-button v-if="cancel" type="grey" @click="emit('update:open', false)">Cancel</a-button>
      <a-button type="dark" @click="emit('ok')">{{ okText }}</a-button>
    </template>
  </a-modal>
</template>

<script setup>
defineProps({
  open: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  sub: {
    type: String,
    default: ''
  },
  text: {
    type: String,
    default: ''
  },
  okText: {
    type: String,
    default: ''
  },
  // 只有说明、没有操作时不显示 Cancel
  cancel: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update:open', 'ok']);
</script>

<style scoped lang="less">
@import '@/views/dashboard/update-forecast/vars.less';

.sub {
  .uf-modal-sub();
}

.exp {
  .uf-modal-text();
  margin: 8px 0 4px;
}
</style>
