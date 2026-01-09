<template>
  <a-modal
    :open="visible"
    :title="t('审核批示')"
    :width="460"
    :footer="null"
    :keyboard="false"
    :maskClosable="false"
    @cancel="updateVisible(false)"
  >
    <div class="sys-form-content mt-5">
      <a-form ref="formRef" layout="vertical" :model="formState" :rules="formRules">
        <a-form-item label="" name="reason">
          <a-textarea
            v-model:value="formState.reason"
            :placeholder="t('请输入')"
            :auto-size="{ minRows: 2, maxRows: 5 }"
          />
        </a-form-item>
      </a-form>
    </div>

    <div v-if="type === 'step_director_audit'" class="mt-2">
      <conditions-list
        :current-id="uuid"
        :btn-add="true"
        :end-date="dataInfo.loan.end_date"
      >
        <template #add-btn>
          <div class="flex justify-end">
            <a-button type="link">{{ t('添加新状况') }}</a-button>
          </div>
        </template>
      </conditions-list>
    </div>

    <div class="mt-5 flex justify-between gap-5">
      <a-button
        type="grey" class="big shadow bold uppercase w-full mb-5 mt-5"
        @click="updateVisible(false)"
      >{{ t('取消') }}</a-button>

      <a-button
        type="dark" class="big shadow bold uppercase w-full mb-5 mt-5"
        :loading="subLoading"
        @click="submitHandle"
      >{{ t('提交') }}</a-button>
    </div>
  </a-modal>
</template>

<script setup>
  import { ref, reactive, watch } from "vue";
  import { useI18n } from "vue-i18n";
  import { projectAuditSaveStep } from "@/api/process"
  import emitter from "@/event"
  import ConditionsList from "./ConditionsList.vue";

  const emits = defineEmits(['update:visible', 'done'])

  const props = defineProps({
    visible: {
      type: Boolean,
      default: false
    },
    uuid: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: ''
    },
    required: {
      type: Boolean,
      default: true
    },
    dataInfo: {
      type: Object,
      default: () => {}
    }
  });

  const { t } = useI18n();

  const formRef = ref()
  const formState = reactive({
    reason: ''
  })

  const formRules = {
    reason: [
      { required: props.required, message: t('请输入'), trigger: 'blur' }
    ]
  }

  /* 更新visible */
  const updateVisible = (value) => {
    emits('update:visible', value);
  };

  const subLoading = ref(false)
  const submitHandle = () => {
    formRef.value
    .validate()
    .then(() => {
      const params = {
        uuid: props.uuid,
        do__mark: props.type
      }
      
      if (props.type === 'step_fc_audit') {
        params.fc_review = formState.reason
      } else if (props.type === 'step_director_audit') {
        params.director_review = formState.reason
      } else if (props.type === 'step_lm_audit') {
        params.alm_review = formState.reason
      } else if (props.type === 'step_lm_review') {
        params.lm_review = formState.reason
      }

      subLoading.value = true

      projectAuditSaveStep(params).then((res) => {
        subLoading.value = false
        updateVisible(false)

        // 触发列表数据刷新
        emitter.emit('refreshRequestsList')

        emits('done', res)
      }).catch(() => {
        subLoading.value = false
      })
    })
    .catch(error => {
      console.log('error', error);
    });
  }

  watch(
    () => props.visible,
    (val) => {
      if (!val) {
        formState.reason = '';
        subLoading.value = false;
        formRef.value?.clearValidate();
      }
    }
  )
</script>

<style lang="less" scoped>
.ant-form-item {
  margin-bottom: 0 !important;
}
</style>