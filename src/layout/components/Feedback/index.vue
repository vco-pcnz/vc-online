<template>
  <div class="Feedback">
    <div class="sys-form-content" v-if="visible">
      <div class="title">{{ t('意见反馈') }}</div>
      <i class="close iconfont" @click="visible = false">&#xe77b;</i>
      <div class="label" :class="{ err: !formState.title && validate }">{{ t('标题') }}</div>
      <a-input v-model:value="formState.title" />
      <div class="label" :class="{ err: !formState.note && validate }">{{ t('描述') }}</div>
      <a-textarea v-model:value="formState.note" :rows="4" />
      <div class="label">
        {{ t('文件') }}

        <vco-upload-modal v-model:list="documentList" v-model:value="formState.document">
          <a-button class="upload_btn" type="brown" shape="round" size="small"> {{ t('上传') }}</a-button>
        </vco-upload-modal>
      </div>

      <div class="file-content">
        <template v-if="documentList.length">
          <div v-for="(item, index) in documentList" :key="index" class="file-item">
            <vco-file-item :file="item" :showClose="true" @remove="remove(index)"></vco-file-item>
          </div>
        </template>
        <p v-if="!documentList.length">{{ t('暂无数据，请上传') }}</p>
      </div>

      <div class="mt-5 flex justify-center gap-5">
        <a-button type="grey" class="shadow bold uppercase" @click="visible = false">{{ t('取消') }}</a-button>

        <a-button type="dark" class="shadow bold uppercase" :loading="loading" @click="submit">{{ t('提交') }}</a-button>
      </div>
    </div>
    <div class="btn" @click="visible = true">
      <i class="iconfont">&#xe619;</i>
      <p>{{ t('意见反馈') }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue';
import { feedback } from '@/api/system';
import { useRoute } from 'vue-router';
const route = useRoute();

const { t } = useI18n();
const visible = ref(false);
const validate = ref(false);
const loading = ref(false);
const documentList = ref([]);
const formState = ref({
  title: '',
  note: '',
  page: '',
  document: []
});

const submit = () => {
  validate.value = true;
  if (!formState.value.title || !formState.value.note) {
    return;
  }
  loading.value = true;
  feedback(formState.value)
    .then((res) => {
      visible.value = false;
      message.success(t('保存成功'));
    })
    .finally((_) => {
      loading.value = false;
    });
};

const reset = () => {
  validate.value = false;
  formState.value = {
    title: '',
    note: '',
    page: '',
    document: []
  };
};

watch(
  () => visible.value,
  (val) => {
    if (!val) {
      reset();
    } else {
      formState.value.page = route.fullPath
    }
  },
  {
    immediate: true
  }
);
</script>
<style lang="less" scoped>
.Feedback {
  position: fixed;
  right: 40px;
  bottom: 70px;
  .btn {
    text-align: center;
    color: #888;
    cursor: pointer;
    line-height: 1.2;
    font-size: 12px;
    .iconfont {
      font-size: 30px;
    }
  }
  .sys-form-content {
    position: absolute;
    bottom: 60px;
    right: 0;
    width: 300px;
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
    background-color: #fff;
    border: 1px solid #dddddd;
    .close {
      position: absolute;
      top: 10px;
      right: 15px;
      font-size: 12px;
      cursor: pointer;
    }
    .title {
      font-weight: 500;
      text-align: center;
      font-size: 16px;
    }
    .label {
      color: #888;
      font-size: 12px;
      padding: 0 0 8px;
      margin-top: 15px;
      position: relative;
      &.err {
        color: #c1430c;
      }
    }
    .file-content {
      border: 1px solid #272727 !important;
      border-radius: 10px !important;
      background-color: #f7f9f8;
      padding: 15px;
      > p {
        text-align: center;
        font-size: 14px;
        color: #999;
      }
    }

    .upload_btn {
      position: absolute;
      top: -4px;
      right: 0;
    }
  }
}
</style>
