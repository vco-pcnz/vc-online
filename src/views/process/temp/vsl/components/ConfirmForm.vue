<template>
  <div
    class="block-item mb"
    :class="{ checked: confirmInfo.is_check && blockInfo.showCheck, 'details': isDetails }"
  >
    <vco-process-title :title="t('确定信息')">
      <div v-if="!isDetails" class="flex gap-5">
        <a-button
          v-if="showSaveBtn"
          type="primary"
          shape="round"
          :loading="subLoading"
          class="uppercase"
          @click="saveHandle"
        >
          {{ t('保存') }}
        </a-button>
        <a-popconfirm
          v-if="blockInfo.showCheck && !confirmInfo.is_check && confirmInfo.confirm"
          :title="t('确定通过审核吗？')"
          :ok-text="t('确定')"
          :cancel-text="t('取消')"
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
        <div class="target-content" @click="confirmTarget = !confirmTarget">
          <div class="icon" :title="confirmTarget ? t('收起') : t('展开')">
            <i v-if="confirmTarget" class="iconfont">&#xe711;</i>
            <i v-else class="iconfont">&#xe712;</i>
          </div>
        </div>
      </div>
    </vco-process-title>

    <div v-show="confirmTarget" class="sys-form-content mt-5">
      <a-form ref="formRef" layout="vertical" :model="form" :rules="formRules">
        <div class="col-item">
          <p>1、{{ t('合同是否已签订？') }}</p>
          <div class="flex gap-4 mt-3">
            <a-checkbox v-model:checked="form.agreementYes" :disabled="!canEidt" @change="() => checkBoxChange('agreement', 'Yes')">{{ t('已签订' )}}</a-checkbox>
            <a-checkbox v-model:checked="form.agreementNo" :disabled="!canEidt" @change="() => checkBoxChange('agreement', 'No')">{{ t('未签订' )}}</a-checkbox>
          </div>
          <a-form-item v-if="form.agreementNo" name="agreementRemark" class="mt-4">
            <a-input v-model:value="form.agreementRemark" :disabled="!canEidt" :placeholder="t('请输入') + t('原因')" />
          </a-form-item>
        </div>
        <div class="col-item">
          <p>2、{{ t('定金是否已收到？') }}</p>
          <div class="flex gap-4 mt-3">
            <a-checkbox v-model:checked="form.depositInfoYes" :disabled="!canEidt" @change="() => checkBoxChange('depositInfo', 'Yes')">{{ t('已收到' )}}</a-checkbox>
            <a-checkbox v-model:checked="form.depositInfoNo" :disabled="!canEidt" @change="() => checkBoxChange('depositInfo', 'No')">{{ t('未收到' )}}</a-checkbox>
          </div>
          <a-form-item v-if="form.depositInfoNo" name="depositInfoRemark"class="mt-4">
            <a-input v-model:value="form.depositInfoRemark" :disabled="!canEidt" :placeholder="t('请输入') + t('原因')" />
          </a-form-item>
        </div>
      </a-form>
    </div>
    
    <div v-if="blockInfo.showCheck" class="check-content">
      <i class="iconfont">&#xe647;</i>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, onUnmounted, computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import {
    projectAuditSaveMode,
    projectAuditCheckMode
  } from '@/api/process';
  import { message } from 'ant-design-vue/es';
  import emitter from '@/event';
  
  const emits = defineEmits(['done', 'refresh']);

  const { t } = useI18n();

  const props = defineProps({
    confirmInfo: {
      type: Object,
      default: () => {}
    },
    offerInfo: {
      type: Object,
      default: () => {}
    },
    blockInfo: {
      type: Object,
      default: () => {}
    },
    currentStep: {
      type: Object
    },
    currentId: {
      type: [Number, String],
      default: ''
    },
    isDetails: {
      type: Boolean,
      default: false
    }
  })

  const currentMark = computed(() => props.currentStep?.mark)
  const canEidt = computed(() => ['step_lm_check'].includes(currentMark.value))

  const formRef = ref()

  const form = ref({
    depositInfoYes: false,
    depositInfoNo: false,
    depositInfoRemark: '',
    agreementYes: false,
    agreementNo: false,
    agreementRemark: ''
  })

  const showSaveBtn = computed(() => {
    return props.blockInfo.showEdit && ((form.value.depositInfoYes || form.value.depositInfoNo) && (form.value.agreementYes || form.value.agreementNo))
  })

  const formRules = {
    depositInfoRemark: [
      { required: true, message: t('请输入') + t('原因'), trigger: 'blur' },
    ],
    agreementRemark: [
      { required: true, message: t('请输入') + t('原因'), trigger: 'blur' },
    ],
  };

  const checkBoxChange = (type, key) => {
    const elseKey = key === 'Yes' ? 'No' : 'Yes'
    const keyStr = `${type}${key}`
    const elseKeyStr = `${type}${elseKey}`

    if (form.value[keyStr]) {
      form.value[elseKeyStr] = false
    }
  }

const checkHandle = async () => {
  try {
    await formRef.value.validate();

    // LM 再次检查
    if (props.currentStep?.mark === 'step_lm_check') {
      if (form.value.agreementYes && !props.offerInfo.sign_offer) {
        message.error(t('请上传') + t('已签订Offer'));
        return false;
      }
    }

    const params = {
      uuid: props.currentId,
      code: props.blockInfo.code
    };

    await projectAuditCheckMode(params);

    // 触发刷新事件
    emits('refresh');
    emitter.emit('refreshAuditHisList');

    return true; // 操作成功
  } catch (error) {
    console.error('校验或审核失败:', error);
    return false; // 操作失败
  }
};

  const subLoading = ref(false);
  const saveHandle = async () => {
    formRef.value
    .validate()
    .then(async () => {
      // LM 再次检查
      if (props.currentStep?.mark === 'step_lm_check') {
        if (form.value.agreementYes && !props.offerInfo.sign_offer) {
          message.error(t('请上传') + t('已签订Offer'));
          return false
        }
      }

      const params = {
        confirm: JSON.stringify(form.value),
        code: props.blockInfo.code,
        uuid: props.currentId
      };

      subLoading.value = true;

      await projectAuditSaveMode(params)
      .then(async () => {
        subLoading.value = false;
        emits('refresh');
        
        // 操作记录
        emitter.emit('refreshAuditHisList');
      })
      .catch(() => {
        subLoading.value = false;
      });
    })
    .catch((error) => {
      console.log('error', error);
    });
  };

  const confirmTarget = ref(true)

  const blockShowTargetHandle = (flag) => {
    confirmTarget.value = flag
  }

  onMounted(() => {
    if (props.confirmInfo.confirm) {
      form.value = JSON.parse(props.confirmInfo.confirm)
    }
    emitter.on('blockShowTarget', blockShowTargetHandle)
  })

  onUnmounted(() => {
    emitter.off('blockShowTarget', blockShowTargetHandle)
  })
</script>

<style lang="less" scoped>
  @import '@/views/process/temp/default/styles/common.less';
  .col-item {
    margin-top: 30px;
    &:first-child {
      margin-top: 0;
    }
  }
</style>
