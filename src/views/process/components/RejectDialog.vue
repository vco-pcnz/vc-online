<template>
  <a-modal
    :open="visible"
    :title="t('拒绝原因')"
    :width="460"
    :footer="null"
    :keyboard="false"
    :maskClosable="false"
    @cancel="updateVisible(false)"
  >
    <div class="sys-form-content mt-5">
      <a-form ref="formRef" layout="vertical" :model="formState" :rules="formRules">
        <a-form-item label="" name="decline_reason">
          <a-textarea
            v-model:value="formState.decline_reason"
            :placeholder="t('请输入')"
            :auto-size="{ minRows: 2, maxRows: 5 }"
          />
        </a-form-item>
      </a-form>
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
  import { projectAuditDeclineProject } from "@/api/process"
  import { navigationTo } from "@/utils/tool"
  import emitter from "@/event"

  const emits = defineEmits(['update:visible'])

  const props = defineProps({
    visible: {
      type: Boolean,
      default: false
    },
    uuid: {
      type: String,
      default: ''
    }
  });

  const { t } = useI18n();

  const formRef = ref()
  const formState = reactive({
    decline_reason: ''
  })

  const formRules = {
    decline_reason: [
      { required: true, message: t('请输入') + t('拒绝原因'), trigger: 'blur' }
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
      subLoading.value = true

      const params = {
        uuid: props.uuid,
        decline_reason: formState.decline_reason
      }

      projectAuditDeclineProject(params).then(() => {
        subLoading.value = false

        // 触发列表数据刷新
        emitter.emit('refreshRequestsList')
        navigationTo('/requests/loan')
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
        formState.decline_reason = '';
        subLoading.value = false;
        formRef.value?.clearValidate();
      }
    }
  )
</script>