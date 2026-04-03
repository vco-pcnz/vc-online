<template>
  <div>
    <div class="inline" @click="init"><slot></slot></div>
    <div @click.stop ref="JournalRef" class="Journal">
      <a-modal :width="550" :open="visible" :title="formState?.id ? t('编辑投资') : t('创建投资')" :getContainer="() => $refs.JournalRef" :maskClosable="false" :footer="false" @cancel="updateVisible(false)">
        <div class="content sys-form-content">
          <div class="flex" style="justify-content: center">
            <vco-upload-image v-model:value="formState.logo" text="Logo" :isAvatar="true"></vco-upload-image>
          </div>
       
          <div class="flex justify-center">
            <a-button @click="save" type="dark" class="save big uppercase" :disabled="!Boolean(formState.logo) " :loading="loading">
              {{ t('确认') }}
            </a-button>
          </div>
        </div>
      </a-modal>
    </div>
  </div>
</template>

<script scoped setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { selectDateFormat } from '@/utils/tool';
import { message } from 'ant-design-vue/es';
import { investEdit } from '@/api/invest/index';

const { t } = useI18n();
const emits = defineEmits(['update']);

const props = defineProps({
  
});

const visible = ref(false);
const loading = ref(false);
const validate = ref(false);

const formState = ref({
  logo: '',
});


const updateVisible = (value) => {
  visible.value = value;
};

const save = () => {
  validate.value = true;
  if (!formState.value.logo) {
    return;
  }
  loading.value = true;
  let params = {
    ...formState.value
  };
  investEdit(params)
    .then((res) => {
      emits('update');
      message.success(t('保存成功'));
      updateVisible(false);
    })
    .finally((_) => {
      loading.value = false;
    });
};

const init = (val) => {
  validate.value = false;
  if (val) {
    formState.value = {
      ...val
    };
  } else {
    formState.value = {
      logo: ''
    };
  }
  visible.value = true;
};

// 暴露方法给父组件
defineExpose({
  init
});
</script>
<style scoped lang="less">
@import '@/styles/variables.less';

.Journal {
  :deep(.ant-modal-content) {
    .ant-modal-header {
      padding: 72px 84px 0px;
      border-radius: 24px;
      .ant-modal-title {
        font-size: 20px;
        font-weight: 500;
      }
    }

    .ant-input-number-group .ant-input-number-group-addon {
      border-start-end-radius: 10px;
      border-end-end-radius: 10px;
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
        margin-top: 24px;
      }
    }
  }

  .input-item {
    margin-top: 20px;
  }

  .edit {
    font-size: 25px;
    padding-left: 10px;
    color: #333;
  }
}
</style>
