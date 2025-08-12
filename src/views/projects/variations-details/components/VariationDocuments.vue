<template>
  <div class="form-item-col">
    <div class="title">
      <p>{{ t('变更文件') }}</p>
      <vco-upload-modal v-if="showUpload" v-model:list="documentList" v-model:value="document">
        <div class="upload-btn">
          <i class="iconfont">&#xe734;</i>
          {{ t('上传文件') }}
        </div>
      </vco-upload-modal>
    </div>
    <div class="file-content">
      <template v-if="documentList.length">
        <div v-for="(item, index) in documentList" :key="index" class="file-item">
          <vco-file-item :file="item" :showClose="showUpload" @remove="remove(index)"></vco-file-item>
        </div>
      </template>
      <p v-else>{{ t('暂无数据，请上传') }}</p>
    </div>
    <div v-if="showUpload" class="flex justify-end mt-5">
      <a-button type="primary" shape="round" :disabled="!documentList.length" class="uppercase" :loading="loading" @click="save">
        {{ t('保存') }}
      </a-button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue/es';
import { cloneDeep } from 'lodash';
import { variationUpdFile } from '@/api/project/variation';
import { hasPermission } from '@/directives/permission/index';

const { t } = useI18n();
const emits = defineEmits(['update']);
const props = defineProps({
  uuid: {
    type: String
  },
  id: {
    type: String
  },
  detail: {
    type: Object,
    default: () => {}
  },
  variationInfo: {
    type: Object,
    default: () => {}
  }
});
const document = ref([]);
const documentList = ref([]);
// 删除文件
const remove = (index) => {
  documentList.value.splice(index, 1);
};
const loading = ref(false);
const save = () => {
  loading.value = true;
  variationUpdFile({ uuid: props.uuid, id: props.id, document: document.value })
    .then((res) => {
      emits('update');
      message.success(t('保存成功'));
    })
    .finally((_) => {
      loading.value = false;
    });
};

const showUpload = computed(() => {
  return (props.variationInfo?.mark === 'variation_lm' || props.variationInfo?.mark === 'variation_overdue_open') &&
          props.variationInfo?.has_permission &&
          props.variationInfo?.state > 0 &&
          props.variationInfo?.state !== 1 ||
          (hasPermission('projects:variations:request') && ['PENDING APPLY', 'variation_request'].includes(props.variationInfo?.mark))
})

watch(
  () => props.detail,
  (val) => {
    if (val) {
      if (props.detail && props.detail.length) {
        documentList.value = cloneDeep(props.detail);
      }
    }
  },
  {
    immediate: true
  }
);
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.form-item-col {
  background-color: #fbfbfb;
  border: 1px solid #fbfbfb;
  border-radius: 10px;
  box-shadow: 0 0 8px 0 rgba(0, 0, 0, 0.1);
  padding: 30px;
  margin: 24px 0;
  &.required {
    > .title > p {
      &::before {
        display: inline-block;
        margin-inline-end: 4px;
        color: #ff4d4f;
        font-size: 14px;
        font-family: SimSun, sans-serif;
        line-height: 1;
        content: '*';
      }
    }
  }
  > .title {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    > p {
      font-size: 12px;
      color: #888;
    }
  }
  .upload-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    cursor: pointer;
    user-select: none;
    color: @colorPrimary;
    &:hover {
      opacity: 0.8;
    }
    > i {
      font-size: 14px;
    }
  }
  > .file-content {
    padding: 10px 15px;
    min-height: 50px;
    background-color: #f7f9f8;
    border: 1px dashed #282828;
    border-radius: 8px;
    > p {
      font-size: 14px;
      color: #999;
      text-align: center;
    }
  }
}
</style>
