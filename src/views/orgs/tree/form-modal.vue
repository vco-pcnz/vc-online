<template>
  <div>
    <div @click="open = true">
      <slot></slot>
    </div>
    <a-modal :width="600" v-if="open" :open="open" @cancel="open = false" :title="t(form.uuid ? '编辑所有权' : '添加所有权')" class="sys-form-content">
      <div class="sys-form-content mt-5">
        <a-form ref="formRef" :model="form" :rules="dynamicRules" layout="vertical">
          <a-form-item label=" ">
            <div style="display: flex; align-items: center">
              从利益相关者选择：
              <div style="flex: 1">
                <vco-choose-user ref="vcoChooseUserRef" url="stake/selStake" :showRest="Boolean(check_user_uuid)" @change="checkUser"></vco-choose-user>
              </div>
            </div>
          </a-form-item>
          <a-form-item name="name" :label="t('股东姓名')">
            <a-input v-model:value="form.name" :placeholder="t('请输入')" :disabled="disabled" />
          </a-form-item>
          <a-form-item :label="t('类型f')" name="type">
            <a-radio-group v-model:value="form.type" :disabled="disabled">
              <a-radio :value="item.code" :key="item.code" v-for="item in orgsStore.stakeholderType">
                {{ item.name }}
              </a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="NZBZ" name="nzbz">
            <a-input v-model:value="form.nzbz" :placeholder="t('请输入')" :disabled="disabled" />
          </a-form-item>
          <a-form-item :label="t('所有权')" name="weight">
            <a-input-number v-model:value="form.weight" addon-after="%" :min="0" :max="100"></a-input-number>
          </a-form-item>
        </a-form>
      </div>
      <template #footer>
        <div class="modal-footer">
          <a-button type="cyan" shape="round" class="big shadow bold uppercase" :loading="loading" @click="submit">
            {{ t('提交') }}
          </a-button>
        </div>
      </template>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue';
import useFormData from '@/utils/use-form-data';
import { useI18n } from 'vue-i18n';
import { pick, trim, cloneDeep } from 'lodash';
import { useOrgsStore } from '@/store';
import { stakeOrgAdd, stakeOrgEdit } from '@/api/orgs';

const emits = defineEmits(['change']);
const { t } = useI18n();
const orgsStore = useOrgsStore();
const props = defineProps({
  detail: {
    type: Object
  }
});
const open = ref(false);
const disabled = ref(false);
const check_user_uuid = ref('');
const s_uuids = ref([]);
const formRef = ref();
const loading = ref(false);

const { form, resetFields, assignFields } = useFormData({
  p_uuid: '',
  s_uuid: '',
  uuid: '',
  type: '',
  name: '',
  nzbz: '',
  weight: 0
});

const dynamicRules = computed(() => {
  let rules = {
    name: [
      {
        required: true,
        message: t('请输入') + t('股东姓名')
      }
    ],
    type: [
      {
        required: true,
        message: t('请输入') + t('类型f')
      }
    ],
    weight: [
      { required: true, message: t('请输入') + t('所有权'), trigger: 'blur' },
      {
        pattern: /^(?:[1-9]\d*(?:\.\d+)?|0\.\d+)$/,
        message: t('请输入大于0的数字'),
        trigger: 'change'
      }
    ]
  };
  if (!disabled.value) {
    rules = {
      ...rules,
      nzbz: [
        {
          required: true,
          message: t('请输入') + 'NZBZ'
        }
      ]
    };
  }
  return rules;
});

// 选择用户
const checkUser = (val) => {
  if (s_uuids.value.includes(val.uuid)) {
    return message.warning(t('请上传头像'));
  }
  disabled.value = !!val.uuid;
  let keys = ['name', 'type', 'nzbz'];
  const newData = pick(val, keys);
  Object.assign(form, newData);
  form.s_uuid = val.uuid;
  check_user_uuid.value = val.uuid;
};
// 初始化
const init = (val, type, has_s_uuids) => {
  s_uuids.value = has_s_uuids;
  check_user_uuid.value = '';
  if (type === 'add') {
    disabled.value = false;
    resetFields();
    form.p_uuid = val.uuid;
  } else {
    disabled.value = true;
    assignFields({
      ...val
    });
  }
  console.log(form);
  open.value = true;
};

// 提交
const submit = () => {
  formRef.value.validate().then(() => {
    loading.value = true;
    console.log(form);
    if (form.uuid) {
      // 编辑
      stakeOrgEdit(form)
        .then((res) => {
          emits('change');
          loading.value = false;
          open.value = false;
        })
        .catch(() => {
          loading.value = false;
        });
    } else {
      //添加
      stakeOrgAdd(form)
        .then((res) => {
          emits('change');
          loading.value = false;
          open.value = false;
        })
        .catch(() => {
          loading.value = false;
        });
    }
  });
};

onMounted(() => {
  // 加载数据
  orgsStore.getStakeholderType();
});

// 暴露方法给父组件
defineExpose({
  init
});
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';
.modal-footer {
  text-align: center;
}
.orgs-info {
  li {
    padding: 10px 30px;
    border-bottom: 1px solid #e2e5e2;
    position: relative;

    .avatar-box {
      display: flex;
      justify-content: center;
    }

    &:last-child {
      border: none;
    }

    .edit {
      position: absolute;
      top: 10px;
      right: 10px;
    }

    p {
      margin-top: 4px;
    }

    .label {
      color: #999;

      .iconfont {
        margin-right: 4px;

        &.cer {
          color: @colorPrimary;
        }
      }
    }

    .value {
      color: #000;
    }
  }
}
</style>
