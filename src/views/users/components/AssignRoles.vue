<template>
  <a-modal :width="480" :open="open" :title="title" @cancel="closeModal">
    <div class="sys-form-content mt-5">
      <a-form ref="formRef" :model="form" :rules="rules" layout="vertical">
        <a-form-item name="roles" :label="t('用户角色')">
          <a-select v-model:value="form.roles" mode="multiple" :placeholder="t('选择角色')" @change="handleChange" @deselect="handleDeselect">
            <a-select-option v-for="(item, index) in roleOptions" :key="item.value || index" :value="item.value" :not="item.not" :status="item.status" :disabled="item.disabled">
              {{ item.label }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </div>
    <template #footer>
      <div class="modal-footer">
        <a-button size="large" type="cyan" :loading="loading" class="register-btn big shadow bold" @click="save">
          {{ t('提交') }}
        </a-button>
      </div>
    </template>
  </a-modal>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { assignRole } from '@/api/users';
import useFormData from '@/utils/use-form-data';
import { message } from 'ant-design-vue';
import { useUsersStore } from '@/store';

const { t } = useI18n();
const loading = ref(false);
const formRef = ref(null);
const usersStore = useUsersStore();
const roleOptions = ref([]);
const disabledIds = ref([]);

const props = defineProps(['open', 'title', 'uuids', 'selectedData']);
const emit = defineEmits(['update:open']);
// 表单数据
const { form, resetFields, assignFields } = useFormData({
  roles: []
});

// 表单验证规则
const rules = reactive({
  roles: [
    {
      required: true,
      message: t('请选择') + t('用户角色'),
      type: 'array',
      trigger: 'blur'
    }
  ]
});

const getNewOptions = (notIds) => {
  roleOptions.value = roleOptions.value.map((item) => {
    if (notIds.includes(item.value)) {
      return {
        ...item,
        disabled: true
      };
    }
    return {
      ...item,
      disabled: item.status !== 1
    };
  });
};

const handleChange = (value, option) => {
  if (option.length) {
    let notIds = disabledIds.value;
    option.forEach((item) => {
      if (item.not) {
        notIds = notIds.concat(item.not.split(',').map(Number));
      }
    });
    disabledIds.value = notIds;
    getNewOptions(notIds);
  }
};

const handleDeselect = (value, option) => {
  if (option.not) {
    const notIds = option.not.split(',').map(Number);
    disabledIds.value = disabledIds.value.filter((item) => !notIds.includes(item));
    getNewOptions(disabledIds.value);
  }
};

const closeModal = () => {
  emit('update:open', false);
  resetFields();
  getNewOptions([]);
  formRef.value.clearValidate();
};

const save = () => {
  if (!props.uuids) {
    return;
  }
  formRef.value.validate().then(() => {
    loading.value = true;
    assignRole({
      uuids: props.uuids,
      ...form
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

watch(
  () => usersStore.roleList,
  (val) => {
    if (val.length) {
      roleOptions.value = val.map((item) => ({
        ...item,
        label: item.name,
        value: item.id,
        disabled: item.status !== 1
      }));
    }
  }
);

watch(
  () => props.open,
  (val) => {
    if (val && props.selectedData.length === 1) {
      let roles = props.selectedData[0].roles;
      let roleIds = [];
      let options = [];
      usersStore.roleList.map((item) => {
        if (roles.includes(item.name)) {
          roleIds.push(item.id);
          options.push(item)
        }
      });
      handleChange('',options)
      assignFields({
        roles: roleIds
      });
    }
  },
  { deep: true }
);
</script>

<style scoped lang="less">
.modal-footer {
  display: flex;
  justify-content: center;
  padding: 10px 0;
}
</style>
