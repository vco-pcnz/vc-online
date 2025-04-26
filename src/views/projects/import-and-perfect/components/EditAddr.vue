<template>
  <div class="inline" @click="init"><slot></slot></div>
  <div ref="modeRef" class="myMode">
    <a-modal :width="700" :open="visible" :title="t('项目地址')" :getContainer="() => $refs.modeRef" :maskClosable="false" :footer="false" @cancel="updateVisible(false)">
      <div class="sys-form-content">
        <a-form ref="formRef" layout="vertical" :model="formState" :rules="formRules">
          <vco-address :config="addressConfig" ref="vcoAddressRef" @change="setAddressInfo"></vco-address>
          <div class="flex justify-center">
            <a-button @click="submitHandle" type="dark" class="save big uppercase mt-3" :loading="subLoading">
              {{ t('保存') }}
            </a-button>
          </div>
        </a-form>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';
import { saveAddr } from '@/api/import';

const { t } = useI18n();
const emits = defineEmits(['reload']);

const props = defineProps({
  currentId: {
    type: [String, Number]
  },
  data: {
    type: Object
  }
});

const visible = ref(false);

const updateVisible = (value) => {
  visible.value = value;
};

const formState = ref({
  project_region: '',
  project_address_short: '',
  project_address: '',
  project_postcode: '',
  region_one_id: '',
  region_two_id: '',
  region_three_id: '',
  region_one_name: '',
  project_suburb: '',
  project_con_id: ''
});

const vcoAddressRef = ref();
const addressConfig = ref({
  addr: 'project_address_short',
  address: 'project_address',
  suburb: 'project_suburb',
  postal: 'project_postcode',
  con_id: 'project_con_id',
  region: 'project_region',
  province_code_name: 'region_one_name',
  province_code: 'region_one_id',
  city_code: 'region_two_id',
  district_code: 'region_three_id'
});
const formRules = {
  project_region: [{ required: true, message: t('请选择') + t('项目地址'), trigger: 'change' }],
  project_address_short: [{ required: true, message: t('请输入') + t('地址1'), trigger: 'blur' }],
  region_one_name: [{ required: true, message: t('请输入') + t('城市/州'), trigger: 'blur' }],
  project_postcode: [
    { required: true, message: t('请输入') + t('邮编'), trigger: 'blur' },
    {
      pattern: /^[A-Za-z0-9\s\-]+$/,
      message: t('邮编') + t('格式不正确'),
      trigger: 'blur'
    }
  ]
};
const init = () => {
  visible.value = true;
  for (const key in formState.value) {
    formState.value[key] = props.data[key] || formState.value[key] || '';
  }
  nextTick(() => {
    vcoAddressRef.value.init(formState.value);
  });
};

const setAddressInfo = (e) => {
  for (const key in e) {
    formState.value[key] = e[key] || '';
  }
};

const formRef = ref(null);
const subLoading = ref(false);
const submitHandle = () => {
  formRef.value
    .validate()
    .then(async () => {
      subLoading.value = true;

      saveAddr({ uuid: props.currentId, ...formState.value })
        .then(async (res) => {
          subLoading.value = false;
          emits('reload');
          updateVisible(false);
        })
        .catch(() => {
          subLoading.value = false;
        });
    })
    .catch((error) => {
      console.log('error', error);
    });
};
</script>

<style lang="less" scoped>
.myMode {
  :deep(.ant-modal-content) {
    .ant-modal-header {
      border-radius: 24px;
      .ant-modal-title {
        font-size: 20px;
        font-weight: 500;
      }
    }
  }
}
</style>
