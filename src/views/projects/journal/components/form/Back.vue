<template>
  <div class="DrawdownBackTitle flex justify-center">
    <div @click="init">
      <slot></slot>
    </div>
  </div>
  <div @click.stop ref="DrawdownBack" class="DrawdownBack">
    <a-modal :width="486" :open="visible" :title="t('退回请求')" :getContainer="() => $refs.DrawdownBack" :maskClosable="false" :footer="false" @cancel="updateVisible(false)">
      <div class="content sys-form-content">
        <div class="input-item">
          <div class="label" :class="{ err: !description && validate }">Description</div>
          <a-textarea v-model:value="description" :rows="6" />
        </div>

        <div class="flex justify-center">
          <a-button @click="save" type="dark" class="save big uppercase" :loading="loading">
            {{ t('保存') }}
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script scoped setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue/es';
import tool from '@/utils/tool';
import { goBack } from '@/api/project/journal';

const { t } = useI18n();
const emits = defineEmits(['change']);

const props = defineProps({
  uuid: {
    type: String
  },
  detail: {
    type: Object
  }
});

const visible = ref(false);
const loading = ref(false);
const validate = ref(false);

const description = ref('');

const updateVisible = (value) => {
  visible.value = value;
};

const save = () => {
  validate.value = true;
  if (!description.value) return message.error(t('请输入') + 'Description');
  loading.value = true;
  let params = {
    uuid: props.uuid,
    id: props.detail.id,
    cancel_reason: description.value
  };
  goBack(params)
    .then((res) => {
      description.value = '';
      message.success(t('保存成功'));
      emits('change');
      updateVisible(false);
    })
    .finally((_) => {
      validate.value = false;
      loading.value = false;
    });
};

const init = () => {
  visible.value = true;
};
</script>
<style scoped lang="less">
@import '@/styles/variables.less';
.DrawdownBackTitle {
  text-align: center;
  margin-top: 10px;
  font-size: @fs_xs;
  .back {
    color: #df622b;
    cursor: pointer;
  }
}
.DrawdownBack {
  :deep(.ant-modal-content) {
    .ant-modal-header {
      padding: 72px 84px 0px;
      border-radius: 24px;
      .ant-modal-title {
        font-size: 20px;
        font-weight: 500;
      }
    }
    padding: 0px !important;

    .content {
      line-height: 1.33;
      padding: 24px 84px 72px;
      .label {
        color: #888;
        font-size: 12px;
        padding: 0 0 8px;
        &.err {
          color: #c1430c;
        }
      }

      .save {
        width: 100%;
        margin-top: 24px;
      }
    }
  }

  .input-item {
    margin-top: 20px;
  }
}
</style>
