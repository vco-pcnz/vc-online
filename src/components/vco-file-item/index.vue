<template>
  <div class="fileBox" :class="{ bg: bg }" v-if="!file || file && filterArr.length>1">
    <i v-if="Number(file.type === 1)" class="iconfont">&#xe797;</i>
    <i v-if="Number(file.type === 2)" class="iconfont">&#xe774;</i>
    <i v-if="Number(file.type === 3)" class="iconfont">&#xe798;</i>
    <div class="fileBox-content">
      <p class="name" :title="showTitle">
        <template v-if="Boolean(!filter)">
          {{ showTitle }}
        </template>
        <template v-else>
          <template v-for="(item, index) in filterArr" :key="index">
            <span>{{ item }}</span>
            <span class="filter" v-if="index < filterArr.length - 1">{{ filter }}</span>
          </template>
        </template>
      </p>
      <p class="info">
        <template v-if="time">
          <span :class="{ err: !validity }">{{ time }}</span> ·
        </template>
        {{ tool.formatSize(file.size) }}
      </p>
    </div>
    <div class="ops">
      <div class="icon"><slot name="ops"></slot></div>
      <EyeOutlined @click="handlePreview(file)" class="icon" />
      <a :href="file.value" target="_blank" v-if="!showClose"><i class="iconfont icon" style="font-size: 14px">&#xe780;</i></a>
      <i class="iconfont icon" @click="remove" v-if="showClose">&#xe77d;</i>
    </div>
  </div>
  <a-modal v-model:open="previewVisible" :footer="null" @cancel="previewHandleCancel">
    <template v-if="previewVisible">
      <div style="padding-top: 30px"></div>
      <img alt="example" style="width: 100%" :src="file.value" v-if="Number(file.type === 1)" />
      <video alt="example" style="width: 100%" :src="file.value" controls v-if="Number(file.type === 3)"></video>
    </template>
  </a-modal>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue';
import tool from '@/utils/tool';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons-vue';
import { fill } from 'lodash';
import axios from 'axios';
import { getToken, removeToken } from '@/utils/token-util.js';

const { t } = useI18n();

const previewVisible = ref(false);
const props = defineProps({
  file: {
    type: Object,
    required: false
  },
  time: {
    type: String,
    default: ''
  },
  showClose: {
    type: Boolean,
    default: false
  },
  bg: {
    type: Boolean,
    default: false
  },
  filter: {
    type: String,
    default: ''
  }
});
const emits = defineEmits(['remove']);

// 预览
const handlePreview = (val) => {
  if (val.type === 1 || val.type === 3) {
    previewVisible.value = true;
  } else {
    window.open(val.value);
  }
};
const validity = computed(() => {
  return tool.toUnixTime(props.time) >= Math.floor(new Date().getTime() / 1000);
});

const showTitle = computed(() => {
  return props.file.name || props.file.real_name;
});

const filterArr = computed(() => {
  return (props.file.name || props.file.real_name).split(props.filter);
});

// 关闭弹框
const previewHandleCancel = () => {
  previewVisible.value = false;
};

// 下载
const down = () => {
  if (props.file.value) {
    let token = getToken();
    const env = import.meta.env;
    axios
      .post(
        props.file.value,
        {},
        {
          headers: {
            Authorization: token,
            token: token
          },
          responseType: 'blob',
          baseURL: env.VITE_APP_OPEN_PROXY === 'true' ? env.VITE_APP_PROXY_PREFIX : env.VITE_APP_BASE_URL
        }
      )
      .then((res) => {
        tool.download(res);
      });
  }
  //
};

const remove = () => {
  emits('remove');
};

watch(
  () => props.file,
  (newVal, oldVal) => {
    if (props.file) {
      props.file.value = props.file.value || props.file.url;
    }
  },
  {
    immediate: true,
    deep: true
  }
);
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
  border-radius: 8px;
  transition: all 0.2s ease;
  .iconfont {
    font-size: 24px;
  }
  .info {
    color: @color_grey;
  }
  .fileBox-content {
    flex: 1;
    width: calc(100% - 100px);
  }
  .name {
    white-space: nowrap; /* 禁止换行 */
    overflow: hidden; /* 隐藏溢出内容 */
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
  .icon {
    font-size: 12px;
    display: none;
    color: @colorPrimary;
    &:hover {
      opacity: 0.8;
    }
  }
  &:hover {
    background-color: #f7f0e6;
    .icon {
      display: block;
    }
  }
  &.bg {
    background-color: #f7f0e6 !important;
  }
  .err {
    color: @color_red-error;
  }
  .filter {
    color: @colorPrimary;
  }
}
</style>
