<template>
  <div
    class="block-item mb"
    :class="{ checked: guarantorInfo.is_check && blockInfo?.showCheck, 'details': isDetails, 'open': isOpen }"
  >
    <!-- 人员选择 -->
    <vco-choose-add-user
      v-model:visible="showChooseVisible"
      :title="t('利益相关者')"
      @done="userChoiced"
    ></vco-choose-add-user>

    <vco-process-title v-if="!isOpen" :title="t('其他安全信息')">
      <div v-if="!isDetails" class="flex gap-5 items-center">
        <a-button
          v-if="blockInfo?.showEdit"
          type="primary"
          shape="round"
          :loading="subLoading"
          :disabled="!formState.guarantor_uuids.length"
          class="uppercase"
          @click="saveHandle()"
        >
          {{ t('保存') }}
        </a-button>

        <a-popconfirm
          :title="t('确定通过审核吗？')"
          :ok-text="t('确定')"
          :cancel-text="t('取消')"
          v-if="blockInfo?.showCheck && openShowCheck && !guarantorInfo.is_check && props.guarantorInfo.guarantor_list.length"
          @confirm="checkHandle"
        >
          <a-button
            type="dark"
            shape="round"
            class="uppercase"
          >
            {{ t('审核') }}
          </a-button>
        </a-popconfirm>

        <div class="target-content" @click="guarantorTarget = !guarantorTarget">
          <div class="icon" :title="guarantorTarget ? t('收起') : t('展开')">
            <i v-if="guarantorTarget" class="iconfont">&#xe711;</i>
            <i v-else class="iconfont">&#xe712;</i>
          </div>
        </div>
      </div>
    </vco-process-title>

    <div v-show="guarantorTarget" class="sys-form-content mt-5">
      <a-form
        ref="formRef"
        layout="vertical"
        :model="formState"
        :rules="formRules"
      >
        <a-row :gutter="24">
          <a-col :span="24">
            <a-form-item :label="t('承包商')" name="main_contractor">
              <a-input
                v-model:value="formState.main_contractor"
                :disabled="!blockInfo?.showEdit && !isOpen"
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item :label="t('履约保函')" name="security_package">
              <a-select
                v-model:value="formState.security_package"
                mode="multiple"
                style="width: 100%"
                :disabled="!blockInfo?.showEdit && !isOpen"
                :options="securityOptions"
              ></a-select>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="" name="guarantor_uuids">
              <div class="title-content">
                <p :class="{'details': isDetails}">{{ t('担保人') }}</p>
                <a-button
                  v-if="userData.length && blockInfo?.showEdit && !disabledGua"
                  type="primary"
                  size="small"
                  shape="round"
                  class="uppercase"
                  @click="openDialg"
                >
                  {{ t('添加') }}
                </a-button>
              </div>
              <div class="info-content">
                <template v-if="userData.length">
                  <div
                    v-for="(item, index) in userData"
                    :key="item.uuid"
                    class="user-item"
                  >
                    <vco-user-item :data="item" :main="true"></vco-user-item>
                    <i
                      v-if="blockInfo?.showEdit && !disabledGua"
                      class="iconfont"
                      @click="removeItem(index)"
                    >
                      &#xe77d;
                    </i>
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
      <div class="check-content">
        <i class="iconfont">&#xe647;</i>
      </div>
    </div>

    <div class="flex justify-end mt-5">
      <a-button
        type="dark" shape="round" class="big shadow bold uppercase"
        @click="saveHandle"
        :loading="subLoading"
      >{{ t('保存') }}</a-button>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, onUnmounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { removeDuplicates } from '@/utils/tool';
import { cloneDeep } from 'lodash';
import { message } from 'ant-design-vue/es';
import { systemDictData } from '@/api/system';
import {
  projectAuditSaveMode,
  projectAuditCheckMode
} from '@/api/process';
import { projectDetailSaveGuarantor } from "@/api/project/project"
import emitter from '@/event';

const emits = defineEmits(['refresh']);
const props = defineProps({
  blockInfo: {
    type: Object,
    default: () => {}
  },
  currentId: {
    type: [Number, String],
    required: true,
  },
  currentStep: {
    type: Object
  },
  guarantorInfo: {
    type: Object,
    default: () => {
      return {
        is_check: false,
        check_status: 407,
        main_contractor: '',
        security_package: [],
        guarantor_list: [],
      };
    },
  },
  isDetails: {
    type: Boolean,
    default: false
  },
  isOpen: {
    type: Boolean,
    default: false
  }
});

const { t } = useI18n();

const formRef = ref();
const formState = reactive({
  main_contractor: '',
  security_package: [],
  guarantor_uuids: '',
});

const formRules = ref({
  guarantor_uuids: [
    { required: true, message: t('请选择') + t('担保人'), trigger: 'change' },
  ],
});

if (props.isOpen) {
  formRules.value['security_package'] = [
    { required: true, message: t('请选择') + t('履约保函'), trigger: 'change' },
  ]
  formRules.value['main_contractor'] = [
    { required: true, message: t('请输入') + t('承包商'), trigger: 'blur' },
  ]
}

const disabledGua = computed(() => props.currentStep?.mark === 'step_open')
const securityOptions = ref([]);

const openShowCheck = computed(() => {
  let res = true
  if (disabledGua.value) {
    // res = props.guarantorInfo.security_package.length && props.guarantorInfo.main_contractor
  }

  return res
})

const subLoading = ref(false);
const saveHandle = () => {
  formRef.value
    .validate()
    .then(() => {
      const params = cloneDeep(formState);
      params.security_package = params.security_package.join(',');
      params.uuid = props.currentId;
      params.code = props.blockInfo?.code;

      let ajaxFn = projectAuditSaveMode

      if (props.isOpen) {
        ajaxFn = projectDetailSaveGuarantor

        delete params.code
      }

      subLoading.value = true;
      ajaxFn(params)
        .then(() => {
          subLoading.value = false;

          if (!props.isOpen) {
            emitter.emit('refreshAuditHisList');
          }
          
          emits('refresh');
        })
        .catch(() => {
          subLoading.value = false;
        });
    })
    .catch((error) => {
      console.log('error', error);
    });
};

const showChooseVisible = ref(false)

const openDialg = () => {
  showChooseVisible.value = true
};

const userData = ref([]);
const userChoiced = (data) => {
  const dataArr = [...userData.value, ...data];

  userData.value = removeDuplicates(dataArr, 'uuid');
  formState.guarantor_uuids = userData.value.map((item) => item.uuid).join(',');
  formRef.value.validateFields(['guarantor_uuids']);

  emitter.emit('changeDataLetDis', true)
};

const removeItem = (index) => {
  userData.value.splice(index, 1);

  const uuidsArr = formState.guarantor_uuids.split(',')
  uuidsArr.splice(index, 1);
  formState.guarantor_uuids = uuidsArr.join(',')
  formRef.value.validateFields(['guarantor_uuids']);

  emitter.emit('changeDataLetDis', true)
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
  formState.main_contractor = props.guarantorInfo.main_contractor;
  formState.security_package = props.guarantorInfo.security_package;
  userData.value = props.guarantorInfo.guarantor_list;
  formState.guarantor_uuids = userData.value.map((item) => item.uuid).join(',');
};

const checkHandle = async () => {
  formRef.value
    .validate()
    .then(async () => {
      const params = {
        uuid: props.currentId,
        code: props.blockInfo?.code
      }

      await projectAuditCheckMode(params)
      .then(() => {
        emits('refresh');
        emitter.emit('refreshAuditHisList');
        return true;
      })
      .catch(() => {
        return false;
      });

    })
    .catch((error) => {
      console.log('error', error);
    });

  // const params = {
  //   uuid: props.currentId,
  //   code: props.blockInfo?.code
  // }
  
  // await projectAuditCheckMode(params)
  //   .then(() => {
  //     emits('refresh');
  //     emitter.emit('refreshAuditHisList');
  //     return true;
  //   })
  //   .catch(() => {
  //     return false;
  //   });
  // if (props.currentStep.mark === 'step_open' && !props.guarantorInfo.main_contractor) {
  //   message.error(t('请先设置后保存再审核'));
  // } else {
  //   const params = {
  //     uuid: props.currentId,
  //     code: props.blockInfo?.code
  //   }
    
  //   await projectAuditCheckMode(params)
  //     .then(() => {
  //       emits('refresh');
  //       emitter.emit('refreshAuditHisList');
  //       return true;
  //     })
  //     .catch(() => {
  //       return false;
  //     });
  // }
};

const guarantorTarget = ref(true)

const blockShowTargetHandle = (flag) => {
  guarantorTarget.value = flag
}

onMounted(() => {
  dataInit();
  getSecurityTypeData();
  emitter.on('blockShowTarget', blockShowTargetHandle)
});

onUnmounted(() => {
  emitter.off('blockShowTarget', blockShowTargetHandle)
})
</script>

<style lang="less" scoped>
@import './../styles/common.less';
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
}

.block-item {
  :deep(.ant-input[disabled]),
  :deep(.ant-select-disabled .ant-select-selection-item-content) {
    color: #999 !important;
  }
  &.open {
    box-shadow: none;
    padding: 0 20px;
    overflow: visible;
  }
}
</style>
