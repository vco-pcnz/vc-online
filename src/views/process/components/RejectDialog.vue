<template>
  <a-modal
    :open="visible"
    :title="t(titleTxt)"
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
            :auto-size="{ minRows: 7 }"
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
  import { ref, reactive, watch, computed } from "vue";
  import { useI18n } from "vue-i18n";
  import { projectAuditDeclineProject, projectAuditGoback } from "@/api/process"
  import { projectVariationGoback, projectVariationDecline } from "@/api/project/variation"
  import { navigationTo } from "@/utils/tool"
  import emitter from "@/event"

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
    type: { // 1 直接拒绝；2 退回审核
      type: [Number, String],
      default: 1
    },
    id: {
      type: [Number, String],
      default: ''
    },
    about: {
      type: Boolean,
      default: false
    }
  });

  const { t } = useI18n();

  const titleTxt = computed(() => {
    let txt = ''
    if ([1, 'variationsDecline'].includes(props.type)) {
      txt = '拒绝原因'
    } else if ([2, 'variationsBack'].includes(props.type)) {
      txt = '退回原因'
    }
    return txt
  })

  const formRef = ref()
  const formState = reactive({
    decline_reason: ''
  })

  const formRules = {
    decline_reason: [
      { required: true, message: t('请输入') + t(titleTxt.value), trigger: 'blur' }
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
      if (props.type === 1) {
        ajaxFn = projectAuditDeclineProject
        params.decline_reason = formState.decline_reason
      } else if (props.type === 2) {
        ajaxFn = projectAuditGoback
        params.cancel_reason = formState.decline_reason
      } else if (props.type === 'variationsBack') {
        ajaxFn = projectVariationGoback
        params.cancel_reason = formState.decline_reason
        params.id = props.id
      } else if (props.type === 'variationsDecline') {
        ajaxFn = projectVariationDecline
        params.decline_reason = formState.decline_reason
        params.id = props.id
      }

      if (ajaxFn) {
        subLoading.value = true

        ajaxFn(params).then(() => {
          subLoading.value = false
          updateVisible(false)

          if (props.about) {
            emits('done')
          } else {
            // 触发列表数据刷新
            emitter.emit('refreshRequestsList')
            navigationTo('/requests/loan')
          }
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
        formState.decline_reason = '';
        subLoading.value = false;
        formRef.value?.clearValidate();
      }
    }
  )
</script>