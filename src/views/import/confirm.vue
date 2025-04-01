<template>
  <div @click.stop ref="JournalRef" class="Journal">
    <a-modal :width="500" :open="visible" :title="t('提示')" :getContainer="() => $refs.JournalRef" :maskClosable="false" :footer="false" @cancel="updateVisible(false)">
      <div class="content sys-form-content">
        <a-alert type="info">
          <template #message>
            <p class="tip-text">
              <span v-for="(item, index) in t('共{0}条', [data?.import_count])" :key="index" :class="[{ number: isNumericString(item) }]">
                {{ item }}
              </span>
            </p>

            <div class="tip-text">
              <template v-if="!isSubmit">
                <template v-if="data?.repeat_email_count !== undefined">
                  <span v-for="(item, index) in t('重复邮箱{0}条', [data?.repeat_email_count])" :key="index" :class="[{ number: isNumericString(item) }]">
                    {{ item }}
                  </span>
                </template>
                <span v-if="data?.repeat_nzbn_count !== undefined || data?.repeat_mobile_count !== undefined">, </span>
                <template v-if="data?.repeat_nzbn_count !== undefined">
                  <span v-for="(item, index) in t('重复NZBZ{0}条', [data?.repeat_nzbn_count])" :key="index" :class="[{ number: isNumericString(item) }]">
                    {{ item }}
                  </span>
                </template>
                <span v-if="data?.repeat_mobile_count !== undefined">, </span>
                <template v-if="data?.repeat_mobile_count !== undefined">
                  <span v-for="(item, index) in t('重复手机{0}条', [data?.repeat_mobile_count])" :key="index" :class="[{ number: isNumericString(item) }]">
                    {{ item }}
                  </span>
                </template>
              </template>
              <template v-else>
                <template v-if="uploadResult?.insert_count !== undefined">
                  <span v-for="(item, index) in t('插入{0}条', [uploadResult?.insert_count])" :key="index" :class="[{ number: isNumericString(item) }]">
                    {{ item }}
                  </span>
                </template>
                <span>, </span>
                <template v-if="uploadResult?.update_count !== undefined">
                  <span v-for="(item, index) in t('更新{0}条', [uploadResult?.update_count])" :key="index" :class="[{ number: isNumericString(item) }]">
                    {{ item }}
                  </span>
                </template>
              </template>
            </div>
          </template>
        </a-alert>
        <template v-if="!isSubmit">
          <a-radio-group v-model:value="type" class="mt-5">
            <a-radio :value="1">
              <p class="tips-txt">{{ t('更新重复数据') }}</p>
            </a-radio>
            <a-radio :value="2">
              <p class="tips-txt">{{ t('忽略重复数据') }}</p>
            </a-radio>
          </a-radio-group>

          <div class="mt-5 flex justify-between gap-5">
            <a-button type="grey" class="big shadow bold uppercase w-full mb-5 mt-5" @click="visible = false">{{ t('取消') }}</a-button>
            <a-button type="dark" class="big shadow bold uppercase w-full mb-5 mt-5" :loading="loading" @click="save">{{ t('确认') }}</a-button>
          </div>
        </template>
      </div>
    </a-modal>
  </div>
</template>

<script scoped setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue/es';
import { request } from '@/utils/request';

const { t } = useI18n();
const emits = defineEmits(['update']);

const props = defineProps({
  data: {
    type: Object,
    default: () => {
      return {};
    }
  }
});

const visible = ref(false);
const loading = ref(false);
const type = ref(1);

const uploadResult = ref();
const isSubmit = ref(false);

const updateVisible = (value) => {
  visible.value = value;
  setTimeout(() => {
    if (value === false) {
      isSubmit.value = false;
    }
  }, 500);
};

const isNumericString = (str) => {
  return !isNaN(Number(str)) && str.trim() !== '';
};

// 导出模板
const save = () => {
  loading.value = true;
  const paramsInfo = {
    url: '/transfer/injectData',
    method: 'post',
    params: { type: type.value, key: props.data?.key }
  };

  request(paramsInfo)
    .then((res) => {
      uploadResult.value = res;
      message.success(t('保存成功'));
      isSubmit.value = true;
    })
    .finally(() => {
      loading.value = false;
    });
};

defineExpose({
  updateVisible
});
</script>
<style scoped lang="less">
@import '@/styles/variables.less';

.content {
  line-height: 1.33;
  padding: 24px 30px 24px;
  .tip-text {
    .number {
      font-weight: bold;
      font-size: 16px;
      color: @colorPrimary;
    }
  }
}
.card {
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
  background-color: #f5f5f5;
  border: 1px solid #dddddd;
}
</style>
