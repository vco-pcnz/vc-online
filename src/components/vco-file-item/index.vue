<template>
  <div class="fileBox">
    <i v-if="Number(file.type === 1)" class="iconfont">&#xe797;</i>
    <i v-if="Number(file.type === 2)" class="iconfont">&#xe774;</i>
    <i v-if="Number(file.type === 3)" class="iconfont">&#xe798;</i>
    <div class="fileBox-content">
      <p class="name">{{ file.name }}</p>
      <p class="size">
        <span v-if="time">{{time}} · </span>
        {{ tool.formatSize(file.size) }}</p>
    </div>
    <div class="ops">
      <EyeOutlined @click="handlePreview(item)" class="remove" v-if="Number(file.type === 1 || file.type === 3)"/>
      <!-- <i class="iconfont" style="font-size: 14px;">&#xe780;</i> -->
      <i class="iconfont remove" @click="remove" v-if="showClose">&#xe77d;</i>
    </div>
  </div>
    <a-modal
      v-model:open="previewVisible"
      :footer="null"
      @cancel="previewHandleCancel"
    ><div style="padding-top: 30px;"></div>
      <img alt="example" style="width: 100%" :src="file.value" v-if="Number(file.type === 1)" />
      <video alt="example" style="width: 100%" :src="file.value" v-if="Number(file.type === 3)" ></video>
    </a-modal>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue';
import tool from '@/utils/tool';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons-vue';

const { t } = useI18n();

const previewVisible = ref(false)
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

  // 预览
const handlePreview = (file) => {
  previewVisible.value = true;
};

// 关闭弹框
const previewHandleCancel = () => {
  previewVisible.value = false;
};
  
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
    width: calc(100% - 80px);
  }
  .name {
    white-space: nowrap;   /* 禁止换行 */
    overflow: hidden;      /* 隐藏溢出内容 */
    text-overflow: ellipsis; /* 使用省略号表示溢出内容 */
  }
  .ops {
    display: flex;
    align-items: center;
    cursor: pointer;
    color: @colorPrimary;
    gap: 10px;
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
