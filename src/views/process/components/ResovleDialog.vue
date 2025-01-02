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
  import { projectAuditFncheck, projectAuditDirectorcheck } from "@/api/process"
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
    },
    type: {
      type: Number,
      default: 2
    }
  });

  const { t } = useI18n();

  const formRef = ref()
  const formState = reactive({
    reason: ''
  })

  const formRules = {
    reason: [
      { required: true, message: t('请输入'), trigger: 'blur' }
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
      let ajaxFn = null
      const params = {
        uuid: props.uuid
      }
      if (props.type === 2) {
        ajaxFn = projectAuditFncheck
        params.fc_review = formState.reason
      } else if (props.type === 3) {
        ajaxFn = projectAuditDirectorcheck
        params.director_review = formState.reason
      }

      if (ajaxFn) {
        subLoading.value = true

        ajaxFn(params).then(() => {
          subLoading.value = false
          updateVisible(false)

          // 触发列表数据刷新
          emitter.emit('refreshRequestsList')
          navigationTo('/requests/loan')
        }).catch(() => {
          subLoading.value = false
        })
      }
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