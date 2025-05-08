<template>
  <div class="inline" @click="init"><slot></slot></div>
  <div ref="modeRef" class="myMode">
    <a-modal :width="700" :open="visible" :title="t('项目地址')" :getContainer="() => $refs.modeRef" :maskClosable="false" :footer="false" @cancel="updateVisible(false)">
      <div class="sys-form-content">
        <AddressList ref="addressListRef" :config="addressConfig" v-model:value="formState.project_address_other"></AddressList>
        <div class="flex justify-center">
          <a-button @click="submitHandle" type="dark" class="save big uppercase mt-3" :loading="subLoading">
            {{ t('保存') }}
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';
import { saveAddr } from '@/api/import';
import AddressList from './AddressList/index.vue';

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
  project_con_id: '',
  project_address_other: [
    {
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
    }
  ]
});

const addressListRef = ref(null);
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
const init = () => {
  visible.value = true;
  formState.value.project_address_other[0]['project_address'] = props.data['project_address'] || formState.value['project_address'] || '';
  for (const key in formState.value) {
    formState.value[key] = props.data[key] || formState.value[key] || '';
  }
};

const formRef = ref(null);
const subLoading = ref(false);
const submitHandle = async () => {
  for (const key in formState.value.project_address_other[0]) {
    formState.value[key] = formState.value.project_address_other[0][key] || '';
  }
  const validate = await addressListRef.value.validate();
  if (!validate) return;

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
