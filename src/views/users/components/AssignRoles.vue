<template>
  <a-modal :width="480" :open="open" :title="title" @cancel="closeModal">
    <a-form ref="formRef" :model="form" :rules="rules" layout="vertical">
      <a-form-item name="roles" :label="t('用户角色')">
        <a-select
          v-model:value="form.roles"
          :options="roleOptions"
          mode="multiple"
          :placeholder="t('选择角色')"
        />
      </a-form-item>
    </a-form>
    <template #footer>
      <div class="modal-footer">
        <a-button
          @click="save"
          size="large"
          type="primary"
          style="width: 40%"
          :loading="loading"
        >
          {{ t('提交') }}
        </a-button>
      </div>
    </template>
  </a-modal>
</template>

<script setup>
import { ref, computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { assignRole } from '@/api/users';
import useFormData from '@/utils/use-form-data';
import { message } from 'ant-design-vue';
import { useUsersStore } from '@/store';

const { t } = useI18n();
const loading = ref(false);
const formRef = ref(null);
const usersStore = useUsersStore();

const roleOptions = computed(() => {
  return usersStore.roleList.map((item) => ({
    label: item.name,
    value: item.id,
  }));
});

const props = defineProps(['open', 'title', 'uuids']);
const emit = defineEmits(['update:open']);
// 表单数据
const { form } = useFormData({
  roles: [],
});

// 表单验证规则
const rules = reactive({
  roles: [
    {
      required: true,
      message: t('请选择') + t('选择角色'),
      type: 'array',
      trigger: 'blur',
    },
  ],
});
const closeModal = () => {
  emit('update:open', false);
};

const save = () => {
  if(!props.uuids) {
    return;
  }
  formRef.value.validate().then(() => {
    loading.value = true;
    assignRole({
      uuids: props.uuids.map(item => item.uuid),
      ...form,
    })
      .then(() => {
        loading.value = false;
        usersStore.getUserList();
        message.success(t('修改成功'));
        closeModal();
      })
      .catch(() => {
        loading.value = false;
      });
  });
};

</script>

<style scoped lang="less">
@import '@/styles/variables.less';
.submit-btn:hover {
  color: @clr_white;
}

.modal-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 0;
}

.modal-content {
  height: 70vh;
  overflow-y: auto;
}
</style>
