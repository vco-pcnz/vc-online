<template>
  <div @click.stop ref="JournalRef" class="Journal">
    <a-modal :width="500" :open="visible" :title="t('提示')" :getContainer="() => $refs.JournalRef" :maskClosable="false" :footer="false" @cancel="updateVisible(false)">
      <div class="content sys-form-content">
        <p class="tip-text">
          <span v-for="(item, index) in text" :key="index" :class="[{ number: isNumericString(item) }]">
            {{ item }}
          </span>
        </p>
        <a-radio-group v-model:value="type">
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
  url: {
    type: String
  },
  text: {
    type: String
  }
});

const visible = ref(false);
const loading = ref(false);
const type = ref(1);

const updateVisible = (value) => {
  visible.value = value;
};

const isNumericString = (str) => {
  return !isNaN(Number(str)) && str.trim() !== '';
};

// 导出模板
const save = () => {
  loading.value = true;
  const paramsInfo = {
    url: props.url,
    method: 'get',
    params: { type: type.value }
  };

  request(paramsInfo)
    .then((res) => {
      message.success(t('保存成功'));
      tipsVisible.value = false;
      updateVisible(false);
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
    margin: 15px 0;
    .number {
      font-weight: bold;
      color: @colorPrimary;
    }
  }
}
</style>
