<template>
  <vco-process-title :title="t('其他安全信息')">
    <a-button type="primary" shape="round" class="uppercase" @click="saveHandle" :loading="subLoading">{{ t('保存') }}</a-button>
  </vco-process-title>
  <!-- 人员选择 -->
  <vco-choose-add-user v-model:visible="showChooseVisible" :title="t('利益相关者')" @done="userChoiced"></vco-choose-add-user>

  <a-form ref="formRef" class="mt-5 sys-form-content" layout="vertical" :model="formState" :rules="formRules">
    <a-row :gutter="24">
      <a-col :span="24">
        <a-form-item :label="t('承包商')" name="main_contractor">
          <vco-company-select v-model:name="formState.main_contractor"></vco-company-select>
        </a-form-item>
      </a-col>
      <a-col :span="24">
        <a-form-item :label="t('履约保函')" name="security_package">
          <a-select v-model:value="formState.security_package" mode="multiple" style="width: 100%" :options="securityOptions"></a-select>
        </a-form-item>
      </a-col>
      <a-col :span="24">
        <a-form-item label="" name="guarantor_uuids">
          <div class="title-content">
            <p>{{ t('担保人') }}</p>
            <a-button v-if="userData.length" type="primary" size="small" shape="round" class="uppercase" @click="openDialg">
              {{ t('添加') }}
            </a-button>
          </div>
          <div class="info-content">
            <template v-if="userData.length">
              <div v-for="(item, index) in userData" :key="item.uuid" class="user-item">
                <vco-user-item :data="item" :main="true" :tips="item.category === 2 ? 'company' : ''"></vco-user-item>
                <a-popconfirm :title="t('移除主账号保存后，会移除其下的所有子账号，确定移除吗？')" :ok-text="t('确定')" :cancel-text="t('取消')" v-if="item.category === 2" @confirm="removeItem(index)">
                  <i class="iconfont">&#xe77d;</i>
                </a-popconfirm>
                <i v-else class="iconfont" @click="removeItem(index)"> &#xe77d; </i>
              </div>
            </template>
            <p v-else class="no-data" @click="openDialg">
              {{ t('请选择') }}
            </p>
          </div>
        </a-form-item>
      </a-col>
    </a-row>
  </a-form>
</template>

<script setup>
import { reactive, ref, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { removeDuplicates } from '@/utils/tool';
import { cloneDeep } from 'lodash';
import { systemDictData } from '@/api/system';
import { addGuarantor } from '@/api/import';

const emits = defineEmits(['reload']);
const props = defineProps({
  currentId: {
    type: [Number, String],
    required: true
  },
  guarantorInfo: {
    type: Object,
    default: () => {
      return {
        is_check: false,
        check_status: 407,
        main_contractor: '',
        security_package: [],
        guarantor_list: []
      };
    }
  }
});

const { t } = useI18n();

const formRef = ref();
const formState = reactive({
  main_contractor: '',
  security_package: [],
  guarantor_uuids: []
});

const formRules = ref({
  guarantor_uuids: [{ required: true, message: t('请选择') + t('担保人'), trigger: 'change' }],
  security_package: [{ required: true, message: t('请选择') + t('履约保函'), trigger: 'change' }],
  main_contractor: [{ required: true, message: t('请输入') + t('承包商'), trigger: 'change' }]
});

const securityOptions = ref([]);

const subLoading = ref(false);
const saveHandle = () => {
  formRef.value
    .validate()
    .then(() => {
      const params = cloneDeep(formState);
      params.security_package = params.security_package.join(',');
      params.uuid = props.currentId;

      const guarantor_uuids = userData.value.filter((item) => item.category === 2 || !item.category).map((item) => item.uuid);
      const guarantor_list = props.guarantorInfo.guarantor_list.filter((item) => item.category !== 2).map((item) => item.id);
      const userdata_list = userData.value.filter((item) => item.category !== 2).map((item) => item.id);

      const del_ids = guarantor_list.filter((item) => !userdata_list.includes(item));

      params.guarantor_uuids = guarantor_uuids;
      params.del_ids = del_ids;
      subLoading.value = true;
      addGuarantor(params)
        .then(() => {
          subLoading.value = false;
          emits('reload');
        })
        .catch(() => {
          subLoading.value = false;
        });
    })
    .catch((error) => {
      console.log('error', error);
    });
};

const showChooseVisible = ref(false);

const openDialg = () => {
  showChooseVisible.value = true;
};

const userData = ref([]);
const userChoiced = (data) => {
  const dataArr = [...userData.value, ...data];

  userData.value = removeDuplicates(dataArr, 'uuid');
  formState.guarantor_uuids = userData.value.map((item) => item.uuid);
  formRef.value.validateFields(['guarantor_uuids']);
};

const removeItem = (index) => {
  userData.value.splice(index, 1);

  formState.guarantor_uuids.splice(index, 1);
  formRef.value.validateFields(['guarantor_uuids']);
};

const getSecurityTypeData = () => {
  systemDictData('performance_security').then((res) => {
    const data = res || [];
    data.forEach((item) => {
      item.label = item.name;
      item.value = item.code;
    });
    securityOptions.value = data;
  });
};

const dataInit = () => {
  if (!props.guarantorInfo) return;
  const guarantor_list = cloneDeep(props.guarantorInfo.guarantor_list);
  formState.main_contractor = props.guarantorInfo.main_contractor;
  formState.security_package = props.guarantorInfo.security_package;
  userData.value = guarantor_list;
  formState.guarantor_uuids = userData.value.map((item) => item.uuid);
};

watch(
  () => props.guarantorInfo,
  (val) => {
    if (val) {
      dataInit();
    }
  }
);

onMounted(() => {
  dataInit();

  getSecurityTypeData();
});
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';
.title-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  > p {
    font-size: 12px;
    color: #888;
    &.details {
      &::before {
        display: none;
      }
    }
    &::before {
      display: inline-block;
      margin-inline-end: 4px;
      color: #ff4d4f;
      font-size: 14px;
      font-family: SimSun, sans-serif;
      line-height: 1;
      content: '*';
    }
  }
}
.info-content {
  border-radius: 8px;
  border: 1px solid #282828;
  padding: 15px;
  margin-top: 10px;
  min-height: 50px;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  .user-item {
    width: 48%;
    padding: 8px 10px;
    background-color: #f7f0e6;
    border-radius: 8px;
    margin-top: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    &:first-child,
    &:nth-child(2) {
      margin-top: 0;
    }
    .iconfont {
      font-size: 13px;
      cursor: pointer;
      color: @colorPrimary;
      &:hover {
        opacity: 0.8;
      }
    }
  }
}

.no-data {
  font-size: 12px;
  color: #999;
  display: block;
  width: 100%;
  cursor: pointer;
  &.disabled {
    cursor: default;
    pointer-events: none;
  }
}
</style>
