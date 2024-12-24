<template>
  <auth-template>
    <template #content>
      <div class="anti-money">
        <a-card :title="t('类型')">
          <template #extra>
            <vco-upload-modal v-model:list="list" controller="wash">
              <div class="upload-btn"><i class="iconfont">&#xe734;</i>{{ t('上传文件') }}</div>
            </vco-upload-modal>
          </template>

          <div class="file-content">
            <template v-if="list.length">
              <div v-for="(item, index) in list" :key="index" class="file-item">
                <vco-file-item :file="item" :showClose="true" @remove="removeItem(2, index)"></vco-file-item>
              </div>
            </template>
            <p v-else>{{ t('暂无数据，请上传') }}</p>
          </div>
        </a-card>
        <div class="flex justify-center my-5">
          <a-button @click="confirm" size="large" type="dark" style="width: 40%">
            {{ t('确认') }}
          </a-button>
        </div>
      </div>
    </template>
  </auth-template>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue';

const { t } = useI18n();
const list = ref([]);
const images = ref([]);
const files = ref([]);
const videos = ref([]);
</script>

<style scoped lang="less">
@import '@/styles/variables.less';
.anti-money {
  width: 100%;
  margin: 20px auto;
  background: #fff;
  padding: 16px;
  border-radius: 16px;
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
.file-content {
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
:deep(.unauth_container) .content_container .content {
  max-width: 800px;
}
</style>
