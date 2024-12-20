<template>
  <div class="flex mt-5 items-end gap-20 justify-between">
    <reject-dialog
      v-model:visible="rejectVisible"
      :uuid="currentId"
    ></reject-dialog>

    <div v-if="!check && showDraft">
      <a-button
        type="grey"
        shape="round"
        class="weight uppercase"
        :loading="draftLoading"
        @click="draftHandle"
      >{{ t('保存草稿') }}</a-button>
      <slot name="draf-tips"></slot>
      <p v-if="hasDraft" class="mt-2 text-sm pl-1 form-tips-color">{{ t('* 存在草稿数据，请点击{0}保存', [`"${t(submitText)}"`]) }}</p>
    </div>
    <p v-else></p>
    
    <div class="flex gap-5">
      <a-button
        v-if="previousPage && !currentStep.examine"
        type="primary" shape="round" class="big shadow bold uppercase"
        @click="previousHandle"
      >{{ t('上一步') }}</a-button>

      <a-button
        v-if="previousPage && currentStep.examine"
        type="grey" shape="round" class="big shadow bold uppercase"
        @click="rejectVisible = true"
      >{{ t('拒绝申请') }}</a-button>

      <a-button
        type="dark" shape="round" class="big shadow bold uppercase"
        @click="submitHandle"
        :loading="subLoading"
      >{{ t(submitText) }}</a-button>
    </div>
  </div>
</template>

<script setup>
  import { computed, ref } from "vue"
  import { useI18n } from "vue-i18n";
  import RejectDialog from "@/views/process/components/RejectDialog.vue";
  import { navigationTo } from "@/utils/tool"

  const emits = defineEmits(['draft', 'submit'])
  const props = defineProps({
    check: {
      type: Boolean,
      default: false
    },
    showDraft: {
      type: Boolean,
      default: true
    },
    hasDraft: {
      type: Boolean,
      default: false
    },
    draftLoading: {
      type: Boolean,
      default: false
    },
    subLoading: {
      type: Boolean,
      default: false
    },
    previousPage: {
      type: String,
      default: ''
    },
    nextPage: {
      type: String,
      default: ''
    },
    canNext: {
      type: Boolean,
      default: false
    },
    currentStep: {
      type: Object
    },
    currentId: {
      type: [Number, String],
      default: ''
    }
  })

  const { t } = useI18n();

  const rejectVisible = ref(false)

  const submitText = computed(() => {
    let txt = ''
    if (props.check) {
      txt = '保存'
    } else {
      if (props.canNext) {
        txt = '下一步'
      } else {
        txt = props.currentStep && props.currentStep.examine ? '通过审核' : '提交审核1'
      }
    }
    return txt
  })

  const draftHandle = () => {
    emits('draft')
  }

  const submitHandle = () => {
    emits('submit')
  }

  const previousHandle = () => {
    if (props.previousPage && props.currentId) {
      navigationTo(`${props.previousPage}?uuid_info=${props.currentId}`)
    }
  }

  const nextHandle = (uuid) => {
    const page = props.canNext ? props.nextPage : '/requests/details'
    navigationTo(`${page}?uuid_info=${uuid}`)
  }

  defineExpose({
    nextHandle
  })
</script>