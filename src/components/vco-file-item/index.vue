<template>
  <div class="fileBox">
    <i v-if="Number(file.type === 1)" class="iconfont">&#xe797;</i>
    <i v-if="Number(file.type === 2)" class="iconfont">&#xe774;</i>
    <i v-if="Number(file.type === 3)" class="iconfont">&#xe798;</i>
    <div class="fileBox-content">
      <p>{{ file.name || file.real_name }}</p>
      <p class="size">
        <span v-if="time">{{time}} · </span>
        {{ tool.formatSize(file.size) }}</p>
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
      <i class="iconfont remove" @click="remove" v-if="showClose">&#xe77d;</i>
      <!-- </a-popconfirm> -->
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue';
import tool from '@/utils/tool';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons-vue';

const { t } = useI18n();

const props = defineProps({
  file: {
    type: Object,
    required: false,
  },
  time: {
    type: String,
    default:''
  },
  showClose: {
    type: Boolean,
    default:false
  }
});
const emits = defineEmits(['remove']);

const remove = () => {
  emits('remove');
};
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
  transition: all 0.2s ease;
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
    color: @colorPrimary;
    span {
      margin-left: 10px;
    }
  }
  .remove {
    font-size: 12px;
    display: none;
    color: @colorPrimary;
    &:hover {
      opacity: 0.8;
    }
  }
  &:hover {
    background-color: #f7f0e6;
    border-radius: 8px;
    .remove {
      display: block;
    }
  }
}
</style>
