<template>
  <auth-template>
    <template #content v-if="req">
      <div class="anti-money" v-if="!showTip">
        <a-card>
          <template #extra>
            <vco-upload-modal v-model:list="list" controller="/wash" :params="{ code: code }">
              <div class="upload-btn"><i class="iconfont">&#xe734;</i>{{ t('上传文件') }}</div>
            </vco-upload-modal>
          </template>

          <div class="file-content">
            <template v-if="list.length">
              <div v-for="(item, index) in list" :key="index" class="file-item">
                <vco-file-item :file="item" :showClose="true" @remove="removeItem(index)"></vco-file-item>
              </div>
            </template>
            <p v-else>{{ t('暂无数据，请上传') }}</p>
          </div>
        </a-card>
        <div class="flex justify-center my-5">
          <a-button @click="submit" size="large" type="dark" style="width: 40%">
            {{ t('确认') }}
          </a-button>
        </div>
      </div>
      <div v-else class="tip">
        <p class="tip-name">Thank you!</p>
        <div class="tip-content">
          We have received your AML documents throughour submission form, Our team will review it. andwe will contact you if further action is
          required.
        </div>
      </div>
    </template>
  </auth-template>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue';
import tool from '@/utils/tool';
import { wash, washCode } from '@/api/wash';

const { t } = useI18n();

const showTip = ref(true);
const req = ref(true);
const code = ref('');
const list = ref([]);

const removeItem = (index) => {
  list.value.splice(index, 1);
};

const submit = () => {
  if (!list.value.length) {
    return message.warning(t('请上传'));
  }

  let uuids = list.value.map((item) => {
    return item.uuid;
  });
  wash({ code: code.value, document: uuids }).then((res) => {
    showTip.value = true;
  });
};

onMounted(() => {
  code.value = tool.getRequestParams(window.location.href).wash_code;
  if (!code.value) return;
  washCode({ code: code.value }).then((res) => {
    showTip.value = res !== 1;
    req.value = true;
  });
});
</script>

<style scoped lang="less">
@import '@/styles/variables.less';
.anti-money {
  width: calc(100% - 20px);
  margin: 20px 10px;
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
  max-height: calc(100vh - 500px);
  overflow-y: scroll;
  > p {
    font-size: 14px;
    color: #999;
    text-align: center;
  }
}
:deep(.unauth_container) {
  &::after {
    display: none;
  }
  .content_container .content {
    max-width: 800px;
    padding-top: 40px;
  }
}

.tip {
  width: 60%;
  margin: 100px auto 0;
  background: #fff;
  padding: 16px;
  border-radius: 16px;
  padding: 60px 70px;
  &-name {
    text-align: center;

    font-size: 30px;
    margin-bottom: 20px;
  }

  &-content {
    font-weight: 500;
  }
}
</style>
