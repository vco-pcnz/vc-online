<template>
  <div class="inline" @click="init">
    <slot></slot>
  </div>
  <div @click.stop ref="JournalRef" class="Journal">
    <a-modal :width="750" :open="visible" :title="t('编辑项目')" :getContainer="() => $refs.JournalRef"
             :maskClosable="false" :footer="false" @cancel="updateVisible(false)">

      <div class="content sys-form-content">
        <div style="color: #181818">ID {{ data?.project_apply_sn }}</div>
        <div class="input-item">
          <div class="label" :class="{ err: !formState.project_name && validate }">{{ t('项目名称') }}</div>
          <a-input v-model:value="formState.project_name" />
        </div>
        <div class="input-item">
          <div class="label" :class="{ err: !formState.project_about && validate }">{{ t('项目详情') }}</div>
          <a-textarea v-model:value="formState.project_about" :rows="4" />
        </div>

        <div class="flex justify-center">
          <a-button @click="save" type="dark" class="save big uppercase" :loading="loading">
            {{ t('确认') }}
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
import { saveProjectName } from '@/api/project/project/index';

const { t } = useI18n();
const emits = defineEmits(['change']);

const props = defineProps({
  data: {
    type: Object,
    default: {},
  },
});

const visible = ref(false);
const loading = ref(false);
const validate = ref(false);

const formState = ref({
  project_name: '',
  project_about: '',
});

const updateVisible = (value) => {
  visible.value = value;
};

const save = () => {
  validate.value = true;
  if (!formState.value.project_name) return message.error(t('请输入') + t('项目名称'));
  if (!formState.value.project_about) return message.error(t('请输入') + t('项目详情'));
  loading.value = true;
  let params = {
    ...formState.value,
    uuid: props.data.uuid
  };
  saveProjectName(params)
    .then((res) => {
      emits('change');
      message.success(t('修改成功'));
      updateVisible(false);
    })
    .finally((_) => {
      loading.value = false;
    });
};

const init = () => {
  formState.value.project_name = props.data.project_name;
  formState.value.project_about = props.data.project_about;
  visible.value = true;
};
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
}
</style>
