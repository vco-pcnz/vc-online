<template>
  <div class="block-item mb" :class="{'checked': securityInfo.is_check}">
    <!-- 新增 -->
    <security-add-edit
      v-model:visible="addVisible"
      :current-id="currentId"
      :security-status="securityInfo.check_status"
      :typeData="securityInfo.type"
    ></security-add-edit>

    <vco-process-title :title="t('抵押物信息')">
      <div class="flex gap-5">
        <a-popconfirm
          :title="t('确定通过审核吗？')"
          :ok-text="t('确定')"
          :cancel-text="t('取消')"
          @confirm="checkHandle()"
        >
          <a-button
            type="dark" shape="round"
            class="uppercase"
            v-if="!securityInfo.is_check"
          >{{ t('审核') }}</a-button>
        </a-popconfirm>
        <a-button
          type="primary" shape="round"
          class="uppercase"
          @click="addVisible = true"
        >{{ t('添加') }}</a-button>
      </div>
    </vco-process-title>
    
    <div class="sys-form-content mt-5">
      <a-form layout="vertical">
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item :label="t('抵押物价值')">
              <vco-number :value="securityInfo.total_value" :precision="2" :end="true"></vco-number>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('抵押物数量')">
              <p class="total-count">{{ securityInfo.count }}</p>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <div class="check-content"><i class="iconfont">&#xe647;</i></div>
  </div>
</template>

<script setup>
  import { ref } from "vue"
  import { useI18n } from "vue-i18n";
  import { lmAuditStatus, fcAuditStatus } from "@/api/process";
  import SecurityAddEdit from "./SecurityAddEdit.vue";

  const emits = defineEmits(['refresh'])
  const props = defineProps({
    currentId: {
      type: [Number, String],
      required: true
    },
    stepType: {
      type: Number,
      default: 1
    },
    securityInfo: {
      type: Object,
      default: () => {
        return {
          count: 0,
          total_value: '0.00',
          is_check: false,
          check_status: 407,
          type: []
        }
      }
    }
  })

  const { t } = useI18n();

  const checkHandle = async () => {
    let ajaxFn = null
    let params = {}
    if (props.stepType === 1) {
      ajaxFn = lmAuditStatus
      params = {
        lm_audit_status: props.securityInfo.check_status,
        uuid: props.currentId
      }
    } else if (props.stepType === 2) {
      ajaxFn = fcAuditStatus
      params = {
        fc_audit_status: props.securityInfo.check_status,
        uuid: props.currentId
      }
    }

    if (ajaxFn) {
      await ajaxFn(params).then(() => {
        emits('refresh')
        return true
      }).catch(() => {
        return false
      })
    }
  }

  const addVisible = ref(false)
</script>

<style lang="less" scoped>
  .total-count {
    font-size: 24px;
  }
</style>