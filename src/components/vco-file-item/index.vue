<template>
  <div class="fileBox">
    <i class="iconfont">&#xe774;</i>
    <div class="fileBox-content">
      <p>{{ file.name }}</p>
      <p class="size">{{ t('大小') }}: {{ file.size }} kb</p>
    </div>
    <div class="ops">
      <!-- <EyeOutlined /> -->
      <!-- <a-popconfirm
        title="Are you sure delete this task?"
        ok-text="Yes"
        cancel-text="No"
        @confirm="confirm"
        @cancel="cancel"
      > -->
        <i class="iconfont remove" @click="remove">&#xe77d;</i>
      <!-- </a-popconfirm> -->
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons-vue';

const { t } = useI18n();

const props = defineProps({
  file: {
    type: Object,
    required: false,
  },
});
const emits = defineEmits(['remove']);

const remove = () => {
  emits('remove');
}
</script>

<style scoped lang="less">
@import '@/styles/variables.less';

.fileBox {
  display: flex;
  align-items: center;
  font-size: 12px;
  gap: 12px;
  line-height: 1.2;
  padding: 10px;
  margin: 5px 0;
  .iconfont {
    font-size: 24px;
  }
  .size {
    color: #888;
  }
  .fileBox-content {
    flex: 1;
  }
  .ops {
    display: flex;
    align-items: center;
    cursor: pointer;
    color: #d8b480;
    span {
      margin-left: 10px;
    }
  }
  .remove {
    font-size: 12px;
    display: none;
    color: #d8b480;
  }
  &:hover {
    background-color: hsla(35, 53%, 67%, 0.2);
    border-radius: 8px;
    .remove {
      display: block;
    }
  }
}
</style>
